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
                if(player.colour == "no colour")
                {
                    playerStates[i].colour = playerColours[0];
                    playerColours.splice(0,1);
                    playerColours.push(playerStates[i].colour);
                }
                else
                {
                    playerStates[i].colour = player.colour;
                }

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
            //checking for the brightness of the colour
            var fontColour = "white";
            var r = hexToInt(playerStates[winner].colour.substring(1, 3));
            var g = hexToInt(playerStates[winner].colour.substring(3, 5));
            var b = hexToInt(playerStates[winner].colour.substring(5, 7));
            if(Math.sqrt(r*r + g*g + b*b) > 194)
            {
                fontColour = "black";
            }
            else{
                fontColour = "white";
            }
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

    function hexToInt(num)
    {
        var result = 0;
        var t = 0;
        while(t < 2)
        {
            var letter = num.substring(0,1);
            letter.toUpperCase();
            switch(letter)
            {
                case '1' :
                    result += Math.pow(16,t)*1;
                    break;
                case '2' :
                    result += Math.pow(16,t)*2;
                    break;
                case '3' :
                    result += Math.pow(16,t)*3;
                    break;
                case '4' :
                    result += Math.pow(16,t)*4;
                    break;
                case '5' :
                    result += Math.pow(16,t)*5;
                    break;
                case '6' :
                    result += Math.pow(16,t)*6;
                    break;
                case '1' :
                    result += Math.pow(16,t)*1;
                    break;
                case '7' :
                    result += Math.pow(16,t)*7;
                    break;
                case '8' :
                    result += Math.pow(16,t)*8;
                    break;
                case '9' :
                    result += Math.pow(16,t)*9;
                    break;
                case '0' :
                    result += Math.pow(16,t)*0;
                    break;
                case 'A' :
                    result += Math.pow(16,t)*10;
                    break;
                case 'B' :
                    result += Math.pow(16,t)*11;
                    break;
                case 'C' :
                    result += Math.pow(16,t)*12;
                    break;
                case 'D' :
                    result += Math.pow(16,t)*13;
                    break;
                case 'E' :
                    result += Math.pow(16,t)*14;
                    break;
                case 'F' :
                    result += Math.pow(16,t)*15;
                    break;
                default :
                    break;
            }
            t++;
        }
        return result;
    }
});


server.listen(process.env.PORT || 3000)

//loading static libraries
app.use(express.static(path.join(__dirname, 'public')))