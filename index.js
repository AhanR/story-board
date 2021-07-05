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
var playerStates = [], gameState = { story: "A long time ago ", playerStates: playerStates }, random = 0, totalVotes = 0;

io.on("connection", (client) => {

    client.emit("user-id", client.id);
    playerStates.push({ name: "untitled", id: client.id, line: "", score: 0, votes: 0, voted: "" })

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

        for (var i = 0; i < playerStates.length; i++) {
            if (storyLine.id == playerStates[i].id) {
                playerStates[i].line = storyLine.line;
                updateLeaderBoard();
            }
        }
    });

    client.on('cast-vote', (vote, cb) => {
        var notAPlayer = 0;
        var j;
        for (var i = 0; i < playerStates.length; i++) {
            if (vote.candidate == playerStates[i].id) {
                console.log("voted for : " + playerStates[i].name);
                playerStates[i].votes++;
                notAPlayer = 1;
                totalVotes++;
            }
            if (playerStates[i].id == vote.player) {
                j = i;
            }
        }
        if(notAPlayer == 1)
        {
            playerStates[j].voted = vote.candidate;
        }
        cb((notAPlayer) ? true : false);
        countVotes();
    });

    client.on("disconnect", () => {
        for (var i = 0; i < playerStates.length; i++) {
            if (client.id == playerStates[i].id) {
                if(playerStates[i].voted != '')
                {
                    totalVotes--;
                }
                playerStates.splice(i, 1);
                updateLeaderBoard();
            }
        }
        if (playerStates.length == 0) {
            resetGameState();
        }
        countVotes();
    });

    function updateLeaderBoard() {
        io.emit('update-player-state', playerStates);
    }

    function resetGameState() {
        random = (random + 1) % numberOfFirstLines;
        gameState.story = firstLines(random);
        totalVotes = 0;
    }

    function countVotes() {
        console.log("---------Counting Votes----------");
        // // checking wheter we have all the votes
        // var votes = 0;
        // for (var i = 0; i < playerStates.length; i++) {
        //     votes += playerStates[i].votes;
        // }
        if (totalVotes == playerStates.length && playerStates.length != 0) {

            var winner = 0, winnerVotes = 0;
            for (var i = 0; i < playerStates.length; i++) {
                if (playerStates[i].votes >= winnerVotes) {
                    winner = i;
                    winnerVotes = playerStates[i].votes;
                }
            }
            playerStates[winner].score++;
            io.emit('new-story-line', playerStates[winner].line);
            gameState.story += playerStates[winner].line;
            updateLeaderBoard();
            console.log("winner : " + playerStates[winner].name);

            //clearing off the array the next round
            for (var i = 0; i < playerStates.length; i++) {
                playerStates[i].line = ""
                playerStates[i].votes = 0;
                playerStates[i].voted = "";
            }
            totalVotes = 0;
        }
    }
});


server.listen(process.env.PORT || 3000)

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))