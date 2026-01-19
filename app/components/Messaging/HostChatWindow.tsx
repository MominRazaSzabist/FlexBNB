"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PaperAirplaneIcon, XMarkIcon, HomeIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: {
    id: string;
    email: string;
    name: string;
  };
  receiver: {
    id: string;
    email: string;
    name: string;
  };
  sender_role: 'guest' | 'host';
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender_name: string;
  receiver_name: string;
}

interface Conversation {
  id: string;
  property: {
    id: string;
    title: string;
    image_url: string;
  };
  guest: {
    id: string;
    email: string;
    name: string;
  };
  host: {
    id: string;
    email: string;
    name: string;
  };
  messages: Message[];
  updated_at: string;
}

interface HostChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
  onMessageSent: () => void;
  quickReplies?: Array<{ id: string; title: string; message: string }>;
}

export default function HostChatWindow({ conversation, onClose, onMessageSent, quickReplies }: HostChatWindowProps) {
  const { getToken, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
    }
  }, [conversation.id]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!conversation?.id) return;
    
    const pollMessages = setInterval(async () => {
      await fetchMessages();
    }, 5000);

    return () => clearInterval(pollMessages);
  }, [conversation.id]);

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(
        `${apiHost}/api/messaging/conversations/${conversation.id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('[HOST CHAT] Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const token = await getToken();
      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(
        `${apiHost}/api/messaging/messages/send/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation_id: conversation.id,
            message: newMessage,
          }),
        }
      );

      if (response.ok) {
        await fetchMessages();
        setNewMessage('');
        onMessageSent();
        toast.success('Message sent!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('[HOST CHAT] Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickReplyClick = (replyMessage: string) => {
    setNewMessage(replyMessage);
    setShowQuickReplies(false);
  };

  const guest = conversation.guest;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Property Context Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Your Property</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-green-500 rounded-full transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <h3 className="font-semibold text-lg">{conversation.property.title}</h3>
      </div>

      {/* Guest Info */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Guest inquiry</p>
            <h4 className="font-semibold text-gray-900">
              {guest.name || guest.email}
            </h4>
          </div>
        </div>
        {quickReplies && quickReplies.length > 0 && (
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Quick Replies</span>
          </button>
        )}
      </div>

      {/* Quick Replies Panel */}
      {showQuickReplies && quickReplies && quickReplies.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-green-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Replies:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply) => (
              <button
                key={reply.id}
                onClick={() => handleQuickReplyClick(reply.message)}
                className="px-3 py-1 bg-white border border-green-300 text-green-700 rounded-full hover:bg-green-100 transition text-sm"
              >
                {reply.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages - Guest messages on LEFT, Host messages on RIGHT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">No messages yet from {guest.name || 'this guest'}</p>
            <p className="text-sm">They will appear here when they reach out</p>
          </div>
        ) : (
          messages.map((message) => {
            const isHost = message.sender_role === 'host';
            return (
              <div
                key={message.id}
                className={`flex ${isHost ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isHost
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold opacity-75">
                      {isHost ? 'You' : guest.name || 'Guest'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isHost ? 'text-green-100' : 'text-gray-400'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

