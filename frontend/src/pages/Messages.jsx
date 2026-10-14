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
    <div className="space-y-4 animate-fade-in py-2">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>Messages & Channels</span>
        </h1>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-soft overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[650px]">
        {/* Left Column: Conversations List */}
        <div className="border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40">
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <p className="p-6 text-xs text-slate-400 text-center">No conversations found.</p>
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
                        ? 'bg-brand-50/80 dark:bg-brand-950/50'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-2xl bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center uppercase overflow-hidden">
                        {conv.type === 'team' ? (
                          <Users className="w-4 h-4" />
                        ) : other?.avatar ? (
                          <img src={other.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          title.charAt(0)
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {title}
                        </p>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
        <div className="md:col-span-2 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-3.5 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-brand-600 text-white font-bold text-xs flex items-center justify-center uppercase">
                    {getConversationTitle(activeConversation).charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {getConversationTitle(activeConversation)}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {activeConversation.type === 'team'
                        ? `${activeConversation.participants?.length || 0} participants in team channel`
                        : 'Encrypted peer conversation'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs">
                    <p>No messages here yet. Break the ice!</p>
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
                        <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center uppercase flex-shrink-0">
                          {msg.sender?.name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                              isMy ? 'justify-end' : ''
                            }`}
                          >
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {isMy ? 'You' : msg.sender?.name}
                            </span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isMy
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
              {typingName && (
                <div className="px-5 py-1 text-[11px] text-slate-400 italic">
                  {typingName} is typing...
                </div>
              )}

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/30 dark:bg-slate-800/20"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type your message..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="rounded-xl bg-brand-600 p-2.5 text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              <p>Select a conversation from the left to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
