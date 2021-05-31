var socket = io.connect('http://localhost:3000');
var userId,currentUser,prevLength = 0;

socket.on('connect', () => {
    console.log("connected to the interwebs server")
});

//adding the message broadcasted from the server to messageBox
socket.on('messageToClients',(data)=>{
    var messageBox = document.getElementById("messageBox");
    messageBox.value += data.message;
    prevLength = messageBox.value.length;

    //setting the controlling user (currentUser)
    currentUser = data.userName;

    //showing the controlling user (currentUser)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUser;

    console.log("message from server : "+data.message);
});


//getting user id / user name in the future
socket.on('getUserId',(user)=>
{
    userId = user;
});


//takikng the input and sending to the server
function send(){


    //send key up data to server
    //data is the ey code of the key pressed
    //userData is the object that is being sent and broadcast
    var data = document.getElementById("messageBox").value;
    if(data.length != prevLength && data != "")
    {    
        data = data.slice(-1);
        var userData = { userName : userId , message : data };
        socket.emit('messgeToServer',userData);
        console.log("me :" + data);
        prevLength = data.length;
    }

    //adding message sent by user to messageBox
    var messageBox = document.getElementById("messageBox");
    messageBox.textContent += (data);
    currentUser = "me";

    //showing the controlling user (currentUser)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUser;
}