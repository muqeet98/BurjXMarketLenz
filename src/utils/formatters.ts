export const formatCurrency = (value: number, minimizeDecimals = false): string => {
    if (value === undefined || value === null) return '-';
    
    if (minimizeDecimals && value < 1) {
      // Show more decimals for small values
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      }).format(value);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  export const formatLargeNumber = (value: number): string => {
    if (value === undefined || value === null) return '-';
    
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    
    return value.toString();
  };
  
  export const formatPercentage = (value: number): string => {
    if (value === undefined || value === null) return '-';
    
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always'
    }).format(value / 100);
    
    return formattedValue;
  };