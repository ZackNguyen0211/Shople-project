'use client';

import { useRouter } from 'next/navigation';

type LogoutButtonProps = {
  label: string;
};

export default function LogoutButton({ label }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <button className="btn-outline" onClick={handleLogout} type="button">
      {label}
    </button>
  );
}
