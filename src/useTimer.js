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

const useTimer = (roomId) => {
    
    // initialize states + refs

    // is the timer started?
    const [start, setStart] = useState(false);
    // is the timer in work mode or rest mode?
    const [work, setWork] = useState(true);
    // who is the current user interacting with client
    const socketRef = useRef();
    // is the alarm supposed to be going off?
    const [alarmSound, setAlarmSound] = useState(false)
    // has initial info been received from teh server
    const [infoReceived, setInfoReceived] = useState(false)
    // what was the timer at the last time someone pressed start/stop or work/rest?
    const [countdown, setCountdown] = useState(1500000)
    // what was the time the last time someone pressed a button
    const [clock, setClock] = useState(1614986917000)
    // what should the timer be displaying (in ms)
    const [display, setDisplay] = useState(1500000)

    useEffect(()=> {
        // creates websocket connection
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });
        

        //receives info from server on connection if info has not been received yet
        if (infoReceived === false) {
            socketRef.current.on(POPULATE_TIMER, (data) => {
                setStart(data.action)
                setCountdown(data.countdown)
                setDisplay(data.countdown)
                setClock(data.clock)
                setInfoReceived(true)
                calculateTime(true, data.action, data.countdown, data.clock);
                // console.log('connection information received', data)
            });
        }

        // listens for info from database that is emitted when start/stop button is pushed, 
        // when work/rest button is pushed, or when timer counts down to zero
        socketRef.current.on(INFORMATION_TO_CLIENT, (data) => {
            setCountdown(data.countdown)
            setClock(data.clock)
            setStart(data.action)
            calculateTime(true, data.action, data.countdown, data.clock);
            // console.log('information received', data)
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

    // calculates timer time in ms based on server data
    const calculateTime = (currentInfoReceived, currentStart, currentCountdown, currentClock) => {
        if (currentInfoReceived) {
            if (!currentStart) {
                setDisplay(currentCountdown)
            } else {
                const difference = Date.now()-currentClock
                setDisplay(Math.max(0,currentCountdown-difference))
                // console.log('difference',difference)
                // console.log('currentDate',Date.now())
            }
        }
    } 

    // checks if alarm should be sounding
    const checkAlarm = () => {
        if (infoReceived === true) {
            if (display === 0 && !alarmSound) {
                // console.log('ALARM IS SOUNDING')
                setAlarmSound(true)
                const newWork = work;
                sendWork(newWork);
            } else if (alarmSound) {
                setAlarmSound(false)
            }
        }
    }

    // calls calculateTime and checkAlarm every second
    useEffect(() => {

       if (start) {
        const foobar = setInterval(()=> {
            // console.log(countdown, clock, 'doing things')
            calculateTime(infoReceived, start, countdown, clock);
            checkAlarm();
        }, 1000 )
        return function cleanup() {
            clearInterval(foobar)
        }
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

    // sends work status to server and alters display time when work/rest is clicked or timer hits 0
    const sendWork = (work) => {
        // console.log('is it work?', work)
        const newWork = !work;
        // console.log('is it work now?', newWork);
        const newClock = Date.now();
        socketRef.current.emit(TIMER_WORK_REST, {
            work: newWork,
            clock: newClock
        })
        setWork(newWork);
        if (newWork) {
            // console.log('because it is work, set to 25')
            setDisplay(1500000);
            setCountdown(1500000);
            setClock(newClock);
          } else {
            // console.log('because it is not work, set to 5')
            setDisplay(300000);
            setCountdown(300000);
            setClock(newClock);
          }
    }

    return {start, sendStart, work, sendWork, display, alarmSound, infoReceived}
}

export default useTimer

