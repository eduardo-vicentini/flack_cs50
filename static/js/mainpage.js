

// Button should start disabled and if is empty
function disable_button(buttom, field) {

    if (field.value.length > 0)
        buttom.disabled = false;
    else
        buttom.disabled = true;

    return false;
}

let setUsername = document.querySelector('#setUsername');
let submitUsername = document.querySelector('#submitUsername');
let setChannel = document.querySelector('#setChannel');
let submitChannel = document.querySelector('#submitNewChannel');
setUsername.onkeyup = () => {disable_button(submitUsername, setUsername)};
setChannel.onkeyup = () => {disable_button(submitNewChannel, setChannel)};


function checkUsername() {
    if (localStorage.getItem("username")) {
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

document.querySelector("#formUsername").onsubmit = () => {
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


// Add a new channel with given contents to DOM.
// Load next set of posts.
function load() {

    // Open new request to get new posts.
    const request = new XMLHttpRequest();
    request.open('POST', '/listchannels');
    
    request.onload = () => {
        const data = JSON.parse(request.responseText);
        data.forEach(add_post);
    };

    // Add start and end points to request data.
    const data = new FormData();

    // Send request.
    request.send(data);
    return false;
}

// Add a new post with given contents to DOM.
var post_template = Handlebars.compile(document.querySelector('#post').innerHTML);
function add_post(contents) {

    // Create new post.
    const post = post_template({'contents': contents});

    // Add post to DOM.
    document.querySelector('#posts').innerHTML += post;
}

document.addEventListener('DOMContentLoaded', () => {

    // First load
    checkUsername();
    load();

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        document.querySelector("#formNewChannel").onclick = () => {
            const channel = document.getElementById("setChannel").value;
            socket.emit('new channel', {'channel': channel});
            
            document.getElementById("setChannel").value = '';
            return false;
        };
    });

    // When a new vote is announced, add to the unordered list
    socket.on('created channel', data => {
        add_post(data.name);
    });
});

/* 
TODO ------------------------------------------------------------
-----------------------------------------------------------------
-----------------------------------------------------------------
*/

