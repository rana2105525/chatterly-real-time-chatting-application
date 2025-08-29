"use client";
import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { Chat, Inputs, SignUp } from "../app/components";
import { User } from "lucide-react";

const socket = io("http://localhost:3001");

export default function Home() {
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const user = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("chatUser") || new URLSearchParams(window.location.search).get("user");
    if (savedUser) {
      user.current = { name: savedUser, id: socket.id };
      socket.emit("new_user", { user: savedUser });
      localStorage.setItem("chatUser", savedUser);
    }
  }, []);

  useEffect(() => {
    socket.on("recieve_message", (msg) => {
      if (selectedUser && (msg.user.name === selectedUser || msg.user.name === user.current.name)) setChat(prev => [...prev, msg]);
      else setUnreadCounts(prev => ({ ...prev, [msg.user.name]: (prev[msg.user.name] || 0) + 1 }));
    });

    socket.on("user_typing", (data) => {
      setTyping(prev => {
        if (!data.typing) return prev.filter(u => u !== data.user);
        if (!prev.includes(data.user)) return [...prev, data.user];
        return prev;
      });
    });

    socket.on("new_user", (newUser) => setAllUsers(prev => [...new Set([...prev, newUser])]));
    socket.on("all_users", (users) => {
      setActiveUsers(users);
      setAllUsers(prev => [...new Set([...prev, ...users])]);
    });

    return () => {
      socket.off("recieve_message");
      socket.off("user_typing");
      socket.off("new_user");
      socket.off("all_users");
    };
  }, [selectedUser]);

  const handleLogout = () => {
    if (!user.current) return;
    socket.emit("logout_user", { socketId: socket.id, user: user.current.name });
    localStorage.removeItem("chatUser");
    user.current = null;
    setChat([]);
    setActiveUsers([]);
    setTyping([]);
  };

  const selectUser = (username) => {
    setSelectedUser(username);
    setUnreadCounts(prev => ({ ...prev, [username]: 0 }));

    fetch(`http://localhost:3001/conversation/${user.current.name}/${username}`)
      .then(res => res.json())
      .then(data => setChat(data.map(m => ({ user: { name: m.sender_name }, content: m.content, type: m.type, created_at: m.created_at }))));
  };

  return (
    <main className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      {user.current ? (
        <div className="flex w-[90%] h-[90%] bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Users Sidebar */}
          <div className="w-1/4 border-r border-gray-200 p-4 bg-gray-50 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto">
              <h2 className="font-bold text-lg mb-4 text-center">Users</h2>
              <ul className="space-y-2">
                {allUsers.map((u, i) => {
                  if (u === user.current.name) return null;
                  const isActive = activeUsers.includes(u);

                  return (
                    <li key={i} onClick={() => selectUser(u)} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-200 ${selectedUser === u ? "bg-gray-300" : "bg-white"}`}>
                      <div className="relative">
                        <User className="w-8 h-8 text-gray-600" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${isActive ? "bg-green-500" : "bg-gray-400"}`}></span>
                        {unreadCounts[u] > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{unreadCounts[u]}</span>}
                      </div>
                      <span>{u}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button onClick={handleLogout} className="mt-4 w-full py-2 px-3 rounded-md bg-red-500 text-white font-bold hover:bg-red-600">Logout</button>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedUser ? <Chat user={user.current} chat={chat} typing={typing} activeUsers={activeUsers} /> :
                <div className="flex items-center justify-center h-full text-gray-400 text-xl font-semibold">Select a chat to start chat</div>}
            </div>
            {selectedUser && (
              <div className="border-t border-gray-300 p-3 bg-gray-50">
                <Inputs setChat={setChat} user={user.current} socket={socket} to={selectedUser} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <SignUp />
      )}
    </main>
  );
}
