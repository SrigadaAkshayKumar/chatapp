import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Chat from "./components/Chat";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Secure Messaging App</h1>
        <nav>
          <ul>
            <li>
              <Link to="/chat">Chat</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
