import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../styles/farmer/FarmerChats.css";
import { userApiService } from "../../api/userApi";

function MerchantChats({ currentUserId }) {
  const session = useMemo(
    () => JSON.parse(localStorage.getItem("session_data") || "null"),
    []
  );
  const meId = currentUserId || session?.id;

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const getThreadKey = useCallback(
    (otherUserId) => [String(meId), String(otherUserId)].sort().join("_"),
    [meId]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!meId) return;
      try {
        const list = await userApiService.getChatContacts(meId);
        if (mounted) setContacts(list || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [meId]);

  useEffect(() => {
    if (!selectedUser || !meId) return;
    const threadKey = getThreadKey(selectedUser.id);

    let cancelled = false;
    const tick = async () => {
      try {
        const list = await userApiService.getChatMessages(threadKey);
        if (!cancelled) setMessages(list || []);
        await userApiService.markChatSeen({ thread_key: threadKey, user_id: meId });
      } catch (e) {
        console.error(e);
      }
    };

    tick();
    const interval = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedUser, meId, getThreadKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  const openChat = (user) => {
    setSelectedUser(user);
  };

  const sendMessage = async (type = "text", image = null) => {
    if (!selectedUser || !meId) return;
    if (type === "text" && !message.trim()) return;
    if (type === "image" && !image) return;

    try {
      await userApiService.sendChatMessage({
        sender_id: meId,
        receiver_id: selectedUser.id,
        type,
        text: type === "text" ? message : "",
        image: type === "image" ? image : null,
      });
      setMessage("");
      const threadKey = getThreadKey(selectedUser.id);
      const list = await userApiService.getChatMessages(threadKey);
      setMessages(list || []);
    } catch (e) {
      alert(e?.message || "Failed to send message");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      sendMessage("image", reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="chat-wrapper">
      {/* LEFT PANEL */}
      <div className="chat-list">
        <h3>Chats</h3>
        {loading ? (
          <div style={{ padding: 12 }}>Loading...</div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: 12 }}>No contacts found.</div>
        ) : (
          contacts.map((user) => (
          <div
            key={user.id}
            className={`chat-user ${selectedUser?.id === user.id ? "active" : ""}`}
            onClick={() => openChat(user)}
          >
            <div>
              <strong>{user.name}</strong>
              <p>ID: {user.id}</p>
            </div>
          </div>
          ))
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header">
              {selectedUser.name} <span>({selectedUser.id})</span>
            </div>

            <div className="chat-body">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg ${
                    String(msg.sender_id) === String(meId) ? "right" : "left"
                  }`}
                >
                  {String(msg.type) === "image" ? (
                    <img src={msg.image} alt="sent" className="chat-image" />
                  ) : (
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                  )}

                  <div className="meta">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {String(msg.sender_id) === String(meId) && (
                      <span>{msg.seen ? " ✓✓" : " ✓"}</span>
                    )}
                  </div>
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
          <div className="no-chat">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default MerchantChats;
