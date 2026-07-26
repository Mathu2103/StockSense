import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { comboService } from '../../../services/comboService';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';

export default function ComboDashboard() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState({
    slowMoving: 0,
    deadStock: 0,
    nearExpiry: 0,
    overstock: 0,
    seasonal: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch opportunities
      const oppData = await comboService.getOpportunities({
        type: filterType || undefined,
        status: filterStatus || undefined
      });

      if (oppData.success) {
        setOpportunities(oppData.data);
        
        // Re-calculate basic type stats if not filtering
        if (!filterType) {
          const data = oppData.data;
          setStats({
            slowMoving: data.filter((o: any) => o.opportunityType === 'SLOW_MOVING').length,
            deadStock: data.filter((o: any) => o.opportunityType === 'DEAD_STOCK').length,
            nearExpiry: data.filter((o: any) => o.opportunityType === 'NEAR_EXPIRY').length,
            overstock: data.filter((o: any) => o.opportunityType === 'OVERSTOCK').length,
            seasonal: data.filter((o: any) => o.opportunityType === 'SEASONAL').length
          });
        }
      }

      // 2. Fetch created combos
      const comboData = await comboService.getCombosList();
      if (comboData.success) {
        setCombos(comboData.data);
      }
    } catch (error) {
      console.error('Failed to load combo dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterType, filterStatus]);

  const handleRunAnalysis = async () => {
    try {
      setRunningAnalysis(true);
      const data = await comboService.runComboAnalysis();
      if (data.success) {
        alert('AI association rules mining and suggestions generation pipeline finished successfully!');
        fetchDashboardData();
      } else {
        alert(data.message || 'Failed to execute AI suggestions pipeline.');
      }
    } catch (error) {
      alert('Error connecting to backend services.');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleIgnore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to ignore this opportunity?')) return;
    try {
      const res = await comboService.ignoreOpportunity(id);
      if (res.success) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-red-50 text-red-700 border border-red-200';
    if (score >= 50) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">AI Combo & Discount Suggester</h1>
          <p className="text-gray-500 text-sm mt-1">Classified inventory opportunities backed by consumer basket association metrics.</p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={runningAnalysis}
          className="flex items-center gap-2 bg-[#103e2c] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#165a40] disabled:bg-gray-400 transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">{runningAnalysis ? 'sync' : 'auto_awesome'}</span>
          {runningAnalysis ? 'Executing AI Engine...' : 'Run AI Analysis'}
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div 
          onClick={() => setFilterType(filterType === 'SLOW_MOVING' ? '' : 'SLOW_MOVING')}
          className={`cursor-pointer p-6 rounded-2xl border transition-all ${filterType === 'SLOW_MOVING' ? 'bg-[#103e2c] text-white shadow-md border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:shadow-md'}`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'SLOW_MOVING' ? 'text-emerald-200' : 'text-gray-400'}`}>Slow-Moving</p>
          <h3 className="text-3xl font-black mt-2">{stats.slowMoving}</h3>
        </div>
        <div 
          onClick={() => setFilterType(filterType === 'DEAD_STOCK' ? '' : 'DEAD_STOCK')}
          className={`cursor-pointer p-6 rounded-2xl border transition-all ${filterType === 'DEAD_STOCK' ? 'bg-[#103e2c] text-white shadow-md border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:shadow-md'}`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'DEAD_STOCK' ? 'text-emerald-200' : 'text-gray-400'}`}>Dead-Stock</p>
          <h3 className="text-3xl font-black mt-2">{stats.deadStock}</h3>
        </div>
        <div 
          onClick={() => setFilterType(filterType === 'NEAR_EXPIRY' ? '' : 'NEAR_EXPIRY')}
          className={`cursor-pointer p-6 rounded-2xl border transition-all ${filterType === 'NEAR_EXPIRY' ? 'bg-[#103e2c] text-white shadow-md border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:shadow-md'}`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'NEAR_EXPIRY' ? 'text-emerald-200' : 'text-gray-400'}`}>Near-Expiry</p>
          <h3 className="text-3xl font-black mt-2">{stats.nearExpiry}</h3>
        </div>
        <div 
          onClick={() => setFilterType(filterType === 'OVERSTOCK' ? '' : 'OVERSTOCK')}
          className={`cursor-pointer p-6 rounded-2xl border transition-all ${filterType === 'OVERSTOCK' ? 'bg-[#103e2c] text-white shadow-md border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:shadow-md'}`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'OVERSTOCK' ? 'text-emerald-200' : 'text-gray-400'}`}>Overstock</p>
          <h3 className="text-3xl font-black mt-2">{stats.overstock}</h3>
        </div>
        <div 
          onClick={() => setFilterType(filterType === 'SEASONAL' ? '' : 'SEASONAL')}
          className={`cursor-pointer p-6 rounded-2xl border transition-all ${filterType === 'SEASONAL' ? 'bg-[#103e2c] text-white shadow-md border-transparent' : 'bg-white text-gray-800 border-gray-100 hover:shadow-md'}`}
        >
          <p className={`text-xs font-bold uppercase tracking-wider ${filterType === 'SEASONAL' ? 'text-emerald-200' : 'text-gray-400'}`}>Seasonal Excess</p>
          <h3 className="text-3xl font-black mt-2">{stats.seasonal}</h3>
        </div>
      </div>

      {/* Main Grid: Opportunities & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Opportunities List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Classified Inventory Opportunities</h2>
            <div className="flex gap-2">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="DETECTED">Detected</option>
                <option value="CONVERTED">Converted</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No opportunities matches found. Run AI analysis.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                    <th className="py-3 px-2">Target Product</th>
                    <th className="py-3 px-2">Reason</th>
                    <th className="py-3 px-2">Stock Level</th>
                    <th className="py-3 px-2">Priority</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {opportunities.map((opp) => (
                    <tr 
                      key={opp.id} 
                      onClick={() => navigate(`/inventory-combo/opportunity/${opp.id}`)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-900 line-clamp-1">{opp.targetProductName || opp.targetProductId}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{opp.targetProductId}</p>
                      </td>
                      <td className="py-4 px-2">
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {opp.opportunityType}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <p className="font-bold text-gray-800">{opp.currentStock} Units</p>
                        <p className="text-xs text-gray-400 mt-0.5">{opp.stockCoverageDays?.toFixed(0) || '0'} Days Coverage</p>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md ${getPriorityBadgeClass(opp.priorityScore)}`}>
                          P-{opp.priorityScore}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        {opp.opportunityStatus === 'DETECTED' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={(e) => handleIgnore(opp.id, e)}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                            <span className="material-symbols-outlined text-gray-300 text-[18px] self-center">chevron_right</span>
                          </div>
                        ) : (
                          <span className="text-emerald-700 font-extrabold text-[10px] uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Converted
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 1 Column: Created Campaigns */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Combo Campaigns</h2>
            <button 
              onClick={() => navigate('/inventory-combo/builder')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> Custom
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading campaigns...</div>
          ) : combos.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No active combo campaigns drafted yet.</div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {combos.map((combo) => (
                <div 
                  key={combo.id}
                  onClick={() => navigate(`/inventory-combo/builder?id=${combo.id}`)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-emerald-700/30 hover:shadow-sm cursor-pointer transition-all space-y-3 bg-gray-50/30"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{combo.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{combo.comboCode}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      combo.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      combo.status === 'PENDING_APPROVAL' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      combo.status === 'CHANGES_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {combo.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Price: <strong>Rs. {combo.comboPrice.toFixed(0)}</strong></span>
                    <span>Margin: <strong className="text-emerald-800">{combo.expectedMarginPercentage.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </main>
</div>
</div>
  );
}
