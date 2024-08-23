// import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
// import { useSocket } from "../providers/Socket";
// import { usePeer } from "../providers/Peer";
// const Roompage = () => {
//   const { socket } = useSocket();
//   const {
//     peer,
//     createOffer,
//     createAnswer,
//     setRemoteAns,
//     sendStream,
//     remoteStream,
//   } = usePeer();
//   const [mystream, setMyStream] = useState(null);
//   const [remoteID, setRemoteId] = useState(null);
//   // const [remoteStream, setRemoteStream] = useState(null);
//   const handleNewUserJoined = useCallback(
//     async (data) => {
//       const { emailID } = data;
//       console.log(data);

//       console.log("New user joined room ", emailID);
//       const offer = await createOffer();
//       console.log("offer : ", offer);

//       socket.emit("call-user", { emailID, offer });
//       setRemoteId(emailID);
//     },
//     [createOffer, socket]
//   );

//   const handleIncommingCall = useCallback(async (data) => {
//     const { from, offer } = data;
//     console.log("data ", data);

//     console.log("Incomming Call From ", from, " Offer : ", offer);

//     const ans = await createAnswer(offer);
//     socket.emit("call-accepted", { emailID: from, ans });

//     setRemoteId(offer);
//   }, []);

//   const handleCallAccepted = useCallback(
//     async (data) => {
//       const { ans } = data;

//       console.log("call got accepted", ans);

//       const answ = await setRemoteAns(ans);
//       console.log("answ", answ);

//       sendStream(mystream);
//     },
//     [setRemoteAns]
//   );
//   useEffect(() => {
//     socket.on("user-joined", handleNewUserJoined);
//     socket.on("incomming-call", handleIncommingCall);
//     socket.on("call-accepted", handleCallAccepted);

//     return () => {
//       socket.off("user-joined", handleNewUserJoined);
//       socket.off("incomming-call", handleIncommingCall);
//     };
//   }, [handleIncommingCall, handleNewUserJoined, socket, handleCallAccepted]);

//   const getUserMediaStream = useCallback(async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: true,
//       video: true,
//     });
//     //  sendStream(stream)
//     console.log("get user media :", stream);

//     setMyStream(stream);
//   }, []);

//   useEffect(() => {
//     getUserMediaStream();
//   }, [getUserMediaStream]);

//   const handleNegotiation = useCallback(() => {
//     console.log("Opps! nagotiation needed");
//     const localOffer = peer.localDiscription;
//     socket.emit("call-user", { emailID: remoteID, offer: localOffer });
//   }, [peer.localDiscription, remoteID, socket]);
//   useEffect(() => {
//     peer.addEventListener("negotiationneeded", handleNegotiation);

//     return () => {
//       peer.removeEventListener("negotiationneeded", handleNegotiation);
//     };
//   }, []);
//   return (
//     <div className="room-page-container">
//       <h1> video room</h1>
//       <h4>You are connected to ${remoteID}</h4>
//       <button onClick={(e) => sendStream(mystream)}>join call</button>
//       <ReactPlayer url={mystream} playing />
//       <ReactPlayer url={remoteStream} playing />
//     </div>
//   );
// };

// export default Roompage;