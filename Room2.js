import   React,{ useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const Roompage = () => {
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,addICECandidate,connectionState,iceCandidateEvent
  } = usePeer();
  const [mystream, setMyStream] = useState(null);
  const [remoteId, setRemoteId] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);



  useEffect(() => {
    if (iceCandidateEvent && remoteId) {
        socket.emit('ice-candidate', { candidate: iceCandidateEvent, to: remoteId });
    }
}, [iceCandidateEvent, remoteId, socket]);
  // Handle a new user joining the room
  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailID } = data;
      console.log("New user joined room", emailID);
      const offer = await createOffer();
      console.log("Offer:", offer);
      socket.emit("call-user", { emailID, offer });
      setRemoteId(emailID);
    },
    [createOffer, socket]
  );
 
  // Handle incoming calls
  const handleIncomingCall = useCallback(async (data) => {
    try {
      const { from, offer } = data;
      console.log("Incoming Call From", from, "Offer:", offer);
      const answer = await createAnswer(offer);
      socket.emit('call-accepted', { emailID: from, answer });
      setRemoteId(from);
    } catch (error) {
      console.error("Error handling incoming call:", error);
    }
  }, [createAnswer, socket]);

  // Handle call acceptance
  const handleCallAccepted = useCallback(
    async (data) => {
      const { answer } = data;
      console.log("Call accepted", answer);
      await setRemoteAns(answer);
      if (mystream) {
        sendStream(mystream);
      }
    },
    [setRemoteAns, sendStream, mystream]
  );
 
  // Set up socket event listeners
  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("Received ICE candidate:", candidate);
      await addICECandidate(candidate);
    });

    // Add this to your existing useEffect that sets up socket event listeners

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off('ice-candidate');
    };
  }, [handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket ,addICECandidate]);

  // Get user media stream
  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("Got user media:", stream);
      setMyStream(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }, []);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  // Handle negotiation needed event
  const handleNegotiation = useCallback(async () => {
    console.log("Negotiation needed");
    console.log("remoteID :", remoteId);
    
    const offer = await peer.createOffer();
    socket.emit("call-user", { emailID: remoteId, offer });
  }, [peer, remoteId, socket]);

  useEffect(() => {
    if (peer) {
      peer.addEventListener("negotiationneeded", handleNegotiation);
      return () => {
        peer.removeEventListener("negotiationneeded", handleNegotiation);
      };
    }
  }, [peer, handleNegotiation]);

  return (
    <div className="room-page-container">
    
      <div className="room-page">
        <p>Connection State: {connectionState}</p>
        <h1> video room</h1>
        <h4>You are connected to {remoteId}</h4>{" "}
        <button onClick={(e) => sendStream(mystream)}>join call</button>
        <ReactPlayer url={mystream} playing />
        <ReactPlayer url={remoteStream} playing />
      </div>
    </div>
  );
};

export default Roompage;
