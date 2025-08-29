import { useState } from "react";

const SignUp = ({ user, socket, input, setInput }) => {

  const addUser = () => {
    user.current = { name: input, id: socket.id };
    socket.emit("new_user", { user: input });
    setInput("");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      {/* Container card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <img
          src="/logo.png"
          alt="Chatterly Logo"
          className="w-50 h-50 rounded-full mb-4"
        />
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Enter your name to join
        </h2>
        <input
          type="text"
          className="text-xl text-center rounded-md p-2 mb-4 w-full border-2 border-gray-300 text-black placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder="Your name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUser()}
        />
        <button
          className={`text-xl w-full text-white font-bold py-2 px-3 rounded-md ${
            input ? "bg-gray-600" : "bg-slate-400"
          }`}
          disabled={!input}
          onClick={addUser}
        >
          Join Chat
        </button>

        
      </div>
    </div>
  );
};

export default SignUp;
