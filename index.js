const express = require('express');
const path = require('path');
const app = express();
const server = app.listen(3000, {
    cors: {
        origin: ["https://localhost:8080"]
    }
});
var connections = [];

const io = require('socket.io')(server);
const socket = require('socket.io');


//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
const firstLines = require('./firstLines');
const numberOfFirstLines = 30;

var playerStates = [] , flag = 0 , gameState = {story : "A long time ago " , playerStates : playerStates} , random = 0;
io.on("connection", (client) => {

    client.emit("user-id", client.id);
    playerStates.push({ name: "", id: client.id, line: "" })

    client.on("new-player", (player, cb) => {

        for (var i = 0; i < playerStates.length; i++) {
            if (player.id == playerStates[i].id) {
                playerStates[i].name = player.name;
                console.log(playerStates[i].name + " connected");
                cb(gameState);
            }
        }

    });

    client.on("send-story-line", storyLine => {

        for (var i = 0; i < playerStates.length; i++)
        {
            if (storyLine.id == playerStates[i].id)
            {
                playerStates[i].line = storyLine.line;
                console.log(playerStates[i].name + " wrote " + playerStates[i].line);
                io.emit('story-lines',playerStates);
                flag++;
            }
        }
        if(flag == playerStates.length)
        {
            console.log("voting begins");
        }
    });

    client.on("disconnect", () => {
        for (var i = 0; i < playerStates.length; i++) {
            if (client.id == playerStates[i].id) {
                playerStates.splice(i, 1);
                console.log(client.id + " was disconnected")
            }
        }
        if(playerStates.length == 0)
        {
            resetGameState();
        }
    });
});

function resetGameState()
{
    random = (random + 1) % numberOfFirstLines;
    gameState.story = firstLines(random);
}

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))