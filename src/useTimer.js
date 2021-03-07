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

// var clientData = {
//     start: false,
//     work: true,
//     minutes: 25,
//     seconds: 0,
//     alarmSound: false,
//     infoReceived: false,
//     action: false,
//     countdown: 0,
//     clock: 0,
//     display: 0,
// }

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
    const socketRef = useRef();
    const [alarmSound, setAlarmSound] = useState(false)
    const [infoReceived, setInfoReceived] = useState(false)

    //initialize these after info pulled from server?

    const [countdown, setCountdown] = useState(1500000)
    const [clock, setClock] = useState(1614986917000)
    const [display, setDisplay] = useState(1500000)

    useEffect(()=> {
        // creates websocket connection
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });
        

        //listens for information on connection
        if (infoReceived === false) {
            socketRef.current.on(POPULATE_TIMER, (data) => {
                setCountdown(data.countdown)
                setDisplay(data.countdown)
                setClock(data.clock)
                setStart(data.action)
                console.log('connection information received', data)
                console.log('set with data',countdown,display,clock)
                setInfoReceived(true)
                calculateTime(data.countdown, data.clock);
                //convert();
                console.log('setInfoReceived', infoReceived)
            });
        }

        //listens for information
        socketRef.current.on(INFORMATION_TO_CLIENT, (data) => {
            setCountdown(data.countdown)
            setClock(data.clock)
            setStart(data.action)
            calculateTime(data.countdown, data.clock);
            console.log('information received', data)
        });

        socketRef.current.on(TIMER_WORK_REST, (data) => {
            setWork(data.work)
            if (data.work) {
                setDisplay(300000);
                setCountdown(300000);
                setClock(data.clock);
              } else {
                setDisplay(1500000);
                setCountdown(1500000);
                setClock(data.clock);
              }
        })

        // destroy socket reference when the connection is closed
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

    //calculates display time in ms based on server data
    const calculateTime = (currentCountdown, currentClock) => {
        if (infoReceived === true) {
            if (start === false) {
                setDisplay(currentCountdown)
            } else {
                const difference = Date.now()-currentClock
                setDisplay(Math.max(0,currentCountdown-difference))
                console.log('difference',difference)
                console.log('currentDate',Date.now())
            }
        }
    } 

    const checkAlarm = () => {
        if (infoReceived === true) {
            if (display === 0 && !alarmSound) {
                console.log('ALARM IS SOUNDING')
                setAlarmSound(true)
                const newWork = !work;
                sendWork(newWork);
            } else if (alarmSound) {
                setAlarmSound(false)
            }
        }
    }


    useEffect(() => {

        const foobar = setInterval(()=> {
            console.log(countdown, clock, 'doing things')
            calculateTime(countdown, clock);
            checkAlarm();
        }, 1000 )
        return function cleanup() {
            clearInterval(foobar)
        }
    
    });

    //sends message to server that forwards to all users in room
    const sendStart = (start) => {
        const newStart = !start;
        socketRef.current.emit(TIMER_START_STOP, {
            start: newStart,
            countdown: display,
            clock: Date.now()
        });
        setStart(newStart);
    }

    const sendWork = (work) => {
        console.log('is it work?', work)
        const newWork = !work;
        console.log('is it work now?', newWork);
        const newClock = Date.now();
        socketRef.current.emit(TIMER_WORK_REST, {
            work: newWork,
            clock: newClock
        })
        setWork(newWork);
        if (newWork) {
            console.log('because it is work, set to 25')
            setDisplay(1500000);
            setCountdown(1500000);
            setClock(newClock);
          } else {
            console.log('because it is not work, set to 5')
            setDisplay(300000);
            setCountdown(300000);
            setClock(newClock);
          }
    }

    return {start, sendStart, work, sendWork, display, alarmSound, infoReceived}
}

export default useTimer

