import React, {useState,useEffect} from 'react';
import './Chat.css';
import { useCookies } from 'react-cookie';
import { useNavigate, Navigate, redirect, useLocation } from 'react-router';
import io from 'socket.io-client';

const socket = io("https://simple-chat-backend.onrender.com/",{
    withCredentials: true,
    extraHeaders: {
    "my-custom-header": "abcd"}}
    );

export default function Chat(){
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastPong, setLastPong] = useState(null);


    const usuarios = ["Pedrito","Juanito","Robertoide","Anastasioide"]
    const [connectedUsers,setConnectedUsers] = useState(/*usuarios.map( (user,index) => <p key={index} id={index}>{user}</p>)*/);
    const [data,setData] = useState();
    const [chatMessages,setChatMessages] = useState([]);
    const [cookies, setCookie,removeCookies] = useCookies(['userName']);   
    const location = useLocation();
    const [message,setMessage] = useState("");

    useEffect(() => {
        socket.on('connect', () => {
          setIsConnected(true);
          socket.emit("userName",cookies.userName)
        });
    
        socket.on('disconnect', () => {
          setIsConnected(false);
          socket.emit("userName_disconnect",cookies.userName)
        });
    
        socket.on('pong', () => {
          setLastPong(new Date().toISOString());
        });

        socket.on("Send_msg", (msg) => {
            console.log(msg);
            setChatMessages(chatMessages =>{ const mensaje = JSON.parse(msg); return [...chatMessages, <p className="message" key={mensaje["date"]}>{mensaje["author"]}: {mensaje["text"]}</p>] });
        })
    
        return () => {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('pong');
          socket.off("Send_msg");
        };
      }, []);


    useEffect(
        () => {
            const chatList = document.querySelector(".chat_messages_list");
            chatList.scrollTop = chatList.scrollHeight
        }
    ,[chatMessages])

    useEffect(
        () => {
            fetch("/messages",{
                mode: "navigate",
                method:'GET'
            }).then(response => {
                if(response.ok){
                    return response.json()
                }
            })
            .then(res => setData(res))
            .catch(err => console.log(err))
        }  
          
        ,[])

        useEffect(  ()=>{ if(data){
            setChatMessages( data["messages"].map( dato => <p key={dato["date"]} className="message">{dato["author"]}: {dato["text"]}</p>))}
        },[data])
    
    function actualizeMessage(e){
        setMessage(e.target.value);
    }

    function borrarUserName(e){
        removeCookies("userName");
    }

    async function sendMessage(e){
        e.preventDefault();
        try{
            if(message){
            await fetch("/messages",{
                mode:"navigate",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body:JSON.stringify({
                    "text" : (message),
                    "date" : (Date.now()),
                    "author" : (cookies.userName)
                })
            });
            socket.emit("message",JSON.stringify({
                "text" : (message),
                "date" : (Date.now()),
                "author" : (cookies.userName)
            }))
            setChatMessages([...new Set([...chatMessages, ...[<p key={Date.now()} className="message">{cookies.userName}: {message}</p>]])]);
            setMessage("");
            }
        } catch(err){
            console.log(err);
        }
       
    }
    

    return(
        <div>
        {cookies.userName ? <button onClick={borrarUserName}>Cambiar Usuario</button> : <Navigate to="/"></Navigate>}
        <div className="chat">
            <h2 className="chat_title">#General</h2>
            <div className="chat_principal">
            <div className="chat_connected_users">
            {connectedUsers}
            </div>
            <div className="chat_messages">
                <div className="chat_messages_list">
            {chatMessages}
            </div>
            <form onSubmit={sendMessage}>
            <input type="text" onChange={actualizeMessage} value={message}></input>
            <input type="submit"></input>
            </form>
            </div>
            </div>
        </div>

        </div>
    )
}