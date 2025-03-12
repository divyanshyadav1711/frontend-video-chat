// ChatMessages.js
import React, { useEffect, useRef, useState } from "react";
import MeIcon from "../icons/MeIcon";
import UserIcon from "../icons/UserIcon";

const ChatMessages = ({ messages, handleSendMessage }) => {
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  const clearMessage = () => setInputMessage("");

  const handleSend = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();  // Prevent the default 'Enter' key behavior (like adding a newline in a textarea)
      handleSendMessage(inputMessage, clearMessage);  // Call the same function as the button click
    }
    else if (!e.key) {
      handleSendMessage(inputMessage, clearMessage);  // Call the same function as the button click
    }
  };


  return (
    <>
      <div className="flex-1 min-h-[100px] overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex text-sm items-start ${message.type === "me" ? "justify-end" : "justify-start"
              }`}
          >
            {message.type === "user" && (
              <UserIcon className="" />
            )}
            <div
              className={`max-w-[70%] break-words p-2 rounded-lg ${message.type === "me"
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
                }`}
              style={{ wordBreak: "break-word" }}
            >
              {message.text}
            </div>
            {message.type === "me" && (
              <MeIcon />
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>


      <div className="flex text-sm w-full items-center border-gray-300 p-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleSend}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg outline-0"
        />
        <button
          onClick={handleSend}
          className="ml-2 px-4 py-2 border border-blue-400 text-blue-400 hover:text-blue-300 rounded-lg"
        >
          Send
        </button>
      </div>
    </>
  )

};

export default ChatMessages;
