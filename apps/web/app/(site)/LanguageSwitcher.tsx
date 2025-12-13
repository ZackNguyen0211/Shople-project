"use client";
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function LanguageSwitcher({ value }: { value: 'vi' | 'en' }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function setLang(lang: 'vi' | 'en') {
    if (lang === value) {
      setOpen(false);
      return;
    }
    await fetch('/api/lang', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang }) });
    startTransition(() => {
      setOpen(false);
      router.refresh();
    });
  }

  const label = value === 'en' ? 'EN' : 'VI';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn-outline"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
      >
        {label} ▾
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
            minWidth: 140,
            padding: 6,
            zIndex: 50,
          }}
        >
          <button
            role="menuitemradio"
            aria-checked={value === 'vi'}
            className="btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 6 }}
            type="button"
            onClick={() => setLang('vi')}
            disabled={pending}
          >
            {value === 'vi' ? '• ' : ''}Tiếng Việt
          </button>
          <button
            role="menuitemradio"
            aria-checked={value === 'en'}
            className="btn-outline"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            type="button"
            onClick={() => setLang('en')}
            disabled={pending}
          >
            {value === 'en' ? '• ' : ''}English
          </button>
        </div>
      ) : null}
    </div>
  );
}
