import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
# MAYBE USE FLASK SESSION
import time

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


class Channel:

    def __init__(self, username, name):
        self.name = name
        self.username = username 
        self.messages = []

    def __str__(self):
        return f"Channel {self.name} created by {self.username}"

class Message:

    def __init__(self, username, text, message_date):
        self.username = username
        self.text = text
        self.message_date = message_date

    def __str__(self):
        return f"{text} by {username}"

# Channels dictionary
channels = {}

@app.route("/")
def index():

    return render_template("index.html")


def has_channel(name):

    if name in channels.keys():
        return True
    else:
        return False

def limit(array):
    if len(array) >= 100:
        return True
    else:
        return False



@app.route("/listchannels", methods=["POST"])
def listchannels():
    listchannels = [i for i in channels.keys()]
    return jsonify(listchannels)


@socketio.on("new channel")
def newchannel(data):
    name = data["channel"].strip()
    username = data["username"].strip()

    if has_channel(name):
        emit("not created channel", {"name": "Channel Name Already in Use"}, broadcast=False)
    else:
        if limit(channels.keys()):
            del channels[channels.keys()[0]]

        channels[name] = Channel(username, name)
        
        emit("created channel", {"name": name}, broadcast=True)



@app.route("/channel/<name>", methods=["GET", "POST"])
def channel_message(name):
    if request.method == "GET":

        return render_template("channel.html", name=name)

    else:
        pass

@app.route("/listmessages/<name>", methods=["POST"])
def listmessages(name):
    channel = channels[name]

    data = []
    for i in channel.messages:
        
        data.append({"message": i.text, "username": i.username, 'time': i.message_date})
    
    return jsonify(data)


@socketio.on("new message")
def newmessage(data):
    channelName = data["channel"]
    message = data["message"].strip()
    username = data["username"].strip()
    message_date = time.asctime( time.localtime(time.time()) )


    messages = channels[channelName].messages
    

    if limit(messages):
        messages.pop(0)

    messages.append(Message(username, message, message_date))

  
    emit("created message", {"channel": channelName, "message": message, 
            "username": username, "time": message_date}, broadcast=True)

