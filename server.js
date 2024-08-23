const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const userMapping = new Map();

app.use(express.json());

io.on('connection', (socket) => {
  console.log('New connection ');

  socket.on('join-room', (data) => {
    const { roomID, userName } = data;
    console.log('requesting for joining room', data);

    console.log(`user ${userName} joined room ${roomID}`);
    userMapping.set(socket.id, { userName, roomID });
    console.log('userMapping :', userMapping);

    socket.join(roomID);
    console.log('added');

    socket.emit('joined-room', { roomID });
    socket.broadcast.to(roomID).emit('user-joined', { userName });
  });

  socket.on('call-user', (data) => {
    try {
      const { roomID, offer } = data;
      const fromUserName = userMapping.get(socket.id).userName;

      console.log('Calling users in room:', roomID);
      console.log('Offer:', offer);

      socket.to(roomID).emit('incoming-call', { from: fromUserName, offer });
    } catch (error) {
      console.error('Error in call-user event:', error.message);
      socket.emit('error', { message: 'Failed to initiate call' });
    }
  });

  socket.on('call-accepted', (data) => {
    const { roomID, answer } = data;

    console.log('Call accepted in room:', roomID);
    console.log('Answer:', answer);

    socket.to(roomID).emit('call-accepted', { answer });
  });

  socket.on('ice-candidate', (data) => {
    const { roomID, candidate } = data;

    console.log('ICE candidate in room:', roomID);
    console.log('Candidate:', candidate);

    socket.to(roomID).emit('ice-candidate', { candidate });
  });

  socket.on('disconnect', () => {
    const userName = userMapping.get(socket.id).userName;
    const roomID = userMapping.get(socket.id).roomID;

    console.log(`user ${userName} left room ${roomID}`);
    userMapping.delete(socket.id);

    socket.broadcast.to(roomID).emit('user-left', { userName });
  });
});

server.listen(8000, () => console.log(`Backend server running on port 8000`));