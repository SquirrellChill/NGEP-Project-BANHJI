const CURRENCY_STORAGE_KEY = 'kc_currency';

export const normalizeCurrency = (currency) => (currency === 'USD' ? 'USD' : 'KHR');

export const getPreferredCurrency = () => normalizeCurrency(localStorage.getItem(CURRENCY_STORAGE_KEY));

export const setPreferredCurrency = (currency) => {
  localStorage.setItem(CURRENCY_STORAGE_KEY, normalizeCurrency(currency));
};

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

export const formatCurrencyValue = (value, currency) =>
  normalizeCurrency(currency) === 'USD' ? formatUSD(value) : formatKHR(value);

export const formatCurrencyPair = ({ khr = 0, usd = 0, preferredCurrency = getPreferredCurrency() }) => {
  const primaryCurrency = normalizeCurrency(preferredCurrency);
  const primaryValue = primaryCurrency === 'USD' ? usd : khr;
  const secondaryValue = primaryCurrency === 'USD' ? khr : usd;
  const secondaryCurrency = primaryCurrency === 'USD' ? 'KHR' : 'USD';

  if (Number(primaryValue || 0) > 0 || Number(secondaryValue || 0) === 0) {
    return {
      primary: formatCurrencyValue(primaryValue, primaryCurrency),
      equivalent: formatCurrencyValue(secondaryValue, secondaryCurrency),
      primaryCurrency,
      secondaryCurrency,
    };
  }

  return {
    primary: formatCurrencyValue(secondaryValue, secondaryCurrency),
    equivalent: formatCurrencyValue(primaryValue, primaryCurrency),
    primaryCurrency: secondaryCurrency,
    secondaryCurrency: primaryCurrency,
  };
};
