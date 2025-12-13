"use client";
import { useEffect, useMemo, useState } from 'react';
import { getClientDict } from '../lib/i18n-client';

type Props = { error: Error & { digest?: string }; reset: () => void };

export default function GlobalError({ error, reset }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const isDev = useMemo(() => process.env.NODE_ENV !== 'production', []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const reference = error?.digest || new Date().toISOString();
  const t = getClientDict();

  return (
    <html>
      <body>
        <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div className="card" style={{ maxWidth: 760 }}>
            <h1 className="page-title" style={{ marginBottom: 8 }}>{isDev ? (t === null ? 'Error' : 'Error') : (t === null ? 'Error' : 'Error')}</h1>
            <p className="muted" style={{ marginTop: 0 }}>
              {isDev
                ? 'See details below to debug.'
                : (document?.cookie?.includes('lang=en')
                  ? 'Please try again or contact support with the reference below.'
                  : 'Vui lòng thử lại hoặc liên hệ hỗ trợ với mã tham chiếu bên dưới.')}
            </p>

            {!isDev ? (
              <p className="muted">Reference: <strong>{reference}</strong></p>
            ) : (
              <div style={{ marginTop: 8 }}>
                <button className="btn-outline" onClick={() => setShowDetails((v) => !v)}>
                  {document?.cookie?.includes('lang=en') ? (showDetails ? 'Hide details' : 'Show details') : (showDetails ? 'Ẩn chi tiết' : 'Hiển thị chi tiết')}
                </button>
                {showDetails ? (
                  <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap', overflowX: 'auto', marginTop: 12 }}>
                    {`${error.name || 'Error'}: ${error.message}\n\n${error.stack || ''}`}
                  </pre>
                ) : null}
              </div>
            )}

            <div className="section" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn" onClick={() => reset()}>{document?.cookie?.includes('lang=en') ? 'Try again' : 'Thử lại'}</button>
              <a className="btn-outline" href="/">{document?.cookie?.includes('lang=en') ? 'Go home' : 'Về trang chủ'}</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
