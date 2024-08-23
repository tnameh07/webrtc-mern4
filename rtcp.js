const { socket } = require("server/router");

const myroom = io.sockets.rooms[room] || {length:0}
const numClient = myroom.length; 

const  iceServers =[ {
    urls:["stun server"]
}]
   


socket.on('ready', (event)=> { 
    rtcPeerConnection= new RTCPeerConnection(iceServers)
rtcPeerConnection.onicecandidate = onIceCandidate
rtcPeerConnection.ontrack = onAddStream
rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)
rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
rtcPeerConnection.createOffer()
.then( sessionDescription =>{
    console.log("sending offer");
    
    rtcPeerConnection.setLocalDescription(sessionDescription)
    socket.emit('offer', {
        type:'offer',
        sdp:sessionDescription,
        room:roomnumber
        
    })
}).catch((err)=>
console.log(err)
)})

socket.on('offer', (event)=> { 
    if(!isCaller)
        rtcPeerConnection= new RTCPeerConnection(iceServers)
rtcPeerConnection.onicecandidate = onIceCandidate
rtcPeerConnection.ontrack = onAddStream
rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream)
rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream)

console.log("recieved offer");

rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
rtcPeerConnection.createAnswer()
.then( sessionDescription =>{
    console.log("sending Answer");
    
    rtcPeerConnection.setLocalDescription(sessionDescription)
    socket.emit('answer', {
        type:'answer',
        sdp:sessionDescription,
        room:roomnumber
        
    })
}).catch((err)=>
console.log(err)
)})

socket.on('answer', (event)=> { 
  console.log("recived answer", event);
  
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    
})

socket.on('candidate', event => {
    const condidate = new RTCIceCandidate({
        sdpMLineIndex:event.label,
        candidate:event.candidate
    })
    console.log("recived candidate");
    rtcPeerConnection.addIceCandidate(candidate)
    
})

function onAddStream(event){

    remoteVideo.srcObjecet = event.streams[0]
    remoteStream = event.streams[0]
}

function onIceCandidate(event){


    if(event.candidate){
        console.log("Sending Ice candidate", event.candidate);
        socket.emit('candidate', {
            type:candidate,
            label: event.candidate.sdpMLineIndex,
            id: event.candidate,
            candidate: event.candidate.candidate,
            room: noomNumber
        })
        
    }
} 