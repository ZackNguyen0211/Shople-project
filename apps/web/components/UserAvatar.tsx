'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  loginLabel: string;
  logoutLabel: string;
  accountLabel: string;
}

export default function UserAvatar({
  name,
  avatarUrl,
  logoutLabel,
  accountLabel,
}: UserAvatarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 8,
          borderRadius: 8,
          transition: 'background-color 0.2s, box-shadow 0.2s',
          backgroundColor: isOpen ? '#245a44' : undefined,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.18)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#245a44';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isOpen ? '#245a44' : '';
        }}
      >
        {/* Avatar Image or Initials */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: avatarUrl
              ? `url('${avatarUrl}')`
              : 'linear-gradient(135deg, #2f6d54 0%, #1e4d3a 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {!avatarUrl && initials}
        </div>

        {/* User Name */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{name}</span>
          <span style={{ fontSize: 12, color: '#e5f3ed' }}>▼</span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 8,
            background: 'white',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: 200,
            overflow: 'hidden',
          }}
        >
          {/* Account Link */}
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'block',
              padding: '12px 16px',
              color: '#374151',
              textDecoration: 'none',
              fontSize: 14,
              borderBottom: '1px solid #f3f4f6',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            👤 {accountLabel}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'white',
              border: 'none',
              color: '#dc2626',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#fee2e2';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            🚪 {isLoading ? '...' : logoutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
