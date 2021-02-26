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
              POMODOER 
            </Link>
          </header>
       </div>
        <div className='timer'>
          <OurTimer room={roomId}/> 
        </div>
        <ToDoList room={roomId}/>
      
    </div>
  );
}

export default Collab;