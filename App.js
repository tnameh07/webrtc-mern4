import { Route, Routes } from "react-router-dom";

import { SocketProvider } from "./providers/Socket";
import Homepage from "./pages/Home";
import Roompage from "./pages/Room";
import { PeerProvider } from "./providers/Peer";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/room/:roomID" element={<Roompage />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
