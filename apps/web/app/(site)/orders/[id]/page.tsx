import { notFound } from 'next/navigation';
import { formatVND, statusLabel } from '../../../../lib/format';
import { getDict, getLang } from '../../../../lib/i18n';
import { getDb, mapOrderItem } from '../../../../lib/db';

type Params = { params: { id: string } };

export default async function OrderPage({ params }: Params) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const supabase = getDb();
  const { data: order, error } = await supabase
    .from('orders')
    .select('id,status,items:order_items(id,product_id,price,quantity)')
    .eq('id', id)
    .maybeSingle();
  if (error || !order) notFound();
  const items = (order.items || []).map(mapOrderItem);
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
          {items.map((item) => (
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

