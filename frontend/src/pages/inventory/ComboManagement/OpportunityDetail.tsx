import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { comboService } from '../../../services/comboService';
import Sidebar from '../Shared/Sidebar';
import InventoryHeader from '../Shared/InventoryHeader';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const payload = await comboService.getOpportunityDetails(id as string);
      if (payload.success) {
        setData(payload.data);
      }
    } catch (error) {
      console.error('Failed to load opportunity details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const handleGenerateSuggestions = async () => {
    try {
      setGenerating(true);
      const payload = await comboService.generateSuggestions(id as string);
      if (payload.success) {
        setSuggestions(payload.suggestions);
      } else {
        alert(payload.message || 'Failed to generate suggestions.');
      }
    } catch (error) {
      alert('Error connecting to backend services.');
    } finally {
      setGenerating(false);
    }
  };

  const handleConvertToDraft = async (sugId: string) => {
    try {
      const payload = await comboService.convertToDraft(sugId);
      if (payload.success) {
        alert('Successfully promoted suggestion to draft!');
        navigate(`/inventory-combo/builder?id=${payload.data.id}`);
      } else {
        alert(payload.message || 'Failed to promote suggestion.');
      }
    } catch (error) {
      alert('Failed to promote suggestion.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <InventoryHeader />
          <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
            <div className="text-center py-20 text-gray-400">Loading opportunity details...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <InventoryHeader />
          <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
            <div className="text-center py-20 text-gray-400">Opportunity not found.</div>
          </main>
        </div>
      </div>
    );
  }

  const opportunity = data;
  const candidates = data.anchorCandidates || [];

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InventoryHeader />

        <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#f8f9fa]">
          <div className="max-w-[1400px] w-full mx-auto space-y-6">
      
      {/* Top Navigation */}
      <button 
        onClick={() => navigate('/inventory-combo')}
        className="flex items-center gap-1 text-gray-500 hover:text-[#103e2c] font-bold text-sm cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Opportunities
      </button>

      {/* Hero Block: Opportunity Target Details */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="bg-[#103e2c] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {opportunity.opportunityType}
            </span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">{opportunity.targetProductName}</h2>
          <p className="text-sm text-gray-400 font-mono">SKU ID: {opportunity.targetProductId}</p>
          <div className="flex gap-4 text-sm mt-4">
            <div>
              <p className="text-gray-400 font-medium">Selling Price</p>
              <p className="font-bold text-gray-800">Rs. {opportunity.normalPrice?.toFixed(2)}</p>
            </div>
            <div className="border-r border-gray-200"></div>
            <div>
              <p className="text-gray-400 font-medium">Cost Price</p>
              <p className="font-bold text-gray-800">Rs. {opportunity.costPrice?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl space-y-2 border border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stock Metrics</p>
          <div className="flex justify-between items-baseline pt-2">
            <span className="text-gray-600 text-sm">Available Quantity</span>
            <span className="font-black text-lg text-gray-800">{opportunity.currentStock} Units</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600 text-sm">Predicted Demand</span>
            <span className="font-bold text-gray-800">{opportunity.predictedDemand} Units</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-gray-600 text-sm">Stock Coverage</span>
            <span className="font-bold text-emerald-800">{opportunity.stockCoverageDays?.toFixed(0) || '0'} Days</span>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col justify-between border border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">AI Run Parameters</p>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Target excess stock: <strong>{opportunity.excessStock || '0'} Units</strong>.
              Priority Rank Score is compiled based on shelf margins and coverage.
            </p>
          </div>
          <div className="pt-4 flex justify-between items-center border-t border-gray-200/50 mt-4">
            <span className="text-xs text-gray-400 font-bold">Priority Score</span>
            <span className="bg-red-50 text-red-700 font-black text-sm px-2.5 py-0.5 rounded border border-red-200">
              P-{opportunity.priorityScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Candidates (Left) & Suggestions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Anchor Candidates */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="text-lg font-bold text-gray-800">Mined Anchor Candidates</h3>
            <button
              onClick={handleGenerateSuggestions}
              disabled={generating}
              className="text-xs bg-[#103e2c] text-white hover:bg-[#165a40] disabled:bg-gray-400 px-4 py-2 font-bold rounded-xl transition-all cursor-pointer"
            >
              {generating ? 'Mining suggestions...' : 'Generate Ranked Suggestions'}
            </button>
          </div>

          {candidates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No companion anchor products found in transaction rules.</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {candidates.map((cand: any) => (
                <div 
                  key={cand.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/20 hover:border-gray-200 transition-all grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="font-bold text-gray-900">{cand.anchorProductName}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">{cand.anchorProductId}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 pt-2">
                      <span>Conf: <strong>{(cand.confidence * 100).toFixed(0)}%</strong></span>
                      <span>Support: <strong>{(cand.support * 100).toFixed(2)}%</strong></span>
                      <span>Lift: <strong>{cand.lift.toFixed(2)}</strong></span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end border-l border-gray-100/80 pl-4 md:border-l-0 md:pl-0 md:items-end">
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Candidate Score</span>
                      <p className="text-lg font-black text-[#103e2c]">{cand.finalCandidateScore?.toFixed(0)}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">
                      Rank #{cand.candidateRank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Suggestion Preview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-4">Ranked AI Combo Suggestions</h3>

          {suggestions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-[48px] text-gray-200">auto_awesome</span>
              <p className="mt-2 text-sm">Click "Generate Ranked Suggestions" on the left to activate the pricing and discount logic engine.</p>
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
              {suggestions.map((sug: any) => (
                <div 
                  key={sug.id} 
                  className="p-6 rounded-xl border border-gray-100 bg-emerald-50/10 hover:border-emerald-700/10 transition-all space-y-4"
                >
                  {/* Suggestion Info header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-[#103e2c]">AI Suggestion (Rank #{sug.recommendationScore?.toFixed(0)})</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">Anchored with {sug.primaryAnchorProductId}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      sug.riskLevel === 'LOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      sug.riskLevel === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {sug.riskLevel} Risk
                    </span>
                  </div>

                  {/* Pricing metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl text-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Promo Price</p>
                      <p className="text-base font-extrabold text-gray-900 mt-1">Rs. {sug.recommendedPrice.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Saving</p>
                      <p className="text-base font-extrabold text-emerald-800 mt-1">Rs. {sug.normalTotalPrice - sug.recommendedPrice}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Margin</p>
                      <p className="text-base font-extrabold text-gray-900 mt-1">{sug.expectedMarginPercentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Natural Language Explanation */}
                  <div className="text-xs text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100 leading-relaxed font-mono">
                    "{sug.explanation}"
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-gray-400 font-medium">
                      Max Promo Quantity: <strong>{sug.maximumQuantity} Packs</strong>
                    </div>
                    <button
                      onClick={() => handleConvertToDraft(sug.id)}
                      className="bg-[#103e2c] text-white hover:bg-[#165a40] font-bold px-4 py-2 text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Promote to Draft
                    </button>
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
