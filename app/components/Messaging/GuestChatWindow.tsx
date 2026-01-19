"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PaperAirplaneIcon, XMarkIcon, HomeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
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

interface GuestChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
  onMessageSent: () => void;
}

export default function GuestChatWindow({ conversation, onClose, onMessageSent }: GuestChatWindowProps) {
  const { getToken, userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
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
      console.error('[GUEST CHAT] Error fetching messages:', error);
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
      console.error('[GUEST CHAT] Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const host = conversation.host;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Property Context Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <HomeIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Property</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-500 rounded-full transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <h3 className="font-semibold text-lg">{conversation.property.title}</h3>
      </div>

      {/* Host Info */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-gray-50">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-lg">
            {host.name?.charAt(0) || host.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Chatting with host</p>
          <h4 className="font-semibold text-gray-900">
            {host.name || host.email}
          </h4>
        </div>
      </div>

      {/* Messages - Guest messages on LEFT, Host messages on RIGHT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-2">Start your conversation with {host.name || 'the host'}</p>
            <p className="text-sm">Ask about the property, amenities, or check-in details</p>
          </div>
        ) : (
          messages.map((message) => {
            const isGuest = message.sender_role === 'guest';
            return (
              <div
                key={message.id}
                className={`flex ${isGuest ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isGuest
                      ? 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                      : 'bg-blue-600 text-white rounded-br-none'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold opacity-75">
                      {isGuest ? 'You' : host.name || 'Host'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isGuest ? 'text-gray-400' : 'text-blue-100'
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
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

