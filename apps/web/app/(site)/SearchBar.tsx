'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'recentSearches';

export default function SearchBar({
  placeholder,
  buttonLabel,
}: {
  placeholder: string;
  buttonLabel: string;
}) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  // Load recent searches from server + localStorage
  useEffect(() => {
    (async () => {
      let server: string[] = [];
      try {
        const res = await fetch('/api/search/recent', { cache: 'no-store' });
        if (res.ok) server = await res.json();
      } catch {
        // Ignore fetch errors
      }
      let local: string[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const items = JSON.parse(raw) as string[];
          if (Array.isArray(items)) local = items;
        }
      } catch {
        // Ignore JSON parse errors
      }
      const merged = [...server, ...local].reduce<string[]>((acc, cur) => {
        const v = String(cur || '').trim();
        if (!v) return acc;
        if (!acc.some((x) => x.toLowerCase() === v.toLowerCase())) acc.push(v);
        return acc;
      }, []);
      setRecent(merged.slice(0, 7));
    })();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  function saveRecent(q: string) {
    const v = q.trim();
    if (!v) return;
    setRecent((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 7);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage errors
      }
      // Best-effort sync to server cookie
      try {
        fetch('/api/search/recent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: v }),
        });
      } catch {
        // Ignore sync errors
      }
      return next;
    });
  }

  function submit(to: string) {
    router.push(to);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = query.trim();
    if (!v) return;
    saveRecent(v);
    setOpen(false);
    submit(`/search?q=${encodeURIComponent(v)}`);
  }

  const visible = open && recent.length > 0;
  const filtered = query
    ? recent.filter((r) => r.toLowerCase().includes(query.toLowerCase()))
    : recent;

  return (
    <div ref={wrapRef} className="searchbar" style={{ position: 'relative' }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          className="input"
          name="q"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        <button className="btn" type="submit" style={{ marginLeft: 8 }}>
          {buttonLabel}
        </button>
      </form>
      {visible ? (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 6,
            background: '#fff',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
            zIndex: 60,
            overflow: 'hidden',
          }}
        >
          {filtered.slice(0, 7).map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn-outline"
                style={{
                  flex: 1,
                  textAlign: 'left',
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 0,
                }}
                onClick={() => {
                  setQuery(item);
                  saveRecent(item);
                  setOpen(false);
                  submit(`/search?q=${encodeURIComponent(item)}`);
                }}
              >
                {item}
              </button>
              <button
                type="button"
                aria-label="Remove from history"
                className="btn-outline"
                style={{
                  border: 'none',
                  borderRadius: 0,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={async (e) => {
                  e.stopPropagation();
                  setRecent((prev) => prev.filter((x) => x !== item));
                  try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    const arr = raw ? (JSON.parse(raw) as string[]) : [];
                    const next = Array.isArray(arr) ? arr.filter((x) => x !== item) : [];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                  } catch {
                    // Ignore localStorage errors
                  }
                  try {
                    await fetch(`/api/search/recent?q=${encodeURIComponent(item)}`, {
                      method: 'DELETE',
                    });
                  } catch {
                    // Ignore delete errors
                  }
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
