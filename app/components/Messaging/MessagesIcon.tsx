"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleSolid } from '@heroicons/react/24/solid';

interface MessagesIconProps {
  className?: string;
  showBadge?: boolean;
  variant?: 'icon' | 'button';
}

export default function MessagesIcon({ 
  className = '', 
  showBadge = true,
  variant = 'icon'
}: MessagesIconProps) {
  const { getToken, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_HOST}/api/messaging/conversations/?filter=unread`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const conversations = await response.json();
          const totalUnread = conversations.reduce(
            (sum: number, conv: any) => sum + (conv.unread_count || 0),
            0
          );
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isSignedIn, getToken, userId]);

  const handleClick = () => {
    router.push('/Messages');
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative flex items-center space-x-2 px-4 py-2 text-white hover:bg-gray-800 rounded-lg transition ${className}`}
        title="Messages"
      >
        {hovered ? (
          <ChatBubbleSolid className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
        <span className="hidden md:inline">Messages</span>
        {showBadge && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-2 text-white hover:bg-gray-800 rounded-full transition ${className}`}
      title={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      {hovered ? (
        <ChatBubbleSolid className="h-6 w-6" />
      ) : (
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      )}
      {showBadge && unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ring-2 ring-black">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

