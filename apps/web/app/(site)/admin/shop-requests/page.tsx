import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUser } from '../../../../../lib/auth';

export default async function AdminShopRequestsPage() {
  const user = getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/');
  const items = await prisma.shopRequest.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="card" style={{ maxWidth: 1100 }}>
      <h1 className="page-title">Shop Requests</h1>
      {items.length === 0 ? (
        <p className="muted">No requests.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Shop name</th>
              <th>Owner email</th>
              <th>Requester</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.shopName}</td>
                <td>{r.shopOwnerEmail}</td>
                <td>{r.requesterId}</td>
                <td>{r.status}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  {r.status === 'PENDING' ? (
                    <>
                      <form action={`/api/shops/requests/${r.id}/approve` as Route} method="post">
                        <button className="btn" type="submit">Approve</button>
                      </form>
                      <form action={`/api/shops/requests/${r.id}/reject` as Route} method="post">
                        <button className="btn-outline" type="submit">Reject</button>
                      </form>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

