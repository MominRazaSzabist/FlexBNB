"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
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

interface ChatWindowProps {
  conversation: Conversation;
  onClose: () => void;
  onMessageSent: () => void;
}

export default function ChatWindow({ conversation, onClose, onMessageSent }: ChatWindowProps) {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/conversations/${conversation.id}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched conversation detail:', data);
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          console.warn('Messages not in expected format:', data);
          setMessages([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching messages:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/messages/send/`,
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
        const sentMessage = await response.json();
        console.log('Message sent successfully:', sentMessage);
        // Refresh messages to get the latest
        await fetchMessages();
        setNewMessage('');
        onMessageSent();
        toast.success('Message sent!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to send message:', response.status, errorData);
        toast.error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (message: Message) => {
    return message.sender.id === userId;
  };

  const otherUser = conversation.guest.id === userId ? conversation.host : conversation.guest;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-lg">
              {otherUser.name?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser.name || otherUser.email}
            </h3>
            <p className="text-sm text-gray-500">{conversation.property.title}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <XMarkIcon className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMyMessage(message)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMyMessage(message) ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

