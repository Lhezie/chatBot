"use client";
import React, { useState, useRef, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Welcome to LeezieBite!  \n" +
        "1 - View the menu 🍽️  \n" +
        "99 - Checkout order  \n" +
        "98 - See order history  \n" +
        "97 - See current order  \n" +
        "0 - Cancel order",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const sessionId = "react-user-123";

  // Scroll to bottom whenever messages or loading change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 1. Show the user's message
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input, sessionId }),
      });
      const data = await res.json();

      // 2. Check for Paystack link
      const urlMatch = data.reply.match(
        /https:\/\/checkout\.paystack\.com\/[^\s]+/
      );
      if (urlMatch) {
        const payUrl = urlMatch[0];
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `Order placed!\nClick below to pay:`,
            payUrl,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: data.reply },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error talking to server" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js"></script>

      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "97px",
            right: "55px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#e67b58",
            color: "white",
            fontSize: "28px",
            border: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          💬
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "76px",
            right: "50px",
            width: "360px",
            height: "500px",
            background: "#f8f8f8",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#e67b58",
              color: "white",
              padding: "12px",
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

          {/* Message Pane */}
          <div
            style={{
              flex: 1,
              padding: "10px",
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
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    backgroundColor:
                      msg.from === "user" ? "#f48059" : "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "16px",
                    maxWidth: "75%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.text}
                  {msg.payUrl && (
                    <div
                      style={{
                        marginTop: "10px",
                        textAlign: "center",
                      }}
                    >
                      <a
                        href={msg.payUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          backgroundColor: "#e67b58",
                          color: "#fff",
                          textDecoration: "none",
                          padding: "8px 16px",
                          borderRadius: "20px",
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

            {/* Loading Spinner */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "10px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid #ccc",
                    borderTop: "3px solid #e67b58",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              backgroundColor: "#fff",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                marginLeft: "10px",
                backgroundColor: "#e67b58",
                color: "white",
                border: "none",
                borderRadius: "50%",
                padding: "8px 12px",
                fontSize: "16px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Spinner keyframes */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default ChatBot;
