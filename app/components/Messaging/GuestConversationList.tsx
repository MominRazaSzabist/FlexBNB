"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChatBubbleLeftRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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
  last_message: {
    message: string;
    sender: string;
    sender_role: 'guest' | 'host';
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  updated_at: string;
}

interface GuestConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  refreshTrigger?: number;
}

export default function GuestConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  refreshTrigger 
}: GuestConversationListProps) {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchConversations();
  }, [filter, refreshTrigger]);

  // Poll for new conversations every 10 seconds
  useEffect(() => {
    const pollConversations = setInterval(() => {
      fetchConversations();
    }, 10000);

    return () => clearInterval(pollConversations);
  }, [filter]);

  // Listen for conversation creation and refresh events
  useEffect(() => {
    const handleConversationCreated = () => {
      console.log('[GUEST CONVERSATIONS] Conversation created event received, refreshing...');
      setTimeout(() => fetchConversations(), 1000); // Small delay to ensure backend is ready
    };

    const handleRefresh = () => {
      console.log('[GUEST CONVERSATIONS] Refresh event received');
      fetchConversations();
    };

    window.addEventListener('conversationCreated', handleConversationCreated);
    window.addEventListener('refreshConversations', handleRefresh);

    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated);
      window.removeEventListener('refreshConversations', handleRefresh);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const url = `${apiHost}/api/messaging/conversations/?filter=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const conversationsList = Array.isArray(data) ? data : (data.results || data.data || []);
        setConversations(conversationsList);
      }
    } catch (error) {
      console.error('[GUEST CONVERSATIONS] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="flex space-x-2 p-4 border-b border-gray-200 bg-white">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Conversations
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread {totalUnread > 0 && `(${totalUnread})`}
        </button>
      </div>

      {/* Conversations List - Grouped by Property */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-center font-medium">No conversations yet</p>
            <p className="text-sm text-center mt-2">Start chatting with hosts from property pages</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const host = conversation.host;
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unread_count > 0;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 hover:bg-white transition text-left ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Property Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                      {conversation.property.image_url ? (
                        <Image
                          src={conversation.property.image_url}
                          alt={conversation.property.title}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HomeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Property Name - Emphasized */}
                      <h4 className={`font-bold text-gray-900 truncate mb-1 ${hasUnread ? 'text-blue-600' : ''}`}>
                        {conversation.property.title}
                      </h4>
                      
                      {/* Host Name */}
                      <p className="text-sm text-gray-600 truncate mb-1">
                        Host: {host.name || host.email}
                      </p>
                      
                      {/* Last Message */}
                      {conversation.last_message && (
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate flex-1 ${
                            hasUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                          }`}>
                            {conversation.last_message.sender_role === 'guest' ? 'You: ' : ''}
                            {conversation.last_message.message}
                          </p>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(conversation.last_message.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {/* Unread Badge */}
                      {hasUnread && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                            {conversation.unread_count} new
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

