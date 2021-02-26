import React from 'react';
import Button from 'react-bootstrap/Button';
import useTimer from './useTimer';
import './ToDoList.css'
// import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from 'react-dom';

const OurTimer = (props) => {
  const roomId =  props.room;
  const {start, sendStart, work, sendWork, minutes, seconds} = useTimer(roomId)
  
  //click handlers
  const handleStart = () => sendStart(start);

  const handleWork = () => {
    sendWork(work)
  }

  //variables for display
  let startStatus = (start ? 'STOP' : 'START');
  let workStatus = (work ? 'REST' : 'WORK');
  //adds zero when seconds gets into single digits
  let secondsDisplay;
  if (seconds < 10) {
    secondsDisplay = '0'+seconds
  } else {
    secondsDisplay = seconds
  }

  return (
    
    <section>
        
        <section className="timerTimer">
          <div>
            <div className = 'buttons'>
              <Button variant="secondary" onClick={handleStart} >{startStatus}</Button>{' '}
              <Button variant="secondary" onClick ={handleWork} >{workStatus}</Button>{' '} 
            </div> 
            <h1 className='timerMargin'>{minutes + ':' + secondsDisplay}</h1>
          </div>

      </section> 
    </section>
  )
}

export default OurTimer
