export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="card" style={{ maxWidth: 600, textAlign: 'center' }}>
        {/* simple server i18n */}
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        {(() => {
          const { getLang } = require('../lib/i18n');
          const lang = getLang();
          const isEn = lang === 'en';
          return (
            <>
              <h1 className="page-title">{isEn ? 'Page not found' : 'Không tìm thấy trang'}</h1>
              <p className="muted">{isEn ? "The page you're looking for doesn't exist." : 'Trang bạn truy cập không tồn tại.'}</p>
              <a className="btn" href="/">{isEn ? 'Go home' : 'Về trang chủ'}</a>
            </>
          );
        })()}
      </div>
    </div>
  );
}
