import { useEffect, useState } from 'react';
import { comboService } from '../../services/comboService';

export default function AdminComboApproval() {
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [comment, setComment] = useState('');

  const fetchPendingCombos = async () => {
    try {
      setLoading(true);
      const payload = await comboService.getCombosList('PENDING_APPROVAL');
      if (payload.success) {
        setCombos(payload.data);
        if (payload.data.length > 0) {
          setSelectedCombo(payload.data[0]);
        } else {
          setSelectedCombo(null);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCombos();
  }, []);

  const handleAction = async (action: 'approve' | 'reject' | 'request-changes') => {
    if (!selectedCombo) return;
    if (action !== 'approve' && !comment) {
      alert('Review comment is required for rejection or requesting changes.');
      return;
    }

    try {
      setActioning(true);
      let payload;
      if (action === 'approve') {
        payload = await comboService.approveCombo(selectedCombo.id);
      } else if (action === 'reject') {
        payload = await comboService.rejectCombo(selectedCombo.id, comment);
      } else {
        payload = await comboService.requestComboChanges(selectedCombo.id, comment);
      }

      if (payload.success) {
        alert(`Combo successfully ${action}d!`);
        setComment('');
        fetchPendingCombos();
      } else {
        alert(payload.message || 'Operation failed.');
      }
    } catch (err) {
      alert('Failed to complete action.');
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans text-gray-900 bg-gray-50/50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Combo Campaign Approvals</h1>
        <p className="text-gray-500 text-sm mt-1">Administrator review queue for proposed AI and custom discount configurations.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading approvals queue...</div>
      ) : combos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-2">
          <span className="material-symbols-outlined text-[48px] text-emerald-700">verified_user</span>
          <h3 className="text-lg font-bold text-gray-800">Approvals queue is clear!</h3>
          <p className="text-gray-500 text-sm">No combo drafts are currently pending reviews.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Queue List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2">Pending Proposals</h3>
            <div className="space-y-3">
              {combos.map((combo) => (
                <div 
                  key={combo.id}
                  onClick={() => setSelectedCombo(combo)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedCombo?.id === combo.id 
                      ? 'border-[#103e2c] bg-emerald-50/10 shadow-sm' 
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50/30'
                  }`}
                >
                  <h4 className="font-bold text-gray-900 line-clamp-1">{combo.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Type: {combo.comboType}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-3">
                    <span>Price: <strong>Rs. {combo.comboPrice}</strong></span>
                    <span>Margin: <strong className="text-emerald-800">{combo.expectedMarginPercentage.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 Columns: Detailed Review & Actions */}
          {selectedCombo && (
            <div className="lg:col-span-2 space-y-6">
              
              {/* Proposal detail card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCombo.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">Code: {selectedCombo.comboCode}</p>
                  </div>
                  <span className="bg-blue-50 text-blue-800 text-[10px] border border-blue-100 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Pending Approval
                  </span>
                </div>

                <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed font-mono">
                  "{selectedCombo.description || 'No description provided.'}"
                </p>

                {/* Items preview table */}
                <div className="space-y-3">
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Products Included</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold">
                          <th className="py-2 px-1">Product SKU</th>
                          <th className="py-2 px-1">Role</th>
                          <th className="py-2 px-1">Qty</th>
                          <th className="py-2 px-1">Normal Unit Price</th>
                          <th className="py-2 px-1">Cost Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
                        {selectedCombo.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="py-3 px-1">
                              <p className="font-bold text-gray-900">{item.product?.name || item.productId}</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">{item.productId}</p>
                            </td>
                            <td className="py-3 px-1">
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase font-bold text-[9px]">
                                {item.role}
                              </span>
                            </td>
                            <td className="py-3 px-1">{item.quantity}</td>
                            <td className="py-3 px-1">Rs. {item.normalUnitPrice?.toFixed(2)}</td>
                            <td className="py-3 px-1">Rs. {item.costPrice?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Combo Cost</span>
                    <p className="text-base font-extrabold text-gray-900 mt-1">Rs. {selectedCombo.totalCost?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Promo Price</span>
                    <p className="text-base font-extrabold text-[#103e2c] mt-1">Rs. {selectedCombo.comboPrice?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Profit</span>
                    <p className="text-base font-extrabold text-gray-900 mt-1">Rs. {selectedCombo.expectedProfit?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Profit Margin</span>
                    <p className="text-base font-extrabold text-emerald-800 mt-1">{selectedCombo.expectedMarginPercentage?.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Review inputs and actions */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Admin Review Decision</h3>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase">Review Comments / Rejection Details</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter approval details, revision instructions, or rejection reasons..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-700 transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actioning}
                    className="bg-red-50 text-red-700 border border-red-200 font-bold px-6 py-2.5 rounded-xl hover:bg-red-100 transition-all cursor-pointer text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction('request-changes')}
                    disabled={actioning}
                    className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-100 transition-all cursor-pointer text-sm"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={actioning}
                    className="bg-[#103e2c] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#165a40] transition-all cursor-pointer text-sm shadow-sm"
                  >
                    Approve Campaign
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
