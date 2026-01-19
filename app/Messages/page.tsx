"use client";
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs";
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import GuestConversationList from '../components/Messaging/GuestConversationList';
import GuestChatWindow from '../components/Messaging/GuestChatWindow';

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

export default function MessagesPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Listen for conversation creation and refresh events
  useEffect(() => {
    const handleConversationCreated = () => {
      console.log('[GUEST MESSAGES] Conversation created event received, refreshing...');
      setRefreshTrigger(prev => prev + 1);
    };

    const handleRefresh = () => {
      console.log('[GUEST MESSAGES] Refresh event received');
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('conversationCreated', handleConversationCreated);
    window.addEventListener('refreshConversations', handleRefresh);

    return () => {
      window.removeEventListener('conversationCreated', handleConversationCreated);
      window.removeEventListener('refreshConversations', handleRefresh);
    };
  }, []);

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
        console.log('[GUEST MESSAGES] Fetched full conversation:', fullConversation);
        setSelectedConversation(fullConversation);
      } else {
        console.error('[GUEST MESSAGES] Failed to fetch conversation detail');
        // Fallback to basic conversation
        setSelectedConversation(conversation);
      }
    } catch (error) {
      console.error('[GUEST MESSAGES] Error fetching conversation detail:', error);
      // Fallback to basic conversation
      setSelectedConversation(conversation);
    }
  };

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Your Messages</h1>
                  <p className="text-blue-100 mt-1">Chat with property hosts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="flex h-[calc(100vh-250px)]">
                {/* Conversation List */}
                <div className="w-full md:w-2/5 border-r border-gray-200">
                  <GuestConversationList
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                    refreshTrigger={refreshTrigger}
                  />
                </div>

                {/* Chat Window */}
                <div className="hidden md:flex flex-1">
                  {selectedConversation ? (
                    <GuestChatWindow
                      conversation={selectedConversation}
                      onClose={() => setSelectedConversation(null)}
                      onMessageSent={handleMessageSent}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full bg-gray-50">
                      <div className="text-center text-gray-500 p-8">
                        <ChatBubbleLeftRightIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</p>
                        <p className="text-sm text-gray-500">Choose a property conversation to start messaging with the host</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Chat Window */}
            {selectedConversation && (
              <div className="md:hidden fixed inset-0 bg-white z-50">
                <GuestChatWindow
                  conversation={selectedConversation}
                  onClose={() => setSelectedConversation(null)}
                  onMessageSent={handleMessageSent}
                />
              </div>
            )}
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view messages</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to access your messages</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

