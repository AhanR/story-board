var socket = io.connect('http://localhost:3000');
var userId, userName, playerStates = [] , story = "";

socket.on("user-id", id =>{
    userId = id;
});

socket.on('story-lines',storyLines => {
    playerStates = storyLines;
})

function sendStoryLine() {
    if (document.getElementById('enter-box').value != "") {
        console.log(document.getElementById('enter-box').value);
        socket.emit("send-story-line", {line : document.getElementById('enter-box').value , id : userId});
        document.getElementById('enter-box').value = "";
    }
}

function addStoryToBox(storyLine){
    story += storyLine;
    document.getElementById("voted-storybox").textContent = story;
}

// document.getElementById("controllingUser").textContent = "rotating turns";