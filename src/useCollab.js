import React, {useState,useEffect,useRef} from 'react';
import socketIOClient from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';
const PASSWORD_PLEASE = 'requestPassword';
const ADD_PASSWORD = 'addPassword';

const useCollab = (roomId) => {
    const socketRef = useRef();
    const [databasePassword, setDatabasePassword] = useState('')
  
    useEffect(() => {
        socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
            query:{roomId},
        });

        //listens for password from server
        socketRef.current.on(PASSWORD_PLEASE, (data) => {
            setDatabasePassword(data)
            console.log('password data',JSON.stringify(data))
        });
        
          
    })

  
    const sendPassword = (password) => {
        socketRef.current.emit(ADD_PASSWORD, {
            password: password
        });
    }
    // useEffect(()=>{
      
  
   return {databasePassword, sendPassword}  
    
}

export default useCollab