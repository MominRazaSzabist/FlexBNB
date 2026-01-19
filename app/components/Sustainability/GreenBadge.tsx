'use client';

import Link from 'next/link';

interface GreenBadgeProps {
  level?: string | null;
  status?: string;
  size?: 'small' | 'medium' | 'large';
  showLink?: boolean;
}

/**
 * Green Stay Certification Badge Component
 * Displays certification badge on properties
 */
export default function GreenBadge({ 
  level, 
  status = 'approved',
  size = 'medium',
  showLink = true 
}: GreenBadgeProps) {
  // Only show badge if certified and approved
  if (status !== 'approved' || !level) {
    return null;
  }

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const levelConfig = {
    bronze: {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: '🥉',
      label: 'Bronze'
    },
    silver: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: '🥈',
      label: 'Silver'
    },
    gold: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: '🥇',
      label: 'Gold'
    }
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.bronze;

  const badgeContent = (
    <div className={`
      inline-flex items-center space-x-1.5 rounded-full font-semibold
      ${config.bg} ${config.text} ${config.border} border-2
      ${sizeClasses[size]}
      transition hover:scale-105
    `}>
      <span className="text-lg">🏅</span>
      <span>{config.label} Green Stay</span>
    </div>
  );

  if (showLink) {
    return (
      <Link 
        href="/sustainability/green-certification"
        className="inline-block"
        title="Learn about Green Stay Certification"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}

