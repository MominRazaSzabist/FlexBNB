"use client";
import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { ChatBubbleLeftRightIcon, UserGroupIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/Host/DashboardLayout';
import StatsCard from '../../components/Host/StatsCard';
import HostConversationList from '../../components/Messaging/HostConversationList';
import HostChatWindow from '../../components/Messaging/HostChatWindow';
import QuickReplies from '../../components/Messaging/QuickReplies';

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

const MessagesPage = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    activeToday: 0,
  });
  const [quickReplies, setQuickReplies] = useState<Array<{ id: string; title: string; message: string }>>([]);

  useEffect(() => {
    fetchStats();
    fetchQuickReplies();
  }, [refreshTrigger]);

  // Poll for new conversations every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchStats();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Listen for custom events when new conversations are created
  useEffect(() => {
    const handleNewConversation = () => {
      console.log('[HOST MESSAGES] New conversation event received, refreshing...');
      setRefreshTrigger(prev => prev + 1);
    };

    const handleRefresh = () => {
      console.log('[HOST MESSAGES] Refresh event received');
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('conversationCreated', handleNewConversation);
    window.addEventListener('refreshConversations', handleRefresh);
    
    return () => {
      window.removeEventListener('conversationCreated', handleNewConversation);
      window.removeEventListener('refreshConversations', handleRefresh);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const url = `${apiHost}/api/messaging/conversations/`;
      
      console.log('[HOST MESSAGES] Fetching conversations from:', url);
      console.log('[HOST MESSAGES] API Host:', apiHost);
      console.log('[HOST MESSAGES] Token present:', !!token);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[HOST MESSAGES] Conversations fetched:', {
          count: Array.isArray(data) ? data.length : 'not an array',
          data: data,
        });
        
        // Handle both array and object with results key
        const conversationsList = Array.isArray(data) ? data : (data.results || data.data || []);
        setConversations(conversationsList);
        
        const unread = conversationsList.reduce((sum: number, conv: Conversation) => sum + (conv.unread_count || 0), 0);
        const today = conversationsList.filter((conv: Conversation) => 
          new Date(conv.updated_at).toDateString() === new Date().toDateString()
        ).length;

        setStats({
          totalConversations: conversationsList.length,
          unreadMessages: unread,
          activeToday: today,
        });
      } else {
        const errorText = await response.text();
        console.error('[HOST MESSAGES] Error fetching conversations:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
      }
    } catch (error: any) {
      console.error('[HOST MESSAGES] Error fetching stats:', error);
      console.error('[HOST MESSAGES] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiHost: process.env.NEXT_PUBLIC_API_HOST,
      });
      
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.error('[HOST MESSAGES] Network error - Backend may not be running');
        console.error('[HOST MESSAGES] Please verify:');
        console.error('  1. Backend server is running on http://localhost:8000');
        console.error('  2. NEXT_PUBLIC_API_HOST is set in .env.local');
        console.error('  3. Frontend server was restarted after setting env var');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickReplies = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      const response = await fetch(`${apiHost}/api/messaging/quick-replies/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuickReplies(data.slice(0, 5)); // Get top 5 quick replies
      }
    } catch (error) {
      console.error('[HOST MESSAGES] Error fetching quick replies:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    // Fetch full conversation detail with messages
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
        const fullConversation = await response.json();
        console.log('[HOST MESSAGES] Fetched full conversation:', fullConversation);
        setSelectedConversation(fullConversation);
      } else {
        console.error('[HOST MESSAGES] Failed to fetch conversation detail');
        // Fallback to basic conversation
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('[HOST MESSAGES] Error fetching conversation detail:', error);
      // Fallback to basic conversation
      setSelectedConversation(conversation);
    }
  };

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleQuickReplySelect = (message: string) => {
    // This would be used to insert the quick reply into the message input
    console.log('Quick reply selected:', message);
  };

  if (loading) {
    return (
      <DashboardLayout title="Messages" subtitle="Communicate with your guests">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SignedIn>
        <DashboardLayout title="Guest Messages" subtitle="Manage inquiries from your guests">
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard 
                title="Total Conversations" 
                value={stats.totalConversations} 
                icon={<UserGroupIcon className="h-6 w-6 text-green-600" />} 
              />
              <StatsCard 
                title="Unread Messages" 
                value={stats.unreadMessages} 
                icon={<EnvelopeIcon className="h-6 w-6 text-red-600" />} 
              />
              <StatsCard 
                title="Active Today" 
                value={stats.activeToday} 
                icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />} 
              />
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex h-[650px]">
                {/* Conversation List - Grouped by Property */}
                <div className="w-2/5 border-r border-gray-200">
                  <HostConversationList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                    refreshTrigger={refreshTrigger}
                  />
                </div>

                {/* Chat Window */}
                <div className="flex-1">
                  {selectedConversation ? (
                    <HostChatWindow
                      conversation={selectedConversation}
                      onClose={() => setSelectedConversation(null)}
                      onMessageSent={handleMessageSent}
                      quickReplies={quickReplies}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center text-gray-500 p-8">
                        <ChatBubbleLeftRightIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">Select a guest conversation</p>
                        <p className="text-sm text-gray-500">Choose a guest inquiry to view messages and respond</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Replies Management Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reply Templates</h3>
              <QuickReplies onSelectTemplate={handleQuickReplySelect} />
            </div>
          </div>
        </DashboardLayout>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="mb-4 text-lg">You must be signed in to view Messages.</p>
          <SignInButton />
        </div>
      </SignedOut>
    </>
  );
};

export default MessagesPage;