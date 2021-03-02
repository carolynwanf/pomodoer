
var fs = require('fs');

//var sslcert = fs.readFileSync('./server/ssl-cert.pem')
//var sslkey = fs.readFileSync('./server/ssl-key.pem'); 

var options = {
 //   key: sslkey,
   // cert: sslcert
};

var express = require('express');
var app = express();

var database = {};

var port = process.env.PORT || 5000

var server = app.listen(port, function() {
    console.log('Node app is running on port', port);
});

app.use(express.static('build'));


// cors for dev
// const io = require('socket.io')(server, {
//     cors: {
//         origin: "http://localhost:3000"
//     }
// });

// io declaration for production
const io = require('socket.io')(server);

const NEW_TASK_EVENT = "newTaskItem";
const STATUS_CHANGE = 'statusChange';
const CLEAR_COMPLETE = 'clearCompleteTasks';
const TIMER_START_STOP = 'timerPush';
const TIMER_WORK_REST = 'workRestPush';
const SENDING_USER_ID = 'sendId'

io.on('connection', (socket) => {

    // schema
    // {
    //    [roomId]: {
    //      users: [list of user IDs],
    //      tasks: [{
    //        body: string,
    //        status: boolean,
    //        owner: user ID
    //      }],
    //   }
    // }
    
    // join a room
    const {roomId} = socket.handshake.query;
    socket.join(roomId);
    if (!database[roomId]) {
        database[roomId] = {
            users: [],
            tasks: [{
                body: '',
                status: false,
                senderId: '',
            }]

        }
    }

    // listens for new tasks
    socket.on(NEW_TASK_EVENT, (data) => {
        io.in(roomId).emit(NEW_TASK_EVENT, data);

        // console.log('new task event data',data)

        // console.log('length of statuses', data.statuses.length)
        // console.log('length of database tasks', database[roomId].tasks.length)
        // for (let i=0; i< ((data.statuses.length+1) - database[roomId].tasks.length); i++) {
        //     console.log(i)
            const object = {
                body: '',
                status: false,
                senderId: '',
            }
            database[roomId].tasks.push(object)
        // }

        // if (database[roomId].tasks.length < data.statuses.length+1) {
            
        // }
        // console.log(JSON.stringify(database[roomId].tasks))
        // console.log('task at index', JSON.stringify(database[roomId].tasks[data.statuses.length]))
        database[roomId].tasks[database[roomId].tasks.length-1].body = data.body
        database[roomId].tasks[database[roomId].tasks.length-1].senderId = data.senderId
        // database[roomId].tasks.owner.push()
        // console.log('database tasks after push',JSON.stringify(database[roomId].tasks))
        
    });

    //listens for status change
    socket.on(STATUS_CHANGE, (data) => {
        io.in(roomId).emit(STATUS_CHANGE, data)
        database[roomId].tasks[data.index].status = !database[roomId].tasks[data.index].status
    
    })



    // console.log('connected')

    

    io.in(roomId).emit('populate',database[roomId].tasks)
    // console.log('populated')
    io.in(roomId).emit('users', database[roomId].users)
  


 

    socket.on(SENDING_USER_ID, (data) => {
        database[roomId].users.push(data.userId)
    })

    //leave room if user closes socket
    socket.on('disconnect', () => {
        socket.leave(roomId);
    });

    // listens for clear notif and removes cleared tasks from database
    socket.on(CLEAR_COMPLETE, (data) => {
        io.in(roomId).emit(CLEAR_COMPLETE, data);
        console.log('clear data', data)
        console.log(JSON.stringify(database[roomId].tasks))

        // removes tasks with "true" status from database
        for (let i=data.status.length-1; i>(-1); i--) {
            if (data.status[i] === true) {
                database[roomId].tasks.splice(i,1)
            }
        }
    })

    socket.on(TIMER_START_STOP, (data) => {
        io.in(roomId).emit(TIMER_START_STOP, data);
    })

    socket.on(TIMER_WORK_REST, (data) => {
        io.in(roomId).emit(TIMER_WORK_REST, data);
    })

    
})

// server.listen(PORT, () => {
//     console.log(`listening on port ${PORT}`)
// })