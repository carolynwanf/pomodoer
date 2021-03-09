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
  const [display, setDisplay] = useState(true)


  // updates password with the value from the 
  const handleChange = (e) => {
      setPassword(e.target.value);
  }

  // if click room, displays password
  const handlePress = () => {
    const newDisplay = !display
    // roomStatus = newDisplay ? 'ROOM'+roomId : databasePassword
    setDisplay(newDisplay)
    console.log('handlePress',roomStatus)
  }

  let roomStatus = display ? 'ROOM: '+roomId : 'PASSWORD: '+databasePassword 


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
    } else if (password !== databasePassword){
      setWrongPassword(true)
    }
  }

  // makes it so that hitting the enter key also works for submission
  const handleEnter = (e) => {
      if (e.key === 'Enter') {
          handleSubmit()
     }
  }

  if (askForPassword && !wrongPassword) {
    return (
      <div className='passwordPage'>
        <h3> ENTER PASSWORD:</h3>
        <div className = 'passwordForm'>
          <input
            onChange = {handleChange}
            value = {password}
            type='text'
            placeholder='enter a password...'
            onKeyDown = {handleEnter}
            className = 'passwordBar'
          ></input>
          <Button variant='tertiary' className = 'addTask' onClick={handleSubmit}>ENTER</Button>
        </div>
      </div>
    );
  } else if (wrongPassword && askForPassword) {
    return (
      <div className='passwordPage'>
        <h3> ENTER PASSWORD:</h3>
        <div className = 'passwordForm'>
          <input
            onChange = {handleChange}
            value = {password}
            type='text'
            placeholder='enter a password...'
            onKeyDown = {handleEnter}
            className = 'passwordBar'
          ></input>
          <Button variant='tertiary' className = 'addTask' onClick={handleSubmit}>ENTER</Button>
        </div>
         <p className='alert'>WRONG PASSWORD</p>
      </div>
    ); 
  } else {
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
          <h2 className='room' onClick = {handlePress}>{roomStatus}</h2>
          <ToDoList room={roomId}/>
        
      </div>
    );
  }
}

export default Collab;