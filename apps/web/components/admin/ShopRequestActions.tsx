'use client';

import { useRouter } from 'next/navigation';

interface ShopRequestActionsProps {
  id: number;
}

export default function ShopRequestActions({ id }: ShopRequestActionsProps) {
  const router = useRouter();

  async function handleApprove() {
    try {
      const res = await fetch(`/api/shops/requests/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        window.dispatchEvent(new Event('notificationUpdated'));
        router.refresh();
        router.push('/admin');
      }
    } catch (e) {
      console.error('Failed to approve', e);
    }
  }

  async function handleReject() {
    try {
      const res = await fetch(`/api/shops/requests/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        window.dispatchEvent(new Event('notificationUpdated'));
        router.refresh();
        router.push('/admin');
      }
    } catch (e) {
      console.error('Failed to reject', e);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="btn" type="button" onClick={handleApprove}>
        Approve
      </button>
      <button className="btn-outline" type="button" onClick={handleReject}>
        Reject
      </button>
    </div>
  );
}
