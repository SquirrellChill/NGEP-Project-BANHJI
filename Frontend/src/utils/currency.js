export const formatKHR = (value) => `${Number(value || 0).toLocaleString('en-US')} KHR`;

export const formatRiel = (value) => `${Number(value || 0).toLocaleString('en-US')}៛`;

export const formatUSD = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

export const khrToUsd = (value, exchangeRate = 4100) => Number(value || 0) / exchangeRate;

export const usdToKhr = (value, exchangeRate = 4100) => Number(value || 0) * exchangeRate;
