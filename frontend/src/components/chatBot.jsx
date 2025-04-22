"use client";
import React, { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Welcome to LeezieBite! \nType 1 to view the menu 🍽️",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const sessionId = "react-user-123";

  // auto‑scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // 1) show user message
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");

    try {
      // 2) send to your real API host
      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input, sessionId }),
      });

      if (!res.ok) {
        // pull error text if any
        const err = await res.text();
        throw new Error(err || res.statusText);
      }

      const data = await res.json();

      // 3) detect Paystack link in the reply
      const urlMatch = data.reply.match(
        /https:\/\/checkout\.paystack\.com\/[^\s]+/
      );

      if (urlMatch) {
        const payUrl = urlMatch[0];
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `Order placed! Click below to pay:`,
            payUrl,
          },
        ]);
      } else {
        // normal bot reply
        setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
      }
    } catch (err) {
      console.error("Chat error", err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: `⚠️ ${err.message}` },
      ]);
    }
  };

  return (
    <>
      {/* toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 97,
            right: 55,
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#e97442",
            color: "#fff",
            fontSize: 28,
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          💬
        </button>
      )}

      {/* chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 93,
            right: 50,
            width: 360,
            height: 500,
            background: "#f8f8f8",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "sans-serif",
          }}
        >
          {/* header */}
          <div
            style={{
              backgroundColor: "#e97442",
              color: "white",
              padding: 12,
              fontWeight: "bold",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>💬 LeezieBite</span>
            <span
              onClick={() => setOpen(false)}
              style={{ cursor: "pointer" }}
            >
              ✖
            </span>
          </div>

          {/* messages */}
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              backgroundColor: "#ece5dd",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      msg.from === "user" ? "#dcf8c6" : "#ffffff",
                    padding: "10px 14px",
                    borderRadius: 16,
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}

                  {/* Pay Now link */}
                  {msg.payUrl && (
                    <div
                      style={{
                        marginTop: 10,
                        textAlign: "center",
                      }}
                    >
                      <a
                        href={msg.payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#e97442",
                          color: "#fff",
                          textDecoration: "none",
                          padding: "8px 16px",
                          borderRadius: 20,
                          display: "inline-block",
                        }}
                      >
                        Pay Now
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={bottomRef} />
          </div>

          {/* input bar */}
          <div
            style={{
              display: "flex",
              padding: 10,
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 20,
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 10,
                backgroundColor: "#e97442",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                padding: "8px 12px",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
