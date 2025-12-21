export const dynamic = 'force-dynamic';

export default function ErrorDemoPage() {
  throw new Error('Demo server-render error: visiting /error-demo crashes intentionally');
}
