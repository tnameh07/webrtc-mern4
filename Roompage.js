import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import ReactPlayer from "react-player";

const UserVideo = ({
  stream,
  emailID,
  muted,
  isLocal,
  isAudioEnabled,
  isVideoEnabled,
}) => {
  return (
    <div className="user-video">
      {stream && (isLocal ? isVideoEnabled : true) ? (
        <ReactPlayer
          playing
          muted={muted}
          height="100%"
          width="100%"
          url={stream}
        />
      ) : (
        <div className="avatar">
          <img src="/default-avatar.png" alt={`Avatar for ${emailID}`} />
        </div>
      )}
      <p>
        {emailID} {!isAudioEnabled && isLocal && "(Muted)"}
      </p>
    </div>
  );
};

const Roompage = () => {
  const { socket } = useSocket();
  const {
    peers,
    setPeers,
    createPeer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    addICECandidate,
    connectionStates,
    handleConnectionStateChange,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const handleNewUserJoined = useCallback(
    async (data) => {
      console.log(`${userName} joined the room`);
      const { emailID } = data;
      console.log("New user joined room", emailID);
      const peer = createPeer();
      const offer = await createOffer(peer);
      socket.emit('call-user', { roomID, offer });
      setPeers((prevPeers) => ({
        ...prevPeers,
        [emailID]: { peer, stream: null },
      }));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: emailID,
          });
        }
      };

      peer.ontrack = (event) => {
        setPeers((prevPeers) => ({
          ...prevPeers,
          [emailID]: { ...prevPeers[emailID], stream: event.streams[0] },
        }));
      };

      peer.onconnectionstatechange = () => {
        handleConnectionStateChange(emailID, peer.connectionState);
      };
    },
    [createPeer, createOffer, socket, setPeers, handleConnectionStateChange]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming Call From", from, "Offer:", offer);
      const peer = createPeer();
      const answer = await createAnswer(peer, offer);
      socket.emit("call-accepted", { emailID: from, answer });
      setPeers((prevPeers) => ({
        ...prevPeers,
        [from]: { peer, stream: null },
      }));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: from,
          });
        }
      };

      peer.ontrack = (event) => {
        setPeers((prevPeers) => ({
          ...prevPeers,
          [from]: { ...prevPeers[from], stream: event.streams[0] },
        }));
      };

      peer.onconnectionstatechange = () => {
        handleConnectionStateChange(from, peer.connectionState);
      };
    },
    [createPeer, createAnswer, socket, setPeers, handleConnectionStateChange]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { emailID, answer } = data;
      console.log("Call accepted by", emailID);
      const peer = peers[emailID]?.peer;
      if (peer) {
        await setRemoteAns(peer, answer);
        socket.emit('call-accepted', { roomID, answer });
        if (myStream) {
          sendStream(peer, myStream);
        }
      }
    },
    [peers, setRemoteAns, sendStream, myStream]
  );

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", async ({ candidate, from }) => {
      const peer = peers[from]?.peer;
      if (peer) {
        await addICECandidate(peer, candidate);
      }
    });
    socket.on("user-left", (emailID) => {
      setPeers((prevPeers) => {
        const newPeers = { ...prevPeers };
        delete newPeers[emailID];
        return newPeers;
      });
    });

    return () => {
      socket.off("user-joined");
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("user-left");
    };
  }, [
    socket,
    handleNewUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    peers,
    addICECandidate,
    setPeers,
  ]);

  // ... (rest of the component remains the same)

  useEffect(() => {
    const getUserMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };
    getUserMediaStream();
  }, []);

  const toggleAudio = () => {
    if (myStream) {
      myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !isAudioEnabled));
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const joinCall = () => {
    Object.values(peers).forEach(({ peer }) => {
      if (peer && myStream) {
        sendStream(peer, myStream);
      }
    });
  };

  return (
    <div className="room-page-container">
      <div className="room-page">
        <h1>Video Room</h1>
        <div className="video-grid">
          <UserVideo
            stream={myStream}
            emailID="You (Me)"
            muted={true}
            isLocal={true}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
          />
          {Object.entries(peers).map(([emailID, peerData]) => (
            <UserVideo
              key={emailID}
              stream={peerData.stream}
              emailID={emailID}
              muted={false}
              isLocal={false}
            />
          ))}
        </div>
        <div className="controls">
          <button onClick={toggleAudio}>
            {isAudioEnabled ? "Mute Myself" : "Unmute Myself"}
          </button>
          <button onClick={toggleVideo}>
            {isVideoEnabled ? "Turn Off My Camera" : "Turn On My Camera"}
          </button>
          <button onClick={joinCall}>Join Call</button>
        </div>
      </div>
    </div>
  );
};

export default Roompage;
