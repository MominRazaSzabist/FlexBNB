"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChatBubbleLeftRightIcon, HomeIcon, UserIcon } from '@heroicons/react/24/outline';
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

interface HostConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  refreshTrigger?: number;
}

export default function HostConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  refreshTrigger 
}: HostConversationListProps) {
  const { getToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [groupBy, setGroupBy] = useState<'property' | 'recent'>('property');

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
      console.log('[HOST CONVERSATIONS] Conversation created event received, refreshing...');
      setTimeout(() => fetchConversations(), 1000); // Small delay to ensure backend is ready
    };

    const handleRefresh = () => {
      console.log('[HOST CONVERSATIONS] Refresh event received');
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
      console.error('[HOST CONVERSATIONS] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

  // Group conversations by property
  const groupedConversations = groupBy === 'property' 
    ? conversations.reduce((acc, conv) => {
        const propertyId = conv.property.id;
        if (!acc[propertyId]) {
          acc[propertyId] = {
            property: conv.property,
            conversations: []
          };
        }
        acc[propertyId].conversations.push(conv);
        return acc;
      }, {} as Record<string, { property: any; conversations: Conversation[] }>)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="p-4 border-b border-gray-200 bg-white space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread {totalUnread > 0 && `(${totalUnread})`}
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setGroupBy('property')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              groupBy === 'property'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            By Property
          </button>
          <button
            onClick={() => setGroupBy('recent')}
            className={`px-3 py-1 rounded text-xs font-medium transition ${
              groupBy === 'recent'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-center font-medium">No guest messages yet</p>
            <p className="text-sm text-center mt-2">Messages from guests will appear here</p>
          </div>
        ) : groupBy === 'property' && groupedConversations ? (
          // Grouped by Property View
          <div>
            {Object.values(groupedConversations).map((group) => (
              <div key={group.property.id} className="mb-4">
                {/* Property Header */}
                <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                  <div className="flex items-center space-x-2">
                    <HomeIcon className="h-5 w-5 text-green-700" />
                    <h3 className="font-semibold text-green-900">{group.property.title}</h3>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                      {group.conversations.length} {group.conversations.length === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                </div>
                
                {/* Conversations for this property */}
                <div className="divide-y divide-gray-200">
                  {group.conversations.map((conversation) => {
                    const guest = conversation.guest;
                    const isSelected = conversation.id === selectedConversationId;
                    const hasUnread = conversation.unread_count > 0;
                    
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => onSelectConversation(conversation)}
                        className={`w-full p-4 hover:bg-white transition text-left ${
                          isSelected ? 'bg-green-50 border-l-4 border-green-600' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Guest Avatar */}
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-6 w-6 text-green-600" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Guest Name - Emphasized */}
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-bold text-gray-900 truncate ${hasUnread ? 'text-green-600' : ''}`}>
                                {guest.name || guest.email}
                              </h4>
                              {conversation.last_message && (
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                  {new Date(conversation.last_message.created_at).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                            
                            {/* Last Message */}
                            {conversation.last_message && (
                              <p className={`text-sm truncate ${
                                hasUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                              }`}>
                                {conversation.last_message.sender_role === 'host' ? 'You: ' : ''}
                                {conversation.last_message.message}
                              </p>
                            )}
                            
                            {/* Unread Badge */}
                            {hasUnread && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
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
              </div>
            ))}
          </div>
        ) : (
          // Recent View (ungrouped)
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const guest = conversation.guest;
              const isSelected = conversation.id === selectedConversationId;
              const hasUnread = conversation.unread_count > 0;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 hover:bg-white transition text-left ${
                    isSelected ? 'bg-green-50 border-l-4 border-green-600' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Guest Avatar */}
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-green-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Guest Name */}
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-bold text-gray-900 truncate ${hasUnread ? 'text-green-600' : ''}`}>
                          {guest.name || guest.email}
                        </h4>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                            {new Date(conversation.last_message.created_at).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                      
                      {/* Property Name */}
                      <p className="text-xs text-gray-500 truncate mb-1 flex items-center space-x-1">
                        <HomeIcon className="h-3 w-3" />
                        <span>{conversation.property.title}</span>
                      </p>
                      
                      {/* Last Message */}
                      {conversation.last_message && (
                        <p className={`text-sm truncate ${
                          hasUnread ? 'font-semibold text-gray-900' : 'text-gray-500'
                        }`}>
                          {conversation.last_message.sender_role === 'host' ? 'You: ' : ''}
                          {conversation.last_message.message}
                        </p>
                      )}
                      
                      {/* Unread Badge */}
                      {hasUnread && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
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

