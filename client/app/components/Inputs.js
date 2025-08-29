import { useRef, useState } from "react";
import Image from "next/image";
import { send, upload } from "../assets";

const Inputs = ({ socket, user, setChat, to }) => {
  const [input, setInput] = useState("");
  const uploadInput = useRef(null);

  const sendMessage = () => {
    if (!to || !input.trim()) return;

    const msg = {
      user: { name: user.name },
      content: input.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
      to,
    };

    setChat((prev) => [...prev, msg]);

    socket.emit("send_message", msg);

    setInput("");
    socket.emit("user_typing", { user: user.name, typing: false });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !to) return;

    if (["image/jpeg", "image/png"].includes(file.type)) {
      const imgUrl = URL.createObjectURL(file);

      const msg = {
        content: imgUrl,
        type: "image",
        user: { name: user.name },
        createdAt: new Date().toISOString(),
        to,
      };

      setChat((prev) => [...prev, msg]);
      socket.emit("send_message", msg);
    }

    e.target.value = null;
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInput(value);
    if (to) socket.emit("user_typing", { user: user.name, typing: !!value });
  };

  return (
    <div className="w-full flex items-center p-2 gap-2">
      <input
        className="flex-1 rounded-2xl p-3 text-black placeholder-gray-500 border border-gray-400 focus:ring-2 focus:ring-gray-500"
        type="text"
        placeholder={to ? `Message ${to}...` : "Select a user"}
        value={input}
        onChange={handleTyping}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        disabled={!to}
      />

      <input
        type="file"
        ref={uploadInput}
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={handleImageUpload}
      />

      <button
        onClick={() => uploadInput.current.click()}
        className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center"
      >
        <Image src={upload} alt="Upload" width={24} height={24} />
      </button>

      <button
        onClick={sendMessage}
        className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center"
      >
        <Image src={send} alt="Send" width={24} height={24} />
      </button>
    </div>
  );
};

export default Inputs;
