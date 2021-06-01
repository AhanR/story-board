var socket = io.connect('http://localhost:3000');
var userId,currentUserName,prevLength = 0,currentUserId,wordLength = 0;
var prevChar = "";

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
        prevChar = "";
    }
});


//getting user id of this client
socket.on('getUserId',(user)=>
{
    userId = user;
});


//checking when to call the send() function & when to send a 'deleted' handler
//preventing user from typing when not turn
document.addEventListener('keyup',(e)=>{

    var data = document.getElementById("messageBox").value;
    if(userId == currentUserId)
    {
        if(prevLength > data.length)
        {
            //this does not work
            //-------------------------------please look at this---------------------------
            wordLength--;
            prevLength = data.length;
            if(prevChar == " ")
            {
                console.log("correcting spaces")
                var messageBox = document.getElementById("messageBox");
                messageBox.value += " ";
            }
            else if(prevChar == "\n")
            {
                var messageBox = document.getElementById("messageBox");
                messageBox.value += "\n";
            }
            else if(prevChar == "")
            {
                var messageBox = document.getElementById("messageBox");
                messageBox.value += " ";
            }
        }
        else
        {
            send();
        }
        prevChar = data[data.length - 1];

    }
    else
    {
        var messageBox = document.getElementById("messageBox");
        messageBox.value = messageBox.value.slice(0,messageBox.value.length - 1);
    }
});

//takikng the input and sending to the server
function send(){

    //send key up data to server
    //data is the ey code of the key pressed
    //userData is the object that is being sent and broadcast
    var data = document.getElementById("messageBox").value;   
    wordLength++;
    if(data[data.length - 1] == " " || data[data.length - 1] == '\n')
    {
        data = data.slice(-wordLength);
        var userData = { userName : userNameInGame , clientId : userId , message : data };
        socket.emit('messgeToServer',userData);
        console.log("me :" + data);
        prevLength = data.length;
        wordLength = 0;
    }

    //adding message sent by user to messageBox
    var messageBox = document.getElementById("messageBox");
    messageBox.textContent += (data);
    currentUserName = "me";

    //showing the controlling user (currentUserName)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUserName;

}