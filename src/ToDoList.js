import React from 'react';

import useList from './useList';
import './ToDoList.css';
import Button from 'react-bootstrap/Button';

const ToDoList = (props) => {
    const roomId =  props.room; // gets roomId from props
    console.log('roomId', roomId)
    const {tasks, sendTask, statuses, sendStatus, sendClear} = useList(roomId);
    const [newTask, setNewTask] = React.useState("");

    

    // handles typing input
    const handleChange = (e) => {
        setNewTask(e.target.value);
    }

    //need tasks to updated here every time someone joins a room
    
    // sends task to server so it shows up for both people
    const handleSubmit = () => {
        sendTask(newTask);
        setNewTask('');
    }

    // makes it so that hitting the enter key also works for submission
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    // on click of task, sends statuses and index so that statuses can be updated
    const handleClick = (e) => {
        console.log('handleClick');
        e.preventDefault();
        const index = e.currentTarget.id;
        sendStatus(index,statuses)
    }

    // on click of clear, updates and sends tasks and statuses to server
    const handleClear = () => {
        console.log('handleClear called')
        sendClear(statuses,tasks);
    }
    console.log('about to render', tasks);

    return (
        <div className='taskList-page'>
            <div className='ToDoForm'>
                <div className="toDoFormTitle">
                    <p>TASKS:</p>
                </div>
                <input
                    value={newTask}
                    type='text'
                    onChange={handleChange}
                    placeholder="add a task..."
                    onKeyPress={handleEnter}
                    className='taskInput'
                ></input>
                <Button variant='tertiary' className = 'addTask' onClick={handleSubmit}>ADD</Button>
            </div>
            
            <div className='tasks-container'>
                
                <ul className='checklist'>
                    <p>TO DO:</p>
                    {tasks.map((task,i)=> {
                        console.log(task, i)
                        return (
                        <li
                            key={i}
                            id={i}
                            className= {`todo ${task.ownedByCurrentUser ? "my-task" : "other-task"} ${statuses[i] ? "strike" : ""} ${task.status ? "strike": ""}`}
                            onClick={handleClick}
                
                        >
                            {task.body}
                        </li>
                        
                    )})}
                </ul>
            </div>
            <Button className='center' variant='primary' onClick={handleClear}>CLEAR</Button>     
        </div>
    );
};

export default ToDoList;