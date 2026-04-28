import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../styles/farmer/FarmerChats.css";
import { userApiService } from "../../api/userApi";
import API_URL from "../../config/apiConfig";
import { io } from "socket.io-client";

const socket = io(API_URL);

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
  const [activeOrders, setActiveOrders] = useState([]);
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

  // Initial fetch and Socket connection
  useEffect(() => {
    if (!meId) return;
    socket.emit("join", meId);

    const handleReceive = (msg) => {
      setSelectedUser((currentSelected) => {
        if (!currentSelected) return currentSelected;
        const currentThreadKey = getThreadKey(currentSelected.id);
        if (msg.thread_key === currentThreadKey) {
          setMessages((prev) => {
            if (prev.find((m) => m._id === msg._id || m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
        return currentSelected;
      });
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [meId, getThreadKey]);

  useEffect(() => {
    if (!selectedUser || !meId) return;

    const threadKey = getThreadKey(selectedUser.id);
    const loadMessages = async () => {
      try {
        const [msgs, orders] = await Promise.all([
          userApiService.getChatMessages(threadKey),
          userApiService.getMerchantOrders(meId)
        ]);
        setMessages(msgs || []);
        
        // Filter orders for this specific farmer that are active
        const filtered = (orders || []).filter(o => 
          String(o.farmer_id) === String(selectedUser.id) && 
          ['pending_sample', 'pending_price', 'accepted'].includes(o.status)
        );
        setActiveOrders(filtered);

        await userApiService.markChatSeen({ thread_key: threadKey, user_id: meId });
      } catch (e) {
        console.error(e);
      }
    };

    loadMessages();
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
      const newMsg = await userApiService.sendChatMessage({
        sender_id: meId,
        receiver_id: selectedUser.id,
        type,
        text: type === "text" ? message : "",
        image: type === "image" ? image : null,
      });

      // Manually append the message to the state to ensure it shows up immediately
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id || m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      setMessage("");
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
            {user.profileImage ? (
               <img src={user.profileImage} alt="profile" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginRight: '10px'}} />
            ) : (
               <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'}}>
                  {user.name?.charAt(0)}
               </div>
            )}
            <div>
              <strong>{user.full_name || user.name}</strong>
            </div>
          </div>
          ))
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-window">
        {selectedUser ? (
          <>
            <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {selectedUser.name || selectedUser.full_name} <span>({selectedUser.id})</span>
              </div>
              {activeOrders.length > 0 && (
                <div className="order-status-banner" style={{ fontSize: '12px', background: '#e3f2fd', padding: '5px 10px', borderRadius: '5px', border: '1px solid #bbdefb' }}>
                  {activeOrders.map(o => (
                    <div key={o.id}>
                      <strong>{o.product_name}:</strong> {
                        o.status === 'pending_sample' ? 'Waiting for Sample' :
                        o.status === 'pending_price' ? 'Farmer Setting Price' :
                        o.status === 'accepted' ? 'Price Set! Ready for Payment' : o.status
                      }
                    </div>
                  ))}
                </div>
              )}
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
