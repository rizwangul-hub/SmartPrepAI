// src/pages/CommunityChat.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import axios from 'axios';
import logoImg from '../assets/logo.png';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CornerUpLeft,
  Pin,
  Trash2,
  Volume2,
  VolumeX,
  X,
  Search,
  Users,
  ChevronLeft,
  Shield,
  VolumeX as MuteIcon,
  Ban
} from 'lucide-react';

export default function CommunityChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  // States
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState({}); // userId -> name
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [muteMinutes, setMuteMinutes] = useState(15);
  const [modifyingUser, setModifyingUser] = useState(null); // for mute/ban modals

  // Refs
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioNotificationRef = useRef(null);

  // 1. Initial Load & Socket Setup
  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch initial latest 50 messages
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/chat/messages');
        setMessages(res.data);
        setHasMore(res.data.length === 50); // if loaded 50, there might be more
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setErrorMsg('Could not load chat history. Please try again.');
      } finally {
        setLoadingHistory(false);
        // Scroll to bottom after initial load
        setTimeout(scrollToBottom, 100);
      }
    };

    // Fetch pinned messages
    const fetchPinned = async () => {
      try {
        const res = await axios.get('/api/chat/pinned');
        setPinnedMessages(res.data);
      } catch (err) {
        console.error('Failed to load pinned messages:', err);
      }
    };

    fetchHistory();
    fetchPinned();

    // Establish Socket.io connection
    const token = localStorage.getItem('token');
    const socketUrl = import.meta.env.VITE_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
    
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Socket Event Listeners
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnected(false);
    });

    newSocket.on('onlineCount', (count) => {
      setOnlineCount(count);
    });

    newSocket.on('messageReceived', (msg) => {
      setMessages((prev) => {
        // Prevent duplicate keys
        if (prev.some((p) => p._id === msg._id)) return prev;
        return [...prev, msg];
      });

      // Play sound and trigger browser notification if tab is unfocused
      if (msg.sender?._id !== user?._id) {
        if (soundEnabled && audioNotificationRef.current) {
          audioNotificationRef.current.play().catch((e) => console.log('Audio play error:', e));
        }

        if (document.hidden && Notification.permission === 'granted') {
          new Notification(`New Message from ${msg.sender?.name}`, {
            body: msg.message.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            icon: '/favicon.png'
          });
        }
      }

      // Scroll to bottom automatically if user is close to bottom
      scrollToBottomIfNear();
    });

    newSocket.on('userTyping', ({ userId: typingId, name, isTyping: typingState }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (typingState) {
          next[typingId] = name;
        } else {
          delete next[typingId];
        }
        return next;
      });
    });

    newSocket.on('adminActionTriggered', ({ action, payload }) => {
      if (action === 'deleteMessage') {
        setMessages((prev) => prev.filter((m) => m._id !== payload.messageId));
        setPinnedMessages((prev) => prev.filter((m) => m._id !== payload.messageId));
      } else if (action === 'pinMessage') {
        // Toggle pin status locally
        setMessages((prev) =>
          prev.map((m) => (m._id === payload.messageId ? { ...m, isPinned: payload.isPinned } : m))
        );
        // Refresh pinned messages
        fetchPinned();
      } else if (action === 'muteUser' && payload.userId === user?._id) {
        setErrorMsg(`You have been temporarily muted from chat until ${new Date(payload.chatMutedUntil).toLocaleString()}`);
      } else if (action === 'banUser' && payload.userId === user?._id) {
        setErrorMsg('You have been banned from this community chat room.');
        newSocket.disconnect();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id, soundEnabled]);

  // Fallback HTTP Polling: Poll for new messages every 5 seconds when socket is disconnected
  useEffect(() => {
    if (isConnected) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await axios.get('/api/chat/messages');
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m._id));
          const newMsgs = res.data.filter((m) => !existingIds.has(m._id));
          if (newMsgs.length === 0) return prev;
          
          const merged = [...prev, ...newMsgs].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
          
          // Try to scroll to bottom if new messages arrived
          setTimeout(scrollToBottomIfNear, 100);
          return merged;
        });
      } catch (err) {
        console.warn('Failed to poll new messages:', err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [isConnected]);

  // Scroll helpers
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBottomIfNear = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // If user is within 300px of bottom, scroll down
    if (scrollHeight - scrollTop - clientHeight < 300) {
      setTimeout(scrollToBottom, 50);
    }
  };

  // Load older messages (Scroll-up Pagination)
  const handleScroll = async () => {
    if (!chatContainerRef.current || loadingHistory || !hasMore) return;
    const { scrollTop } = chatContainerRef.current;

    // Trigger loading older messages when user scrolls near the top
    if (scrollTop < 50) {
      setLoadingHistory(true);
      const oldestMessage = messages[0];
      if (!oldestMessage) {
        setLoadingHistory(false);
        return;
      }

      try {
        const res = await axios.get(`/api/chat/messages?before=${oldestMessage.createdAt}`);
        if (res.data.length === 0) {
          setHasMore(false);
        } else {
          // Prepend older messages
          const prevScrollHeight = chatContainerRef.current.scrollHeight;
          setMessages((prev) => [...res.data, ...prev]);

          // Adjust scroll position so it doesn't jump
          setTimeout(() => {
            if (chatContainerRef.current) {
              const postScrollHeight = chatContainerRef.current.scrollHeight;
              chatContainerRef.current.scrollTop = postScrollHeight - prevScrollHeight;
            }
          }, 50);
        }
      } catch (err) {
        console.error('Failed to load older messages:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  // Send message (falls back to HTTP POST if socket is disconnected)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageText = input;
    const replyId = replyTo ? replyTo._id : null;

    // Stop typing immediately
    handleTypingStop();

    if (isConnected && socket) {
      // Send via WebSocket
      socket.emit(
        'sendMessage',
        {
          message: messageText,
          replyTo: replyId
        },
        (res) => {
          if (!res.success) {
            setErrorMsg(res.error || 'Failed to send message');
            setTimeout(() => setErrorMsg(''), 6000);
          } else {
            setInput('');
            setReplyTo(null);
            scrollToBottom();
          }
        }
      );
    } else {
      // Send via HTTP POST Fallback
      try {
        const res = await axios.post('/api/chat/messages', {
          message: messageText,
          replyTo: replyId
        });
        
        // Add to local state immediately
        setMessages((prev) => {
          if (prev.some((p) => p._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
        
        setInput('');
        setReplyTo(null);
        setTimeout(scrollToBottom, 50);
      } catch (err) {
        console.error('HTTP send fallback failed:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to send message.');
        setTimeout(() => setErrorMsg(''), 6000);
      }
    }
  };

  // Typing event emission (Debounced)
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(handleTypingStop, 2000);
  };

  const handleTypingStop = () => {
    setIsTyping(false);
    if (socket) {
      socket.emit('typing', false);
    }
  };

  // Scroll to original replied message
  const handleScrollToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-indigo-500/20');
      setTimeout(() => {
        el.classList.remove('bg-indigo-500/20');
      }, 1500);
    }
  };

  // Admin actions
  const handleDeleteMessage = async (msgId) => {
    if (user?.role !== 'admin') return;
    try {
      await axios.delete(`/api/chat/messages/${msgId}`);
      socket?.emit('adminAction', {
        action: 'deleteMessage',
        payload: { messageId: msgId }
      });
    } catch (err) {
      console.error('Admin delete message failed:', err);
    }
  };

  const handleTogglePin = async (msgId) => {
    if (user?.role !== 'admin') return;
    try {
      const res = await axios.put(`/api/chat/messages/${msgId}/pin`);
      socket?.emit('adminAction', {
        action: 'pinMessage',
        payload: { messageId: msgId, isPinned: res.data.isPinned }
      });
    } catch (err) {
      console.error('Admin pin toggle failed:', err);
    }
  };

  const handleMuteUser = async () => {
    if (!modifyingUser || user?.role !== 'admin') return;
    try {
      const res = await axios.post(`/api/chat/users/${modifyingUser._id}/mute`, {
        durationMinutes: Number(muteMinutes)
      });
      socket?.emit('adminAction', {
        action: 'muteUser',
        payload: { userId: modifyingUser._id, chatMutedUntil: res.data.chatMutedUntil }
      });
      setModifyingUser(null);
    } catch (err) {
      console.error('Admin mute user failed:', err);
    }
  };

  const handleToggleBan = async (u) => {
    if (user?.role !== 'admin') return;
    try {
      const res = await axios.post(`/api/chat/users/${u._id}/ban`);
      socket?.emit('adminAction', {
        action: 'banUser',
        payload: { userId: u._id, isChatBanned: res.data.isChatBanned }
      });
    } catch (err) {
      console.error('Admin toggling chat ban failed:', err);
    }
  };

  // Filtering local messages based on search query
  const filteredMessages = messages.filter((m) =>
    m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.sender?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sound notification handler */}
      <audio
        ref={audioNotificationRef}
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav"
        preload="auto"
      />

      {/* Top Header */}
      <nav className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
            title="Back to Dashboard"
          >
            <ChevronLeft size={20} />
          </button>
          {logoFailed ? (
            <span className="text-lg font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              PrepForce AI
            </span>
          ) : (
            <img
              src={logoImg}
              alt="PrepForce AI"
              className="h-10 w-auto object-contain rounded-xl"
              onError={() => setLogoFailed(true)}
            />
          )}
          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black tracking-wide uppercase">Community Chat</h1>
            {isConnected ? (
              <p className="text-[10px] text-indigo-400 flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {onlineCount} active students online
              </p>
            ) : (
              <p className="text-[10px] text-amber-500 flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Real-time disabled (polling active)
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition text-slate-400 hover:text-white"
            title={soundEnabled ? 'Mute Notification Sounds' : 'Unmute Notification Sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <ThemeToggle />
          <div className="flex items-center gap-2">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="avatar"
                className="w-9 h-9 rounded-xl object-cover border border-slate-800"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow border border-slate-800">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Body Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Announcements and Search) */}
        <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col hidden lg:flex">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="relative">
              <Search className="absolute top-3 left-3 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-3 right-3 text-slate-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Pinned Announcements */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Pin size={14} className="text-indigo-400" /> Pinned Notices ({pinnedMessages.length})
            </h3>
            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-slate-600 italic">No pinned announcements yet. Admins can pin important messages.</p>
            ) : (
              pinnedMessages.map((m) => (
                <div
                  key={`pin-${m._id}`}
                  onClick={() => handleScrollToMessage(m._id)}
                  className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 p-3 rounded-2xl cursor-pointer transition space-y-1.5 shadow"
                >
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-indigo-400">{m.sender?.name}</span>
                    <span className="text-slate-600">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-slate-355 line-clamp-3">
                    {m.message.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Center Panel (Chat view) */}
        <section className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          {/* Error Banner */}
          {errorMsg && (
            <div className="absolute top-0 inset-x-0 bg-red-600/90 backdrop-blur text-white text-xs font-bold py-2.5 px-6 text-center z-20 flex justify-between items-center">
              <span>⚠️ {errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-black/10 rounded">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Pinned Announcement Bar (Mobile view or quick access) */}
          {pinnedMessages.length > 0 && (
            <div className="bg-indigo-950/40 border-b border-slate-800/60 py-2 px-6 flex items-center justify-between text-xs lg:hidden">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Pin size={12} className="text-indigo-400 animate-pulse" />
                Latest Pin: <strong>{pinnedMessages[0]?.message.slice(0, 45)}...</strong>
              </span>
              <button
                onClick={() => handleScrollToMessage(pinnedMessages[0]._id)}
                className="text-indigo-400 font-bold hover:underline"
              >
                View
              </button>
            </div>
          )}

          {/* Messages Pane */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
          >
            {loadingHistory && (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 mt-2 font-semibold">Loading messages history...</p>
              </div>
            )}

            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-3">
                <span className="text-5xl">💬</span>
                <p className="text-sm font-semibold">
                  {searchQuery ? 'No matching messages found.' : 'Welcome to PrepForce AI Community Room! Start the conversation.'}
                </p>
              </div>
            ) : (
              filteredMessages.map((m) => {
                const isOwn = m.sender?._id === user?._id;
                const isSystem = m.sender?.role === 'admin';
                return (
                  <div
                    key={m._id}
                    id={`msg-${m._id}`}
                    className={`flex flex-col max-w-[75%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    {/* Sender Header info */}
                    {!isOwn && (
                      <span className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-1.5">
                        {m.sender?.name}
                        {isSystem && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 px-1 rounded flex items-center gap-0.5">
                            <Shield size={8} /> Admin
                          </span>
                        )}
                      </span>
                    )}

                    {/* Bubble Container */}
                    <div
                      className={`relative px-4 py-3 rounded-3xl group shadow border transition-colors duration-200 ${
                        isOwn
                          ? 'bg-indigo-600 border-indigo-500/20 text-white rounded-tr-none'
                          : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {/* Replied block inside bubble */}
                      {m.replyTo && (
                        <div
                          onClick={() => handleScrollToMessage(m.replyTo._id || m.replyTo)}
                          className={`mb-2 p-2.5 rounded-xl text-xs cursor-pointer border ${
                            isOwn
                              ? 'bg-indigo-750/50 border-indigo-500/30 text-indigo-200'
                              : 'bg-slate-950/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-bold mb-0.5">
                            @{m.replyTo.sender?.name || 'User'}
                          </div>
                          <div className="line-clamp-2">
                            {m.replyTo.message?.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}
                          </div>
                        </div>
                      )}

                      {/* Main Message Text */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.message.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}
                      </p>

                      {/* Timestamp & Icons Footer */}
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[9px] opacity-60">
                        {m.isPinned && <Pin size={8} className="text-amber-400 fill-amber-400" />}
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Hover action overlay */}
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1.5 z-10 px-2 py-1 rounded-xl bg-slate-800/90 border border-slate-700 shadow-lg ${
                          isOwn ? 'right-full mr-2' : 'left-full ml-2'
                        }`}
                      >
                        <button
                          onClick={() => setReplyTo(m)}
                          className="p-1 hover:text-indigo-400 transition"
                          title="Reply"
                        >
                          <CornerUpLeft size={14} />
                        </button>
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleTogglePin(m._id)}
                              className={`p-1 transition ${m.isPinned ? 'text-amber-400' : 'hover:text-amber-400'}`}
                              title={m.isPinned ? 'Unpin message' : 'Pin message'}
                            >
                              <Pin size={14} />
                            </button>
                            <button
                              onClick={() => setModifyingUser(m.sender)}
                              className="p-1 hover:text-orange-400 transition"
                              title="Mute user"
                            >
                              <MuteIcon size={14} />
                            </button>
                            <button
                              onClick={() => handleToggleBan(m.sender)}
                              className={`p-1 transition ${m.sender?.isChatBanned ? 'text-red-500' : 'hover:text-red-500'}`}
                              title={m.sender?.isChatBanned ? 'Unban user' : 'Ban user'}
                            >
                              <Ban size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(m._id)}
                              className="p-1 hover:text-red-500 transition"
                              title="Delete message"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Typing users display */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="px-6 py-2 bg-slate-950/80 text-xs text-indigo-400 italic flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...
            </div>
          )}

          {/* Input & Action Panel */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            {/* Replying details preview bar */}
            {replyTo && (
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-2xl mb-3 animate-slide-in">
                <div className="border-l-4 border-indigo-500 pl-3">
                  <div className="text-xs font-bold text-indigo-400">Replying to @{replyTo.sender?.name}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">{replyTo.message}</div>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                placeholder={
                  user?.isChatBanned
                    ? 'You are blocked from sending messages.'
                    : 'Type a message in the community...'
                }
                value={input}
                onChange={handleInputChange}
                disabled={user?.isChatBanned}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || user?.isChatBanned}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Admin Mute Modal */}
      {modifyingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MuteIcon size={18} className="text-orange-400" /> Mute User: {modifyingUser.name}
            </h3>
            <p className="text-xs text-slate-400">Specify mute duration. Muted users can read but cannot send messages.</p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Mute Duration</label>
              <select
                value={muteMinutes}
                onChange={(e) => setMuteMinutes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="15">15 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="1440">1 Day (24h)</option>
                <option value="10080">1 Week (7d)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModifyingUser(null)}
                className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleMuteUser}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition"
              >
                Mute User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
