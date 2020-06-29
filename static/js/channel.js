
// Name of the actual channel
NAME = document.title;

// Button should start disabled and if is empty
function disable_button(buttom, field) {

    if (field.value.trimLeft().length > 0)
        buttom.disabled = false;
    else
        buttom.disabled = true;

    return false;
}


var newMessage = document.querySelector('#newMessage');
var submitMessage = document.querySelector('#submitMessage');


function checkUsername() {
    if (localStorage.getItem("username")) {
        var username = localStorage.getItem("username");
        const itens_hide = document.getElementsByClassName("hide-if-username");
        const itens_show = document.getElementsByClassName("show-if-username");
        for (let i = 0; i < itens_hide.length; i++)
        {
            itens_hide[i].style.display = 'none';
        }

        for (let i = 0; i < itens_show.length; i++)
        {
            itens_show[i].style.display = 'block';
        }
        document.querySelector("#username").innerHTML = localStorage.getItem("username");
    }
    else {
        document.querySelector("#username").innerHTML = "";
        
        const itens_hide = document.getElementsByClassName("hide-if-username");
        const itens_show = document.getElementsByClassName("show-if-username");
        for (let i = 0; i < itens_hide.length; i++)
        {
            itens_hide[i].style.display = 'block';
        }

        for (let i = 0; i < itens_show.length; i++)
        {
            itens_show[i].style.display = 'none';
        }
    }
}

document.querySelector("#formNewMessage").onsubmit = () => {
    const username = setUsername.value;
    localStorage.setItem('username', username);
    checkUsername();
    return false;
};

document.getElementById("deleteButton").onclick = () => {
    localStorage.removeItem('username');
    checkUsername();
    return false;
};

/* 
TODO ------------------------------------------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------
*/

// If hide button is clicked, delete the post.
document.addEventListener('click', event => {
    const element = event.target;
    if (element.className === 'hide') {
        element.parentElement.style.animationPlayState = 'running';
        element.parentElement.addEventListener('animationend', () =>  {
            element.parentElement.remove();
        });
    }
});
// ---------------------------------------------------------



function load(name) {

 
    const request = new XMLHttpRequest();
    request.open('POST', `/listmessages/${name}`);
    
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        data.forEach(add_post);
    };


    const data = new FormData();


    request.send(data);
    return false;
}

// Add a new channel with given contents to DOM.
var message_template = Handlebars.compile('<p> {{ message }}</p> <p>posted by: {{ username }}</p><button class="hide">Hide</button><br>');
function add_post(data) {

    const channelDiv = document.createElement('div');
    channelDiv.className = 'channel';

    const message = message_template({'message': data.message,'username': data.username});
    channelDiv.innerHTML = message;
  
    // Add channel to DOM.
    document.querySelector('#messages').append(channelDiv);

}

document.addEventListener('DOMContentLoaded', () => {

    // First load
    newMessage.onkeyup = () => {disable_button(submitMessage, newMessage)};
    checkUsername();
    load(NAME);

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        document.querySelector("#submitMessage").onclick = () => {
            const message = document.getElementById("newMessage").value;
            socket.emit('new message', {'message': message, 'username': localStorage.getItem("username"), 'channel': NAME});
            
            document.getElementById("newMessage").value = '';
            disable_button(submitMessage, newMessage)
            return false;
        };
    });

    // When a new vote is announced, add to the unordered list
    socket.on('created message', data => {
        add_post(data);
    });
});

/* 
TODO ------------------------------------------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------
*/

