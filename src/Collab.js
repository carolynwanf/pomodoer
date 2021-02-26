import React from 'react';
//mock data
// import data from "./data.json";
//components
import ToDoList from "./ToDoList";
// import './App.css';
import './ToDoList.css';
// import useChat from "../useChat";

import {Link} from 'react-router-dom'


import OurTimer from './Timer';

const Collab = (props) => {
  
  const {roomId} =  props.match.params;

  return (
    <div className="App">
        <div className="App-header">
          <header className='collab-header'>
            <Link to ={`/`} className='home-button'> 
              <h1 className='pomodoer'>
                POMODOER
              </h1> 
            </Link>
          </header>
       </div>
        <div className='timer'>
          <OurTimer room={roomId}/> 
        </div>
        <h2>ROOM: {roomId}</h2>
        <ToDoList room={roomId}/>
      
    </div>
  );
}

export default Collab;