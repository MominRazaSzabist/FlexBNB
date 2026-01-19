// components/MessageModal/MessageModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  isRead: boolean;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageModal = ({ isOpen, onClose }: MessageModalProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample initial messages
  const initialMessages: Message[] = [
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      sender: 'admin',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setMessages(initialMessages);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      isRead: true
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(newMessage),
        sender: 'admin',
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'Hello! Welcome to our service. How can I assist you today?';
    } else if (message.includes('price') || message.includes('cost')) {
      return 'Our pricing varies based on the property and duration. Could you tell me which property you\'re interested in?';
    } else if (message.includes('booking') || message.includes('reserve')) {
      return 'To make a booking, simply select your dates on the property page and proceed with the reservation. Would you like help with a specific property?';
    } else if (message.includes('availability') || message.includes('available')) {
      return 'Availability depends on the property and dates. Check the calendar on the property page for real-time availability.';
    } else if (message.includes('cancel') || message.includes('refund')) {
      return 'Our cancellation policy varies by property. Most properties offer free cancellation within 24-48 hours. Check the property details for specific policies.';
    } else if (message.includes('contact') || message.includes('phone') || message.includes('email')) {
      return 'You can reach our support team at support@example.com or call +1 (555) 123-4567. We\'re available 24/7 to help!';
    } else if (message.includes('thank') || message.includes('thanks')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    } else {
      return 'Thank you for your message. Our team will get back to you shortly with more detailed information. Is there anything specific you\'d like to know about our properties?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold">Customer Support</h3>
              <p className="text-xs text-blue-100">Online • Usually responds instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Typically replies within seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;