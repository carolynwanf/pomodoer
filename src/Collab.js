import React, {useState,useEffect,useRef} from 'react';
import useCollab from './useCollab';
import ToDoList from "./ToDoList"
import './ToDoList.css';
import Button from 'react-bootstrap/Button'

import {Link} from 'react-router-dom'

import OurTimer from './Timer';

const Collab = (props) => {
  const {roomId} =  props.match.params;
  const {databasePassword, sendPassword} = useCollab(roomId)
  const [password, setPassword] = useState('')
  const [askForPassword, setAskForPassword] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(false);
  

  // updates password with the value from the 
  const handleChange = (e) => {
      setPassword(e.target.value);
  }


  // sends task to server so it shows up for both people
  const handleSubmit = () => {
    // sendTask(newTask);
    // setNewTask('')
    // if password = password from database, set askForPassword to false
    // if there is no password in database, send {password} to database database and set askForPassword to false
    // else, if password !== password from database, set askForPassword to true + display "wrong password"
    if (password === databasePassword) {
      setAskForPassword(false)
    } else if (databasePassword === 'nothing yet') {
      setAskForPassword(false)
      sendPassword(password)
    } else {
      setWrongPassword(true)
    }
  }

// makes it so that hitting the enter key also works for submission
  const handleEnter = (e) => {
      if (e.key === 'Enter') {
          handleSubmit()
      }
  }


  if (askForPassword) {
    return (
      <div>
        <p>PASSWORD:</p>
        <input
          onChange = {handleChange}
          value = {password}
          type='text'
          placeholder='enter a password...'
          onKeyDown = {handleEnter}
        ></input>
         <Button variant='tertiary' className = 'addTask' onClick={handleSubmit}>ENTER</Button>
      </div>
    );
    if (wrongPassword) {
      return (
        <div>
          <p>PASSWORD:</p>
          <input
            onChange = {handleChange}
            value = {password}
            type='text'
            placeholder='enter a password...'
            onKeyDown = {handleEnter}
          ></input>
           <Button variant='tertiary' className = 'addTask' onClick={handleSubmit}>ENTER</Button>
        </div>
      );
    }
  } 
  else {
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
}

export default Collab;