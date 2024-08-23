import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";

const io = new Server({
  cors: true,
});
const app = express();

app.use(bodyParser.json());

const emailToSocektMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New connection ");

  socket.on("join-room", (data) => {
    const { roomID, emailID } = data;
    console.log("requesting for joinng room", data);

    console.log(`user ${emailID}  joined room ${roomID}`);
    emailToSocektMapping.set(emailID, socket.id);
    socketToEmailMapping.set(socket.id, emailID);
    console.log("emailToSocketIdMapping :", emailToSocektMapping);
    console.log("socketToEmailMapping :", socketToEmailMapping);

    socket.join(roomID);
    console.log("added");

    socket.emit("joined-room", { roomID });
    socket.broadcast.to(roomID).emit("user-joined", { emailID });
  });

  socket.on("call-user", (data) => {
    try {
      const { emailID, offer } = data;
      const fromEmail = socketToEmailMapping.get(socket.id);
      const socketID = emailToSocektMapping.get(emailID);
  
      if (!socketID) {
        throw new Error(`Socket for ${emailID} not found`);
      }
  
      console.log("Calling user:", fromEmail, "to socket id", socketID);
      console.log("Offer:", offer);
  
      socket.to(socketID).emit("incoming-call", { from: fromEmail, offer });
    } catch (error) {
      console.error("Error in call-user event:", error.message);
      socket.emit('error', { message: "Failed to initiate call" });
    }
  });

  socket.on("call-accepted", (data) => {
    const { emailID, answer } = data;

    const socketID = emailToSocektMapping.get(emailID);
    socket.to(socketID).emit("call-accepted", { answer });
  });
});

app.listen(8000, () => console.log(`backend server running port 8000`));
io.listen(8001);
