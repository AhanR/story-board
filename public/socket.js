var socket = io.connect('http://localhost:3000');
var userId,currentUserName,prevLength = 0,currentUserId;

userNameInGame = prompt("enter username");

//showing connection
socket.on('connect', () => {
    console.log("connected to the interwebs server")
});

//adding the message broadcasted from the server to messageBox
socket.on('messageToClients',(data)=>{
    var messageBox = document.getElementById("messageBox");
    messageBox.value += data.message;
    prevLength = messageBox.value.length;

    //setting the controlling user (currentUserName)
    currentUserName = data.userName;

    //showing the controlling user (currentUserName)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUserName;

    console.log("message from server : "+data.message);
});

//receiving the controlling user from the server & updating game status
socket.on('sendCurrentUser',(currentUser)=>{
    currentUserId = currentUser;

    //updating game status
    if(currentUserId == userId)
    {
        document.getElementById("controllingUser").textContent = "your turn";
    }
    else
    {
        document.getElementById("controllingUser").textContent = "rotating turns";
    }
});


//getting user id of this client
socket.on('getUserId',(user)=>
{
    userId = user;
});


//doing the onkeyup thing
document.addEventListener('keyup',()=>{
    if(userId == currentUserId)
    {
        send();
    }
    else
    {
        var messageBox = document.getElementById("messageBox");
        messageBox.value = messageBox.value.slice(0,messageBox.value.length - 1);
        console.log("delete last element");
    }
});

//takikng the input and sending to the server
function send(){

    //send key up data to server
    //data is the ey code of the key pressed
    //userData is the object that is being sent and broadcast
    var data = document.getElementById("messageBox").value;
    if(data.length > prevLength && data != "")
    {    
        data = data.slice(-1);
        var userData = { userName : userNameInGame , clientId : userId , message : data };
        socket.emit('messgeToServer',userData);
        console.log("me :" + data);
        prevLength = data.length;
    }

    //adding message sent by user to messageBox
    var messageBox = document.getElementById("messageBox");
    messageBox.textContent += (data);
    currentUserName = "me";

    //showing the controlling user (currentUserName)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUserName;

}