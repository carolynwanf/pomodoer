import {useEffect, useState, useRef} from 'react';
import socketIOClient from 'socket.io-client';


//for heroku
// const SOCKET_SERVER_URL = 'https://pomodoer.herokuapp.com/';

//for local environ.
const SOCKET_SERVER_URL = 'http://localhost:5000';



const TIMER_START_STOP = 'timerPush';
const TIMER_WORK_REST = 'workRestPush';
const INFORMATION_TO_CLIENT = 'sendInfo';
const POPULATE_TIMER = 'populateTimer';

var clientData = {
    start: false,
    work: true,
    minutes: 25,
    seconds: 0,
    alarmSound: false,
    infoReceived: false,
    action: false,
    countdown: 0,
    clock: 0,
    display: 0,
}

// var start = clientData.start
// var work = clientData.work
// var minutes = clientData.minutes
// var seconds = clientData.seconds
// var alarmSound = clientData.alarmSound
// var infoReceived = clientData.infoReceived
// var action = clientData.action
// var countdown = clientData.countdown
// var clock = clientData.clock
// var display = display 

const useTimer = (roomId) => {
    
    const [start, setStart] = useState(false);
    const [work, setWork] = useState(true);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const socketRef = useRef();
    const [alarmSound, setAlarmSound] = useState(false)
    const [infoReceived, setInfoReceived] = useState(false)

    //initialize these after info pulled from server?

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

        //listens for information on connection
        if (infoReceived === false) {
            socketRef.current.on(POPULATE_TIMER, (data) => {
                setAction(data.action)
                setCountdown(data.countdown)
                setDisplay(data.countdown)
                setClock(data.clock)
                setStart(data.action)
                console.log('connection information received', data)
                console.log('set with data', action,countdown,display,clock)
                setInfoReceived(true)
                console.log('setInfoReceived', infoReceived)
            });
        }

        //listens for information
        socketRef.current.on(INFORMATION_TO_CLIENT, (data) => {
            setAction(data.action)
            setCountdown(data.countdown)
            setClock(data.clock)
            setStart(data.action)
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
    }, [roomId]);

    //calculates display time in ms based on server data
    const calculateTime = () => {
        if (action === false) {
            setDisplay(countdown)
            console.log('setting display',display,countdown)
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
        console.log('between setting minutes and seconds', display)
        setSeconds(Math.floor ((display/1000) % 60))
        console.log('inside conversion', display, minutes, seconds)
        if (minutes === seconds === 0) {
            setAlarmSound(true)
            setWork(!work)
            socketRef.current.emit(TIMER_WORK_REST, {
                work:work
            })
            console.log('inside conditional in conversion' )
        } else {
            setAlarmSound(false)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            calculateTime();
            convert();
        }, 0);
    })

    //sends message to server that forwards to all users in room
    const sendStart = (start) => {
        socketRef.current.emit(TIMER_START_STOP, {
            start: start,
            countdown: display,
        });
    }

    const sendWork = (work) => {
        socketRef.current.emit(TIMER_WORK_REST, {
            work: work,
        })
    }

    return {start, sendStart, work, sendWork, minutes, seconds, alarmSound, infoReceived}
}

export default useTimer

