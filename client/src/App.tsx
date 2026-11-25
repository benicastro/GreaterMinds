import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Landing } from './routes/Landing';
import { JoinRoomEntry } from './routes/JoinRoomEntry';
import { HostNew } from './routes/host/HostNew';
import { HostRoomRoute } from './routes/host/HostRoomRoute';
import { PlayerRoomRoute } from './routes/player/PlayerRoomRoute';
import { DisplayRoom } from './routes/display/DisplayRoom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/join" element={<JoinRoomEntry />} />
        <Route path="/host/new" element={<HostNew />} />
        <Route path="/host/:roomCode" element={<HostRoomRoute />} />
        <Route path="/play/:roomCode" element={<PlayerRoomRoute />} />
        <Route path="/display/:roomCode" element={<DisplayRoom />} />
      </Routes>
    </BrowserRouter>
  );
}
