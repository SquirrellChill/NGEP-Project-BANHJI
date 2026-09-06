import { formatKHR, formatUSD } from '../../utils/currency';
import { useLanguage } from '../../context/LanguageContext';

const formatMoney = (item, fieldBase) => {
  if (item.currency === 'USD') return formatUSD(item[`${fieldBase}USD`]);
  return formatKHR(item[`${fieldBase}KHR`]);
};

export default function ProductSummaryTable({ items }) {
  const { t } = useLanguage();
  return (
    <section className="product-table-card">
      <table>
        <thead>
          <tr>
            <th>{t('product')}</th>
            <th>{t('qty')}</th>
            <th>{t('unitPrice')}</th>
            <th>{t('total')}</th>
          </tr>
        </thead>
        <tbody>
          {!items.length && (
            <tr>
              <td colSpan={4}>{t('noProducts')}</td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.product}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item, 'unitPrice')}</td>
              <td>{formatMoney(item, 'total')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
