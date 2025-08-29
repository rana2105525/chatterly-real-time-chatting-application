const Message = ({ content, type, own, user, createdAt }) => {
  // Format the date nicely, e.g., HH:MM AM/PM, safely
  const formatTime = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ""; // fallback if invalid date

    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className={`flex flex-col ${own ? "items-end" : "items-start"} mb-2`}>
      <p className={`message flex ${own ? "justify-end" : "justify-start"} px-2 py-1`}>
        {!own && (
          <span className="logo text-2xl bg-gray-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-2">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}

        <span
          className={`text-xl md:text-2xl py-2 rounded-2xl ${
            type === "text" ? "px-6" : "px-2"
          } ${own ? "bg-black text-white" : "bg-gray-600 text-white"}`}
        >
          {type === "text" ? (
            content
          ) : (
            <img
              src={content}
              alt="image"
              className="w-48 h-48 object-cover rounded-md shadow-md"
            />
          )}
        </span>
      </p>

      <span className="text-xs text-gray-400 mt-1">
        {formatTime(createdAt)}
      </span>
    </div>
  );
};

export default Message;
