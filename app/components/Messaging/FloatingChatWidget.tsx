"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Conversation {
  id: string;
  property: {
    id: string;
    title: string;
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
}

export default function FloatingChatWidget() {
  const { getToken, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetchConversations();
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [isSignedIn]);

  const fetchConversations = async () => {
    if (!isSignedIn) return;
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/conversations/?filter=all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        const totalUnread = data.reduce(
          (sum: number, conv: Conversation) => sum + (conv.unread_count || 0),
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleOpenChat = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to view messages');
      return;
    }
    router.push('/Messages');
  };

  if (!isSignedIn) {
    return null; // Don't show widget if not signed in
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group animate-pulse hover:animate-none"
          aria-label="Open chat"
          style={{ 
            width: '64px', 
            height: '64px',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.5)'
          }}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <>
              <ChatBubbleLeftRightIcon className="h-7 w-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center ring-2 ring-white animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9998] w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              <h3 className="font-semibold">Messages</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded-full transition"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Contact a host to start chatting</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conversation) => {
                  const otherUser = conversation.guest.id === userId 
                    ? conversation.host 
                    : conversation.guest;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/Messages');
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold text-sm">
                            {otherUser.name?.charAt(0) || otherUser.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-sm text-gray-900 truncate">
                              {otherUser.name || otherUser.email}
                            </h4>
                            {conversation.unread_count > 0 && (
                              <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                {conversation.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">
                            {conversation.property.title}
                          </p>
                          {conversation.last_message && (
                            <p className={`text-xs truncate ${
                              conversation.unread_count > 0 
                                ? 'font-semibold text-gray-900' 
                                : 'text-gray-600'
                            }`}>
                              {conversation.last_message.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <button
              onClick={handleOpenChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>Open All Messages</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

