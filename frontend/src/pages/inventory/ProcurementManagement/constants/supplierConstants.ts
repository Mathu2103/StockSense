export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  contactPhone: string;
  email: string;
  companyName: string;
  brn: string;
  taxNumber: string;
  street: string;
  city: string;
  province: string;
  categories: string;
  deliveryDays: string[];
  paymentTerms: string;
  status: 'Active' | 'Inactive';
  products: number;
  lastPurchaseDate: string;
  totalPurchases: number;
  totalValue: string;
  reliability: number;
  onTime: number;
  rating: number;
}

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'ABC Distributors',
    contact: 'John Doe',
    phone: '+94 77 123 4567',
    contactPhone: '+94 77 123 4560',
    email: 'john@abcdistributors.com',
    companyName: 'ABC Logistics Pvt Ltd',
    brn: 'BRN-20150912',
    taxNumber: 'TN-102934-A',
    street: '123 Business Street',
    city: 'Colombo',
    province: 'Western',
    categories: 'Grocery, Beverages',
    deliveryDays: ['Monday', 'Wednesday', 'Friday'],
    paymentTerms: 'Net 30',
    status: 'Active',
    products: 45,
    lastPurchaseDate: '2023-10-24',
    totalPurchases: 142,
    totalValue: '$18,450.00',
    reliability: 96,
    onTime: 98,
    rating: 4.8,
  },
  {
    id: 'SUP-002',
    name: 'Fresh Foods Ltd',
    contact: 'Jane Smith',
    phone: '+94 71 987 6543',
    contactPhone: '+94 71 987 6540',
    email: 'jane@freshfoodslk.com',
    companyName: 'Fresh Foods Sri Lanka',
    brn: 'BRN-20181102',
    taxNumber: 'TN-982341-B',
    street: '456 Trade Complex',
    city: 'Kandy',
    province: 'Central',
    categories: 'Dairy, Eggs',
    deliveryDays: ['Tuesday', 'Thursday'],
    paymentTerms: 'COD',
    status: 'Active',
    products: 120,
    lastPurchaseDate: '2023-10-25',
    totalPurchases: 284,
    totalValue: '$34,120.00',
    reliability: 92,
    onTime: 95,
    rating: 4.6,
  },
  {
    id: 'SUP-003',
    name: 'Lanka Grocery Suppliers',
    contact: 'Kamal Perera',
    phone: '+94 75 555 5555',
    contactPhone: '+94 75 555 5550',
    email: 'kamal@lgs.lk',
    companyName: 'LGS Holdings',
    brn: 'BRN-20120516',
    taxNumber: 'TN-382941-C',
    street: '789 Market Road',
    city: 'Galle',
    province: 'Southern',
    categories: 'Snacks, Grocery',
    deliveryDays: ['Wednesday', 'Saturday'],
    paymentTerms: 'Net 15',
    status: 'Active',
    products: 23,
    lastPurchaseDate: '2023-10-12',
    totalPurchases: 89,
    totalValue: '$9,280.00',
    reliability: 85,
    onTime: 80,
    rating: 4.2,
  },
  {
    id: 'SUP-004',
    name: 'XYZ Suppliers',
    contact: 'Nimal Silva',
    phone: '+94 72 222 3333',
    contactPhone: '+94 72 222 3330',
    email: 'nimal@xyz.lk',
    companyName: 'XYZ Imports',
    brn: 'BRN-20160824',
    taxNumber: 'TN-823491-D',
    street: '321 Industrial Park',
    city: 'Jaffna',
    province: 'Northern',
    categories: 'Beverages',
    deliveryDays: ['Friday'],
    paymentTerms: 'Net 60',
    status: 'Inactive',
    products: 12,
    lastPurchaseDate: '2023-09-18',
    totalPurchases: 45,
    totalValue: '$4,150.00',
    reliability: 65,
    onTime: 60,
    rating: 3.5,
  },
];
