export const PeerProvider = (props) => {
    const [peers, setPeers] = useState({});
    const [connectionStates, setConnectionStates] = useState({});
  
    const createPeer = useCallback(() => {
      return new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
    }, []);
  
    const createOffer = async (peer) => {
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    };
  
    const createAnswer = async (peer, offer) => {
      try {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
      } catch (error) {
        console.error("Error creating answer:", error);
      }
    };
    socket.emit('ice-candidate', { roomID, candidate: event.candidate });
    socket.on('user-left', ({ userName }) => {
        console.log(`${userName} left the room`);
        setPeers(prevPeers => {
          const newPeers = { ...prevPeers };
          const leftUserEmail = Object.keys(newPeers).find(email => newPeers[email].userName === userName);
          if (leftUserEmail) {
            delete newPeers[leftUserEmail];
          }
          return newPeers;
        });
      });
    const setRemoteAns = async (peer, ans) => {
      try {
        await peer.setRemoteDescription(ans);
        console.log("Remote ans set");
      } catch (error) {
        console.error("Error setting remote answer:", error);
      }
    };
  
    const sendStream = async (peer, stream) => {
      try {
        const tracks = stream.getTracks();
        for (const track of tracks) {
          peer.addTrack(track, stream);
        }
      } catch (error) {
        console.error("Error sending stream:", error);
      }
    };
  
    const addICECandidate = async (peer, candidate) => {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };
  
    const handleConnectionStateChange = useCallback((emailID, state) => {
      setConnectionStates(prev => ({ ...prev, [emailID]: state }));
    }, []);
  
    return (
      <PeerContext.Provider
        value={{
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
        }}
      >
        {props.children}
      </PeerContext.Provider>
    );
  };