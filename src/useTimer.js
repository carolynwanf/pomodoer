import {useEffect, useState, useRef} from 'react';
import socketIOClient from 'socket.io-client';


//for heroku
// const SOCKET_SERVER_URL = 'https://pomodoer.herokuapp.com/';

//for local environ.
const SOCKET_SERVER_URL = 'http://localhost:5000';



const TIMER_START_STOP = 'timerPush';
const TIMER_WORK_REST = 'workRestPush';
const INFORMATION_TO_CLIENT = 'sendInfo';

const useTimer = (roomId) => {
    const [start, setStart] = useState(false);
    const [work, setWork] = useState(true);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const socketRef = useRef();
    const [alarmSound, setAlarmSound] = useState(false)

    // 
    //function for decrementing timer
    // const decrement = () => {
    //     if (start === true) {
    //     const intervalId = setInterval(() => {
    //         setSeconds((prev) => prev - 1);
    //         setAlarmSound(false)
    //         console.log('alarm sound set',alarmSound)
    //     }, 1000);
    
    //     return () => {
    //         clearInterval(intervalId);
    //     };
    //     }
    // }

    //calls decrement every time start changes
    // useEffect(decrement, [start]);

// console.log(alarmSound)

    //function for setting work when timer ticks down to zero
    // const time = () => {
    //     if (start === true){
    //       if (minutes === 0 && seconds === 0 && work === true) {
    //         setWork(false);
    //       } else if (minutes === 0 && seconds === 0 && work === false) {
    //         setMinutes(25);
    //         setSeconds(0);
    //         setWork(true);
    //       }
    //     }
    // }

    //calls time on every re-render
    // useEffect(time, [seconds]);

    const [action,setAction] = useState(false)
    const [countdown, setCountdown] = useState(1500000)
    const [clock, setClock] = useState(1614986917000)
    const [display, setDisplay] = useState(1500000)

    useEffect(()=> {
        // creates websocket connection
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });
        
        // listens for timer start/stop push
        socketRef.current.on(TIMER_START_STOP, (data) => {
            setStart(!data.start);
            console.log('start/stop received')
        });

        //listens for information
        socketRef.current.on(INFORMATION_TO_CLIENT, (data) => {
            // setAction(data.action)
            // setCountdown(data.countdown)
            // setClock(data.clock)
            console.log('information received', data)
        });


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

    //calculates display time in ms based on server data
    const calculateTime = () => {
        if (action === false) {
            setDisplay(countdown)
        } else {
            const difference = Date.now()-clock
            setDisplay(Math.max(0,countdown-difference))
            console.log('difference',difference)
            console.log('currentDate',Date.now())
        }
        console.log('inside caluclateTime',display)
    } 

    const convert = () => {
        setMinutes(Math.floor(display/1000/60))
        setSeconds(Math.floor ((display/1000) % 60))
        console.log('inside conversion', minutes, seconds)
        if (minutes === seconds === 0) {
            setAlarmSound(true)
            if (work === true) {
                socketRef.current.emit(TIMER_WORK_REST, {
                    work:work
                })
                setWork(false)
            } else {
                socketRef.current.emit(TIMER_WORK_REST, {
                    work:work
                })
                setWork(true)
            }
        } else {
            setAlarmSound(false)
        }
    }

    // // runs convert and calculateTime every second when start is true
    // if (start === true) {
    //     setInterval(function(){ 
    // //     calculateTime()
    // //     convert()      
    //     }, 1000);
    // }

    useEffect(() => {
        calculateTime()
        convert()
    },[action,countdown,clock,seconds,start])

    

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

