import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const Messages = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { toast } = useToast();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [typingName, setTypingName] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // If navigated with state.activeConversationId
  const initialConvId = location.state?.activeConversationId;

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);

      if (socket) {
        socket.emit('join_conversation', activeConversation._id);

        socket.on('new_message', ({ message, conversationId }) => {
          if (conversationId === activeConversation._id) {
            setMessages((prev) => [...prev, message]);
          }
        });

        socket.on('user_typing', ({ userName, isTyping, conversationId }) => {
          if (conversationId === activeConversation._id) {
            setTypingName(isTyping ? userName : null);
          }
        });

        return () => {
          socket.emit('leave_conversation', activeConversation._id);
          socket.off('new_message');
          socket.off('user_typing');
        };
      }
    }
  }, [activeConversation, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/conversations');
      if (res.success && res.data?.conversations) {
        const convList = res.data.conversations;
        setConversations(convList);

        if (initialConvId) {
          const target = convList.find((c) => c._id === initialConvId);
          if (target) setActiveConversation(target);
          else if (convList.length > 0) setActiveConversation(convList[0]);
        } else if (convList.length > 0 && !activeConversation) {
          setActiveConversation(convList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/conversations/${convId}/messages`);
      if (res.success && res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    if (socket) {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }

    try {
      await api.post(`/messages/conversations/${activeConversation._id}/messages`, { content });
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConversation) return;

    socket.emit('typing_start', { conversationId: activeConversation._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConversation._id });
    }, 2000);
  };

  const getConversationTitle = (conv) => {
    if (conv.type === 'team') {
      return conv.team?.name || 'Team Workspace';
    }
    const other = conv.participants?.find((p) => p._id !== user?._id);
    return other?.name || 'Chat';
  };

  const getOtherParticipant = (conv) => {
    return conv.participants?.find((p) => p._id !== user?._id);
  };

  const filteredConversations = conversations.filter((c) => {
    const title = getConversationTitle(c).toLowerCase();
    return title.includes(searchFilter.toLowerCase());
  });

  return (
    <div className="space-y-4 animate-fade-in py-2 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F4F7F2] flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-[#B7FF5A]" />
          <span>Messages & Channels</span>
        </h1>
        <p className="text-xs text-[#70796F] mt-1">Real-time collaboration with teammates, peers, and project squads.</p>
      </div>

      <div className="rounded-2xl bg-[#151915] border border-[#282F28] overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[680px]">
        {/* Left Column: Conversations List */}
        <div className="border-r border-[#282F28] flex flex-col h-full bg-[#101310]">
          {/* Search bar */}
          <div className="p-3 border-b border-[#282F28]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#70796F] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="input-surface w-full pl-8 pr-3 py-1.5 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#282F28]/50">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#B7FF5A] mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="p-6 text-xs text-[#70796F] text-center">No conversations found.</p>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = activeConversation?._id === conv._id;
                const title = getConversationTitle(conv);
                const other = getOtherParticipant(conv);
                const isOnline = other && onlineUsers.has(other._id);

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors ${
                      isSelected
                        ? 'bg-[#1B211B] border-l-2 border-[#B7FF5A]'
                        : 'hover:bg-[#151915] border-l-2 border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-[#151915] border border-[#282F28] text-[#B7FF5A] font-bold text-xs flex items-center justify-center uppercase overflow-hidden">
                        {conv.type === 'team' ? (
                          <Users className="w-4 h-4 text-[#B7FF5A]" />
                        ) : other?.avatar ? (
                          <img src={other.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          title.charAt(0)
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#B7FF5A] border-2 border-[#101310]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#B7FF5A]' : 'text-[#F4F7F2]'}`}>
                          {title}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] font-mono text-[#70796F]">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A1AAA0] truncate mt-0.5">
                        {conv.lastMessage?.content || (conv.type === 'team' ? 'Team channel' : 'Direct message')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-2 flex flex-col h-full bg-[#151915]">
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 px-5 border-b border-[#282F28] flex items-center justify-between bg-[#101310]">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-xs flex items-center justify-center uppercase">
                    {getConversationTitle(activeConversation).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#F4F7F2]">
                      {getConversationTitle(activeConversation)}
                    </h3>
                    <p className="text-[11px] text-[#70796F]">
                      {activeConversation.type === 'team'
                        ? `${activeConversation.participants?.length || 0} participants in team channel`
                        : 'Direct encrypted peer conversation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#090B0A]/60">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#B7FF5A]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-[#70796F] text-xs">
                    <p>No messages here yet. Say hello and break the ice!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMy = msg.sender?._id === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex items-start gap-2.5 max-w-md ${
                          isMy ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        <div className="h-7 w-7 rounded-full bg-[#1B211B] border border-[#282F28] text-[#B7FF5A] font-bold text-[10px] flex items-center justify-center uppercase flex-shrink-0">
                          {msg.sender?.name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-2 text-[10px] text-[#70796F] ${
                              isMy ? 'justify-end' : ''
                            }`}
                          >
                            <span className="font-semibold text-[#A1AAA0]">
                              {isMy ? 'You' : msg.sender?.name}
                            </span>
                            <span className="font-mono text-[9px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMy
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
              {typingName && (
                <div className="px-5 py-1.5 text-[11px] text-[#A1AAA0] italic bg-[#101310] border-t border-[#282F28]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF5A] animate-ping" />
                  <span>{typingName} is typing...</span>
                </div>
              )}

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#282F28] flex items-center gap-2 bg-[#101310]"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="flex-1 input-surface px-4 py-2.5 text-xs rounded-xl"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary p-2.5 text-[#090B0A] rounded-xl disabled:opacity-50 transition-colors"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[#70796F] text-xs">
              <p>Select a conversation from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
