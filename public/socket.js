var socket = io.connect('http://localhost:3000');
var userId, userName, playerStates = [] , story = "";

socket.on("user-id", id =>{
    userId = id;
});

socket.on('story-lines',storyLines => {
    playerStates = storyLines;
    updateLeaderBoard();
});

socket.on('player-left',playerStatesNew => {
    playerStates = playerStatesNew;
    updateLeaderBoard();
});

function sendStoryLine() {
    if (document.getElementById('enter-box').value != "") {
        console.log(document.getElementById('enter-box').value);
        socket.emit("send-story-line", {line : document.getElementById('enter-box').value , id : userId});
        document.getElementById('enter-box').value = "";
        var vote = prompt("add vote","id");
        castVote(vote);
    }
}

function addStoryToBox(storyLine){
    story += storyLine;
    document.getElementById("voted-storybox").textContent = story;
}

function updateLeaderBoard()
{
    document.getElementById("leaderboard").innerHTML = "<h3>leaderboard</h3>";
    for(var i = 0; i < playerStates.length; i++)
    {
        document.getElementById("leaderboard").innerHTML += `<div>${playerStates[i].name}  ${playerStates[i].score}</div>`;
    }
}

function castVote(vote)
{
    socket.emit('cast-vote',vote, (voteCast) => {
        if(!voteCast)
        alert("voting failed, start contemplting life");
    });
    //apply global popup and prevent user form voting
}

// document.getElementById("controllingUser").textContent = "rotating turns";