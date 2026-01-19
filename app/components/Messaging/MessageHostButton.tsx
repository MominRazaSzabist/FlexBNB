"use client";
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface MessageHostButtonProps {
  propertyId: string;
  propertyTitle: string;
  hostName?: string;
  variant?: 'compact' | 'full';
  className?: string;
}

export default function MessageHostButton({ 
  propertyId, 
  propertyTitle, 
  hostName = 'Host',
  variant = 'compact',
  className = ''
}: MessageHostButtonProps) {
  const { getToken, isSignedIn } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to property page
    
    if (!isSignedIn) {
      toast.error('Please sign in to message the host');
      return;
    }
    setShowModal(true);
    setMessage(`Hi! I'm interested in your property "${propertyTitle}". `);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!propertyId) {
      toast.error('Property ID is missing');
      console.error('Property ID is missing');
      return;
    }

    setSending(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const payload = {
        property_id: propertyId,
        message: message.trim(),
      };

      const apiHost = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:8000';
      
      console.log('[MESSAGING] Sending message:', {
        property_id: propertyId,
        message_length: message.trim().length,
        api_host: apiHost,
        token_present: !!token,
      });

      const response = await fetch(
        `${apiHost}/api/messaging/conversations/create/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      console.log('[MESSAGING] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[MESSAGING] Conversation created/message sent:', data);
        
        // Verify message was actually created
        const conversationId = data.conversation?.id || data.conversation_id || data.conversation?.id;
        const messageCount = data.conversation?.messages?.length || 0;
        
        console.log('[MESSAGING] Conversation ID:', conversationId);
        console.log('[MESSAGING] Messages in response:', messageCount);
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('conversationCreated', {
          detail: { 
            conversationId: conversationId,
            propertyId: propertyId,
            messageCount: messageCount
          }
        }));
        
        // Also dispatch a refresh event
        window.dispatchEvent(new CustomEvent('refreshConversations'));
        
        toast.success('Message sent successfully!');
        setShowModal(false);
        setMessage('');
        
        // Small delay to ensure backend has processed everything
        setTimeout(() => {
          router.push('/Messages');
        }, 500);
      } else {
        let errorText = '';
        let error: any = {};
        
        try {
          errorText = await response.text();
          console.log('[MESSAGING] Raw error response:', errorText);
          
          // Try to parse as JSON
          try {
            error = JSON.parse(errorText);
          } catch {
            // If not JSON, might be HTML error page
            if (errorText.includes('<html>') || errorText.includes('<!DOCTYPE')) {
              error = { 
                error: 'Server returned HTML error page. Check backend logs.',
                detail: 'The server encountered an error. Check backend terminal for details.'
              };
            } else {
              error = { error: errorText || 'Failed to send message' };
            }
          }
        } catch (parseError) {
          console.error('[MESSAGING] Error parsing response:', parseError);
          error = { error: 'Failed to parse error response' };
        }
        
        console.error('[MESSAGING] Failed to send message:', {
          status: response.status,
          statusText: response.statusText,
          error: error,
          errorText: errorText.substring(0, 500), // First 500 chars
          url: `${apiHost}/api/messaging/conversations/create/`,
        });
        
        // Provide specific error messages based on status code
        let errorMessage = 'Failed to send message';
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to send this message.';
        } else if (response.status === 404) {
          errorMessage = 'Property not found.';
        } else if (response.status === 500) {
          // Server error - show detailed message if available
          if (error.error) {
            errorMessage = error.error;
          } else if (error.detail) {
            errorMessage = error.detail;
          } else {
            errorMessage = 'Server error. Please check backend logs and try again.';
          }
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.detail) {
          errorMessage = error.detail;
        }
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('[MESSAGING] Error sending message:', error);
      console.error('[MESSAGING] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        toast.error('Cannot connect to server. Please check your connection.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={`flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm hover:shadow-md ${className}`}
          title={`Message ${hostName}`}
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span>Message</span>
        </button>

        {/* Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModal(false);
              }
            }}
          >
            <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Message {hostName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Property: {propertyTitle}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message here..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Full variant (same as ContactHostButton)
  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`flex items-center justify-center space-x-2 w-full px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium ${className}`}
      >
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
        <span>Contact Host</span>
      </button>

      {/* Modal - same as compact */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Message {hostName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Property: {propertyTitle}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message here..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

