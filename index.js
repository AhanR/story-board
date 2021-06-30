const express = require('express');
const path = require('path');
const app = express();
const server = app.listen(3000, {
    cors: {
        origin: ["https://localhost:8080"]
    }
});

const io = require('socket.io')(server);
const socket = require('socket.io');

const firstLines = require('./firstLines');
const numberOfFirstLines = 30;

var playerStates = [] , flag = 0 , gameState = {story : "A long time ago " , playerStates : playerStates} , random = 0;
io.on("connection", (client) => {

    client.emit("user-id", client.id);
    console.log(client.id);
    playerStates.push({ name: "", id: client.id, line: "" , score : 0, votes : 0})

    client.on("new-player", (player, cb) => {

        for (var i = 0; i < playerStates.length; i++) {
            if (player.id == playerStates[i].id) {
                playerStates[i].name = player.name;
                console.log(playerStates[i].name + " connected");
                cb(gameState);
                updateLeaderBoard();
            }
        }
        console.log(playerStates);
    });

    client.on("send-story-line", storyLine => {

        for (var i = 0; i < playerStates.length; i++)
        {
            if (storyLine.id == playerStates[i].id)
            {
                playerStates[i].line = storyLine.line;
                console.log(playerStates[i].name + " wrote " + playerStates[i].line);
                updateLeaderBoard();
            }
        }
    });

    client.on('cast-vote',(vote,cb) =>{
        var notAPlayer = 0;
        for(var i =0; i < playerStates.length; i++)
        {
            if(vote == playerStates[i].id)
            {
                console.log("vote cast");
                playerStates[i].votes++;
                notAPlayer = 1;
                flag++;
            }
        }
        cb((notAPlayer)?true:false);
        if(flag == playerStates.length)
        {
            console.log("countitng votes");
            var winner = 0,winnerVotes = 0;
            for(var i = 0; i < playerStates.length; i++)
            {
                if(playerStates[i].votes >= winnerVotes)
                {
                    winner = i;
                    
                }
            }
            playerStates[winner].score++;
            gameState.story += playerStates[winner].line;
            io.emit('new-story-line',playerStates[winner].line);
            updateLeaderBoard();
            console.log(playerStates[winner].name);
            //clearing off the array the next round
            for(var i = 0; i < playerStates.length; i++)
            {
                playerStates[i].line = ""
                playerStates[i].votes = 0;
            }
            flag = 0;
        }
    });

    client.on("disconnect", () => {
        for (var i = 0; i < playerStates.length; i++) {
            if (client.id == playerStates[i].id) {
                playerStates.splice(i, 1);
                console.log(client.id + " was disconnected")
                updateLeaderBoard();
            }
        }
        if(playerStates.length == 0)
        {
            resetGameState();
        }
    });

    function updateLeaderBoard() {
        io.emit('update-player-state',playerStates);
    }
});

function resetGameState()
{
    random = (random + 1) % numberOfFirstLines;
    gameState.story = firstLines(random);
}

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))