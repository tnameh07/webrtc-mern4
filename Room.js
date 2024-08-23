import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../providers/Socket';
import { usePeer } from '../providers/Peer';
import ReactPlayer from 'react-player';

const Roompage = () => {
  const { socket } = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAns, sendStream, remoteStream, addICECandidate, connectionState } = usePeer();
  const [mystream, setMyStream] = useState(null);
  const [remoteId, setRemoteId] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);

  useEffect(() => {
    if (peer) {
      peer.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { candidate: event.candidate, to: remoteId });
        }
      });
    }
  }, [peer, remoteId, socket]);


  const handleNewUserJoined = useCallback(async (data) => {
    const { emailID } = data;
    console.log('New user joined room', emailID);
    const offer = await createOffer();
    // console.log('Offer:', offer);
    console.log("sending offer",offer);
    
    socket.emit('call-user', { emailID, offer });
    setRemoteId(emailID);
  }, [createOffer, socket]);

  const handleIncomingCall = useCallback(async (data) => {
    try {
      const { from, offer } = data;
      console.log('Incoming Call From', from, 'Offer:', offer);
      const answer = await createAnswer(offer);
      console.log("sending Answer", answer);
      
      socket.emit('call-accepted', { emailID: from, answer });
      setRemoteId(from);
    } catch (error) {
      console.error('Error handling incoming call:', error);
    }
  }, [createAnswer, socket]);

  const handleCallAccepted = useCallback(async (data) => {
    const { answer } = data;
    console.log('Call accepted', answer);
    await setRemoteAns(answer);
    if (mystream) {
        console.log( "mystream :",mystream);
        
    //   sendStream(mystream);
    }else  console.log( "emptystream :",mystream);

  }, [setRemoteAns, mystream]);

  const handleNegotiationNeeded = useCallback(() => {
    if (!peer.localDescription) return;
  
    console.log("Negotiation needed");
    console.log(`Remote ID: ${remoteId}, Local Offer: ${peer.localDescription}`);
  
    socket.emit('call-user', { emailID: remoteId, offer: peer.localDescription });
  }, [peer, remoteId, socket]);
  
  useEffect(() => {
    if (peer) {
      peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
      return () => {
        peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
      };
    }
  }, [handleNegotiationNeeded, peer]);

  useEffect(() => {
    socket.on('user-joined', handleNewUserJoined);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('ice-candidate', async ({ candidate }) => {
      console.log('Received ICE candidate:', candidate);
      await addICECandidate(candidate);
    });

    return () => {
      socket.off('user-joined', handleNewUserJoined);
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('ice-candidate');
    };
  }, [handleNewUserJoined, handleIncomingCall, handleCallAccepted, socket, addICECandidate]);

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      console.log('Got user media:', stream);
      setMyStream(stream);   
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }, []);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="room-page-container">
      <div className="room-page">
        <p>Connection State: {connectionState}</p>
        <h1>Video Room</h1>
        <h4>You are connected to {remoteId}</h4>
        <button onClick={(e) => sendStream(mystream)}>Join Call</button>
        <ReactPlayer url={mystream} playing />
        <ReactPlayer url={remoteStream} playing />
      </div>
    </div>
  );
};

export default Roompage;