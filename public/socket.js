var socket = io.connect('http://localhost:3000');
var userId, userName = "", playerStates = [] , story = "";
var counter = 0;

window.onload = ()=>{
    document.getElementById('vote-box').style.display='none';
    document.getElementById('prevent-player').style.display='none'
    document.getElementById('popup-vote').innerHTML = "";
}

socket.on("user-id", id =>{
    userId = id;
});

socket.on('new-story-line',line => {
    // if ((story.slice(-1) == " " || story.slice(-1) == "\n") && (line.slice(0,1) != "." || line.slice(0,1) != "," || line.slice(0,1) != "!")) {
    //     line = " ." + line;
    // }
    addStoryToBox(line);
    document.getElementById('vote-box').style.display='none';
    document.getElementById('prevent-player').style.display='none'
    document.getElementById('popup-vote').innerHTML = "";
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
    }
}

function addStoryToBox(storyLine){
    story += storyLine;
    document.getElementById("voted-storybox").textContent = story;
}

function updateLeaderBoard()
{
    document.getElementById("leaderboard").innerHTML = "<h3>leaderboard</h3>";
    var leaderboad = playerStates;
    for(var i = 0; i < leaderboad.length; i++)
    {
        for(var j = 0; j < i; j++)
        {
            if(leaderboad[i].score > leaderboad [j].score)
            {
                var temp = leaderboad[i];
                leaderboad[i] = leaderboad[j];
                leaderboad[j] = temp;
            }
        }
    }

    for(var i = 0; i < leaderboad.length; i++)
    {
        document.getElementById("leaderboard").innerHTML += `<div>${playerStates[i].name}  <p>${playerStates[i].score}</p></div>`;
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
                `<div class="pop-back${i + 1}">
                <div class="text-box" readonly disabled >${playerStates[i].line}</div>
                <button onclick = "castVote(${i})"><b>Vote for ${playerStates[i].name}</b></button>
                </div>`
            }
            else
            {
                document.getElementById("popup-vote").innerHTML +=
                `<div class="pop-back${i + 1}">
                <div class="text-box" readonly disabled >${playerStates[i].line}</div>
                <button><b>can't vote for self</b></button>
                </div>`
            }
        }
    }
}

function castVote(index)
{
    var vote = playerStates[index].id;
    socket.emit('cast-vote',vote, (voteCast) => {
        if(!voteCast)
        alert("voting failed, start contemplting life");
    });
    console.log("casting vote");
    document.getElementById('prevent-player').style.display='block'
}

// document.getElementById("controllingUser").textContent = "rotating turns";