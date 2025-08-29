const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",   // XAMPP MySQL runs on localhost
  user: "root",        // default XAMPP MySQL user
  password: "",        // default XAMPP MySQL has NO password (keep empty string)
  database: "chat_app" // the DB you created
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL (XAMPP)");
});

module.exports = db;
