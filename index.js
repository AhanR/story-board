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
var playerStates = [], gameState = { story: `<a title = "computer generated line line" style = "background-color : rgb(31, 83, 151); color : white">A long time ago </a>`, playerStates: playerStates }, random = 0, totalVotes = 0;
var playerColours = ["#AD75E0","#D88361","#E2D62B","#6CC519","#19C5AE","#4FA3EC","#DD34FF","#790A0A"];

io.on("connection", (client) => {

    client.emit("user-id", client.id);
    playerStates.push({ name: "untitled", id: client.id, line: "", score: 0, votes: 0, voted: "", colour : "#62B7D9"});

    client.on("new-player", (player, cb) => {
        for (var i = 0; i < playerStates.length; i++) {
            if (player.id == playerStates[i].id) {
                //selecting colour
                playerStates[i].colour = playerColours[0];
                playerColours.splice(0,1);

                //setting other player attributes
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

                //handling colour deallocaction :
                playerColours.push(playerStates[i].colour);

                //handling votes exception :
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
        gameState.story = `<a title = "computer generated line line" style = "background-color : rgb(31, 83, 151); color : white">${firstLines(random)}</a>`;
        totalVotes = 0;
    }

    function countVotes() {
        if (totalVotes == playerStates.length && playerStates.length != 0) {

            var winner = 0, winnerVotes = 0;
            for (var i = 0; i < playerStates.length; i++) {
                if (playerStates[i].votes >= winnerVotes) {
                    winner = i;
                    winnerVotes = playerStates[i].votes;
                }
            }
            playerStates[winner].score++;
            //--------------------------------------------------------check this -------------------------------------------
            // //checking for the brightness of the colour
            // var r = parseInt(`${playerStates[winner].colour}`.splice(1,2));
            // var g = parseInt(playerStates[winner].colour.splice(3,2));
            // var b = parseInt(playerStates[winner].colour.splice(5,2));
            var fontColour = "white";
            // if(Math.sqrt(r*r + g*g + b*b) > Math.sqrt(parseInt('7F')*parseInt('7F')*3))
            // {
            //     fontColour = "black";
            // }
            // else{
            //     fontColour = "white";
            // }
            storyLineWinner = `<a title = "${playerStates[winner].name}'s line" style = "background-color : ${playerStates[winner].colour}; color : ${fontColour}">${playerStates[winner].line}</a>`
            io.emit('new-story-line', storyLineWinner);
            gameState.story += storyLineWinner;
            updateLeaderBoard();

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