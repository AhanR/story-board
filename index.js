const express = require('express');
const path = require('path');
const app = express();
const server  = app.listen(3000);

const io = require('socket.io')(server);
const socket = require('socket.io');

//connection time stuff
io.on('connection', (client) => {
    console.log(client.id);
    client.emit('getUserId',client.id);

    //message from the user to the server is parsed here.
    client.on('messgeToServer', (data)=>
    {
        console.log(data)
        client.broadcast.emit('messageToClients',data);
    });
});


//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))