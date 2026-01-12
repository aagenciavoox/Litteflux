
import React, { useState, useMemo } from 'react';
import { Campaign, Lead, LeadStatus, CampaignStatus, UserRole, Influencer } from '../types';

interface HistoryProps {
  role: UserRole;
  campaigns: Campaign[];
  leads: Lead[];
  influencers: Influencer[];
}

const History: React.FC<HistoryProps> = ({ campaigns, leads, influencers }) => {
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'LEADS'>('CAMPAIGNS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'CAMPAIGNS') {
      return campaigns.filter(c =>
        c.status === CampaignStatus.COMPLETED &&
        (c.title.toLowerCase().includes(searchLower) || c.brand.toLowerCase().includes(searchLower))
      );
    }
    return leads.filter(l =>
      l.status === LeadStatus.REFUSED &&
      (l.brand.toLowerCase().includes(searchLower) || l.campaignObject.toLowerCase().includes(searchLower))
    );
  }, [activeTab, campaigns, leads, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Arquivo Histórico</h3>
          <p className="text-slate-400 text-[10px] font-bold mt-0.5 uppercase tracking-widest">Base de dados Littê Flux para registros arquivados</p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <button
            onClick={() => { setActiveTab('CAMPAIGNS'); setSearchTerm(''); }}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'CAMPAIGNS' ? 'bg-[#1F7A5F] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Campanhas
          </button>
          <button
            onClick={() => { setActiveTab('LEADS'); setSearchTerm(''); }}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LEADS' ? 'bg-[#1F7A5F] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Negociações
          </button>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          placeholder={`Buscar em ${activeTab === 'CAMPAIGNS' ? 'campanhas finalizadas' : 'prospecções recusadas'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 outline-none focus:border-[#1F7A5F] shadow-sm transition-all"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação / Marca</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Criadores Envolvidos</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data de Arquivamento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.length > 0 ? filteredData.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-10 py-7">
                  <p className="text-xs font-black text-[#1F7A5F] uppercase mb-1 tracking-widest">{item.brand}</p>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-tight line-clamp-1">{item.title || item.campaignObject}</p>
                </td>
                <td className="px-10 py-7">
                  <div className="flex flex-wrap gap-2">
                    {item.influencerIds?.map((id: string) => {
                      const inf = influencers.find(i => i.id === id);
                      return inf ? (
                        <div key={id} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{inf.nome}</span>
                        </div>
                      ) : null;
                    })}
                    {(!item.influencerIds || item.influencerIds.length === 0) && <span className="text-[10px] text-slate-300 font-bold uppercase">N/A</span>}
                  </div>
                </td>
                <td className="px-10 py-7 text-right">
                  <span className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {item.startDate || '--/--/----'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3} className="py-32 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl grayscale opacity-20">📂</div>
                  <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Nenhum registro encontrado no arquivo</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
