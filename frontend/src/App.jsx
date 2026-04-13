import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// Home screen for creating or joining a room manually
function Home() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateMeeting = () => {
    // Generate a random room ID (e.g. "abc-123-xyz")
    const newRoomId = Math.random().toString(36).substring(2, 6) + '-' + 
                      Math.random().toString(36).substring(2, 6) + '-' + 
                      Math.random().toString(36).substring(2, 6);
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">LiveKit Meetings</h1>
        <p className="text-center text-gray-500 mb-8">Create or join a high-quality video room</p>
        
        <div className="space-y-6">
          <button
            onClick={handleCreateMeeting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex justify-center items-center"
          >
            Create New Meeting
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or join existing</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleJoinMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter Room ID or Link</label>
              <input
                type="text"
                required
                placeholder="e.g. abc-123-xyz"
                value={roomId}
                onChange={(e) => {
                  let val = e.target.value;
                  // If user pasted a full URL, extract the room ID
                  if (val.includes('/room/')) {
                    val = val.split('/room/')[1];
                  }
                  setRoomId(val);
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-200 flex justify-center items-center"
            >
              Join Meeting
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Room screen handles token fetching, participant name entry, and the actual meeting
function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, username }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }

      const data = await response.json();
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const inviteLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (token) {
    return (
      <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col">
        {/* Top bar for sharing link inside the meeting */}
        <div className="bg-neutral-800 p-3 px-6 flex justify-between items-center border-b border-neutral-700 shadow-md z-10 w-full">
          <div>
            <span className="text-gray-400 text-sm mr-2">Room ID:</span>
            <span className="font-mono bg-neutral-900 px-2 py-1 rounded text-sm">{roomId}</span>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-white"
          >
            {copied ? (
              <><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied!</>
            ) : (
              <><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> Copy Invite Link</>
            )}
          </button>
        </div>

        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          onDisconnected={() => navigate('/')}
          className="flex-1 w-full"
        >
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Ready to join?</h2>
        <p className="text-center text-gray-500 mb-6">
          You are joining room: <span className="font-mono bg-blue-50 text-blue-800 px-2 py-1 rounded select-all">{roomId}</span>
        </p>
        
        <form onSubmit={joinRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {loading ? "Connecting..." : "Join Meeting"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-gray-500 hover:text-gray-800 font-medium py-2 text-sm transition"
          >
            Cancel and go back
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
