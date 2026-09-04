import { formatRiel } from '../../utils/currency';

export default function ProductSummaryTable({ items }) {
  return (
    <section className="product-table-card">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>{formatRiel(item.unitPriceKHR)}</td>
              <td>{formatRiel(item.totalKHR)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
