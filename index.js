const express = require('express');
const path = require('path');
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*"
  },
});

const firstLines = require('./firstLines');
const numberOfFirstLines = 30;
var playerStates = [] , flag = 0 , gameState = {story : "A long time ago " , playerStates : playerStates} , random = 0;

io.on("connection", (client) => {

    client.emit("user-id", client.id);
    playerStates.push({ name: "untitled", id: client.id, line: "" , score : 0, votes : 0})

    client.on("new-player", (player, cb) => {
        for (var i = 0; i < playerStates.length; i++) {
            if (player.id == playerStates[i].id) {
                playerStates[i].name = player.name;
                cb(gameState);
                updateLeaderBoard();
            }
        }
    });

    client.on("send-story-line", storyLine => {

        for (var i = 0; i < playerStates.length; i++)
        {
            if (storyLine.id == playerStates[i].id)
            {
                playerStates[i].line = storyLine.line;
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
                console.log("vote cast " + playerStates[i].name);
                playerStates[i].votes++;
                console.log(playerStates);
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
                    winnerVotes = playerStates[i].votes;
                }
            }
            playerStates[winner].score++;
            io.emit('new-story-line',playerStates[winner].line);
            gameState.story += playerStates[winner].line;
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

server.listen(process.env.PORT || 3000)

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))