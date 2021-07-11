const socket = io.connect('https://story-board-game.herokuapp.com/');
var userId, userName = "", playerStates = [] , story = "", isPlayerVoting = false;
var counter = 0;
var usersVoting = [], hasUserBeenFound = false;

window.onload = ()=>{
    document.getElementById('vote-box').style.display='none';
    document.getElementById('prevent-player').style.display='none'
    document.getElementById('popup-vote').innerHTML = "";
    document.getElementById('prevent-play').style.display='none';
    isPlayerVoting =false;
}

socket.on("user-id", id =>{
    userId = id;
});

socket.on('new-story-line',line => {
    addStoryToBox(line);
    document.getElementById('vote-box').style.display='none';
    document.getElementById('prevent-player').style.display='none'
    document.getElementById('popup-vote').innerHTML = "";
    isPlayerVoting =false;
    hasUserBeenFound = false;
    usersVoting = [];
});

socket.on('update-player-state',playerStatesNew => {
    playerStates = playerStatesNew;
    updateLeaderBoard();
    updateVoteBox();
});

function sendStoryLine() {
    if (document.getElementById('enter-box').value != "") {
        var line = document.getElementById('enter-box').value;
        if(line.slice(-1) != " " || line.slice(-1) != "\n" || line.slice(-1) != ",")
        {
            line += " ";
        }
        socket.emit("send-story-line", { line: line, id: userId });
        document.getElementById('enter-box').value = "";
        document.getElementById('vote-box').style.display = 'block';
        isPlayerVoting =true;
    }
}

function addStoryToBox(storyLine){
    story += storyLine;
    document.getElementById("voted-storybox").innerHTML = story;
}

function updateLeaderBoard()
{
    document.getElementById("player-list").innerHTML = "";
    var leaderboad = playerStates;
    //sorting for leaderboard
    for (var i = 0; i < leaderboad.length; i++) {
        for (var j = 0; j < i; j++) {
            if (leaderboad[i].score > leaderboad[j].score) {
                var temp = leaderboad[i];
                leaderboad[i] = leaderboad[j];
                leaderboad[j] = temp;
            }
        }
    }

    hasUserBeenFound = false;
    //adding elements to the leaderboard
    for (var i = 0; i < leaderboad.length; i++) {
        document.getElementById("player-list").innerHTML +=
            `<div class = "leaderboard-element"><div class = "profile-colour" style="background-color: ${leaderboad[i].colour};"></div>${leaderboad[i].name}  <p>${leaderboad[i].score}</p></div>`;

        //findind new text content
        var flag = 0;
        if (!hasUserBeenFound) {
            for (var j = 0; j < usersVoting.length; j++) {
                if (usersVoting[j] == playerStates[i].id) {
                    flag++
                    break;
                }
            }
            if (playerStates[i].line != "" && flag == 0) {
                hasUserBeenFound = true;
                usersVoting.push(playerStates[i].id);
                updatePactivityBox(playerStates[i]);
            }
        }
    }
    
    //checking number of players and making sure we have more than 3
    if(leaderboad.length < 3)
    {
        document.getElementById('enter-box').placeholder = "hold up, waiting for some more idiots to join";
        document.getElementById('enter-box').disabled = true;
    }
    else
    {
        document.getElementById('enter-box').placeholder = "write a god damned story";
        document.getElementById('enter-box').disabled = false;
    }    
}

function updateVoteBox()
{
    document.getElementById("popup-vote").innerHTML = "";
    for(var i = 0; i < playerStates.length; i++)
    {
        if(playerStates[i].line != "")
        {
            if (playerStates[i].id != userId) {
                document.getElementById("popup-vote").innerHTML +=
                `<div class="pop-back${i + 1}" style="background-color: ${playerStates[i].colour};">
                <div class="text-box" readonly disabled >${playerStates[i].line}</div>
                <button onclick = "castVote(${i})"><b>Vote for ${playerStates[i].name}</b></button>
                </div>`
            }
            else
            {
                document.getElementById("popup-vote").innerHTML +=
                `<div class="pop-back${i + 1}" disabled style="background-color: ${playerStates[i].colour};">
                <div class="text-box" readonly disabled >${playerStates[i].line}</div>
                <button><b>can't vote for self</b></button>
                </div>`
            }
        }
    }
}

function castVote(index)
{
    var vote = {candidate : playerStates[index].id, player : userId};
    socket.emit('cast-vote',vote, (voteCast) => {
        if(!voteCast)
        alert("voting failed, start contemplting life");
    });
    document.getElementById('prevent-player').style.display='block';
}

function updatePactivityBox(userData)
{
    const pactivityBox = document.getElementById('Pactivity-box');
    pactivityBox.innerHTML += 
    `<div class = "author-name">${userData.name}'s line :</div>
    <div class="story-line-written" style="background-color: ${userData.colour};">${userData.line}</div>`;
    var xH = pactivityBox.scrollHeight;
    pactivityBox.scrollTo(0, xH);
}

function checkEnterStory() {
    var last = document.getElementById('enter-box').value.slice(-1);
    if(last == "\n")
    {
        sendStoryLine();
    }
}