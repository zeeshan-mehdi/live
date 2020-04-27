let peerConnection;
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

const socket = io.connect(window.location.origin);
const video = document.querySelector("video");

socket.on("offer", (id, description) => {
  console.log('offer watch.js ');
  console.log(id);
  console.log(description);
  
  peerConnection = new RTCPeerConnection(config);
  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });

    peerConnection.onaddstream = event => {
      console.log('stream added ');
      console.log(event.stream);
      video.srcObject = event.stream;
    };
  peerConnection.ontrack = event => {
    console.log('track added ');
    console.log(event.streams[0]);
    video.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {

    if (event.candidate) {
      var obj = {
        'id':id,
        'candidate':{
          'sdpMLineIndex': event.candidate.sdpMlineIndex,
          'sdpMid': event.candidate.sdpMid,
          'candidate': event.candidate.candidate,
        }
      }
      socket.emit("candidate", obj);
    }   
  };
});

socket.on("candidate", (data) => {
  let id = data['id'];
  let candidate = data['candidate'];
  console.log('candidate watch.js');
  console.log(id);
  console.log(candidate);
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  console.log('connect watch.js');
  socket.emit("watcher");
});

// socket.on("connection", () => {
//   console.log('connection watch.js');
//   socket.emit("watcher");
// });

socket.on("broadcaster", () => {
  console.log('broadcaster watch.js');
  socket.emit("watcher");
});

socket.on("disconnectPeer", () => {
  try{
  peerConnection.close();
  }catch(e){
    console.log(e);
  }
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};
