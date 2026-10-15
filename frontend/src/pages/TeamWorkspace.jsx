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
  ExternalLink,
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
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B7FF5A] mx-auto" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="py-16 text-center text-[#A1AAA0]">
        <p>Team workspace not found or access denied.</p>
        <Link to="/teams" className="text-[#B7FF5A] font-bold hover:underline mt-2 inline-block">
          Return to My Teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in py-4 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20">
                Team Workspace
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1B211B] border border-[#282F28] text-[#A1AAA0] capitalize">
                {team.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] tracking-tight">
              {team.name}
            </h1>
            {team.project && (
              <p className="text-xs text-[#A1AAA0] pt-0.5">
                Connected Project:{' '}
                <Link to={`/projects/${team.project._id}`} className="text-[#B7FF5A] hover:underline font-medium inline-flex items-center gap-1">
                  <span>{team.project.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLeader && (
              <button
                onClick={handleLeaveTeam}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 text-rose-400 px-3.5 py-2 text-xs font-semibold hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Team</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#282F28] pt-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 text-xs sm:text-sm ${
              activeTab === 'overview'
                ? 'border-[#B7FF5A] text-[#B7FF5A]'
                : 'border-transparent text-[#70796F] hover:text-[#F4F7F2]'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Workspace Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 text-xs sm:text-sm ${
              activeTab === 'chat'
                ? 'border-[#B7FF5A] text-[#B7FF5A]'
                : 'border-transparent text-[#70796F] hover:text-[#F4F7F2]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Team Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-2 text-xs sm:text-sm ${
              activeTab === 'members'
                ? 'border-[#B7FF5A] text-[#B7FF5A]'
                : 'border-transparent text-[#70796F] hover:text-[#F4F7F2]'
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
            <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-3">
              <h3 className="text-base font-bold text-[#F4F7F2]">Team Mission & Description</h3>
              <p className="text-sm text-[#A1AAA0] leading-relaxed">
                {team.description || 'Welcome to your team collaboration workspace! Coordinate development, manage shared files, and communicate with teammates here.'}
              </p>
            </div>

            {/* Shared Resources & Links */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#F4F7F2]">Shared Team Resources</h3>
                  <p className="text-xs text-[#70796F] mt-0.5">Quick access links for your repository, design files, and documentation.</p>
                </div>
                <button
                  onClick={handleSaveLinks}
                  disabled={savingLinks}
                  className="btn-primary px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  {savingLinks ? 'Saving...' : 'Save Links'}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#A1AAA0] flex items-center gap-1.5 mb-1.5">
                    <Github className="w-3.5 h-3.5 text-[#B7FF5A]" />
                    <span>GitHub Repository URL</span>
                  </label>
                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                    placeholder="https://github.com/organization/repo"
                    className="input-surface w-full p-2.5 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#A1AAA0] flex items-center gap-1.5 mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#B7FF5A]" />
                    <span>Figma / Design Canvas URL</span>
                  </label>
                  <input
                    type="url"
                    value={links.figma}
                    onChange={(e) => setLinks({ ...links, figma: e.target.value })}
                    placeholder="https://figma.com/file/..."
                    className="input-surface w-full p-2.5 text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#A1AAA0] flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#B7FF5A]" />
                    <span>Docs & Meeting Notes URL</span>
                  </label>
                  <input
                    type="url"
                    value={links.docs}
                    onChange={(e) => setLinks({ ...links, docs: e.target.value })}
                    placeholder="https://notion.so/... or https://docs.google.com/..."
                    className="input-surface w-full p-2.5 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Roster */}
          <div className="p-6 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4 h-fit">
            <h3 className="text-base font-bold text-[#F4F7F2]">Workspace Roster</h3>
            <div className="space-y-3">
              {(team.members || []).map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#101310] border border-[#282F28]/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold flex items-center justify-center uppercase text-xs flex-shrink-0">
                      {m.user?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/students/${m.user?._id}`}
                        className="font-bold text-[#F4F7F2] hover:text-[#B7FF5A] truncate block"
                      >
                        {m.user?.name}
                      </Link>
                      <span className="text-[11px] text-[#70796F] truncate block">{m.role}</span>
                    </div>
                  </div>
                  {m.user?._id === team.leader?._id && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20 flex-shrink-0">
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
        <div className="rounded-2xl bg-[#151915] border border-[#282F28] overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#282F28] flex items-center justify-between bg-[#101310]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF5A] animate-pulse" />
              <span className="text-xs font-bold text-[#F4F7F2]">
                Team Channel: #{team.name}
              </span>
            </div>
            <span className="text-xs text-[#70796F] font-mono">
              {team.members?.length || 1} members active
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#090B0A]/60">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-[#70796F] text-xs">
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
                    <div className="h-7 w-7 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-[10px] flex items-center justify-center flex-shrink-0 uppercase">
                      {msg.sender?.name?.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-2 text-[10px] text-[#70796F] ${
                          isMyMsg ? 'justify-end' : ''
                        }`}
                      >
                        <span className="font-semibold text-[#A1AAA0]">
                          {isMyMsg ? 'You' : msg.sender?.name}
                        </span>
                        <span className="font-mono text-[9px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMyMsg
                            ? 'bg-[#B7FF5A] text-[#090B0A] font-medium rounded-tr-none'
                            : 'bg-[#1B211B] border border-[#282F28] text-[#F4F7F2] rounded-tl-none'
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
            <div className="px-4 py-1.5 text-[11px] text-[#A1AAA0] italic bg-[#101310] border-t border-[#282F28]/50 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-ping" />
              <span>{typingUser} is typing...</span>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-[#282F28] bg-[#101310] flex items-center gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Send a message to your team channel..."
              className="flex-1 input-surface px-4 py-2.5 text-xs rounded-xl"
            />
            <button
              type="submit"
              disabled={sendingMsg || !newMessage.trim()}
              className="btn-primary p-2.5 text-[#090B0A] rounded-xl disabled:opacity-50 transition-colors"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MEMBERS & ROLES */}
      {activeTab === 'members' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[#151915] border border-[#282F28] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F4F7F2]">
              Team Members & Permissions
            </h3>
            <span className="text-xs font-mono text-[#70796F]">
              {team.members?.length || 0} Total Members
            </span>
          </div>

          <div className="space-y-3">
            {(team.members || []).map((m) => {
              const memberIsLeader = m.user?._id === team.leader?._id;
              return (
                <div
                  key={m.user?._id}
                  className="p-4 rounded-xl bg-[#101310] border border-[#282F28] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold flex items-center justify-center uppercase text-sm">
                      {m.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/students/${m.user?._id}`}
                          className="font-bold text-sm text-[#F4F7F2] hover:text-[#B7FF5A] transition-colors"
                        >
                          {m.user?.name}
                        </Link>
                        {memberIsLeader && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#B7FF5A]/10 text-[#B7FF5A] border border-[#B7FF5A]/20">
                            LEADER
                          </span>
                        )}
                      </div>
                      <p className="text-[#70796F] text-[11px] mt-0.5">
                        {m.user?.college} • {m.user?.course}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="font-medium text-[#A1AAA0] px-2.5 py-1 rounded-lg bg-[#151915] border border-[#282F28]">
                      {m.role}
                    </span>
                    {isLeader && !memberIsLeader && (
                      <button
                        onClick={() => handleRemoveMember(m.user?._id)}
                        className="p-1.5 rounded-lg text-[#70796F] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
