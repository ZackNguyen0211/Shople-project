'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Notification = {
  id: number;
  title: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Load unread count on mount
  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (e) {
      console.warn('Failed to load unread count', e);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Listen for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };
    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdated', handleNotificationUpdate);
  }, [loadUnreadCount]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load once when dropdown is first opened
    if (open && !hasLoaded) {
      load();
    }
  }, [open, hasLoaded, load]);

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      await load();
      await loadUnreadCount();
      window.dispatchEvent(new Event('notificationUpdated'));
    } catch (e) {
      console.warn('Failed to mark notifications read', e);
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="iconbtn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path
              d="M12 2a6 6 0 0 0-6 6v3.586l-1.707 1.707A1 1 0 0 0 4 15h16a1 1 0 0 0 .707-1.707L19 11.586V8a6 6 0 0 0-6-6Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M9 18a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        {unreadCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              background: '#ef4444',
              color: 'white',
              borderRadius: 999,
              fontSize: 10,
              padding: '0 6px',
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 6,
            background: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            minWidth: 320,
            maxWidth: 380,
            padding: 8,
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <strong style={{ fontSize: 15, color: '#111827', fontWeight: 700 }}>Thông báo</strong>
            <button
              type="button"
              className="btn-outline"
              onClick={markAllRead}
              disabled={loading}
              style={{ fontSize: 12, padding: '6px 10px', fontWeight: 500 }}
            >
              Đánh dấu đã đọc
            </button>
          </div>
          {loading ? (
            <div style={{ padding: 12, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
              Đang tải...
            </div>
          ) : null}
          {items.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              Không có thông báo
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {items.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: n.isRead ? '#fafafa' : '#eff6ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = n.isRead ? '#f3f4f6' : '#dbeafe';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = n.isRead ? '#fafafa' : '#eff6ff';
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>
                    {n.title}
                  </div>
                  {n.body ? (
                    <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>{n.body}</div>
                  ) : null}
                  {n.createdAt ? (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
