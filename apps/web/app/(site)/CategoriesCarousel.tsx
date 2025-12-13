"use client";
import Link from 'next/link';
import { useMemo, useState } from 'react';

type Cat = { name: string; q: string };

export default function CategoriesCarousel({ title, items }: { title: string; items: ReadonlyArray<Cat> }) {
  // Show 2 rows x 8 columns = 16 items per page
  const perPage = 16;
  const pages = useMemo(() => Math.max(1, Math.ceil(items.length / perPage)), [items.length]);
  const [page, setPage] = useState(0);

  function move(dir: number) {
    setPage((p) => Math.min(pages - 1, Math.max(0, p + dir)));
  }

  return (
    <section className="cat-carousel">
      <h2 className="cat-title">{title}</h2>
      <div className="cat-carousel-wrap">
        <button className="cat-nav left" type="button" aria-label="Prev" onClick={() => move(-1)} disabled={page === 0}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="cat-carousel-viewport">
          <div className="cat-carousel-track" style={{ transform: `translateX(-${page * 100}%)` }}>
            {Array.from({ length: pages }).map((_, idx) => {
              const start = idx * perPage;
              const group = items.slice(start, start + perPage);
              return (
              <div className="cat-slide" key={idx}>
                <div className="cat-carousel-grid">
                  {group.map((c) => (
                    <Link key={`${c.q}-${c.name}`} className="cat-item card-lite" href={{ pathname: '/search', query: { q: c.q } }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/category.svg" alt="" width={56} height={56} />
                      <span className="cat-name-small">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        </div>
        <button className="cat-nav right" type="button" aria-label="Next" onClick={() => move(1)} disabled={page >= pages - 1}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </section>
  );
}
