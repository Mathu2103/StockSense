export interface StockRulesConfig {
  defaultReorderLevel: string;
  minimumStockThreshold: string;
  maximumStockLimit: string;
  stockUpdateMode: string;
  allowNegativeStock: boolean;
  autoDeductStock: boolean;
  // Alert settings
  enableLowStockAlerts: boolean;
  enableOutOfStockAlerts: boolean;
  enableExpiryAlerts: boolean;
  enableDeadStockAlerts: boolean;
  enableOverstockAlerts: boolean;
  notifyInApp: boolean;
  notifyEmail: boolean;
  notifySMS: boolean;
}
