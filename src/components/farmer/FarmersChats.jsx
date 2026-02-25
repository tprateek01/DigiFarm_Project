import React, { useState, useEffect, useRef } from "react";
import "../../styles/farmer/FarmerChats.css";

function FarmersChats({ currentUserId }) {
  const [data, setData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chats, setChats] = useState({});
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  // -------------------------
  // Load JSON
  // -------------------------
  useEffect(() => {
    fetch("/server/data.json")
      .then((res) => res.json())
      .then((jsonData) => setData(jsonData))
      .catch((err) => console.error(err));
  }, []);

  // -------------------------
  // Load chats from localStorage
  // -------------------------
  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem("digifarm_chats")) || {};
    setChats(storedChats);
  }, []);

  // -------------------------
  // Real-time sync between tabs
  // -------------------------
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "digifarm_chats") {
        setChats(JSON.parse(e.newValue) || {});
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // -------------------------
  // Auto-scroll to latest message
  // -------------------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedUser]);

  // -------------------------
  // Determine current user
  // -------------------------
  useEffect(() => {
    if (!data) return;

    let user = data.user.find((u) => u.id === currentUserId);

    if (!user) {
      user =
        data.user.find((u) => u.role === "farmer") ||
        data.user.find((u) => u.role === "merchant") ||
        null;
    }

    setCurrentUser(user);
  }, [data, currentUserId]);

  // -------------------------
  // Conditional rendering
  // -------------------------
  if (!data) return <div>Loading...</div>;
  if (!currentUser)
    return (
      <div style={{ padding: "20px", color: "red" }}>
        Error: No users found in data.json
      </div>
    );

  // Show only merchants for farmer
  const chatUsers = data.user.filter((u) => u.role !== currentUser.role);

  const getChatKey = (otherUserId) => [currentUser.id, otherUserId].sort().join("_");

  const openChat = (user) => {
    const key = getChatKey(user.id);
    const updatedChats = { ...chats };

    if (updatedChats[key]) {
      updatedChats[key] = updatedChats[key].map((msg) =>
        msg.sender !== currentUser.id ? { ...msg, seen: true } : msg
      );
    }

    localStorage.setItem("digifarm_chats", JSON.stringify(updatedChats));
    setChats(updatedChats);
    setSelectedUser(user);
  };

  // -------------------------
  // Send message
  // -------------------------
  const sendMessage = (type = "text", image = null) => {
    if (!message && !image) return;
    if (!selectedUser) return;

    const key = getChatKey(selectedUser.id);
    const updatedChats = { ...chats };

    if (!updatedChats[key]) updatedChats[key] = [];

    updatedChats[key].push({
      id: Date.now(),
      sender: currentUser.id,
      text: message,
      image: image,
      type: type,
      seen: false,
      deleted: false,
      time: new Date().toLocaleTimeString(),
    });

    localStorage.setItem("digifarm_chats", JSON.stringify(updatedChats));
    setChats(updatedChats);
    setMessage("");
  };

  // -------------------------
  // Handle image upload
  // -------------------------
  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage("image", reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  // -------------------------
  // Delete message
  // -------------------------
  const deleteForMe = (msgId) => {
    const key = getChatKey(selectedUser.id);
    const updatedChats = { ...chats };

    updatedChats[key] = updatedChats[key].filter((msg) => msg.id !== msgId);

    localStorage.setItem("digifarm_chats", JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  const deleteForEveryone = (msgId) => {
    const key = getChatKey(selectedUser.id);
    const updatedChats = { ...chats };

    updatedChats[key] = updatedChats[key].map((msg) =>
      msg.id === msgId ? { ...msg, deleted: true, text: "", image: null } : msg
    );

    localStorage.setItem("digifarm_chats", JSON.stringify(updatedChats));
    setChats(updatedChats);
  };

  const getUnreadCount = (user) => {
    const key = getChatKey(user.id);
    if (!chats[key]) return 0;
    return chats[key].filter((msg) => msg.sender !== currentUser.id && !msg.seen).length;
  };

  const currentMessages = selectedUser && chats[getChatKey(selectedUser.id)];

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="chat-wrapper">
      {/* LEFT PANEL */}
      <div className="chat-list">
        <h3>Merchants</h3>
        {chatUsers.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => openChat(user)}
          >
            <div>
              <strong>{user.name}</strong>
              <p>ID: {user.id}</p>
            </div>
            {getUnreadCount(user) > 0 && <span className="badge">{getUnreadCount(user)}</span>}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {selectedUser.name} <span>({selectedUser.id})</span>
            </div>

            <div className="chat-body">
              {currentMessages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg ${msg.sender === currentUser.id ? "right" : "left"}`}
                >
                  {msg.deleted ? (
                    <p className="deleted-msg">This message was deleted</p>
                  ) : msg.type === "image" ? (
                    <img src={msg.image} alt="sent" className="chat-image" />
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  <div className="meta">
                    {msg.time}
                    {msg.sender === currentUser.id && !msg.deleted && (
                      <span>{msg.seen ? " ✓✓" : " ✓"}</span>
                    )}
                  </div>

                  {msg.sender === currentUser.id && !msg.deleted && (
                    <div className="delete-options">
                      <button onClick={() => deleteForMe(msg.id)}>Delete for Me</button>
                      <button onClick={() => deleteForEveryone(msg.id)}>Delete for Everyone</button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-footer">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message"
              />
              <label className="image-btn">
                📷
                <input type="file" hidden onChange={handleImage} />
              </label>
              <button onClick={() => sendMessage()}>Send</button>
            </div>
          </>
        ) : (
          <div className="no-chat">Select a merchant to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default FarmersChats;
