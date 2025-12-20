'use client';
import { useEffect, useRef, useState } from 'react';

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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  async function markAllRead() {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      await load();
    } catch (e) {
      console.warn('Failed to mark notifications read', e);
    }
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

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
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            minWidth: 260,
            padding: 6,
            zIndex: 50,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <strong style={{ fontSize: 13 }}>Notifications</strong>
            <button
              type="button"
              className="btn-outline"
              onClick={markAllRead}
              disabled={loading}
              style={{ fontSize: 12, padding: '6px 8px' }}
            >
              Mark all read
            </button>
          </div>
          {loading ? (
            <div className="muted" style={{ padding: 8, fontSize: 12 }}>
              Loading...
            </div>
          ) : null}
          {items.length === 0 ? (
            <div className="muted" style={{ padding: 8, fontSize: 12 }}>
              No notifications
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {items.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    background: n.isRead ? '#fafafa' : '#f0f9ff',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                  {n.body ? (
                    <div style={{ fontSize: 12 }} className="muted">
                      {n.body}
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
