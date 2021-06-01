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

    currentUser = 0;

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
});

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))