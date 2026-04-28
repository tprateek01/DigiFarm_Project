import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../styles/farmer/FarmerChats.css";
import { userApiService } from "../../api/userApi";
import API_URL from "../../config/apiConfig";
import { io } from "socket.io-client";

const socket = io(API_URL);

function FarmersChats({ currentUserId }) {
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
  const [pendingOrders, setPendingOrders] = useState([]);
  const [newPrices, setNewPrices] = useState({}); // orderId -> price
  const chatEndRef = useRef(null);

  const getThreadKey = useCallback(
    (otherUserId) => [String(meId), String(otherUserId)].sort().join("_"),
    [meId]
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      console.log('FarmersChats - Session:', session);
      console.log('FarmersChats - Me ID:', meId);
      
      if (!meId) return;
      try {
        const list = await userApiService.getChatContacts(meId);
        console.log('FarmersChats - Contacts list:', list);
        if (mounted) setContacts(list || []);
      } catch (e) {
        console.error('FarmersChats - Error loading contacts:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [meId, session]);

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
          userApiService.getFarmerOrders(meId)
        ]);
        setMessages(msgs || []);
        
        // Filter orders for this specific merchant that are in pending_price status
        const filtered = (orders || []).filter(o => 
          String(o.merchant_id) === String(selectedUser.id) && 
          o.status === 'pending_price'
        );
        setPendingOrders(filtered);

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

  const handleSetPrice = async (orderId) => {
    const price = newPrices[orderId];
    if (!price || isNaN(price)) {
      alert("Please enter a valid price");
      return;
    }

    try {
      await userApiService.updateOrderStatus(orderId, "accepted", { totalPrice: Number(price) });
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      
      // Notify via chat that price has been set
      await sendMessage("text", null, `✅ Final price for your order of ${pendingOrders.find(o => o.id === orderId)?.product_name} has been set to ₹${price}. You can now proceed to payment.`);
    } catch (e) {
      alert("Failed to update price");
    }
  };

  const sendMessage = async (type = "text", image = null, overrideText = null) => {
    if (!selectedUser || !meId) return;
    const textToSend = overrideText || message;
    if (type === "text" && !textToSend.trim()) return;
    if (type === "image" && !image) return;

    try {
      // The API call itself writes to DB and emits via Socket to both us and receiver
      const newMsg = await userApiService.sendChatMessage({
        sender_id: meId,
        receiver_id: selectedUser.id,
        type,
        text: type === "text" ? textToSend : "",
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
        <h3>Merchants</h3>
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
              {pendingOrders.length > 0 && (
                <div className="pending-actions" style={{ fontSize: '12px', background: '#e8f5e9', padding: '5px 10px', borderRadius: '5px', border: '1px solid #c8e6c9' }}>
                  {pendingOrders.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>Price for {o.product_name}:</span>
                      <input 
                        type="number" 
                        placeholder={o.totalPrice} 
                        value={newPrices[o.id] || ""}
                        onChange={(e) => setNewPrices(prev => ({ ...prev, [o.id]: e.target.value }))}
                        style={{ width: '70px', padding: '2px' }}
                      />
                      <button 
                        onClick={() => handleSetPrice(o.id)}
                        style={{ background: '#4caf50', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '3px', cursor: 'pointer' }}
                      >
                        Set Price
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="chat-body">
              {messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-msg ${String(msg.sender_id) === String(meId) ? "right" : "left"}`}
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
          <div className="no-chat">Select a merchant to start chatting</div>
        )}
      </div>
    </div>
  );
}

export default FarmersChats;
