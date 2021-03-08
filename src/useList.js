import {useEffect, useRef, useState} from 'react';
import socketIOClient from 'socket.io-client';

const NEW_TASK_EVENT = 'newTaskItem';

//for heroku
const SOCKET_SERVER_URL = 'https://pomodoer.herokuapp.com/';
//for local environ.
// const SOCKET_SERVER_URL = 'http://localhost:5000';

const STATUS_CHANGE = 'statusChange'
const CLEAR_COMPLETE = 'clearCompleteTasks'
const SENDING_USER_ID = 'sendId'
const useList = (roomId) => {
    const [tasks, setTasks] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const socketRef = useRef();
    // console.log('tasks after useList called', tasks)

    useEffect(()=> {
        console.log('creating new websocket connection');
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


        // listens for population 
        socketRef.current.on('populate', (data) => {

            // console.log('populate',data)
            // console.log(data.length)

            const savedTasks = [...tasks]
            for (let i=0; i < data.length; i++) {
                savedTasks.push(data[i])
            }

            for (let i=0; i<savedTasks.length; i++) {
                if (savedTasks[i].senderId === socketRef.current.id) {
                    savedTasks[i].ownedByCurrentUser = true
                } else { 
                    savedTasks[i].ownedByCurrentUser = false
                }
            }


            // console.log('saved tasks', savedTasks)
            setTasks(savedTasks);
                
    
            
        })

        // listens for status changes
        socketRef.current.on(STATUS_CHANGE, (data) => {
            const copy = [...data.status]
            copy[data.index] = !copy[data.index];
            setStatuses(copy);
        })

        // listens for connection
        socketRef.current.on('connect', ()=>{
            // console.log(socketRef.current.id)
            sendId(socketRef.current.id)
            //maybe add population in here?

        });

        // socketRef.current.on(SENDING_USER_ID, (data) => {
        //     console.log('listening for sending user id', data)
        // })

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
            
            // corrects owner association
            for (let i=0; i<copy.length; i++) {
                if (copy[i].senderId === socketRef.current.id) {
                    copy[i].ownedByCurrentUser = true
                } else { 
                    copy[i].ownedByCurrentUser = false
                }
            }

            setTasks(copy);
        })

        // destroy socket reference when the connection is closed
        return () => {
            socketRef.current.disconnect();
        };
    }, [roomId]);

    //sends message to server that forwards to all users in room
    const sendTask = (taskBody) => {
        socketRef.current.emit(NEW_TASK_EVENT, {
            body: taskBody,
            senderId: socketRef.current.id,
            statuses: statuses
        });
    }

    // sends user Id to server
    const sendId = (userId) => {
        socketRef.current.emit(SENDING_USER_ID, {
            userId: userId
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

    // const populateTasks = (tasks) => {
    //     socketRef.current.emit('populate', {
    //         tasks:tasks,
    //     })
    // }


    return {tasks, sendTask, statuses, sendStatus, sendClear}
}

export default useList