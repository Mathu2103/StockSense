import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import Sidebar from "./Components/Sidebar";
import InventoryHeader from './Components/InventoryHeader';

// Comprehensive mock data for Suppliers
const initialSuppliers = [
  {
    id: 'SUP-001',
    name: 'ABC Distributors',
    contact: 'John Doe',
    phone: '+94 77 123 4567',
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
    status: 'Active' as 'Active' | 'Inactive',
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
    status: 'Active' as 'Active' | 'Inactive',
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
    status: 'Active' as 'Active' | 'Inactive',
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
    status: 'Inactive' as 'Active' | 'Inactive',
    products: 12,
    lastPurchaseDate: '2023-09-18',
    totalPurchases: 45,
    totalValue: '$4,150.00',
    reliability: 65,
    onTime: 60,
    rating: 3.5,
  },
];

// Purchase Records Mock Data according to specifications
const initialPurchases = [
  {
    id: 'PR-1024-001',
    invoiceNumber: 'INV-98210',
    referenceNumber: 'REF-8877610',
    supplier: 'ABC Distributors',
    purchaseDate: '2023-10-24',
    numberOfItems: 3,
    totalQuantity: 220,
    totalCost: '$2,450.00',
    paymentStatus: 'Paid' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Received' as 'Received' | 'Pending' | 'Cancelled',
    paymentMethod: 'Bank Transfer',
    itemsList: [
      { name: 'Standard Full Cream Milk 1L', category: 'Dairy', qty: 100, cost: '$1.20', total: '$120.00' },
      { name: 'Cheddar Cheese Block 200g', category: 'Dairy', qty: 50, cost: '$4.50', total: '$225.00' },
      { name: 'Premium Butter 500g', category: 'Dairy', qty: 70, cost: '$30.00', total: '$2,105.00' },
    ]
  },
  {
    id: 'PR-1024-002',
    invoiceNumber: 'INV-98211',
    referenceNumber: 'REF-8877611',
    supplier: 'Fresh Foods Ltd',
    purchaseDate: '2023-10-25',
    numberOfItems: 2,
    totalQuantity: 500,
    totalCost: '$4,890.00',
    paymentStatus: 'Partially Paid' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Pending' as 'Received' | 'Pending' | 'Cancelled',
    paymentMethod: 'COD',
    itemsList: [
      { name: 'Fresh Chicken Breast 1kg', category: 'Poultry', qty: 250, cost: '$10.00', total: '$2,500.00' },
      { name: 'Premium Chicken Drumsticks 1kg', category: 'Poultry', qty: 250, cost: '$9.56', total: '$2,390.00' },
    ]
  },
  {
    id: 'PR-1024-003',
    invoiceNumber: 'INV-98212',
    referenceNumber: 'REF-8877612',
    supplier: 'Lanka Grocery Suppliers',
    purchaseDate: '2023-10-26',
    numberOfItems: 2,
    totalQuantity: 120,
    totalCost: '$1,250.00',
    paymentStatus: 'Pending' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Received' as 'Received' | 'Pending' | 'Cancelled',
    paymentMethod: 'Cheque',
    itemsList: [
      { name: 'Basmati Rice 5kg', category: 'Grains', qty: 80, cost: '$10.00', total: '$800.00' },
      { name: 'Ceylon Premium Tea 250g', category: 'Beverages', qty: 40, cost: '$11.25', total: '$450.00' },
    ]
  },
  {
    id: 'PR-1024-004',
    invoiceNumber: 'INV-98213',
    referenceNumber: 'REF-8877613',
    supplier: 'ABC Distributors',
    purchaseDate: '2023-10-27',
    numberOfItems: 1,
    totalQuantity: 45,
    totalCost: '$450.00',
    paymentStatus: 'Pending' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Cancelled' as 'Received' | 'Pending' | 'Cancelled',
    paymentMethod: 'Credit Card',
    itemsList: [
      { name: 'Natural Mineral Water 500ml', category: 'Beverages', qty: 45, cost: '$10.00', total: '$450.00' },
    ]
  }
];

// Preset Supermarket Products list to prepopulate categories & costs beautifully
const supermarketCatalog = [
  { name: 'Standard Full Cream Milk 1L', category: 'Dairy', unitCost: 1.20 },
  { name: 'Cheddar Cheese Block 200g', category: 'Dairy', unitCost: 4.50 },
  { name: 'Premium Butter 500g', category: 'Dairy', unitCost: 30.00 },
  { name: 'Fresh Chicken Breast 1kg', category: 'Poultry', unitCost: 10.00 },
  { name: 'Premium Chicken Drumsticks 1kg', category: 'Poultry', unitCost: 9.56 },
  { name: 'Basmati Rice 5kg', category: 'Grains', unitCost: 10.00 },
  { name: 'Ceylon Premium Tea 250g', category: 'Beverages', unitCost: 11.25 },
  { name: 'Natural Mineral Water 500ml', category: 'Beverages', unitCost: 10.00 },
  { name: 'Organic Red Apples 1kg', category: 'Produce', unitCost: 4.80 },
  { name: 'Fresh White Eggs 10pk', category: 'Dairy', unitCost: 3.20 },
  { name: 'Sparkling Soda Can 330ml', category: 'Beverages', unitCost: 1.10 },
  { name: 'Potato Chips Family Pack 150g', category: 'Snacks', unitCost: 2.50 }
];

