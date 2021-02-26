import React, {useState} from "react";
import {Link} from "react-router-dom";

import "./home.css";

const Home = () => {
  const [roomName, setRoomName] = useState("");

  const handleRoomNameChange = (e) => {
    setRoomName(e.target.value);
  }

  return (
      <div className = "home-page">
          <header className='home-header'>
            <text> 
                POMODOER
            </text>
          </header>
          <div className = 'room-form'>
            <input
                type = "text"
                placeholder = "enter room name..."
                value = {roomName}
                onChange={handleRoomNameChange}
                className = "input-field"
            />   
          </div>
          <div className='button'>
            <Link to ={`/${roomName}`} className='join-button'> 
              join room
            </Link>
          </div>
      </div>
  )
}

export default Home;