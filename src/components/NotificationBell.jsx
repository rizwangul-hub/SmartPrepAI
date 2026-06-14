// src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/notifications/unread-count');
      setUnreadCount(res.data.unreadCount ?? res.data.count ?? 0);
    } catch (err) {
      console.error('Notification count fetch error:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Notification fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'test_reminder': return '📝';
      case 'plan_update': return '📅';
      case 'achievement': return '🏆';
      default: return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'test_reminder': return 'text-sky-400';
      case 'plan_update': return 'text-emerald-400';
      case 'achievement': return 'text-amber-400';
      default: return 'text-indigo-400';
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
        title="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/40">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 max-h-[480px] bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-full border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition uppercase tracking-wider"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-3xl block mb-2">📭</span>
                <p className="text-xs text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-white/5 flex gap-3 transition cursor-pointer hover:bg-white/5 ${!n.read ? 'bg-indigo-950/20' : ''}`}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                >
                  <span className={`text-lg mt-0.5 ${getTypeColor(n.type)}`}>{getTypeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs font-bold truncate ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