export default function ProcurementManagement() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = location.pathname.includes('purchase-records') ? 'records' : 'suppliers';
  const activeTab = searchParams.get('tab') || defaultTab;

  // Active Datasets State
  const [suppliersList, setSuppliersList] = useState(initialSuppliers);
  const [purchasesList, setPurchasesList] = useState(initialPurchases);

  // Supplier Profile Page State
  const [activeProfileSupplier, setActiveProfileSupplier] = useState<typeof initialSuppliers[0] | null>(null);

  // General Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Purchase Specific Filters
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Modals & Selected details State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Purchase Modal State
  const [isRecordPurchaseOpen, setIsRecordPurchaseOpen] = useState(false);
  const [isEditPurchaseOpen, setIsEditPurchaseOpen] = useState(false);
  const [isViewPurchaseOpen, setIsViewPurchaseOpen] = useState(false);
  
  const [selectedSupplier, setSelectedSupplier] = useState<typeof initialSuppliers[0] | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<typeof initialPurchases[0] | null>(null);

  // Forms Field States for Supplier Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    companyName: '',
    brn: '',
    taxNumber: '',
    street: '',
    city: '',
    province: '',
    categories: '',
    deliveryDays: [] as string[],
    paymentTerms: 'Net 30',
    status: 'Active' as 'Active' | 'Inactive',
  });

  // STATEFUL HIGH-FIDELITY RECORD PURCHASE FORM
  const [purchaseForm, setPurchaseForm] = useState({
    supplierName: suppliersList[0]?.name || '',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    referenceNumber: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
    paymentMethod: 'Bank Transfer' as 'Bank Transfer' | 'COD' | 'Credit Card' | 'Cheque',
    paymentStatus: 'Pending' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Pending' as 'Received' | 'Pending' | 'Cancelled',
    items: [
      { product: supermarketCatalog[0].name, category: supermarketCatalog[0].category, unitCost: supermarketCatalog[0].unitCost, quantity: 10 }
    ]
  });

  // Single edit transaction status state
  const [editPurchaseStatusForm, setEditPurchaseStatusForm] = useState({
    paymentStatus: 'Pending' as 'Paid' | 'Partially Paid' | 'Pending',
    deliveryStatus: 'Pending' as 'Received' | 'Pending' | 'Cancelled',
  });

  // Validation States
  const [formErrors, setFormErrors] = useState({
    name: '', contact: '', phone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
  });

  const [purchaseFormErrors, setPurchaseFormErrors] = useState({
    invoiceNumber: '',
    items: '',
  });

  const handleTabChange = (tabName: string) => {
    setSearchParams({ tab: tabName });
    // Clear profile page when switching main tabs
    setActiveProfileSupplier(null);
  };

  // Top Statistics Cards Counts
  const totalSuppliersCount = suppliersList.length;
  const activeSuppliersCount = suppliersList.filter(s => s.status === 'Active').length;
  const totalPurchasesCount = purchasesList.length;
  
  const totalPurchaseValue = useMemo(() => {
    const total = purchasesList
      .filter(p => p.deliveryStatus !== 'Cancelled')
      .reduce((sum, p) => {
        const val = parseFloat(p.totalCost.replace(/[$,]/g, '')) || 0;
        return sum + val;
      }, 0);
    return `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [purchasesList]);

  const pendingDeliveriesCount = purchasesList.filter(p => p.deliveryStatus === 'Pending').length;

  // Real-time automatic calculations for Record Purchase Form
  const recordPurchaseCalculations = useMemo(() => {
    const totalItems = purchaseForm.items.length;
    const totalQuantity = purchaseForm.items.reduce((sum, item) => sum + (parseInt(item.quantity.toString()) || 0), 0);
    const subtotal = purchaseForm.items.reduce((sum, item) => sum + ((parseFloat(item.unitCost.toString()) || 0) * (parseInt(item.quantity.toString()) || 0)), 0);
    const tax = subtotal * 0.08; // 8% standard supermarket tax rate
    const grandTotal = subtotal + tax;

    return {
      totalItems,
      totalQuantity,
      subtotal: `$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      tax: `$${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      grandTotal: `$${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  }, [purchaseForm.items]);

  // Selected supplier card inside the Record Purchase form
  const purchaseFormSelectedSupplierInfo = useMemo(() => {
    return suppliersList.find(s => s.name === purchaseForm.supplierName) || null;
  }, [suppliersList, purchaseForm.supplierName]);

  // Filtered Suppliers List
  const filteredSuppliers = useMemo(() => {
    return suppliersList.filter(s => {
      const matchesSearch = 
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliersList, searchTerm, statusFilter]);

  // Filtered Purchase Records List
  const filteredPurchases = useMemo(() => {
    return purchasesList.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
        p.supplier.toLowerCase().includes(purchaseSearch.toLowerCase());
      
      const matchesSupplier = supplierFilter === 'All' || p.supplier === supplierFilter;

      let matchesDate = true;
      if (startDateFilter) {
        matchesDate = matchesDate && p.purchaseDate >= startDateFilter;
      }
      if (endDateFilter) {
        matchesDate = matchesDate && p.purchaseDate <= endDateFilter;
      }

      return matchesSearch && matchesSupplier && matchesDate;
    });
  }, [purchasesList, purchaseSearch, supplierFilter, startDateFilter, endDateFilter]);

  // Supplier Profile calculations
  const supplierProfileData = useMemo(() => {
    if (!activeProfileSupplier) return null;

    const supplierPurchases = purchasesList.filter(p => p.supplier === activeProfileSupplier.name);
    const validPurchases = supplierPurchases.filter(p => p.deliveryStatus !== 'Cancelled');
    
    const totalValSum = validPurchases.reduce((sum, p) => sum + (parseFloat(p.totalCost.replace(/[$,]/g, '')) || 0), 0);
    const totalItemsSum = validPurchases.reduce((sum, p) => sum + p.numberOfItems, 0);

    const averageOrderValue = validPurchases.length > 0 ? totalValSum / validPurchases.length : 0;
    
    // Purchase Frequency mapping
    let frequency = 'Monthly';
    if (activeProfileSupplier.deliveryDays.length >= 3) {
      frequency = 'Bi-weekly';
    } else if (activeProfileSupplier.deliveryDays.length >= 1) {
      frequency = 'Weekly';
    }

    return {
      purchasesCount: supplierPurchases.length,
      totalPurchaseValueFormatted: `$${totalValSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      lastPurchase: supplierPurchases.length > 0 ? supplierPurchases[0].purchaseDate : activeProfileSupplier.lastPurchaseDate,
      averageOrderValueFormatted: `$${averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      frequency,
      purchasesList: supplierPurchases
    };
  }, [activeProfileSupplier, purchasesList]);

  // Handle Input Changes for Suppliers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDeliveryDayChange = (day: string) => {
    setFormData(prev => {
      const isSelected = prev.deliveryDays.includes(day);
      const updatedDays = isSelected
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day];
      return { ...prev, deliveryDays: updatedDays };
    });
  };

  // Validation Form for Suppliers
  const validateForm = () => {
    let isValid = true;
    const errors = {
      name: '', contact: '', phone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    };

    if (!formData.name.trim()) { errors.name = 'Supplier name is required'; isValid = false; }
    if (!formData.contact.trim()) { errors.contact = 'Contact person is required'; isValid = false; }
    
    const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address';
      isValid = false;
    }

    if (!formData.companyName.trim()) { errors.companyName = 'Company name is required'; isValid = false; }
    if (!formData.brn.trim()) { errors.brn = 'Registration number is required'; isValid = false; }
    if (!formData.taxNumber.trim()) { errors.taxNumber = 'Tax number is required'; isValid = false; }
    if (!formData.street.trim()) { errors.street = 'Street address is required'; isValid = false; }
    if (!formData.city.trim()) { errors.city = 'City is required'; isValid = false; }
    if (!formData.province.trim()) { errors.province = 'Province is required'; isValid = false; }
    if (!formData.categories.trim()) { errors.categories = 'Specify categories'; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  // CRUD for Suppliers
  const handleOpenAddModal = () => {
    setFormData({
      name: '', contact: '', phone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '', deliveryDays: [], paymentTerms: 'Net 30', status: 'Active',
    });
    setFormErrors({
      name: '', contact: '', phone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    });
    setIsAddModalOpen(true);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newId = `SUP-00${suppliersList.length + 1}`;
    const newSupplier = {
      ...formData,
      id: newId,
      products: 0,
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
      totalValue: '$0.00',
      reliability: 100,
      onTime: 100,
      rating: 5.0,
      address: `${formData.street}, ${formData.city}, ${formData.province}`,
    };
    setSuppliersList(prev => [...prev, newSupplier]);
    setIsAddModalOpen(false);
  };

  const handleOpenEditModal = (supplier: typeof initialSuppliers[0]) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      companyName: supplier.companyName,
      brn: supplier.brn,
      taxNumber: supplier.taxNumber,
      street: supplier.street,
      city: supplier.city,
      province: supplier.province,
      categories: supplier.categories,
      deliveryDays: supplier.deliveryDays,
      paymentTerms: supplier.paymentTerms,
      status: supplier.status,
    });
    setFormErrors({
      name: '', contact: '', phone: '', email: '', companyName: '', brn: '', taxNumber: '', street: '', city: '', province: '', categories: '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedSupplier) return;

    setSuppliersList(prev => prev.map(s => {
      if (s.id === selectedSupplier.id) {
        const updated = {
          ...s,
          ...formData,
          address: `${formData.street}, ${formData.city}, ${formData.province}`
        };
        // Update active profile if open currently
        if (activeProfileSupplier && activeProfileSupplier.id === s.id) {
          setActiveProfileSupplier(updated);
        }
        return updated;
      }
      return s;
    }));
    setIsEditModalOpen(false);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm(`Are you sure you want to delete supplier ${id}?`)) {
      setSuppliersList(prev => prev.filter(s => s.id !== id));
      if (activeProfileSupplier && activeProfileSupplier.id === id) {
        setActiveProfileSupplier(null);
      }
    }
  };

  const handleExportSuppliers = () => {
    const headers = ["Supplier ID", "Supplier Name", "Contact Person", "Phone", "Email", "Address", "Products Supplied", "Last Purchase Date", "Status"];
    const csvRows = [headers.join(",")];
    suppliersList.forEach(s => {
      const row = [
        s.id, 
        `"${s.name}"`, 
        `"${s.contact}"`, 
        s.phone, 
        s.email, 
        `"${s.street}, ${s.city}"`, 
        s.products, 
        s.lastPurchaseDate, 
        s.status
      ];
      csvRows.push(row.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `stocksense_suppliers_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // HIGH-FIDELITY RECORD NEW PURCHASE WORKFLOW ACTIONS
  const handleOpenRecordPurchase = () => {
    setPurchaseForm({
      supplierName: suppliersList[0]?.name || '',
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
      referenceNumber: `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
      items: [
        { product: supermarketCatalog[0].name, category: supermarketCatalog[0].category, unitCost: supermarketCatalog[0].unitCost, quantity: 10 }
      ]
    });
    setPurchaseFormErrors({
      invoiceNumber: '',
      items: '',
    });
    setIsRecordPurchaseOpen(true);
  };

  const handlePurchaseFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPurchaseForm(prev => ({ ...prev, [name]: value }));
    if (name === 'invoiceNumber') {
      setPurchaseFormErrors(prev => ({ ...prev, invoiceNumber: '' }));
    }
  };

  // Prepopulate row category & cost when product choice changes
  const handleProductRowChange = (index: number, productName: string) => {
    const selectedCatalogItem = supermarketCatalog.find(p => p.name === productName);
    if (!selectedCatalogItem) return;

    setPurchaseForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        product: productName,
        category: selectedCatalogItem.category,
        unitCost: selectedCatalogItem.unitCost
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setPurchaseForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
      return { ...prev, items: newItems };
    });
  };

  const handleItemCostChange = (index: number, unitCost: number) => {
    setPurchaseForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], unitCost: Math.max(0, unitCost) };
      return { ...prev, items: newItems };
    });
  };

  const handleAddProductRow = () => {
    setPurchaseForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { product: supermarketCatalog[0].name, category: supermarketCatalog[0].category, unitCost: supermarketCatalog[0].unitCost, quantity: 1 }
      ]
    }));
  };

  const handleRemoveProductRow = (index: number) => {
    if (purchaseForm.items.length <= 1) {
      alert("At least one product line is required.");
      return;
    }
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSavePurchase = (e: React.FormEvent, printMode = false) => {
    e.preventDefault();
    if (!purchaseForm.invoiceNumber.trim()) {
      setPurchaseFormErrors(prev => ({ ...prev, invoiceNumber: 'Invoice Number is required' }));
      return;
    }

    const newId = `PR-1024-00${purchasesList.length + 1}`;
    
    // Map list to purchase format
    const formattedItems = purchaseForm.items.map(item => ({
      name: item.product,
      category: item.category,
      qty: item.quantity,
      cost: `$${item.unitCost.toFixed(2)}`,
      total: `$${(item.unitCost * item.quantity).toFixed(2)}`
    }));

    const newPurchase = {
      id: newId,
      invoiceNumber: purchaseForm.invoiceNumber,
      referenceNumber: purchaseForm.referenceNumber,
      supplier: purchaseForm.supplierName,
      purchaseDate: purchaseForm.purchaseDate,
      numberOfItems: purchaseForm.items.length,
      totalQuantity: purchaseForm.items.reduce((sum, item) => sum + item.quantity, 0),
      totalCost: recordPurchaseCalculations.grandTotal,
      paymentStatus: purchaseForm.paymentStatus,
      deliveryStatus: purchaseForm.deliveryStatus,
      paymentMethod: purchaseForm.paymentMethod,
      itemsList: formattedItems
    };

    setPurchasesList(prev => [newPurchase, ...prev]);
    setIsRecordPurchaseOpen(false);

    if (printMode) {
      setSelectedPurchase(newPurchase);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const handleOpenEditPurchase = (purchase: typeof initialPurchases[0]) => {
    setSelectedPurchase(purchase);
    setEditPurchaseStatusForm({
      paymentStatus: purchase.paymentStatus,
      deliveryStatus: purchase.deliveryStatus,
    });
    setIsEditPurchaseOpen(true);
  };

  const handleEditPurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchase) return;

    setPurchasesList(prev => prev.map(p => {
      if (p.id === selectedPurchase.id) {
        return {
          ...p,
          paymentStatus: editPurchaseStatusForm.paymentStatus,
          deliveryStatus: editPurchaseStatusForm.deliveryStatus,
        };
      }
      return p;
    }));
    setIsEditPurchaseOpen(false);
  };

  const handlePrintInvoice = (purchase: typeof initialPurchases[0]) => {
    setSelectedPurchase(purchase);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleExportPurchases = () => {
    const headers = ["Purchase ID", "Invoice Number", "Reference Number", "Supplier", "Purchase Date", "Number of Items", "Total Quantity", "Total Cost", "Payment Status", "Delivery Status", "Payment Method"];
    const csvRows = [headers.join(",")];
    purchasesList.forEach(p => {
      const row = [
        p.id, 
        p.invoiceNumber, 
        p.referenceNumber,
        `"${p.supplier}"`, 
        p.purchaseDate, 
        p.numberOfItems, 
        p.totalQuantity, 
        `"${p.totalCost}"`, 
        p.paymentStatus, 
        p.deliveryStatus,
        p.paymentMethod
      ];
      csvRows.push(row.join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `stocksense_purchases_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  // HIGH-FIDELITY DYNAMIC ANALYTICS CALCULATIONS
  const analyticsData = useMemo(() => {
    // Average Cost calculation
    const validPurchases = purchasesList.filter(p => p.deliveryStatus !== 'Cancelled');
    const totalVal = validPurchases.reduce((sum, p) => sum + (parseFloat(p.totalCost.replace(/[$,]/g, '')) || 0), 0);
    const avgCost = validPurchases.length > 0 ? totalVal / validPurchases.length : 0;

    // Top Supplier calculation
    const supplierSpendMap: Record<string, number> = {};
    validPurchases.forEach(p => {
      const costVal = parseFloat(p.totalCost.replace(/[$,]/g, '')) || 0;
      supplierSpendMap[p.supplier] = (supplierSpendMap[p.supplier] || 0) + costVal;
    });

    let topSupplierName = 'None';
    let topSupplierSpend = 0;
    Object.entries(supplierSpendMap).forEach(([name, spend]) => {
      if (spend > topSupplierSpend) {
        topSupplierSpend = spend;
        topSupplierName = name;
      }
    });

    // Top Suppliers Table Calculation
    const suppliersTable = suppliersList.map(s => {
      const pCount = purchasesList.filter(p => p.supplier === s.name).length;
      const pValSum = purchasesList
        .filter(p => p.supplier === s.name && p.deliveryStatus !== 'Cancelled')
        .reduce((sum, p) => sum + (parseFloat(p.totalCost.replace(/[$,]/g, '')) || 0), 0);
      
      const supplierPurchases = purchasesList.filter(p => p.supplier === s.name);
      const lastTx = supplierPurchases.length > 0 ? supplierPurchases[0].purchaseDate : s.lastPurchaseDate;

      return {
        name: s.name,
        count: pCount,
        value: `$${pValSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        valueRaw: pValSum,
        lastTransaction: lastTx
      };
    }).sort((a, b) => b.valueRaw - a.valueRaw);

    // Top Purchased Products Table Calculation
    const productStatsMap: Record<string, { qty: number; cost: number }> = {};
    purchasesList.forEach(p => {
      if (p.deliveryStatus === 'Cancelled') return;
      p.itemsList?.forEach(item => {
        const itemQty = parseInt(item.qty.toString()) || 0;
        const itemCostTotal = parseFloat(item.total.replace(/[$,]/g, '')) || 0;
        if (!productStatsMap[item.name]) {
          productStatsMap[item.name] = { qty: 0, cost: 0 };
        }
        productStatsMap[item.name].qty += itemQty;
        productStatsMap[item.name].cost += itemCostTotal;
      });
    });

    const productsTable = Object.entries(productStatsMap).map(([name, stats]) => ({
      name,
      qty: stats.qty,
      totalCost: `$${stats.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      costRaw: stats.cost
    })).sort((a, b) => b.costRaw - a.costRaw);

    return {
      monthlyValue: `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      totalCount: validPurchases.length,
      averageCost: `$${avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      topSupplier: topSupplierName,
      suppliersTable,
      productsTable
    };
  }, [purchasesList, suppliersList]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'new-supplier') {
      handleOpenAddModal();
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      }, { replace: true });
    } else if (action === 'record-purchase') {
      handleOpenRecordPurchase();
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('action');
        return next;
      }, { replace: true });
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader>
          <div className="relative w-full max-w-xl min-w-0">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input
              type="text"
              placeholder="Search procurement records, suppliers or POs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </InventoryHeader>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
            
            {/* Page Header (Render back button if profile view is active) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {activeProfileSupplier ? (
                  <button 
                    onClick={() => setActiveProfileSupplier(null)}
                    className="mb-2 text-xs font-black text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
                    Back to Suppliers Directory
                  </button>
                ) : null}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
                  {activeProfileSupplier ? 'Supplier Profile Dashboard' : 'Procurement Management'}
                </h1>
                <p className="text-sm text-outline mt-1">
                  {activeProfileSupplier ? `Enterprise-level view of ${activeProfileSupplier.name}` : 'Manage suppliers, purchase records, and procurement analytics.'}
                </p>
              </div>
            </div>

            {/* RENDER ENTERPRISE SUPPLIER PROFILE VIEW PAGE */}
            {activeProfileSupplier && supplierProfileData ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* 1. Header Card Panel */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-sm">
                      <span className="material-symbols-outlined text-4xl text-primary font-bold">store</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-on-surface">{activeProfileSupplier.name}</h2>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          activeProfileSupplier.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {activeProfileSupplier.status}
                        </span>
                      </div>
                      
                      {/* Legal Company details */}
                      <p className="text-xs font-bold text-slate-500 mt-1">{activeProfileSupplier.companyName} | BRN: {activeProfileSupplier.brn} | Tax ID: {activeProfileSupplier.taxNumber}</p>
                      
                      {/* Contact information details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-primary">person</span> {activeProfileSupplier.contact}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-primary">phone</span> {activeProfileSupplier.phone}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-primary">mail</span> {activeProfileSupplier.email}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-primary">location_on</span> {activeProfileSupplier.street}, {activeProfileSupplier.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleOpenEditModal(activeProfileSupplier)}
                      className="px-4 py-2 border border-outline-variant hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(activeProfileSupplier.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span>
                      Delete Supplier
                    </button>
                  </div>
                </div>

                {/* 2. Dynamic Statistics Grid widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">Total Purchases</span>
                    <div className="text-3xl font-black text-slate-800">{supplierProfileData.purchasesCount} orders</div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Non-cancelled consignments</p>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">Total Purchase Value</span>
                    <div className="text-3xl font-black text-primary">{supplierProfileData.totalPurchaseValueFormatted}</div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Cumulative procurement cost</p>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">Products Supplied</span>
                    <div className="text-3xl font-black text-slate-800">{activeProfileSupplier.products} products</div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Registered grocery lines</p>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-black text-outline uppercase tracking-wider">Last Purchase Date</span>
                    <div className="text-3xl font-black text-amber-600">{supplierProfileData.lastPurchase}</div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">Last transaction received</p>
                  </div>

                </div>

                {/* 3. Performance Metrics Grid Panel */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">verified</span> Enterprise Partner Performance Metrics
                  </h3>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    
                    {/* Metric 1: Reliability Score */}
                    <div className="space-y-2 flex flex-col items-center">
                      <span className="text-[10px] font-black text-outline uppercase tracking-wider">Supplier Reliability Score</span>
                      <div className="w-20 h-20 rounded-full border-4 border-[#0b8252] flex items-center justify-center text-sm font-black text-slate-800 bg-[#eef8f2] shadow-sm">
                        {activeProfileSupplier.reliability}%
                      </div>
                      <p className="text-[10px] text-[#0b8252] font-extrabold">Excellent performance</p>
                    </div>

                    {/* Metric 2: Delivery Success Rate */}
                    <div className="space-y-2 flex flex-col items-center">
                      <span className="text-[10px] font-black text-outline uppercase tracking-wider">Delivery Success Rate</span>
                      <div className="w-20 h-20 rounded-full border-4 border-primary flex items-center justify-center text-sm font-black text-slate-800 bg-primary/5 shadow-sm">
                        {activeProfileSupplier.onTime}%
                      </div>
                      <p className="text-[10px] text-primary font-extrabold">On-time consignment arrivals</p>
                    </div>

                    {/* Metric 3: Average Order Value */}
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-outline uppercase tracking-wider block">Average Order Value</span>
                      <div className="text-xl font-black text-slate-800 mt-2">{supplierProfileData.averageOrderValueFormatted}</div>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">AOV calculated dynamically</p>
                    </div>

                    {/* Metric 4: Purchase Frequency */}
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-outline uppercase tracking-wider block">Purchase Frequency</span>
                      <div className="text-xl font-black text-primary mt-2">{supplierProfileData.frequency}</div>
                      <p className="text-[10px] text-slate-500 font-bold mt-1">Based on delivery days</p>
                    </div>

                  </div>
                </div>

                {/* 4. Dynamic Purchase History Table & Transactions Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column 1 & 2: Purchase History Table */}
                  <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">history</span> Purchase Transaction History
                    </h3>

                    <div className="overflow-x-auto border border-outline-variant rounded-lg">
                      <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                        <thead className="bg-background text-outline font-extrabold uppercase border-b border-outline-variant">
                          <tr>
                            <th className="px-4 py-3">Purchase ID</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Invoice Number</th>
                            <th className="px-4 py-3 text-right">Total Cost</th>
                            <th className="px-4 py-3 text-center">Payment Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
                          {supplierProfileData.purchasesList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-12 text-center text-outline font-bold">
                                No purchases recorded under this supplier.
                              </td>
                            </tr>
                          ) : (
                            supplierProfileData.purchasesList.map((p) => (
                              <tr 
                                key={p.id} 
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => { setSelectedPurchase(p); setIsViewPurchaseOpen(true); }}
                              >
                                <td className="px-4 py-3 text-primary font-bold">{p.id}</td>
                                <td className="px-4 py-3 text-slate-600">{p.purchaseDate}</td>
                                <td className="px-4 py-3">{p.invoiceNumber}</td>
                                <td className="px-4 py-3 text-right font-black text-slate-800">{p.totalCost}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    p.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : p.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {p.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Column 3: Recent Transactions Timeline (Vertical) */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">timeline</span> Partnership Milestone Timeline
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      
                      {/* Timeline 1: Live dynamic transaction if exists */}
                      {supplierProfileData.purchasesList.slice(0, 2).map((p, i) => (
                        <div key={p.id} className="relative space-y-1">
                          {/* Point indicator */}
                          <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0b8252] border-4 border-white shadow-sm"></div>
                          
                          <div className="text-[10px] font-black text-[#0b8252] uppercase">{p.purchaseDate}</div>
                          <div className="text-xs font-bold text-slate-800">Consignment Received ({p.id})</div>
                          <p className="text-[10px] text-slate-500 font-semibold">Invoice Ref: {p.invoiceNumber} | Total Cost: {p.totalCost}</p>
                        </div>
                      ))}

                      {/* Onboarding static timeline indicators */}
                      <div className="relative space-y-1">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-4 border-white shadow-sm"></div>
                        <div className="text-[10px] font-black text-primary uppercase">2023-10-01</div>
                        <div className="text-xs font-bold text-slate-800">Contract Renewed</div>
                        <p className="text-[10px] text-slate-500 font-semibold">Supermarket procurement audit cleared successfully with excellent ratings.</p>
                      </div>

                      <div className="relative space-y-1">
                        <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-slate-400 border-4 border-white shadow-sm"></div>
                        <div className="text-[10px] font-black text-slate-500 uppercase">2023-09-01</div>
                        <div className="text-xs font-bold text-slate-800">Partnership Onboarded</div>
                        <p className="text-[10px] text-slate-500 font-semibold">Vendor onboarding documentation finalized. Payment gateway synced.</p>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            ) : (
              // RENDER MAIN TABS SYSTEM DIRECTORY
              <div className="space-y-6">
                
                {/* Top Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Card 1: Total Suppliers */}
                  <div 
                    onClick={() => handleTabChange('suppliers')}
                    className={`bg-surface-container-lowest p-5 rounded-xl border shadow-sm flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      activeTab === 'suppliers' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-outline">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Suppliers</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Updated</span>
                    </div>
                    <div className="text-3xl font-black text-on-surface mt-1">{totalSuppliersCount}</div>
                    <p className="text-xs text-outline font-medium">Total registered suppliers</p>
                  </div>

                  {/* Card 2: Total Purchases This Month */}
                  <div 
                    onClick={() => handleTabChange('records')}
                    className={`bg-surface-container-lowest p-5 rounded-xl border shadow-sm flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      activeTab === 'records' ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-outline">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Purchases</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">+12% vs last mo</span>
                    </div>
                    <div className="text-3xl font-black text-on-surface mt-1">{totalPurchasesCount}</div>
                    <p className="text-xs text-outline font-medium">Transactions this month</p>
                  </div>

                  {/* Card 3: Total Purchase Value */}
                  <div 
                    onClick={() => handleTabChange('analytics')}
                    className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/50"
                  >
                    <div className="flex items-center justify-between text-outline">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0b8252] text-[20px]">payments</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Purchase Value</span>
                      </div>
                      <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
                    </div>
                    <div className="text-3xl font-black text-on-surface mt-1">{totalPurchaseValue}</div>
                    <p className="text-xs text-outline font-medium">Total procurement cost</p>
                  </div>

                  {/* Card 4: Active Suppliers */}
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between text-emerald-600">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">verified_user</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Active Suppliers</span>
                      </div>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-3xl font-black text-on-surface mt-1">{activeSuppliersCount}</div>
                    <p className="text-xs text-outline font-medium">Currently supplying products</p>
                  </div>

                  {/* Card 5: Pending Deliveries */}
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between text-[#d97706]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                        <span className="text-[11px] font-bold uppercase tracking-wider">Pending Arrivals</span>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] font-black bg-[#fef3c7] text-[#d97706] rounded-full uppercase tracking-wider">Warning</span>
                    </div>
                    <div className="text-3xl font-black text-on-surface mt-1">{pendingDeliveriesCount}</div>
                    <p className="text-xs text-outline font-medium">Deliveries to be received</p>
                  </div>
                </div>

                {/* Tab Navigation System */}
                <div className="border-b border-outline-variant flex items-center gap-2 bg-background sticky top-0 z-20 py-2">
                  <button
                    onClick={() => handleTabChange('suppliers')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all duration-200 ${
                      activeTab === 'suppliers'
                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                        : 'border-transparent text-outline hover:text-on-surface hover:border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    Suppliers
                  </button>
                  <button
                    onClick={() => handleTabChange('records')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all duration-200 ${
                      activeTab === 'records'
                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                        : 'border-transparent text-outline hover:text-on-surface hover:border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    Purchase Records
                  </button>
                  <button
                    onClick={() => handleTabChange('analytics')}
                    className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-all duration-200 ${
                      activeTab === 'analytics'
                        ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                        : 'border-transparent text-outline hover:text-on-surface hover:border-outline-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">insights</span>
                    Purchase Analytics
                  </button>
                </div>

                {/* Tab Content Rendering */}
                <div className="mt-6">
                  
                  {/* TAB 1: SUPPLIERS SECTION */}
                  {activeTab === 'suppliers' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* Top Actions Panel */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                        {/* Search & Filter Inputs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                          <div className="relative min-w-[280px]">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
                            <input
                              type="text"
                              placeholder="Search by ID, name, contact or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full rounded-lg border border-outline-variant bg-background py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider text-outline whitespace-nowrap">Filter Status:</span>
                            <select 
                              value={statusFilter}
                              onChange={e => setStatusFilter(e.target.value)}
                              className="border border-outline-variant rounded-lg px-3 py-2 text-xs font-bold outline-none bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                            >
                              <option value="All">All Statuses</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        {/* Actions Buttons */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button 
                            onClick={handleExportSuppliers}
                            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Export Suppliers
                          </button>
                          <button 
                            onClick={handleOpenAddModal} 
                            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-extrabold hover:bg-primary/95 shadow-sm transition-all flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Add Supplier
                          </button>
                        </div>
                      </div>

                      {/* Supplier Registry Table Grid */}
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                            <thead className="bg-background text-outline font-extrabold uppercase tracking-wider border-b border-outline-variant">
                              <tr>
                                <th className="px-6 py-4">Supplier ID</th>
                                <th className="px-6 py-4">Supplier Name</th>
                                <th className="px-6 py-4">Contact Person</th>
                                <th className="px-6 py-4">Phone Number</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4 text-center">Products Supplied</th>
                                <th className="px-6 py-4 text-center">Last Purchase</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant font-medium text-slate-700">
                              {filteredSuppliers.length === 0 ? (
                                <tr>
                                  <td colSpan={10} className="px-6 py-12 text-center text-outline font-bold text-sm">
                                    No suppliers found matching criteria.
                                  </td>
                                </tr>
                              ) : (
                                filteredSuppliers.map((s) => (
                                  <tr 
                                    key={s.id} 
                                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    onClick={() => setActiveProfileSupplier(s)}
                                  >
                                    <td className="px-6 py-4 font-bold text-primary">{s.id}</td>
                                    <td className="px-6 py-4 font-bold text-on-surface">
                                      <div>{s.name}</div>
                                      <div className="text-[10px] text-outline-variant font-semibold mt-0.5">{s.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4">{s.contact}</td>
                                    <td className="px-6 py-4 text-slate-600">{s.phone}</td>
                                    <td className="px-6 py-4 text-slate-600">{s.email}</td>
                                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500" title={`${s.street}, ${s.city}`}>{s.street}, {s.city}</td>
                                    <td className="px-6 py-4 text-center font-bold text-on-surface">{s.products} items</td>
                                    <td className="px-6 py-4 text-center text-slate-500">{s.lastPurchaseDate}</td>
                                    <td className="px-6 py-4 text-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        s.status === 'Active' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : 'bg-slate-100 text-slate-800'
                                      }`}>
                                        {s.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                                        <button 
                                          onClick={() => setActiveProfileSupplier(s)} 
                                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                          title="View Supplier Profile"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                                        </button>
                                        <button 
                                          onClick={() => handleOpenEditModal(s)} 
                                          className="p-1.5 text-[#0b8252] hover:bg-[#eef8f2] rounded transition-colors"
                                          title="Edit Supplier"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button 
                                          onClick={() => { setActiveProfileSupplier(s); handleTabChange('records'); }} 
                                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                          title="View Purchase History"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">history</span>
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteSupplier(s.id)} 
                                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                          title="Delete Supplier"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PURCHASE RECORDS SECTION */}
                  {activeTab === 'records' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* Top Actions Panel */}
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                        
                        {/* First Row: Search, Date Filter, Supplier Selector */}
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
                            
                            {/* Search Purchases */}
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
                              <input
                                type="text"
                                placeholder="Search by PO ID, Invoice #..."
                                value={purchaseSearch}
                                onChange={(e) => setPurchaseSearch(e.target.value)}
                                className="w-full rounded-lg border border-outline-variant bg-background py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary"
                              />
                            </div>

                            {/* Supplier Filter */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-outline text-right whitespace-nowrap">Supplier:</span>
                              <select 
                                value={supplierFilter}
                                onChange={e => setSupplierFilter(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg px-2 py-2 text-xs font-bold outline-none bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                              >
                                <option value="All">All Suppliers</option>
                                {suppliersList.map(s => (
                                  <option key={s.id} value={s.name}>{s.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Date Range Filter: Start */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-outline text-right whitespace-nowrap">Start:</span>
                              <input 
                                type="date"
                                value={startDateFilter}
                                onChange={e => setStartDateFilter(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                              />
                            </div>

                            {/* Date Range Filter: End */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-outline text-right whitespace-nowrap">End:</span>
                              <input 
                                type="date"
                                value={endDateFilter}
                                onChange={e => setEndDateFilter(e.target.value)}
                                className="w-full border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none bg-surface-container-lowest focus:ring-1 focus:ring-primary"
                              />
                            </div>

                          </div>

                          {/* Right Action buttons */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <button 
                              onClick={handleExportPurchases}
                              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Export Purchases
                            </button>
                            <button 
                              onClick={handleOpenRecordPurchase} 
                              className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-extrabold hover:bg-primary/95 shadow-sm transition-all flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[16px]">post_add</span>
                              Record New Purchase
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Purchase Records Registry Table */}
                      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                            <thead className="bg-background text-outline font-extrabold uppercase tracking-wider border-b border-outline-variant">
                              <tr>
                                <th className="px-6 py-4">Purchase ID</th>
                                <th className="px-6 py-4">Invoice Number</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4 text-center">Purchase Date</th>
                                <th className="px-6 py-4 text-center">Number of Items</th>
                                <th className="px-6 py-4 text-center">Total Quantity</th>
                                <th className="px-6 py-4 text-right">Total Cost</th>
                                <th className="px-6 py-4 text-center">Payment Status</th>
                                <th className="px-6 py-4 text-center">Delivery Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant font-medium text-slate-700">
                              {filteredPurchases.length === 0 ? (
                                <tr>
                                  <td colSpan={10} className="px-6 py-12 text-center text-outline font-bold text-sm">
                                    No purchase records found matching criteria.
                                  </td>
                                </tr>
                              ) : (
                                filteredPurchases.map((p) => (
                                  <tr 
                                    key={p.id} 
                                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                                    onClick={() => { setSelectedPurchase(p); setIsViewPurchaseOpen(true); }}
                                  >
                                    <td className="px-6 py-4 font-bold text-primary">{p.id}</td>
                                    <td className="px-6 py-4 font-bold text-on-surface">{p.invoiceNumber}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">{p.supplier}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{p.purchaseDate}</td>
                                    <td className="px-6 py-4 text-center">{p.numberOfItems} items</td>
                                    <td className="px-6 py-4 text-center">{p.totalQuantity} units</td>
                                    <td className="px-6 py-4 text-right font-black text-slate-800">{p.totalCost}</td>
                                    <td className="px-6 py-4 text-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        p.paymentStatus === 'Paid' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : p.paymentStatus === 'Partially Paid' 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-red-100 text-red-800'
                                      }`}>
                                        {p.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        p.deliveryStatus === 'Received' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : p.deliveryStatus === 'Pending' 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-slate-100 text-slate-800'
                                      }`}>
                                        {p.deliveryStatus}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                                        <button 
                                          onClick={() => { setSelectedPurchase(p); setIsViewPurchaseOpen(true); }} 
                                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                          title="View Purchase"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                                        </button>
                                        <button 
                                          onClick={() => handleOpenEditPurchase(p)} 
                                          className="p-1.5 text-[#0b8252] hover:bg-[#eef8f2] rounded transition-colors"
                                          title="Edit Purchase"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">edit</span>
                                        </button>
                                        <button 
                                          onClick={() => handlePrintInvoice(p)} 
                                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                          title="Print Invoice"
                                        >
                                          <span className="material-symbols-outlined text-[16px]">print</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: MODERN PROCUREMENT ANALYTICS */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      
                      {/* Analytics Dashboard Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Monthly Purchase Value</span>
                          <div className="text-2xl font-black text-on-surface">{analyticsData.monthlyValue}</div>
                          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">trending_up</span> +8.4% vs last month
                          </p>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Total Purchases (POs)</span>
                          <div className="text-2xl font-black text-on-surface">{analyticsData.totalCount} orders</div>
                          <p className="text-[10px] text-primary font-bold">Excludes cancelled records</p>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Average Purchase Cost</span>
                          <div className="text-2xl font-black text-on-surface">{analyticsData.averageCost}</div>
                          <p className="text-[10px] text-slate-500 font-bold">Standard procurement transaction cost</p>
                        </div>

                        <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-outline uppercase tracking-wider">Top Supplier partner</span>
                          <div className="text-2xl font-black text-primary truncate" title={analyticsData.topSupplier}>{analyticsData.topSupplier}</div>
                          <p className="text-[10px] text-slate-500 font-bold">Highest order consignment volume</p>
                        </div>
                      </div>

                      {/* 4 Professional Supermarket Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Chart 1: Monthly Purchase Trend */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span> Monthly Purchase Trend
                            </h3>
                            <span className="text-[9px] font-black uppercase text-outline bg-slate-100 px-2 py-0.5 rounded">Line Chart</span>
                          </div>
                          
                          <div className="h-44 flex items-end justify-between gap-6 px-4 pt-4 border-b border-slate-100 relative">
                            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 pointer-events-none"></div>
                            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100 pointer-events-none"></div>
                            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100 pointer-events-none"></div>

                            {[
                              { h: 35, l: "Jul", val: "$1,890" },
                              { h: 50, l: "Aug", val: "$2,450" },
                              { h: 70, l: "Sep", val: "$3,800" },
                              { h: 95, l: "Oct", val: "$9,080" },
                            ].map((trend, i) => (
                              <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group z-10 relative">
                                <span className="text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-lowest border border-primary/20 px-1.5 py-0.5 rounded shadow-sm absolute -top-4">{trend.val}</span>
                                <div className="w-3.5 h-3.5 bg-primary border-4 border-white rounded-full shadow absolute transition-all duration-300 group-hover:scale-125" style={{ bottom: `calc(${trend.h}% + 16px)` }}></div>
                                <div className="w-0.5 bg-gradient-to-t from-primary/10 to-primary/80 w-[2px] transition-all duration-500" style={{ height: `${trend.h}%` }} />
                                <span className="text-[10px] font-bold text-outline mt-1">{trend.l}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chart 2: Purchases by Supplier */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">bar_chart</span> Purchases by Supplier Share
                            </h3>
                            <span className="text-[9px] font-black uppercase text-outline bg-slate-100 px-2 py-0.5 rounded">Bar Chart</span>
                          </div>

                          <div className="h-44 flex flex-col justify-around">
                            {[
                              { n: "ABC Distributors", s: "$2,900", p: 70, c: "bg-primary" },
                              { n: "Fresh Foods Ltd", s: "$4,890", p: 90, c: "bg-[#0b8252]" },
                              { n: "Lanka Grocery Suppliers", s: "$1,250", p: 40, c: "bg-amber-600" },
                            ].map((sup, i) => (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-800">
                                  <span>{sup.n}</span>
                                  <span>{sup.s} ({sup.p}%)</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${sup.c} rounded-full transition-all duration-700`} style={{ width: `${sup.p}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Chart 3: Category Wise Purchases */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span> Category Wise Procurement
                            </h3>
                            <span className="text-[9px] font-black uppercase text-outline bg-slate-100 px-2 py-0.5 rounded">Pie Chart</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="flex justify-center">
                              <div 
                                className="w-32 h-32 rounded-full border border-slate-100 shadow flex items-center justify-center relative transition-transform duration-300 hover:rotate-6"
                                style={{
                                  background: 'conic-gradient(#0b8252 0% 55%, #d97706 55% 80%, #2563eb 80% 100%)'
                                }}
                              >
                                <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center text-center p-2 z-10">
                                  <span className="text-[10px] font-black uppercase text-outline">Top</span>
                                  <span className="text-xs font-extrabold text-on-surface leading-tight">Poultry</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3.5 text-xs font-semibold text-slate-700">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#0b8252]"></div>
                                <span>Poultry (55% share)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                                <span>Dairy (25% share)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                <span>Grains & Bev (20% share)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chart 4: Monthly Procurement Cost */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-sm text-on-surface flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[18px]">area_chart</span> Monthly Procurement Cost ($ USD)
                            </h3>
                            <span className="text-[9px] font-black uppercase text-outline bg-slate-100 px-2 py-0.5 rounded">Area Chart</span>
                          </div>

                          <div className="h-44 flex items-end justify-between gap-4 px-2 pt-6 relative border-b border-slate-100">
                            <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-t from-primary/5 to-primary/20 clip-path pointer-events-none rounded-t-lg"></div>

                            {[
                              { h: 30, l: "Jul", val: "$1,890.00" },
                              { h: 48, l: "Aug", val: "$2,450.00" },
                              { h: 65, l: "Sep", val: "$3,800.00" },
                              { h: 90, l: "Oct", val: "$9,080.00" },
                            ].map((cost, i) => (
                              <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group z-10 relative">
                                <span className="text-[9px] font-black text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity bg-white border px-1 py-0.5 rounded shadow absolute -top-4">{cost.val}</span>
                                <div className="w-2.5 h-2.5 bg-primary rounded-full border-2 border-white absolute transition-transform group-hover:scale-125" style={{ bottom: `calc(${cost.h}% + 18px)` }}></div>
                                <div className="w-8 bg-primary/20 rounded-t-md hover:bg-primary/30 transition-all duration-300" style={{ height: `${cost.h}%` }} />
                                <span className="text-[10px] font-bold text-outline mt-1">{cost.l}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Procurement Performance Matrices */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        
                        {/* Top Suppliers Table */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col p-5 space-y-4">
                          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">emoji_events</span> Top Partner Suppliers Registry
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                              <thead className="bg-background text-outline font-extrabold uppercase border-b border-outline-variant">
                                <tr>
                                  <th className="px-4 py-3">Supplier Name</th>
                                  <th className="px-4 py-3 text-center">Purchase Count</th>
                                  <th className="px-4 py-3 text-right">Purchase Value</th>
                                  <th className="px-4 py-3 text-right">Last Transaction</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
                                {analyticsData.suppliersTable.map((sup, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-on-surface">{sup.name}</td>
                                    <td className="px-4 py-3 text-center text-primary font-extrabold">{sup.count} POs</td>
                                    <td className="px-4 py-3 text-right font-black text-slate-800">{sup.value}</td>
                                    <td className="px-4 py-3 text-right text-slate-500">{sup.lastTransaction}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Top Purchased Products Table */}
                        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden flex flex-col p-5 space-y-4">
                          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">shopping_bag</span> Top Purchased Grocery Products
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                              <thead className="bg-background text-outline font-extrabold uppercase border-b border-outline-variant">
                                <tr>
                                  <th className="px-4 py-3">Product Name</th>
                                  <th className="px-4 py-3 text-center">Quantity Purchased</th>
                                  <th className="px-4 py-3 text-right">Total Procurement Cost</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
                                {analyticsData.productsTable.slice(0, 5).map((prod, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-on-surface">{prod.name}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{prod.qty} units</td>
                                    <td className="px-4 py-3 text-right font-black text-primary">{prod.totalCost}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Record New Purchase Modal (High-Fidelity Overhaul Workflow) */}
      {isRecordPurchaseOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form className="bg-[#f8fafc] rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] border border-outline-variant animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
              <div>
                <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
                  Record Supermarket Procurement Consignment
                </h2>
                <p className="text-[10px] text-outline font-semibold">Prepopulate, select catalog items, and verify auto-totals.</p>
              </div>
              <button type="button" onClick={() => setIsRecordPurchaseOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span> Supplier Selection & Info
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Select Supplier Partner *</label>
                      <select 
                        name="supplierName"
                        value={purchaseForm.supplierName}
                        onChange={handlePurchaseFormChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2.5 outline-none text-xs font-bold bg-background focus:ring-2 focus:ring-primary"
                      >
                        {suppliersList.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {purchaseFormSelectedSupplierInfo && (
                      <div className="border border-outline-variant rounded-lg p-3 bg-slate-50 text-[11px] space-y-2">
                        <span className="text-[9px] font-black text-primary uppercase block tracking-wider">Active Partner Profile</span>
                        <div className="font-bold text-slate-800 text-xs">{purchaseFormSelectedSupplierInfo.companyName}</div>
                        <div className="text-slate-600">Contact: {purchaseFormSelectedSupplierInfo.contact}</div>
                        <div className="text-slate-600">Phone: {purchaseFormSelectedSupplierInfo.phone}</div>
                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5 mt-1.5 text-[10px]">
                          <span className="font-bold text-primary">Terms: {purchaseFormSelectedSupplierInfo.paymentTerms}</span>
                          <span className="font-bold text-emerald-600">Reliability: {purchaseFormSelectedSupplierInfo.reliability}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span> Purchase Identifiers
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Invoice Number *</label>
                      <input 
                        type="text" 
                        name="invoiceNumber"
                        value={purchaseForm.invoiceNumber}
                        onChange={handlePurchaseFormChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary ${purchaseFormErrors.invoiceNumber ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. INV-99210"
                      />
                      {purchaseFormErrors.invoiceNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{purchaseFormErrors.invoiceNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Reference Number (Auto Generated)</label>
                      <input 
                        type="text" 
                        name="referenceNumber"
                        value={purchaseForm.referenceNumber}
                        readOnly
                        className="w-full border border-outline-variant bg-slate-50 text-slate-500 rounded-lg px-3 py-2 outline-none text-xs font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Purchase Date *</label>
                      <input 
                        type="date" 
                        name="purchaseDate"
                        value={purchaseForm.purchaseDate}
                        onChange={handlePurchaseFormChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">shopping_bag</span> Product Selection Consignment Table
                  </h3>
                  <button 
                    type="button"
                    onClick={handleAddProductRow}
                    className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black hover:bg-primary/25 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">add</span> Add Product Line
                  </button>
                </div>

                <div className="overflow-x-auto border border-outline-variant rounded-lg">
                  <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                    <thead className="bg-background text-outline font-extrabold uppercase border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-3">Supermarket Catalog Product Choice</th>
                        <th className="px-4 py-3 text-center">Category</th>
                        <th className="px-4 py-3 text-right">Unit Cost ($ USD)</th>
                        <th className="px-4 py-3 text-center">Quantity (Units)</th>
                        <th className="px-4 py-3 text-right">Line Total ($)</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-semibold text-slate-700">
                      {purchaseForm.items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-4 py-3 min-w-[280px]">
                            <select 
                              value={item.product}
                              onChange={e => handleProductRowChange(index, e.target.value)}
                              className="border border-outline-variant rounded px-2.5 py-1.5 text-xs font-bold bg-background focus:ring-1 focus:ring-primary w-full"
                            >
                              {supermarketCatalog.map(cat => (
                                <option key={cat.name} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-extrabold uppercase">{item.category}</span>
                          </td>

                          <td className="px-4 py-3 text-right max-w-[120px]">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-outline-variant text-[10px] font-bold">$</span>
                              <input 
                                type="number"
                                step="0.01"
                                value={item.unitCost}
                                onChange={e => handleItemCostChange(index, parseFloat(e.target.value) || 0)}
                                className="border border-outline-variant rounded pl-5 pr-2 py-1 text-right text-xs font-bold outline-none focus:ring-1 focus:ring-primary w-full"
                              />
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center max-w-[120px]">
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={e => handleItemQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="border border-outline-variant rounded px-2 py-1 text-center text-xs font-bold outline-none focus:ring-1 focus:ring-primary w-20"
                            />
                          </td>

                          <td className="px-4 py-3 text-right font-black text-slate-800">
                            ${(item.unitCost * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button 
                              type="button"
                              onClick={() => handleRemoveProductRow(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remove Product"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">payments</span> Payment & Logistics Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Payment Method</label>
                      <select 
                        name="paymentMethod"
                        value={purchaseForm.paymentMethod}
                        onChange={handlePurchaseFormChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="COD">COD (Cash on Delivery)</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Payment Status</label>
                      <select 
                        name="paymentStatus"
                        value={purchaseForm.paymentStatus}
                        onChange={handlePurchaseFormChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Delivery Arrival Status</label>
                      <select 
                        name="deliveryStatus"
                        value={purchaseForm.deliveryStatus}
                        onChange={handlePurchaseFormChange}
                        className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                      >
                        <option value="Received">Received</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">calculate</span> Auto Summary calculations
                  </h3>
                  <div className="space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Product Items Lines</span>
                      <span className="font-bold">{recordPurchaseCalculations.totalItems} items</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Total Procurement Quantity</span>
                      <span className="font-bold">{recordPurchaseCalculations.totalQuantity} units</span>
                    </div>
                    <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-2">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-800">{recordPurchaseCalculations.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Calculated Tax (8.00% standard POS)</span>
                      <span className="font-bold text-slate-800">{recordPurchaseCalculations.tax}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/80 pt-2 text-sm font-black text-on-surface">
                      <span>Grand Total</span>
                      <span className="text-[#0b8252] text-base">{recordPurchaseCalculations.grandTotal}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-6 border-t border-outline-variant flex flex-col sm:flex-row justify-between gap-3 bg-surface-container-lowest">
              <button 
                type="button" 
                onClick={() => setIsRecordPurchaseOpen(false)} 
                className="px-6 py-2.5 text-xs font-bold border border-outline-variant rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={(e) => handleSavePurchase(e, true)}
                  className="px-5 py-2.5 text-xs font-bold border border-primary/20 bg-primary/10 text-primary hover:bg-primary/25 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Save & Print Invoice
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleSavePurchase(e, false)}
                  className="px-6 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm"
                >
                  Save Purchase
                </button>
              </div>
            </div>
            
          </form>
        </div>
      )}

      {/* View Purchase Modal (Invoice styling) */}
      {isViewPurchaseOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-outline-variant animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt</span>
                Purchase Transaction Details
              </h2>
              <button onClick={() => setIsViewPurchaseOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-[#f8fafc]">
              
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-primary">STOCKSENSE PROCUREMENT</h3>
                    <p className="text-[10px] text-outline font-semibold">Intelligent POS & Inventory Solution</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <h4 className="text-sm font-black text-on-surface">{selectedPurchase.id}</h4>
                    <p className="text-[10px] text-outline font-semibold">Invoice Ref: {selectedPurchase.invoiceNumber}</p>
                    <p className="text-[10px] text-outline font-semibold">Reference Ref: {selectedPurchase.referenceNumber}</p>
                    <p className="text-[10px] text-outline font-semibold">Date: {selectedPurchase.purchaseDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border border-outline-variant rounded-lg p-3 bg-slate-50 text-xs">
                  <div>
                    <span className="text-[10px] font-black text-outline block uppercase tracking-wider mb-1">Payment Status</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] tracking-wider ${
                      selectedPurchase.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : selectedPurchase.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>{selectedPurchase.paymentStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-outline block uppercase tracking-wider mb-1">Delivery Status</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] tracking-wider ${
                      selectedPurchase.deliveryStatus === 'Received' ? 'bg-emerald-100 text-emerald-800' : selectedPurchase.deliveryStatus === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>{selectedPurchase.deliveryStatus}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-outline block uppercase tracking-wider mb-1">Payment Method</span>
                    <span className="font-bold text-slate-800 text-xs block mt-1">{selectedPurchase.paymentMethod || 'Bank Transfer'}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] font-black text-outline block uppercase tracking-wider mb-1">Supplier Entity</span>
                  <p className="text-sm font-black text-on-surface">{selectedPurchase.supplier}</p>
                  <p className="text-slate-600 font-semibold mt-1">Verified partner registry profile active.</p>
                </div>

                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-background text-outline font-extrabold uppercase">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-center">Category</th>
                        <th className="p-3 text-center">Quantity</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPurchase.itemsList?.map((item, i) => (
                        <tr key={i} className="font-semibold text-slate-700">
                          <td className="p-3">{item.name}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-extrabold uppercase">{item.category || 'Grocery'}</span>
                          </td>
                          <td className="p-3 text-center">{item.qty} units</td>
                          <td className="p-3 text-right">{item.cost}</td>
                          <td className="p-3 text-right text-slate-800 font-extrabold">{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end text-xs font-semibold border-t border-slate-100 pt-4">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-outline">
                      <span>Subtotal</span>
                      <span>{selectedPurchase.totalCost}</span>
                    </div>
                    <div className="flex justify-between text-outline">
                      <span>Supermarket Taxes (8%)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2 text-sm font-black text-on-surface">
                      <span>Grand Total</span>
                      <span className="text-[#0b8252]">{selectedPurchase.totalCost}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="p-6 border-t border-outline-variant flex justify-between bg-surface-container-lowest">
              <button 
                onClick={() => handlePrintInvoice(selectedPurchase)} 
                className="px-5 py-2.5 text-xs font-bold border border-outline-variant hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print Invoice
              </button>
              <button onClick={() => setIsViewPurchaseOpen(false)} className="px-6 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Purchase Status Modal */}
      {isEditPurchaseOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleEditPurchaseSubmit} className="bg-surface-container-lowest rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252]">edit</span>
                Update Transaction Status
              </h2>
              <button type="button" onClick={() => setIsEditPurchaseOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-black text-outline uppercase">Purchase ID</span>
                <p className="font-bold text-primary text-sm">{selectedPurchase.id}</p>
              </div>
              
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-black text-outline uppercase">Supplier</span>
                <p className="font-bold text-on-surface">{selectedPurchase.supplier}</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1.5">Payment Status</label>
                <select 
                  name="paymentStatus"
                  value={editPurchaseStatusForm.paymentStatus}
                  onChange={e => setEditPurchaseStatusForm(prev => ({ ...prev, paymentStatus: e.target.value as any }))}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                >
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1.5">Delivery Status</label>
                <select 
                  name="deliveryStatus"
                  value={editPurchaseStatusForm.deliveryStatus}
                  onChange={e => setEditPurchaseStatusForm(prev => ({ ...prev, deliveryStatus: e.target.value as any }))}
                  className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                >
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button type="button" onClick={() => setIsEditPurchaseOpen(false)} className="px-5 py-2.5 text-xs font-bold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface">Cancel</button>
              <button type="submit" className="px-5 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm">Save Status</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleAddSupplierSubmit} className="bg-[#f8fafc] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                Create Supplier Profile
              </h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                    General Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Supplier Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.name ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. ABC Distributors" 
                      />
                      {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Contact Person *</label>
                      <input 
                        type="text" 
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.contact ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. John Doe" 
                      />
                      {formErrors.contact && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.contact}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.phone ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. +94 77 123 4567" 
                        />
                        {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.email ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. info@abcdistributors.com" 
                        />
                        {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">business_center</span>
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Company Name *</label>
                      <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.companyName ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. ABC Holdings (Pvt) Ltd" 
                      />
                      {formErrors.companyName && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.companyName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Registration Number *</label>
                        <input 
                          type="text" 
                          name="brn"
                          value={formData.brn}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.brn ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. BRN-20150912" 
                        />
                        {formErrors.brn && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.brn}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Tax Number *</label>
                        <input 
                          type="text" 
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.taxNumber ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. TN-102934-A" 
                        />
                        {formErrors.taxNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.taxNumber}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    Address Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Street Address *</label>
                      <input 
                        type="text" 
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.street ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. 123 Business Street" 
                      />
                      {formErrors.street && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.street}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">City *</label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.city ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. Colombo" 
                        />
                        {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Province *</label>
                        <input 
                          type="text" 
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.province ? 'border-red-500' : 'border-outline-variant'}`}
                          placeholder="e.g. Western" 
                        />
                        {formErrors.province && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.province}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                    Supply Info & Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Product Categories Supplied *</label>
                      <input 
                        type="text" 
                        name="categories"
                        value={formData.categories}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.categories ? 'border-red-500' : 'border-outline-variant'}`}
                        placeholder="e.g. Grocery, Beverages, Snacks" 
                      />
                      {formErrors.categories && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.categories}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Payment Terms</label>
                        <select 
                          name="paymentTerms"
                          value={formData.paymentTerms}
                          onChange={handleInputChange}
                          className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                        >
                          <option value="COD">COD (Cash on Delivery)</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 60">Net 60</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Status</label>
                        <select 
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1.5">Preferred Delivery Days</label>
                      <div className="grid grid-cols-4 gap-2 border border-outline-variant p-2 rounded-lg bg-background">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600 select-none hover:text-slate-800">
                            <input 
                              type="checkbox" 
                              checked={formData.deliveryDays.includes(day)}
                              onChange={() => handleDeliveryDayChange(day)}
                              className="accent-primary w-3.5 h-3.5 rounded"
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-xs font-bold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm">Save Supplier</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {isEditModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleEditSupplierSubmit} className="bg-[#f8fafc] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-outline-variant animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest">
              <h2 className="text-base font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0b8252] text-[20px]">edit</span>
                Edit Supplier Profile
              </h2>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                    General Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Supplier Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.name ? 'border-red-500' : 'border-outline-variant'}`}
                      />
                      {formErrors.name && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Contact Person *</label>
                      <input 
                        type="text" 
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.contact ? 'border-red-500' : 'border-outline-variant'}`}
                      />
                      {formErrors.contact && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.contact}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Phone Number *</label>
                        <input 
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.phone ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.phone && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Email Address *</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.email ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.email}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">business_center</span>
                    Business Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Company Name *</label>
                      <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.companyName ? 'border-red-500' : 'border-outline-variant'}`}
                      />
                      {formErrors.companyName && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.companyName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Registration Number *</label>
                        <input 
                          type="text" 
                          name="brn"
                          value={formData.brn}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.brn ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.brn && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.brn}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Tax Number *</label>
                        <input 
                          type="text" 
                          name="taxNumber"
                          value={formData.taxNumber}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.taxNumber ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.taxNumber && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.taxNumber}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    Address Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Street Address *</label>
                      <input 
                        type="text" 
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.street ? 'border-red-500' : 'border-outline-variant'}`}
                      />
                      {formErrors.street && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.street}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">City *</label>
                        <input 
                          type="text" 
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.city ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.city && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Province *</label>
                        <input 
                          type="text" 
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.province ? 'border-red-500' : 'border-outline-variant'}`}
                        />
                        {formErrors.province && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.province}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                    Supply Info & Status
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Product Categories Supplied *</label>
                      <input 
                        type="text" 
                        name="categories"
                        value={formData.categories}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 outline-none text-xs font-semibold focus:ring-1 focus:ring-primary ${formErrors.categories ? 'border-red-500' : 'border-outline-variant'}`}
                      />
                      {formErrors.categories && <p className="text-[10px] text-red-500 font-bold mt-1">{formErrors.categories}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Payment Terms</label>
                        <select 
                          name="paymentTerms"
                          value={formData.paymentTerms}
                          onChange={handleInputChange}
                          className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                        >
                          <option value="COD">COD (Cash on Delivery)</option>
                          <option value="Net 15">Net 15</option>
                          <option value="Net 30">Net 30</option>
                          <option value="Net 60">Net 60</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1">Status</label>
                        <select 
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-outline-variant rounded-lg px-3 py-2 outline-none text-xs font-bold bg-background focus:ring-1 focus:ring-primary"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-outline mb-1.5">Preferred Delivery Days</label>
                      <div className="grid grid-cols-4 gap-2 border border-outline-variant p-2 rounded-lg bg-background">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold text-slate-600 select-none hover:text-slate-800">
                            <input 
                              type="checkbox" 
                              checked={formData.deliveryDays.includes(day)}
                              onChange={() => handleDeliveryDayChange(day)}
                              className="accent-primary w-3.5 h-3.5 rounded"
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-outline-variant flex justify-end gap-3 bg-surface-container-lowest">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-2.5 text-xs font-bold border border-outline-variant rounded-lg hover:bg-surface-container transition-colors text-on-surface">Cancel</button>
              <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[#0b8252] hover:bg-[#096b43] text-white rounded-lg transition-colors shadow-sm">Save Changes</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
