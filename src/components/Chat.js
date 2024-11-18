import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import CryptoJS from "crypto-js";

const socket = io("http://192.168.1.25:5000");

const Chat = () => {
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [encryptionPasskey, setEncryptionPasskey] = useState("");
  const [decryptionPasskey, setDecryptionPasskey] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [decryptedMessages, setDecryptedMessages] = useState({});

  // Register user ID on the server
  const registerUser = () => {
    if (userId) {
      socket.emit("register", { userId });
      console.log(`User registered: ${userId}`);
    } else {
      alert("Please enter a user ID to register.");
    }
  };

  // Handle message encryption and sending
  const encryptAndSendMessage = () => {
    if (message && encryptionPasskey && recipientId) {
      const encrypted = CryptoJS.AES.encrypt(
        message,
        encryptionPasskey
      ).toString();
      socket.emit("sendMessage", {
        senderId: userId,
        recipientId,
        encryptedMessage: encrypted,
      });
      setMessage(""); // Clear the message input
      console.log(`Message sent to ${recipientId}`);
    } else {
      alert(
        "Please fill out the message, recipient ID, and encryption passkey."
      );
    }
  };

  // Handle message decryption
  const decryptMessage = (encrypted, index) => {
    if (decryptionPasskey) {
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, decryptionPasskey);
        const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
        setDecryptedMessages((prev) => ({
          ...prev,
          [index]: originalMessage || "Invalid passkey!",
        }));
      } catch {
        setDecryptedMessages((prev) => ({
          ...prev,
          [index]: "Decryption failed!",
        }));
      }
    } else {
      alert("Please enter a decryption passkey.");
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setReceivedMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  return (
    <div className="chat-container">
      <h1 className="chat-title">Secure Chat</h1>

      {/* Register User Section */}
      <div className="section">
        <h2>Register</h2>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your user ID"
        />
        <button className="btn" onClick={registerUser}>
          Register
        </button>
      </div>

      {/* Sender Section */}
      <div className="section">
        <h2>Send a Message</h2>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message..."
          rows="4"
        />
        <input
          type="text"
          value={encryptionPasskey}
          onChange={(e) => setEncryptionPasskey(e.target.value)}
          placeholder="Enter encryption passkey"
        />
        <input
          type="text"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Enter recipient ID"
        />
        <button className="btn" onClick={encryptAndSendMessage}>
          Send Encrypted Message
        </button>
      </div>

      {/* Received Messages Section */}
      <div className="section">
        <h2>Received Messages</h2>
        {receivedMessages.map((msg, index) => (
          <div key={index} className="message-box">
            <p>From: {msg.senderId}</p>
            <p>Encrypted: {msg.encryptedMessage}</p>
            <input
              type="text"
              value={decryptionPasskey}
              onChange={(e) => setDecryptionPasskey(e.target.value)}
              placeholder="Enter decryption passkey"
            />
            <button
              className="btn"
              onClick={() => decryptMessage(msg.encryptedMessage, index)}
            >
              Decrypt
            </button>
            {decryptedMessages[index] && (
              <p className="decrypted-message">
                Decrypted: {decryptedMessages[index]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chat;
