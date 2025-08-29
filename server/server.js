const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./db"); // Your MySQL connection
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// --- Google OAuth ---
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GoogleStrategy(
    {
      clientID: "862808763678-1sfbflr65ihb2lrh296gg42lim078f7s.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://localhost:3001/api/auth/callback/google",
    },
    (accessToken, refreshToken, profile, done) => {
      db.query("SELECT * FROM users WHERE google_id = ?", [profile.id], (err, results) => {
        if (err) return done(err);
        if (!results.length) {
          db.query("INSERT INTO users (name, google_id) VALUES (?, ?)", [profile.displayName, profile.id]);
        }
        return done(null, profile);
      });
    }
  )
);

app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/auth/callback/google",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`http://localhost:3000/?user=${req.user.displayName}`);
  }
);

app.get("/api/auth/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// --- Socket.IO ---
const io = new Server(server, { cors: { origin: "*" } });
let activeUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // New user joins
  socket.on("new_user", ({ user }) => {
    activeUsers[user] = socket.id;

    db.query("SELECT * FROM users WHERE name = ?", [user], (err, results) => {
      if (err) return console.error(err);
      if (!results.length) {
        db.query("INSERT INTO users (name, socket_id) VALUES (?, ?)", [user, socket.id]);
      } else {
        db.query("UPDATE users SET socket_id = ? WHERE name = ?", [socket.id, user]);
      }

      db.query("SELECT name FROM users", (err, users) => {
        if (!err) io.emit("all_users", users.map(u => u.name));
      });

      io.emit("new_user", user);
    });
  });

  // Send message
  socket.on("send_message", ({ to, content, type }) => {
    const senderName = Object.keys(activeUsers).find(u => activeUsers[u] === socket.id);
    if (!senderName) return;

    db.query("SELECT id FROM users WHERE name = ?", [senderName], (err, senderRes) => {
      if (err || !senderRes.length) return console.error(err);
      const senderId = senderRes[0].id;

      db.query("SELECT id FROM users WHERE name = ?", [to], (err, receiverRes) => {
        if (err || !receiverRes.length) return console.error(err);
        const receiverId = receiverRes[0].id;

        db.query("INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)", [senderId, receiverId, content, type]);

        const messageData = { user: { name: senderName }, content, type, created_at: new Date() };
        if (activeUsers[to]) io.to(activeUsers[to]).emit("recieve_message", messageData);
      });
    });
  });

  // Typing indicator
  socket.on("user_typing", (data) => {
    if (activeUsers[data.to]) io.to(activeUsers[data.to]).emit("user_typing", data);
  });

  // Logout
  socket.on("logout_user", ({ user, socketId }) => {
    delete activeUsers[user];
    db.query("UPDATE users SET socket_id = NULL WHERE socket_id = ?", [socketId]);
    db.query("SELECT name FROM users", (err, users) => { if (!err) io.emit("all_users", users.map(u => u.name)); });
  });

  // Disconnect
  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(activeUsers).find(u => activeUsers[u] === socket.id);
    if (disconnectedUser) delete activeUsers[disconnectedUser];
    db.query("UPDATE users SET socket_id = NULL WHERE socket_id = ?", [socket.id]);
    db.query("SELECT name FROM users", (err, users) => { if (!err) io.emit("all_users", users.map(u => u.name)); });
    console.log("User disconnected:", socket.id);
  });
});

// --- API Endpoints ---
app.get("/conversation/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;
  db.query(
    `SELECT m.*, u1.name AS sender_name, u2.name AS receiver_name
     FROM messages m
     JOIN users u1 ON m.sender_id = u1.id
     JOIN users u2 ON m.receiver_id = u2.id
     WHERE (u1.name = ? AND u2.name = ?) OR (u1.name = ? AND u2.name = ?)
     ORDER BY m.created_at ASC`,
    [user1, user2, user2, user1],
    (err, results) => { if (err) return res.status(500).json({ error: err.message }); res.json(results); }
  );
});

app.get("/conversations/:user", (req, res) => {
  const { user } = req.params;
  db.query(
    `SELECT u.id, u.name, MAX(m.created_at) AS last_message_time
     FROM users u
     LEFT JOIN messages m 
       ON (u.id = m.sender_id AND m.receiver_id = (SELECT id FROM users WHERE name=?))
       OR (u.id = m.receiver_id AND m.sender_id = (SELECT id FROM users WHERE name=?))
     WHERE u.name != ?
     GROUP BY u.id, u.name
     ORDER BY last_message_time DESC`,
    [user, user, user],
    (err, results) => { if (err) return res.status(500).json({ error: err.message }); res.json(results); }
  );
});

server.listen(3001, () => console.log("Server running on port 3001"));
