import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

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



@app.route("/listchannels", methods=["POST"])
def listchannels():
    listchannels = [i for i in channels.keys()]
    return jsonify(listchannels)

@socketio.on("new channel")
def newchannel(data):
    name = data["channel"]

    if has_channel(name):
        emit("not created channel", {"name": "Channel Name Already in Use"}, broadcast=False)
    else:
        channels[name] = []
        emit("created channel", {"name": name}, broadcast=True)


