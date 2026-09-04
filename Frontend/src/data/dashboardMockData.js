export const currentUserProfile = {
  name: 'Sok Bora',
  firstName: 'Bora',
  businessName: 'Boran Coffee shop',
  role: 'Owner',
  email: 'bora@example.com',
  phone: '+855 12 345 678',
  address: 'Phnom Penh, Cambodia',
};

export const revenueSummary = {
  label: "TODAY'S REVENUE",
  filteredLabel: 'FILTERED TODAY REVENUE',
  date: '15-Mar-2026',
  amountKHR: 42000,
  amountUSD: 10.25,
  exchangeRate: 4100,
  totalOrders: 4,
};

export const recentTransactions = [
  { id: 'txn-1', title: 'Iced coffee x2', time: '10:42 am', source: 'voice', amountKHR: 4000 },
  { id: 'txn-2', title: 'Croissant x1', time: '10:15 am', source: 'manual', amountKHR: 6000 },
  { id: 'txn-3', title: 'Iced tea x3', time: '9:50 am', source: 'voice', amountKHR: 12000 },
];

export const productSummary = [
  { id: 'milk-tea', product: 'Milk tea', quantity: 2, unitPriceKHR: 4000, totalKHR: 8000 },
  { id: 'greentea-1', product: 'Greentea', quantity: 2, unitPriceKHR: 3000, totalKHR: 6000 },
  { id: 'honey-tea', product: 'Honey tea', quantity: 2, unitPriceKHR: 8000, totalKHR: 4000 },
  { id: 'greentea-2', product: 'Greentea', quantity: 2, unitPriceKHR: 3000, totalKHR: 6000 },
  { id: 'greentea-3', product: 'Greentea', quantity: 2, unitPriceKHR: 3000, totalKHR: 6000 },
];

export const extractedSaleItems = [
  { id: 'sale-1', product: 'Milk tea', quantity: 2, unitPriceUSD: 1, totalUSD: 2 },
  { id: 'sale-2', product: 'Greentea', quantity: 2, unitPriceUSD: 1.5, totalUSD: 3 },
  { id: 'sale-3', product: 'Milk tea', quantity: 2, unitPriceUSD: 1, totalUSD: 2 },
  { id: 'sale-4', product: 'Greentea', quantity: 2, unitPriceUSD: 1.5, totalUSD: 3 },
];

export const transactionDetails = {
  date: '15-Mar-2026',
  time: '10:42 am',
  source: 'voice',
  items: [
    { id: 'detail-1', product: 'Iced coffee', quantity: 2, unitPriceKHR: 2000, totalKHR: 4000 },
    { id: 'detail-2', product: 'Croissant', quantity: 1, unitPriceKHR: 6000, totalKHR: 6000 },
  ],
};
