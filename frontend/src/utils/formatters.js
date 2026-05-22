export const formatCurrency = (amount, currency = 'LKR') =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency }).format(amount)

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB')

export const formatBarcode = (code) => String(code).padStart(13, '0')

export const formatPercentage = (value) => `{(value * 100).toFixed(1)}%`

