// import { useEffect } from "react";
import  React,  {useCallback, useEffect, useState} from "react";
import { useSocket } from "../providers/Socket";
import {useNavigate} from 'react-router-dom'
const Homepage = () => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [email , setEmail] = useState('');
  const [roomID, setRoomID] = useState('');

const handleRoomJoined = ({roomID}) =>{
  console.log("Room joined ", roomID);
  navigate(`/room/${roomID}`)
  
}


const handleJoinRoom = useCallback(() => {
  
  console.log(`${email} just connected socket with socketid`, socket.id);
  
  socket.emit('join-room', { roomID, userName });
}, [email, roomID, socket]);


useEffect( ()=>{

  socket.on('joined-room', handleRoomJoined)
 

  return ()=>{
    socket.off('joined-room', handleRoomJoined)
  }
},[   socket ])

  return (
    <div className="homepage-container">
      <div className="input-container">
       
        <input  value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your emaill  here" />
        <input  value={roomID} onChange={ e => setRoomID(e.target.value)} type="text" placeholder="room Id " />
        <button onClick={handleJoinRoom} > join room </button>
      </div>
    </div>
  );
};
export default Homepage;
