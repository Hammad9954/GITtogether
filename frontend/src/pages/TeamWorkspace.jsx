import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Users,
  MessageSquare,
  Send,
  Github,
  Globe,
  FileText,
  Shield,
  Trash2,
  LogOut,
  Edit,
  Loader2,
  Paperclip,
  Check,
  Sparkles,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const TeamWorkspace = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'chat' | 'members'
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Links state
  const [links, setLinks] = useState({ github: '', figma: '', docs: '' });
  const [savingLinks, setSavingLinks] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isLeader = team && user && team.leader?._id === user._id;

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  useEffect(() => {
    if (team?.chatRoom) {
      fetchMessages();

      if (socket) {
        socket.emit('join_conversation', team.chatRoom);

        socket.on('new_message', ({ message, conversationId }) => {
          if (conversationId === team.chatRoom) {
            setMessages((prev) => [...prev, message]);
          }
        });

        socket.on('user_typing', ({ userName, isTyping }) => {
          if (isTyping) {
            setTypingUser(userName);
          } else {
            setTypingUser(null);
          }
        });

        return () => {
          socket.emit('leave_conversation', team.chatRoom);
          socket.off('new_message');
          socket.off('user_typing');
        };
      }
    }
  }, [team?.chatRoom, socket]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teams/${id}`);
      if (res.success && res.data?.team) {
        setTeam(res.data.team);
        setLinks(res.data.team.links || { github: '', figma: '', docs: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/conversations/${team.chatRoom}/messages`);
      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch {
      // Non-blocking
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !team?.chatRoom) return;

    const content = newMessage.trim();
    setNewMessage('');
    setSendingMsg(true);

    if (socket) {
      socket.emit('typing_stop', { conversationId: team.chatRoom });
    }

    try {
      await api.post(`/messages/conversations/${team.chatRoom}/messages`, { content });
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !team?.chatRoom) return;

    socket.emit('typing_start', { conversationId: team.chatRoom });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: team.chatRoom });
    }, 2000);
  };

  const handleSaveLinks = async () => {
    try {
      setSavingLinks(true);
      const res = await api.patch(`/teams/${id}/links`, { links });
      if (res.success) {
        toast.success('Workspace links updated!');
      }
    } catch (err) {
      toast.error('Failed to update links');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    try {
      const res = await api.delete(`/teams/${id}/members/${memberUserId}`);
      if (res.success) {
        toast.success('Member removed');
        fetchTeamData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      const res = await api.post(`/teams/${id}/leave`, {});
      if (res.success) {
        toast.success('You left the team');
        navigate('/teams');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to leave team');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>Team workspace not found or access denied.</p>
        <Link to="/teams" className="text-brand-600 font-bold hover:underline mt-2 inline-block">
          Return to My Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in py-4">
      {/* Workspace Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                Team Workspace
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                {team.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {team.name}
            </h1>
            {team.project && (
              <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold pt-0.5">
                Connected Project:{' '}
                <Link to={`/projects/${team.project._id}`} className="hover:underline">
                  {team.project.title}
                </Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLeader && (
              <button
                onClick={handleLeaveTeam}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 text-rose-600 px-3.5 py-2 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Team</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pt-2 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Workspace Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Team Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Members & Roles ({team.members?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: WORKSPACE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {team.description || 'Welcome to your team collaboration workspace!'}
              </p>
            </div>

            {/* Shared Resources & Links */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Shared Team Resources
                </h3>
                <button
                  onClick={handleSaveLinks}
                  disabled={savingLinks}
                  className="rounded-xl bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {savingLinks ? 'Saving...' : 'Save Links'}
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Figma / Design Canvas URL
                  </label>
                  <input
                    type="url"
                    value={links.figma}
                    onChange={(e) => setLinks({ ...links, figma: e.target.value })}
                    placeholder="https://figma.com/file/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Docs & Meeting Notes URL
                  </label>
                  <input
                    type="url"
                    value={links.docs}
                    onChange={(e) => setLinks({ ...links, docs: e.target.value })}
                    placeholder="https://notion.so/..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Roster */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Roster</h3>
            <div className="space-y-3">
              {(team.members || []).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 font-bold flex items-center justify-center uppercase">
                      {m.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <Link
                        to={`/students/${m.user?._id}`}
                        className="font-bold text-slate-900 dark:text-white hover:underline block"
                      >
                        {m.user?.name}
                      </Link>
                      <span className="text-[11px] text-slate-400">{m.role}</span>
                    </div>
                  </div>
                  {m.user?._id === team.leader?._id && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      LEAD
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TEAM CHAT */}
      {activeTab === 'chat' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden flex flex-col h-[550px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Team Channel: {team.name}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {team.members?.length || 1} team members
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                <p>No messages yet in this team channel. Say hello to kick off your collaboration!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMyMsg = msg.sender?._id === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2.5 max-w-lg ${
                      isMyMsg ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 uppercase">
                      {msg.sender?.name?.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                          isMyMsg ? 'justify-end' : ''
                        }`}
                      >
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {isMyMsg ? 'You' : msg.sender?.name}
                        </span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMyMsg
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUser && (
            <div className="px-4 py-1 text-[11px] text-slate-400 italic">
              {typingUser} is typing...
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Send a message to your team channel..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessage.trim()}
              className="rounded-xl bg-brand-600 p-2.5 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MEMBERS & ROLES */}
      {activeTab === 'members' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Team Members & Permissions
          </h3>
          <div className="space-y-3">
            {(team.members || []).map((m) => {
              const memberIsLeader = m.user?._id === team.leader?._id;
              return (
                <div
                  key={m.user?._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center uppercase">
                      {m.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <Link
                        to={`/students/${m.user?._id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:underline block"
                      >
                        {m.user?.name}
                      </Link>
                      <p className="text-slate-500">
                        {m.user?.college} • {m.user?.course}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {m.role}
                    </span>
                    {isLeader && !memberIsLeader && (
                      <button
                        onClick={() => handleRemoveMember(m.user?._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;
