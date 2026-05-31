export type AlertCategory = 'Low Stock' | 'Out of Stock' | 'Expiring Soon' | 'Overstock' | 'Reorder Recommendation';
export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type Tab = 'All Alerts' | AlertCategory;

export interface AlertItem {
  id: number | string;
  category: AlertCategory;
  severity: AlertSeverity;
  issueType: string;
  currentStock: number;
  suggestedAction: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  accentColor: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  dismissed: boolean;
  primaryAction: string;
  secondaryAction: string;
  primaryBtnClass: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}
