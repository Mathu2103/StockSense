import { useEffect, useState, useMemo } from 'react';
import { inventoryOperationsService, ProductItem, GRNRecord, GRNItem } from './inventoryOperationsService';

export default function GRNPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [grnHistory, setGrnHistory] = useState<GRNRecord[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form states
  const [selectedSupplier, setSelectedSupplier] = useState('FreshFarm Supplies');
  const [notes, setNotes] = useState('');
  const [formItems, setFormItems] = useState<GRNItem[]>([
    { productName: '', sku: '', orderedQty: 10, receivedQty: 10, unitCost: 0, mfgDate: '', expiryDate: '' }
  ]);

  // Selected GRN for details view & printing
  const [viewingGRN, setViewingGRN] = useState<GRNRecord | null>(null);

  const suppliersList = [
    'FreshFarm Supplies',
    'Ceylon Beverage Distributors',
    'Golden Crust Bakery',
    'Ocean Harvest',
    'ABC Distributors',
    'Fresh Foods Ltd',
    'Lanka Grocery Suppliers'
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const prods = await inventoryOperationsService.getProducts();
    setProducts(prods);
    const history = await inventoryOperationsService.getGRNHistory();
    setGrnHistory(history);

    // Set first product cost/sku defaults
    if (prods.length > 0) {
      setFormItems([
        {
          productName: prods[0].name,
          sku: prods[0].sku,
          orderedQty: 10,
          receivedQty: 10,
          unitCost: prods[0].costPrice,
          mfgDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]);
    }
  };

  const triggerToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Add a new row to the receipt form
  const addProductRow = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setFormItems(prev => [
      ...prev,
      {
        productName: defaultProduct.name,
        sku: defaultProduct.sku,
        orderedQty: 10,
        receivedQty: 10,
        unitCost: defaultProduct.costPrice,
        mfgDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]);
  };

  // Remove a row
  const removeProductRow = (index: number) => {
    if (formItems.length === 1) {
      triggerToast('A GRN must contain at least one product line.');
      return;
    }
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  // Handle row product selection updates
  const handleProductChange = (index: number, name: string) => {
    const match = products.find(p => p.name === name);
    if (!match) return;

    setFormItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productName: match.name,
        sku: match.sku,
        unitCost: match.costPrice
      };
      return updated;
    });
  };

  const handleRowValueChange = (index: number, field: keyof GRNItem, value: any) => {
    setFormItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Calculate live summary stats for the active form
  const liveStats = useMemo(() => {
    let totalItems = formItems.length;
    let totalOrdered = 0;
    let totalReceived = 0;
    let totalValue = 0;
    let matchedLines = 0;

    formItems.forEach(item => {
      totalOrdered += Number(item.orderedQty || 0);
      totalReceived += Number(item.receivedQty || 0);
      totalValue += Number(item.receivedQty || 0) * Number(item.unitCost || 0);
      if (Number(item.orderedQty) === Number(item.receivedQty)) {
        matchedLines++;
      }
    });

    const accuracy = totalItems > 0 ? Math.round((matchedLines / totalItems) * 100) : 100;
    return {
      totalItems,
      totalOrdered,
      totalReceived,
      totalValue,
      accuracy
    };
  }, [formItems]);

  // Handle GRN submission
  const handleSubmitGRN = async (e: React.FormEvent, andPrint = false) => {
    e.preventDefault();
    
    // Validate rows
    const invalidRow = formItems.find(item => !item.productName || item.receivedQty < 0 || item.orderedQty <= 0);
    if (invalidRow) {
      triggerToast('Please ensure all items have valid quantities and products selected.');
      return;
    }

    try {
      const newGRN = await inventoryOperationsService.createGRN({
        supplierName: selectedSupplier,
        receivedDate: new Date().toISOString().split('T')[0],
        items: formItems,
        totalQuantity: liveStats.totalReceived,
        totalCost: liveStats.totalValue,
        notes
      });

      // Reload
      const history = await inventoryOperationsService.getGRNHistory();
      setGrnHistory(history);
      
      // Reset form
      setShowCreateForm(false);
      setNotes('');
      if (products.length > 0) {
        setFormItems([
          {
            productName: products[0].name,
            sku: products[0].sku,
            orderedQty: 10,
            receivedQty: 10,
            unitCost: products[0].costPrice,
            mfgDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ]);
      }

      triggerToast(`GRN ${newGRN.grnNumber} generated successfully!`);
      
      if (andPrint) {
        setViewingGRN(newGRN);
        setTimeout(() => window.print(), 500);
      }
    } catch (err: any) {
      triggerToast(err.message || 'Error occurred while saving GRN.');
    }
  };

  const printSelectedGRN = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="material-symbols-outlined text-primary text-emerald-400">check_circle</span>
          <span className="text-xs font-extrabold text-white">{toast}</span>
        </div>
      )}

      {/* Action header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Supplier Goods Receiving Ledger</h2>
          <p className="text-xs text-slate-500">Record incoming shipments, verify ordered amounts, and log discrepancies.</p>
        </div>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary bg-[#0b8252] text-white rounded-lg text-xs font-bold hover:bg-[#096a43] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            New Goods Receiving Note (GRN)
          </button>
        ) : (
          <button
            onClick={() => setShowCreateForm(false)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm bg-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Cancel
          </button>
        )}
      </div>

      {/* CREATE NEW GRN CONTAINER */}
      {showCreateForm && (
        <form onSubmit={(e) => handleSubmitGRN(e)} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Select Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252]"
              >
                {suppliersList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">GRN Date</label>
              <input
                type="text"
                readOnly
                value={new Date().toLocaleDateString()}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Operator (Auditor)</label>
              <input
                type="text"
                readOnly
                value="Inventory Manager"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC PRODUCTS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Product Line Entries</span>
              <button
                type="button"
                onClick={addProductRow}
                className="flex items-center gap-1 text-[11px] font-black text-[#0b8252] hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">add_circle</span>
                Add Product Line
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200 text-[10px]">
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5 w-32">SKU</th>
                    <th className="px-4 py-2.5 w-24 text-center">Ordered Qty</th>
                    <th className="px-4 py-2.5 w-24 text-center">Received Qty</th>
                    <th className="px-4 py-2.5 w-28 text-center font-black">Ordered vs Rec.</th>
                    <th className="px-4 py-2.5 w-28">Unit Cost</th>
                    <th className="px-4 py-2.5 w-32">MFG Date</th>
                    <th className="px-4 py-2.5 w-32">EXP Date</th>
                    <th className="px-4 py-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {formItems.map((item, idx) => {
                    const diff = Number(item.receivedQty || 0) - Number(item.orderedQty || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        {/* Product selection */}
                        <td className="px-4 py-2">
                          <select
                            value={item.productName}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-bold text-slate-800 focus:outline-none"
                          >
                            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </td>

                        {/* SKU */}
                        <td className="px-4 py-2 text-slate-500 font-mono font-bold">
                          {item.sku || 'N/A'}
                        </td>

                        {/* Ordered Qty */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.orderedQty}
                            onChange={(e) => handleRowValueChange(idx, 'orderedQty', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold text-center"
                          />
                        </td>

                        {/* Received Qty */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={item.receivedQty}
                            onChange={(e) => handleRowValueChange(idx, 'receivedQty', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold text-center"
                          />
                        </td>

                        {/* Status Check highlight */}
                        <td className="px-4 py-2 text-center">
                          {diff === 0 ? (
                            <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-100">
                              Matched
                            </span>
                          ) : diff < 0 ? (
                            <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded-full border border-rose-100">
                              Shortage ({diff})
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full border border-blue-100">
                              Over (+{diff})
                            </span>
                          )}
                        </td>

                        {/* Unit Cost */}
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleRowValueChange(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold text-center"
                          />
                        </td>

                        {/* MFG Date */}
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={item.mfgDate}
                            onChange={(e) => handleRowValueChange(idx, 'mfgDate', e.target.value)}
                            className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-bold text-center"
                          />
                        </td>

                        {/* EXP Date */}
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) => handleRowValueChange(idx, 'expiryDate', e.target.value)}
                            className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-bold text-center"
                          />
                        </td>

                        {/* Row Delete button */}
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeProductRow(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SUMMARY KPI METRICS CARD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Line Items</span>
              <span className="text-lg font-black text-slate-800">{liveStats.totalItems} lines</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Total Received Stock</span>
              <span className="text-lg font-black text-slate-800">{liveStats.totalReceived} units</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Delivery Value Summary</span>
              <span className="text-lg font-black text-emerald-600">Rs. {liveStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">Fulfillment Accuracy</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black ${liveStats.accuracy === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {liveStats.accuracy}%
                </span>
                <span className="text-[10px] text-slate-400 font-bold">accuracy</span>
              </div>
            </div>
          </div>

          {/* Notes area */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Receiving Log Notes / Observations</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Batch checked, 2 boxes water damaged, rest clean..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0b8252] h-20"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={(e) => handleSubmitGRN(e, true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm bg-white"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              Receive & Print receipt
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary bg-[#0b8252] text-white rounded-lg text-xs font-bold hover:bg-[#096a43] transition-colors shadow-sm"
            >
              Save Receipt & Update Stock
            </button>
          </div>
        </form>
      )}

      {/* PAST GRN HISTORY REGISTRY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Past Goods Receiving Receipts</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-100 text-[10px]">
                <th className="px-4 py-3">GRN Number</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Received Date</th>
                <th className="px-4 py-3 text-center">Items Received</th>
                <th className="px-4 py-3 text-right">Total Shipment Cost</th>
                <th className="px-4 py-3 text-center">Fulfillment Accuracy</th>
                <th className="px-4 py-3 text-center">Discrepancy Status</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grnHistory.map((grn) => (
                <tr key={grn.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-extrabold text-[#0b8252]">{grn.grnNumber}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{grn.supplierName}</td>
                  <td className="px-4 py-3 text-slate-500 font-bold">{grn.receivedDate}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">{grn.totalQuantity} items</td>
                  <td className="px-4 py-3 text-right font-black text-slate-800">Rs. {grn.totalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold ${grn.accuracyScore === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {grn.accuracyScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {grn.status === 'Completed' ? (
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full border border-emerald-100">
                        100% Correct
                      </span>
                    ) : grn.status === 'Shortage' ? (
                      <span className="inline-block px-2.5 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[10px] rounded-full border border-rose-100">
                        Shortage Warning
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full border border-blue-100">
                        Over Delivery
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-medium truncate max-w-xs">{grn.notes || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setViewingGRN(grn)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE RECEIPT DETAILS MODAL */}
      {viewingGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:relative print:bg-white print:p-0 print:inset-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-6 print:shadow-none print:border-none print:p-0">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:pb-2">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-[8px]">StockSense Inventory POS</span>
                <h3 className="text-lg font-black text-slate-800 print:text-md">GOODS RECEIVING NOTE (GRN)</h3>
              </div>
              <div className="text-right">
                <span className="block text-xs font-mono font-black text-[#0b8252] print:text-[10px]">{viewingGRN.grnNumber}</span>
                <span className="block text-[10px] text-slate-400 font-bold print:text-[8px]">{viewingGRN.receivedDate}</span>
              </div>
            </div>

            {/* Supplier / Delivery info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Supplier Address Info</span>
                <span className="text-xs font-black text-slate-800">{viewingGRN.supplierName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Audited Accuracy</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black ${viewingGRN.accuracyScore === 100 ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {viewingGRN.accuracyScore}% Accuracy score
                  </span>
                  <span className="text-[9px] text-slate-400 font-extrabold">({viewingGRN.status})</span>
                </div>
              </div>
            </div>

            {/* Product Item lines */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Shipment Item Ledger</span>
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 font-black uppercase text-[9px] border-b border-slate-200">
                      <th className="px-3 py-2">Product Name</th>
                      <th className="px-3 py-2 text-center w-20">Ordered</th>
                      <th className="px-3 py-2 text-center w-20">Received</th>
                      <th className="px-3 py-2 text-right w-24">Unit Cost</th>
                      <th className="px-3 py-2 text-right w-28">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {viewingGRN.items.map((item, idx) => (
                      <tr key={idx} className="print:text-[10px]">
                        <td className="px-3 py-2 font-bold text-slate-800">{item.productName}</td>
                        <td className="px-3 py-2 text-center text-slate-400 font-bold">{item.orderedQty}</td>
                        <td className="px-3 py-2 text-center text-slate-800 font-black">{item.receivedQty}</td>
                        <td className="px-3 py-2 text-right text-slate-500 font-mono">Rs. {item.unitCost.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-black text-slate-800 font-mono">Rs. {(item.receivedQty * item.unitCost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total value and notes summary */}
            <div className="flex items-start justify-between">
              <div className="max-w-xs space-y-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Auditor Observations</span>
                <p className="text-[11px] text-slate-600 font-bold">{viewingGRN.notes || 'No damaged or rejected items reported.'}</p>
              </div>
              <div className="text-right space-y-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Shipment Value Summary</span>
                <span className="text-xl font-black text-emerald-600 font-mono">Rs. {viewingGRN.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 print:hidden">
              <button
                type="button"
                onClick={printSelectedGRN}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0b8252] text-white rounded-lg text-xs font-bold hover:bg-[#096a43] transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print GRN
              </button>
              <button
                type="button"
                onClick={() => setViewingGRN(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
