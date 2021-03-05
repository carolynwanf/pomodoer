import {useEffect, useState, useRef} from 'react';
import socketIOClient from 'socket.io-client';


//for heroku
// const SOCKET_SERVER_URL = 'https://pomodoer.herokuapp.com/';

//for local environ.
const SOCKET_SERVER_URL = 'http://localhost:5000';



const TIMER_START_STOP = 'timerPush';
const TIMER_WORK_REST = 'workRestPush';

const useTimer = (roomId) => {
    const [start, setStart] = useState(false);
    const [work, setWork] = useState(true);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const socketRef = useRef();
    const [alarmSound, setAlarmSound] = useState(false)

    // 
    //function for decrementing timer
    const decrement = () => {
        if (start === true) {
        const intervalId = setInterval(() => {
            setSeconds((prev) => prev - 1);
            setAlarmSound(false)
            console.log('alarm sound set',alarmSound)
        }, 1000);
    
        return () => {
            clearInterval(intervalId);
        };
        }
    }

    //calls decrement every time start changes
    useEffect(decrement, [start]);

// console.log(alarmSound)

    //function for adjusting display time
    const time = () => {
        if (start === true){
          if (seconds === -1 && minutes !== 0) {
            setSeconds(59);
            setMinutes((prev) => prev - 1);
          } else if (minutes === 0 && seconds === -1 && work === true) {
            setMinutes(5);
            setSeconds(0);
            setWork(false);
            setAlarmSound(true)
          } else if (minutes === 0 && seconds === -1 && work === false) {
            setMinutes(25);
            setSeconds(0);
            setWork(true);
            setAlarmSound(true)
          }
        }
    }

    //calls time on every re-render
    useEffect(time, [seconds]);


    useEffect(()=> {
        // creates websocket connection
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });
        
        // listens for timer start/stop push
        socketRef.current.on(TIMER_START_STOP, (data) => {
            setStart(!data.start);
        })

        socketRef.current.on(TIMER_WORK_REST, (data) => {
            const work = data.work
            setWork(!work)
            if (work === true){
                setMinutes(5);
                setSeconds(0);
              } else {
                setMinutes(25);
                setSeconds(0);
              }
    
        })

        // destroy socket reference when the connection is closed
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId,start]);

    //sends message to server that forwards to all users in room
    const sendStart = (start) => {
        socketRef.current.emit(TIMER_START_STOP, {
            start: start
        });
    }

    const sendWork = (work) => {
        socketRef.current.emit(TIMER_WORK_REST, {
            work: work,
        })
    }


    return {start, sendStart, work, sendWork, minutes, seconds, alarmSound}
}

export default useTimer

