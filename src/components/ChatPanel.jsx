import { useState } from "react";

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { text: "Merchant: Hello, available wheat?", self: false }
  ]);
  const [msg, setMsg] = useState("");

  const send = () => {
    if (!msg) return;

    const newMsgs = [...messages, { text: msg, self: true }];
    setMessages(newMsgs);

    // fake merchant reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "Merchant: Offer ₹25/kg", self: false }
      ]);
    }, 1000);

    setMsg("");
  };

  return (
    <div className="dashboard-box">
      <h3>💬 Live Chat</h3>

      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={m.self ? "msg self" : "msg"}>
            {m.text}
          </div>
        ))}
      </div>

      <input
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={send}>Send</button>
    </div>
  );
}
