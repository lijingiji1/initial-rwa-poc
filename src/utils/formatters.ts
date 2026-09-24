export const formatCurrency = (amount: number, currency: string): string => {
  if (currency === 'USDT') {
    return `$${amount.toLocaleString()}`;
  } else if (currency === 'ETH') {
    return `${amount.toLocaleString()} ETH`;
  }
  return `${amount.toLocaleString()} ${currency}`;
};

export const truncateAddress = (address: string, length = 6): string => {
  if (!address) return '';
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};