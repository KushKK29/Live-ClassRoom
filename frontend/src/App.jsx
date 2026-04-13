import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  DisconnectButton,
  ControlBar,
  Chat
} from '@livekit/components-react';
import { Track } from 'livekit-client';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;

// =========================================================================
// Modern LiveKit Components (Google Meet Style, Mobile First)
// =========================================================================

const VideoGrid = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex-1 w-full overflow-hidden p-2 sm:p-4 flex items-center justify-center bg-gray-950 pb-24 sm:pb-4">
      <GridLayout tracks={tracks} className="lk-grid-layout w-full h-full max-w-7xl mx-auto">
        <ParticipantTile className="rounded-2xl shadow-lg border border-gray-800 overflow-hidden bg-black" />
      </GridLayout>
    </div>
  );
};

const ChatPanel = ({ isChatOpen, toggleChat }) => {
  return (
    <>
      {/* Mobile overlay backdrop - clicking it closes chat */}
      {isChatOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={toggleChat}
        ></div>
      )}
      
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] bg-[#111827] border-l border-gray-800 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-10
        ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:hidden lg:w-0 lg:opacity-0'}
      `}>
        {/* Mobile close button header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#111827]">
          <h3 className="text-white font-medium">In-call messages</h3>
          <button 
            type="button" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleChat(); }} 
            className="text-gray-400 hover:text-white p-2 bg-gray-800/80 rounded-lg hover:bg-gray-700 transition relative z-[9999] pointer-events-auto cursor-pointer flex-shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <Chat className="w-full h-full flex-1" />
      </div>
    </>
  );
};

const CustomControlBar = ({ isChatOpen, toggleChat }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 bg-[#0B0C10] px-4 py-3 sm:px-6 sm:py-3 rounded-[2.5rem] border border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.8)] z-40 flex-nowrap w-max max-w-[95%] overflow-x-auto">
      
      {/* Red Circular Mic Toggle */}
      <TrackToggle source={Track.Source.Microphone} className="lk-custom-mic-btn" />
      
      {/* Red Circular Camera Toggle */}
      <TrackToggle source={Track.Source.Camera} className="lk-custom-cam-btn" />
      
      {/* Grey Circular Screen Share */}
      <TrackToggle source={Track.Source.ScreenShare} className="lk-custom-share-btn hidden sm:flex" />
      
      <div className="w-[1px] h-8 bg-gray-700 mx-1 sm:mx-2 flex-shrink-0"></div>
      
      {/* Blue Circular Chat Toggle */}
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleChat(); }}
        className={`flex items-center justify-center min-w-[50px] w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-full transition-all flex-shrink-0 z-50 relative pointer-events-auto cursor-pointer ${
          isChatOpen ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-[#2563eb] text-white hover:bg-blue-600 hover:scale-105'
        }`}
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
      
      {/* Rounded-Square Leave Button */}
      <DisconnectButton className="min-w-[50px] w-[50px] h-[50px] sm:w-[60px] sm:h-[54px] bg-[#1a1c23] border-[1.5px] border-red-500 rounded-[14px] flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all ml-1 sm:ml-2 flex-shrink-0 lk-leave-custom relative pointer-events-auto cursor-pointer z-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"/>
        </svg>
      </DisconnectButton>
    </div>
  );
};


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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const joinRoom = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");

    try {
      // Use production backend URL if deployed, otherwise fallback to localhost
      const backendUrl = import.meta.env.PROD 
        ? 'https://live-classroom.onrender.com' 
        : 'http://localhost:5000';

      const response = await fetch(`${backendUrl}/getToken`, {
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
      <div className="h-screen w-screen bg-gray-950 text-white flex flex-col items-center relative overflow-hidden">
        {/* Absolute Sticky Top bar */}
        <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none flex justify-between items-start px-4 md:px-6 pt-4 z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 pointer-events-auto bg-black/50 backdrop-blur-md rounded-xl px-4 py-2 border border-gray-800 shadow-xl">
            <span className="font-semibold tracking-wide text-gray-200 hidden md:block">LiveKit Meet</span>
            <span className="md:hidden font-semibold tracking-wide text-gray-200 text-sm">Meet app</span>
            <span className="hidden md:block text-gray-500">|</span>
            <span className="font-mono text-gray-400 text-xs md:text-sm">
              {roomId}
            </span>
          </div>
          
          <button 
            onClick={copyToClipboard}
            className="flex items-center pointer-events-auto text-sm px-3 py-2 md:px-4 md:py-2.5 bg-black/60 hover:bg-black/80 border border-gray-700 backdrop-blur-md drop-shadow-xl rounded-full transition-colors text-white"
          >
            {copied ? (
              <><svg className="w-4 h-4 md:mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> <span className="hidden md:inline">Copied!</span></>
            ) : (
              <><svg className="w-4 h-4 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg> <span className="hidden md:inline">Share Invite</span></>
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
          className="flex-1 w-full h-full flex flex-row overflow-hidden"
        >
          {/* Main Video Section */}
          <VideoGrid />

          {/* Right Side Chat Panel - Unconditionally rendered for CSS transitions */}
          <ChatPanel toggleChat={() => setIsChatOpen(false)} isChatOpen={isChatOpen} />

          {/* Control Bar */}
          <CustomControlBar isChatOpen={isChatOpen} toggleChat={() => setIsChatOpen(!isChatOpen)} />

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
