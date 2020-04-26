const express = require("express");
const app = express();

let broadcaster;
const port = process.env.PORT||3000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static(__dirname + "/public"));

// io.on('connection', function (socket) {
//   console.log(socket.id, 'joined');
//   socket.on('send_message', function (msg) {
//       io.broadcast.emit('receive_message',msg);
//   });
// });

io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  console.log('connected');

  socket.on('connect',()=>{
    console.log('connected');
  });

  socket.broadcast.emit('success','success');


  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});
server.listen(port, () => console.log(`Server is running on port ${port}`));
