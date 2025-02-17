import React, {useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import useTimer from './useTimer';
import './ToDoList.css'
import useSound from 'use-sound';
import audio from './alarm_chime.mp3'
// import { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } from 'react-dom';

var context = new AudioContext();

const OurTimer = (props) => {
  const roomId =  props.room;
  const {start, sendStart, work, sendWork, display, alarmSound, infoReceived} = useTimer(roomId)

  
  const [playSound] = useSound(
    audio,
    { volume: 0.75 }
  );

  const conditionalPlay = () => {
    console.log(alarmSound)
    if (alarmSound===true) {
      playSound()
    }
  }

  useEffect(conditionalPlay,[alarmSound])

  //click handlers
  const handleStart = () => {
    context.resume()
    sendStart(start);
  }
  const handleWork = () => {
    sendWork(work)
  }

  //variables for display
  let startStatus = (start ? 'STOP' : 'START');
  let workStatus = (work ? 'REST' : 'WORK');
  //adds zero when seconds gets into single digits


  if (infoReceived === false) {
    return (
      <section>

          <section className="timerTimer">
  
        </section> 
      </section>
    )
  } else {
    const minutes = Math.floor(display/1000/60);
    const seconds = Math.floor((display/1000) % 60);
    let secondsDisplay;
    if (seconds < 10) {
      secondsDisplay = '0'+seconds
    } else {
      secondsDisplay = seconds
    }
    
    const time = minutes + ':' + secondsDisplay
    const newTitle =  time + ' POMODOER'
    if (document.title !== newTitle) {
      document.title = newTitle;
    }
    return (
    
      <section>
          
          <section className="timerTimer">
            <div>
              <div className = 'buttons'>
                <Button variant="secondary" className='startButton' onClick={handleStart} >{startStatus} </Button>{' '}
                <Button variant="secondary" className='workButton'onClick ={handleWork} >{workStatus}</Button>{' '} 
              </div> 
              <h1 className='timerMargin'>{time}</h1>
            </div>
  
        </section> 
      </section>
    )
  }
}

export default OurTimer
