var socket = io.connect('http://localhost:3000');
var userId,currentUser;

socket.on('connect', () => {
    console.log("connecting to the interwebs server")
});

//adding the message broadcasted from the server to messageBox
socket.on('messageToClients',(data)=>{
    var messageBox = document.getElementById("messageBox");
    messageBox.textContent += data.message;

    //setting the controlling user (currentUser)
    currentUser = data.userName;

    //showing the controlling user (currentUser)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUser;

    console.log("message from server : "+data.message);
});

socket.on('getUserId',(user)=>
{
    userId = user;
});

//takikng the input and sending to the server
function print(){

    //send input box data to server
    //data is the message from textbox
    //userData is the object that is being sent and broadcast
    var data = document.getElementById("inputBox");
    if(data.value != "")
    {    
        //add newline here
        data.value = data.value;

        var userData = { userName : userId , message : data.value};
        socket.emit('messgeToServer',userData);
        console.log("me :"+data.value);
    }
     
    //adding message sent by user to messageBox
    var messageBox = document.getElementById("messageBox");
    messageBox.textContent += (data.value);
    currentUser = "me";

    //showing the controlling user (currentUser)
    var controllingUser = document.getElementById("controllingUser");
    controllingUser.textContent = "User in control : " + currentUser;

    //clearing the input box
    data.value = null;
}