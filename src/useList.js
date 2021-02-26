import {useEffect, useRef, useState} from 'react';
import socketIOClient from 'socket.io-client';

const NEW_TASK_EVENT = 'newTaskItem';
const SOCKET_SERVER_URL = 'https://pomodoer.herokuapp.com/';
const STATUS_CHANGE = 'statusChange'
const CLEAR_COMPLETE = 'clearCompleteTasks'

const useList = (roomId) => {
    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const socketRef = useRef();
    

    useEffect(()=> {
        // creates websocket connection
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });

        // listens for incoming tasks
        socketRef.current.on(NEW_TASK_EVENT, (task) => {
            const incomingTask = {
                ...task,
                ownedByCurrentUser: task.senderId === socketRef.current.id
            };

            //adds task to tasks list, adds corresponding status to statuses
            setTasks((tasks) => [...tasks, incomingTask])
            const copy = [...statuses];
            copy.push(false);
            setStatuses((statuses) => [...statuses, false])

        });

        // listens for status changes
        socketRef.current.on(STATUS_CHANGE, (data) => {
            const copy = [...data.status]
            copy[data.index] = !copy[data.index];
            setStatuses(copy);
        })

        // listens for clear 
        socketRef.current.on(CLEAR_COMPLETE, (data) => {
            const indices = []
            const statusesCopy = []
            for (let i=0; i < data.status.length; i++) {
                if (data.status[i] === true) {
                    indices.push(i)
                } else {
                    statusesCopy.push(false)
                }
            }

            setStatuses(statusesCopy)
            // setCompleteIndices(indices)
            

            // using indices to delete corresponding tasks
            const copy = [...data.tasks]
            for (let i=indices.length-1; i>(-1);i--) {
                copy.splice(indices[i],1)
            }
            setTasks(copy);

        })

        // destroy socket reference when the connection is closed
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId,statuses]);

    //sends message to server that forwards to all users in room
    const sendTask = (taskBody) => {
        socketRef.current.emit(NEW_TASK_EVENT, {
            body: taskBody,
            senderId: socketRef.current.id,
        });
    }

    //sends status change to server
    const sendStatus = (index,statuses) => {
        socketRef.current.emit(STATUS_CHANGE, {
            index: index,
            status: statuses,
        })
    }

    //sends clear notif to server
    const sendClear = (statuses,tasks) => {
        socketRef.current.emit(CLEAR_COMPLETE, {
            status: statuses,
            tasks: tasks,
        }) 
    }

    return {tasks, sendTask, statuses, sendStatus, sendClear}
}

export default useList