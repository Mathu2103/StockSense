export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidBarcode = (code) => /^\d{8,14}$/.test(code)

export const isRequired = (value) => value !== null && value !== undefined && value !== ''

export const isPositiveNumber = (value) => !isNaN(value) && Number(value) > 0

