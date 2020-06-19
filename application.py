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


@app.route("/newchannel", methods=["POST"])
def newchannel():
    # Get start and end point for channels to generate.
    channel = request.form.get("channel")
    # Generate list of channels.
    channels[channel] = []
    # Return list of posts.
    return jsonify([channel])

@app.route("/listchannels", methods=["POST"])
def listchannels():
    listchannels = [i for i in channels.keys()]
    return jsonify(listchannels)

@socketio.on("submit vote")
def vote(data):
    selection = data["selection"]
    votes[selection] += 1
    emit("vote totals", votes, broadcast=True)


