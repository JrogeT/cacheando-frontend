import React from 'react';
import './App.css';
import {Routes, Route, Outlet, Navigate} from "react-router-dom";
import Login from "./components/login.tsx";
import NotFound from "./components/not-found.tsx";
import Home from "./components/Home.tsx";
import Layout from "./components/Layout.tsx";
import Lobby from "./components/lobby.tsx";

function App() {
  return (
    <div>
      <Routes>
          <Route
              path="/"
              element={<Navigate to="/login" replace />}
          />
        <Route path="login" element={<Login />} />
        <Route path="room/:id" element={<Lobby />}/>
      </Routes>
    </div>
  );
}

export default App;