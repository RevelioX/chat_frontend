import './App.css';
import React, {useState} from 'react';
import Login from'./components/Login.js';
import Header from './components/Header.js';
import Chat from './components/Chat.js'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import SocketClient from "socket.io-client";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login/>
  },
  {
    path: '/chat',
    element: <Chat/>
  }
])
function App() {
  const socket = SocketClient("http://localhost:3080");

 return (
  <div>
  <Header/>
  <RouterProvider router={router}/>
  </div>
  );
}

export default App;


