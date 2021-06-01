const express = require('express');
const path = require('path');
const app = express();
const server  = app.listen(3000);
var connections = [];
var currentUser = 0;

const io = require('socket.io')(server);
const socket = require('socket.io');

//connection time stuff
io.on('connection', (client) => {
    console.log(client.id);
    connections.push(client.id);
    console.log(connections);
    client.emit('getUserId',client.id);

    //change turn after every 30 seconds
    if(connections.length > 1)
    {    
        setInterval(()=>{
            if(connections.length>1)
            {
                currentUser = (currentUser + 1) % (connections.length) ;
                io.emit('sendCurrentUser',connections[currentUser]);
                console.log("turn changes to : "+connections[currentUser]);
            }
        },30000);
    }
    else if(connections.length == 1)
    {
        io.emit('sendCurrentUser','no one else');
    }
    else if(connections.length == 0)
    {
        console.log("no users connected");
    }

    //message from the user to the server is parsed here.
    client.on('messgeToServer', (data)=>
    {
        console.log(data)
        if(`${data.clientId}` == `${connections[currentUser]}`)
        {
            client.broadcast.emit('messageToClients',data);
            console.log("message was broadcast");
        }
    });

    //disconnecting the user from the game
    client.on('disconnect',()=>{
        console.log("Trying to find disconnected user");
        for(var i = 0 ; i<=connections.length ; i++)
        {
            if(client.id == connections[i])
            {
                connections.splice(i,1);
                console.log(client.id + " was disconnected")
            }
        }
    });
});

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))