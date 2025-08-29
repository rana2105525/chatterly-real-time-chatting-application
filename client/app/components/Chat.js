import { useEffect, useRef } from "react";
import Message from "./Messages/Message";

const Chat = ({ chat, user }) => {
  const scroller = useRef(null);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chat]);

  return (
    <div className="chat-window overflow-auto h-full p-2">
      {chat.map((msg, index) => (
        <Message
          key={index}
          content={msg.content}
          type={msg.type}
          own={msg.user.name === user.name}
          user={msg.user}
          createdAt={msg.createdAt} // use normalized createdAt
        />
      ))}
      <div ref={scroller} />
    </div>
  );
};

export default Chat;
