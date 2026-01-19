"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChatBubbleLeftRightIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
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
    created_at: string;
    is_read: boolean;
  } | null;
  unread_count: number;
  updated_at: string;
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  refreshTrigger?: number;
}

export default function ConversationList({ 
  onSelectConversation, 
  selectedConversationId,
  refreshTrigger 
}: ConversationListProps) {
  const { getToken, userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

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

  const fetchConversations = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const url = `${apiHost}/api/messaging/conversations/?filter=${filter}`;
      
      console.log('[MESSAGING] Fetching conversations from:', url);
      console.log('[MESSAGING] API Host:', apiHost);
      console.log('[MESSAGING] Token present:', !!token);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[MESSAGING] Fetched conversations:', {
          count: Array.isArray(data) ? data.length : 'not an array',
          data: data,
        });
        
        // Handle both array and object with results key
        const conversationsList = Array.isArray(data) ? data : (data.results || data.data || []);
        setConversations(conversationsList);
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('[MESSAGING] Error fetching conversations:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
      }
    } catch (error: any) {
      console.error('[MESSAGING] Error fetching conversations:', error);
      console.error('[MESSAGING] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiHost: process.env.NEXT_PUBLIC_API_HOST,
      });
      
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('[MESSAGING] Network error - Backend may not be running');
        console.error('[MESSAGING] Please verify:');
        console.error('  1. Backend server is running on http://localhost:8000');
        console.error('  2. NEXT_PUBLIC_API_HOST is set in .env.local');
        console.error('  3. Frontend server was restarted after setting env var');
      }
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.guest.id === userId ? conversation.host : conversation.guest;
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
      <div className="flex space-x-2 p-4 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
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
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'archived'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4" />
            <p className="text-center">No conversations yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const isSelected = conversation.id === selectedConversationId;
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-4 hover:bg-gray-50 transition text-left ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-lg">
                        {otherUser.name?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {otherUser.name || otherUser.email}
                        </h4>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(conversation.last_message.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.property.title}
                      </p>
                      
                      {conversation.last_message && (
                        <p className={`text-sm truncate ${
                          conversation.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                        }`}>
                          {conversation.last_message.message}
                        </p>
                      )}
                      
                      {conversation.unread_count > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
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

