'use client';
import React, { useState, useRef, useEffect } from 'react';
import Script from 'next/script';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text:
        'Welcome to LeezieBite!  \n' +
        '1 - View the menu 🍽️  \n' +
        '99 - Checkout order  \n' +
        '98 - See order history  \n' +
        '97 - See current order  \n' +
        '0 - Cancel order',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const sessionId = 'react-user-123';
  let currentTotal = 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setMessages((m) => [...m, { from: 'user', text: input }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // extract the total returned by the server
      currentTotal = data.total || currentTotal;

      const match = data.reply.match(
        /https:\/\/checkout\.paystack\.com\/([A-Za-z0-9_-]+)/
      );
      if (match) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          reference: match[1],
          email: `${sessionId}@guest.com`,
          amount: currentTotal * 100,      // use the real total
          onClose: () =>
            setMessages((m) => [
              ...m,
              { from: 'bot', text: '❌ Payment cancelled.' },
            ]),
          callback: () =>
            setMessages((m) => [
              ...m,
              { from: 'bot', text: '✅ Payment successful! Thank you.' },
            ]),
        });
        handler.openIframe();
      } else {
        setMessages((m) => [...m, { from: 'bot', text: data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { from: 'bot', text: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 97,
            right: 55,
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: '#e67b58',
            color: '#fff',
            fontSize: 28,
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
          }}
        >
          💬
        </button>
      )}

      {open && (
        // 1) Paystack Script must live INSIDE this form
        <form onSubmit={sendMessage} style={{ all: 'unset' }}>
          <Script
            src="https://js.paystack.co/v1/inline.js"
            strategy="afterInteractive"
          />

          <div
            style={{
              position: 'fixed',
              bottom: 76,
              right: 50,
              width: 360,
              height: 500,
              background: '#f8f8f8',
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'sans-serif',
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: '#e67b58',
                color: 'white',
                padding: 12,
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>💬 LeezieBite</span>
              <span
                onClick={() => setOpen(false)}
                style={{ cursor: 'pointer' }}
              >
                ✖
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: 10,
                overflowY: 'auto',
                backgroundColor: '#ece5dd',
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent:
                      msg.from === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        msg.from === 'user' ? '#f48059' : '#ffffff',
                      color: msg.from === 'user' ? '#fff' : '#000',
                      padding: '10px 14px',
                      borderRadius: 16,
                      maxWidth: '75%',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 10,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: '3px solid #ccc',
                      borderTop: '3px solid #e67b58',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              style={{
                display: 'flex',
                padding: 10,
                backgroundColor: '#fff',
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Type a number…"
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 20,
                  border: '1px solid #ccc',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginLeft: 10,
                  backgroundColor: '#e67b58',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '8px 12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                ➤
              </button>
            </div>
          </div>

          {/* spinner keyframes */}
          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </form>
      )}
    </>
  );
}
