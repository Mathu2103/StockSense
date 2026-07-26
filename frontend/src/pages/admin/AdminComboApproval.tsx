import { useEffect, useState } from 'react';
import { comboService } from '../../services/comboService';
import Sidebar from './Shared/Sidebar';
import AdminHeader from './Shared/AdminHeader';

export default function AdminComboApproval() {
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  // StockSense Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    inputText?: string;
    inputPlaceholder?: string;
    confirmText?: string;
    onConfirmSuccess?: () => void;
  }>({
    isOpen: false,
    type: 'APPROVE',
    title: '',
    message: ''
  });

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

  const openActionModal = (action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    if (!selectedCombo) return;
    if (action === 'APPROVE') {
      setModalConfig({
        isOpen: true,
        type: 'APPROVE',
        title: 'Approve & Activate Campaign?',
        message: `Are you sure you want to approve "${selectedCombo.name}"? Target product opportunities will be marked as CONVERTED.`,
        confirmText: 'Approve & Activate'
      });
    } else if (action === 'REJECT') {
      setModalConfig({
        isOpen: true,
        type: 'REJECT',
        title: 'Reject Campaign',
        message: `Please provide a rejection reason for "${selectedCombo.name}":`,
        inputPlaceholder: 'e.g. Profit margin too thin, re-assess product quantities...',
        confirmText: 'Confirm Rejection'
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'REQUEST_CHANGES',
        title: 'Request Campaign Changes',
        message: `Please specify instructions or required price adjustments for "${selectedCombo.name}":`,
        inputPlaceholder: 'e.g. Increase bundle price to Rs. 1600 or replace target item...',
        confirmText: 'Send Feedback to Manager'
      });
    }
  };

  const executeAdminAction = async () => {
    if (!selectedCombo) return;
    const { type, inputText } = modalConfig;

    if ((type === 'REJECT' || type === 'REQUEST_CHANGES') && (!inputText || !inputText.trim())) {
      setModalConfig(prev => ({
        ...prev,
        message: 'Review instructions/reason is required before submitting action.'
      }));
      return;
    }

    try {
      setActioning(true);
      let payload;
      if (type === 'APPROVE') {
        payload = await comboService.approveCombo(selectedCombo.id);
      } else if (type === 'REJECT') {
        payload = await comboService.rejectCombo(selectedCombo.id, inputText || '');
      } else {
        payload = await comboService.requestComboChanges(selectedCombo.id, inputText || '');
      }

      if (payload.success) {
        setModalConfig({
          isOpen: true,
          type: 'SUCCESS',
          title: 'Action Completed Successfully',
          message: `Combo campaign draft has been ${type === 'APPROVE' ? 'approved & activated' : type === 'REJECT' ? 'rejected' : 'sent back for changes'}.`,
          confirmText: 'Continue',
          onConfirmSuccess: () => fetchPendingCombos()
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: 'ERROR',
          title: 'Operation Failed',
          message: payload.message || 'Error executing action.'
        });
      }
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        type: 'ERROR',
        title: 'Server Error',
        message: err.response?.data?.message || 'Failed to complete action.'
      });
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
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

                {/* Direct Admin Review Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openActionModal('REJECT')}
                    disabled={actioning}
                    className="bg-red-50 text-red-700 border border-red-200 font-extrabold px-5 py-2.5 rounded-xl hover:bg-red-100 transition-all cursor-pointer text-xs"
                  >
                    Reject Campaign
                  </button>
                  <button
                    type="button"
                    onClick={() => openActionModal('REQUEST_CHANGES')}
                    disabled={actioning}
                    className="bg-amber-50 text-amber-800 border border-amber-200 font-extrabold px-5 py-2.5 rounded-xl hover:bg-amber-100 transition-all cursor-pointer text-xs"
                  >
                    Request Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => openActionModal('APPROVE')}
                    disabled={actioning}
                    className="bg-[#103e2c] text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-[#165a40] transition-all cursor-pointer text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Approve Campaign
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
          </div>
        </main>
      </div>

      {/* StockSense Custom Themed Admin Action Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-gray-100 space-y-5 animate-scale-up">
            {/* Modal Header & Icon */}
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                modalConfig.type === 'APPROVE' || modalConfig.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                modalConfig.type === 'REQUEST_CHANGES' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <span className="material-symbols-outlined text-[26px]">
                  {modalConfig.type === 'APPROVE' || modalConfig.type === 'SUCCESS' ? 'check_circle' :
                   modalConfig.type === 'REQUEST_CHANGES' ? 'edit_note' : 'cancel'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{modalConfig.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{modalConfig.message}</p>
              </div>
            </div>

            {/* Textarea Input for Reject / Request Changes */}
            {(modalConfig.type === 'REJECT' || modalConfig.type === 'REQUEST_CHANGES') && (
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  {modalConfig.type === 'REJECT' ? 'Rejection Reason (Required)' : 'Feedback / Revision Instructions (Required)'}
                </label>
                <textarea
                  value={modalConfig.inputText || ''}
                  onChange={(e) => setModalConfig(prev => ({ ...prev, inputText: e.target.value }))}
                  placeholder={modalConfig.inputPlaceholder || 'Enter instructions...'}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs outline-none focus:bg-white focus:border-emerald-700 transition-all font-medium text-gray-800"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-3">
              {modalConfig.type !== 'SUCCESS' && modalConfig.type !== 'ERROR' && (
                <button
                  type="button"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                disabled={actioning}
                onClick={() => {
                  if (modalConfig.type === 'SUCCESS' || modalConfig.type === 'ERROR') {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    if (modalConfig.onConfirmSuccess) modalConfig.onConfirmSuccess();
                  } else {
                    executeAdminAction();
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                  modalConfig.type === 'REJECT' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  modalConfig.type === 'REQUEST_CHANGES' ? 'bg-amber-600 hover:bg-amber-700 text-white' :
                  'bg-[#103e2c] hover:bg-[#165a40] text-white'
                }`}
              >
                {actioning ? 'Processing...' : modalConfig.confirmText || 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
