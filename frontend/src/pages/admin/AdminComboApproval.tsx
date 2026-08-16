import { useEffect, useState } from 'react';
import { comboService } from '../../services/comboService';
import Sidebar from './Shared/Sidebar';
import AdminHeader from './Shared/AdminHeader';

export default function AdminComboApproval() {
  const [combos, setCombos] = useState<any[]>([]);
  const [selectedCombo, setSelectedCombo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED'>('PENDING');

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

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const statusParam = activeTab === 'PENDING' ? 'PENDING_APPROVAL' : 'APPROVED';
      const payload = await comboService.getCombosList(statusParam);
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
    fetchCombos();
  }, [activeTab]);

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
          onConfirmSuccess: () => fetchCombos()
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
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_right,_rgba(11,130,82,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f5f7fb_100%)] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Combo Campaign Approvals</h1>
              <p className="text-slate-500 text-sm mt-1">Administrator review queue for proposed AI and custom discount configurations.</p>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400">Loading approvals queue...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Queue List */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                  {/* Tab Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full">
                    <button
                      onClick={() => setActiveTab('PENDING')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'PENDING'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Pending Reviews
                    </button>
                    <button
                      onClick={() => setActiveTab('APPROVED')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === 'APPROVED'
                          ? 'bg-[#0b8252] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Approved
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
                    {activeTab === 'PENDING' ? 'Pending Proposals' : 'Approved Campaigns'}
                  </h3>

                  {combos.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {activeTab === 'PENDING' ? 'No pending proposals.' : 'No approved campaigns.'}
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {combos.map((combo) => (
                        <div 
                          key={combo.id}
                          onClick={() => setSelectedCombo(combo)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedCombo?.id === combo.id 
                              ? 'border-primary bg-emerald-50/10 shadow-sm' 
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                          }`}
                        >
                          <h4 className="font-bold text-slate-900 line-clamp-1">{combo.name}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-semibold">Type: {combo.comboType}</p>
                          <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                            <span>Price: <strong>Rs. {combo.comboPrice}</strong></span>
                            <span>Margin: <strong className={combo.expectedMarginPercentage < 0 ? "text-rose-600 font-extrabold" : "text-emerald-800"}>{combo.expectedMarginPercentage.toFixed(1)}%</strong></span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-50">
                            <span className="flex items-center gap-1" title="Start Date"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {new Date(combo.startDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1" title="End Date"><span className="material-symbols-outlined text-[12px]">event</span> {new Date(combo.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right 2 Columns: Detailed Review & Actions */}
                <div className="lg:col-span-2">
                  {selectedCombo ? (
                    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{selectedCombo.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-400 font-mono">Code: {selectedCombo.comboCode}</p>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1" title="Campaign Period">
                              <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                              {new Date(selectedCombo.startDate).toLocaleDateString()} - {new Date(selectedCombo.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] border font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          selectedCombo.status === 'APPROVED' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                            : 'bg-blue-50 text-blue-800 border-blue-100'
                        }`}>
                          {selectedCombo.status === 'APPROVED' ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-mono">
                        "{selectedCombo.description || 'No description provided.'}"
                      </p>

                      {/* Items preview table */}
                      <div className="space-y-3">
                        <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Products Included</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                                <th className="py-2 px-1">Product SKU</th>
                                <th className="py-2 px-1">Role</th>
                                <th className="py-2 px-1">Qty</th>
                                <th className="py-2 px-1">Normal Unit Price</th>
                                <th className="py-2 px-1">Cost Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                              {selectedCombo.items?.map((item: any) => (
                                <tr key={item.id}>
                                  <td className="py-3 px-1">
                                    <p className="font-bold text-slate-900">{item.product?.name || item.productId}</p>
                                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{item.productId}</p>
                                  </td>
                                  <td className="py-3 px-1">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase font-bold text-[9px]">
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Combo Cost</span>
                          <p className="text-base font-extrabold text-slate-900 mt-1">Rs. {selectedCombo.totalCost?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Promo Price</span>
                          <p className="text-base font-extrabold text-primary mt-1">Rs. {selectedCombo.comboPrice?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Profit</span>
                          <p className="text-base font-extrabold text-slate-900 mt-1">Rs. {selectedCombo.expectedProfit?.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Profit Margin</span>
                          <p className={`text-base font-extrabold mt-1 ${selectedCombo.expectedMarginPercentage < 0 ? 'text-rose-600' : 'text-emerald-800'}`}>{selectedCombo.expectedMarginPercentage?.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Negative Margin High-Impact Warning Banner */}
                      {selectedCombo.expectedMarginPercentage < 0 && (
                        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex gap-3 items-start animate-in slide-in-from-top-2 duration-200">
                          <span className="material-symbols-outlined text-[24px] text-rose-600 shrink-0">warning</span>
                          <div>
                            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">Negative Profit Margin Warning</h4>
                            <p className="text-[11px] text-rose-700 leading-relaxed mt-1">
                              This promotional combo has a net profit margin of <strong className="text-rose-900 font-extrabold">{selectedCombo.expectedMarginPercentage.toFixed(1)}%</strong>. Selling this combo will result in a financial loss of <strong className="text-rose-900 font-extrabold">Rs. {Math.abs(selectedCombo.expectedProfit || 0).toFixed(2)}</strong> per unit. Ensure this is an intended loss-leader strategy before approving.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Direct Admin Review Action Buttons / Status Banner */}
                      {selectedCombo.status === 'APPROVED' ? (
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mt-4">
                          <span className="material-symbols-outlined text-emerald-600 text-[20px]">verified</span>
                          <div>
                            <p className="text-xs font-bold">Approved and Activated</p>
                            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Approved by {selectedCombo.approvedByAdmin?.name || 'Administrator'} {selectedCombo.approvedAt ? `on ${new Date(selectedCombo.approvedAt).toLocaleDateString()} at ${new Date(selectedCombo.approvedAt).toLocaleTimeString()}` : ''}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => openActionModal('REJECT')}
                            disabled={actioning}
                            className="bg-rose-50 text-rose-600 border border-rose-200 font-extrabold px-5 py-2.5 rounded-xl hover:bg-rose-100 transition-all cursor-pointer text-xs"
                          >
                            Reject Campaign
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal('REQUEST_CHANGES')}
                            disabled={actioning}
                            className="bg-slate-100 text-slate-700 border border-slate-200 font-extrabold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all cursor-pointer text-xs"
                          >
                            Request Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => openActionModal('APPROVE')}
                            disabled={actioning}
                            className="bg-[#0b8252] text-white font-extrabold px-6 py-2.5 rounded-xl hover:bg-[#096b43] transition-all cursor-pointer text-xs shadow-sm flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Approve Campaign
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center h-full min-h-[300px] space-y-3">
                      <span className="material-symbols-outlined text-[48px] text-slate-300">ads_click</span>
                      <h3 className="text-base font-bold text-slate-700">No Campaign Selected</h3>
                      <p className="text-slate-400 text-xs max-w-xs">Select a combo campaign from the list to view its complete pricing structure and product details.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* StockSense Custom Themed Admin Action Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-slate-100 space-y-5 animate-scale-up">
            {/* Modal Header & Icon */}
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                modalConfig.type === 'APPROVE' || modalConfig.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                modalConfig.type === 'REQUEST_CHANGES' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                <span className="material-symbols-outlined text-[26px]">
                  {modalConfig.type === 'APPROVE' || modalConfig.type === 'SUCCESS' ? 'check_circle' :
                   modalConfig.type === 'REQUEST_CHANGES' ? 'edit_note' : 'cancel'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{modalConfig.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{modalConfig.message}</p>
              </div>
            </div>

            {/* Combo Campaign Details Summary in Approve Modal */}
            {modalConfig.type === 'APPROVE' && selectedCombo && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Summary</p>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="col-span-2 py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Name: </span>
                    <strong className="text-slate-900 font-bold">{selectedCombo.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Combo Code</span>
                    <strong className="text-slate-900 font-bold font-mono">{selectedCombo.comboCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Type</span>
                    <strong className="text-slate-900 font-bold uppercase">{selectedCombo.comboType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Cost Price</span>
                    <strong className="text-slate-900 font-bold">Rs. {selectedCombo.totalCost?.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Promo Price</span>
                    <strong className="text-[#0b8252] font-bold">Rs. {selectedCombo.comboPrice?.toFixed(2)}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-medium">Campaign Period</span>
                    <strong className="text-slate-900 font-bold">{new Date(selectedCombo.startDate).toLocaleDateString()} to {new Date(selectedCombo.endDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Expected Profit</span>
                    <strong className="text-slate-900 font-bold">Rs. {selectedCombo.expectedProfit?.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Expected Margin</span>
                    <strong className={`font-bold ${selectedCombo.expectedMarginPercentage < 0 ? 'text-rose-600' : 'text-emerald-800'}`}>
                      {selectedCombo.expectedMarginPercentage?.toFixed(1)}%
                    </strong>
                  </div>
                </div>
                {selectedCombo.expectedMarginPercentage < 0 && (
                  <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-[10px] flex gap-1.5 items-start mt-1">
                    <span className="material-symbols-outlined text-[14px] text-rose-600 shrink-0">warning</span>
                    <span>
                      <strong>Warning:</strong> You are approving a campaign with a negative profit margin.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Textarea Input for Reject / Request Changes */}
            {(modalConfig.type === 'REJECT' || modalConfig.type === 'REQUEST_CHANGES') && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  {modalConfig.type === 'REJECT' ? 'Rejection Reason (Required)' : 'Feedback / Revision Instructions (Required)'}
                </label>
                <textarea
                  value={modalConfig.inputText || ''}
                  onChange={(e) => setModalConfig(prev => ({ ...prev, inputText: e.target.value }))}
                  placeholder={modalConfig.inputPlaceholder || 'Enter instructions...'}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:bg-white focus:border-primary transition-all font-medium text-slate-800"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
              {modalConfig.type !== 'SUCCESS' && modalConfig.type !== 'ERROR' && (
                <button
                  type="button"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
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
                  modalConfig.type === 'REJECT' ? 'bg-danger-600 hover:bg-danger-700 text-white' :
                  modalConfig.type === 'REQUEST_CHANGES' ? 'bg-warning-600 hover:bg-warning-700 text-white' :
                  'bg-[#0b8252] hover:bg-[#096b43] text-white'
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
