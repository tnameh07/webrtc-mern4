// import React, {useMemo, useEffect, useState, useCallback} from "react";
// const PeerContext = React.createContext(null);

// export const usePeer = () => React.useContext(PeerContext);

// export const PeerProvider = (props) => {
//     const [remoteStream, setRemoteStream] = useState(null);
//     const peer = useMemo(()=> new RTCPeerConnection({
//         iceServers: [
//             {
//                 urls: "stun:stun.l.google.com:19302",
//               },
//         ]
//     }) )

// const createOffer = async () => {
// const offer = await peer.createOffer();
// console.log("offer created  setting ld:", offer);

// const pc =await peer.setLocalDescription(offer);
// console.log("sld setted:", pc);
// return offer;

// };

// const createAnswer = async (offer) =>{
//     await peer.setRemoteDescription(offer)
//     const answer= await peer.createAnswer();

//     await peer.setLocalDescription(answer);

//     return answer;
// }

// const setRemoteAns = async (ans) =>{

//     console.log("Answer accep" );
//    await peer.setRemoteDescription(ans);

// }

// const  sendStream = async (stream) =>{
//     const tracks =stream.getTracks();
//     for(const  track of tracks){
//         peer.addTrack(track, stream);
//     }
// }
// const handleTrackEvent = useCallback( (ev)=>{
// const streams = ev.streams;
// console.log("streams :", streams);

// setRemoteStream(streams[0]);
// }, [])

// useEffect( ()=>{
//     peer.addEventListener('track', handleTrackEvent);

//     return () =>{
//         peer.removeEventListener('track', handleTrackEvent)
//     }
// },[handleTrackEvent,peer])

//     return (
//         <PeerContext.Provider value={ {peer, createOffer , createAnswer, setRemoteAns , sendStream, remoteStream}} >
//             {props.children}
//         </PeerContext.Provider>
//     )
// }
import React, { useMemo, useEffect, useState, useCallback } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionState, setConnectionState] = useState("new");
  const [iceCandidateEvent, setIceCandidateEvent] = useState(null);
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
    []
  );

  const createOffer = async () => {
    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  const createAnswer = async (offer) => {
    try {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  const setRemoteAns = async (ans) => {
    if (peer.signalingState === 'stable') {
        console.error('Cannot set remote answer in stable state');
        return;
      }
    try {
      await peer.setRemoteDescription(ans);
      console.log("Remote ans set");
      
    } catch (error) {
      console.error("Error setting remote answer:", error);
    }
  };

  const sendStream = async (stream) => {
    try {
      console.log("stream :", stream);
      
      // stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      const tracks  = stream.getTracks();
      for(const track of tracks){
        peer.addTrack(track, stream);
      
      }
      console.log("done");
      
    } catch (error) {
      console.error("Error sending stream:", error);
    }
  };

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
    setRemoteStream(streams[0]);
    console.log("setRomote streams :", streams);
    
  }, []);

  const handleICECandidate = useCallback((event) => {
    if (event.candidate) {
      setIceCandidateEvent(event.candidate);
    }
  }, []);



  useEffect(() => {
    peer.addEventListener("icecandidate", handleICECandidate);
    peer.addEventListener("track", handleTrackEvent);
   
    return () => {
      peer.removeEventListener("icecandidate", handleICECandidate);
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleICECandidate, handleTrackEvent]);

  const addICECandidate = async (candidate) => {
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  useEffect(() => {
    const handleConnectionStateChange = () => {
      setConnectionState(peer.connectionState);
      if (peer.connectionState === "connected") {
        console.log("Peer connection established successfully!");
      }
    };

    peer.addEventListener("connectionstatechange", handleConnectionStateChange);
    return () => {
      peer.removeEventListener(
        "connectionstatechange",
        handleConnectionStateChange
      );
    };
  }, [peer]);
  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
        connectionState,
        addICECandidate,
        handleICECandidate,
        iceCandidateEvent,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
