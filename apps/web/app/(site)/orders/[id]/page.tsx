import { notFound } from 'next/navigation';
import { prisma } from '../../../../lib/prisma';
import { formatVND, statusLabel } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';

type Params = { params: { id: string } };

export default async function OrderPage({ params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const t = getDict(getLang());

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <h1 className="page-title">{t.orderDetail.title(order.id)}</h1>
      <p className="muted">{t.orderDetail.status}: {statusLabel(order.status, getLang())}</p>
      <table className="table section">
        <thead>
          <tr>
            <th>{t.orderDetail.productId}</th>
            <th>{t.orderDetail.qty}</th>
            <th>{t.orderDetail.price}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id}>
              <td>{item.productId}</td>
              <td>{item.quantity}</td>
              <td>{formatVND(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

