
import React, { useState, useMemo } from 'react';
import { LeadPhase, LeadStatus, Lead, Influencer, UserRole } from '../types';
import { ModalBase, FormField, Input, Select, Textarea, Button } from './Modals';

interface PipelineProps {
  leads: Lead[];
  influencers: Influencer[];
  onUpdateStatus: (leadId: string, status: LeadStatus, additionalData?: any) => void;
  onCreateLead: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
  role: UserRole;
}

const Pipeline: React.FC<PipelineProps> = ({ leads, influencers, onUpdateStatus, onDeleteLead, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<LeadPhase | 'ALL'>('ALL');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('GERAL');

  const [editStatus, setEditStatus] = useState<LeadStatus>(LeadStatus.WAITING);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const isWaiting = lead.status === LeadStatus.WAITING;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = lead.brand.toLowerCase().includes(searchLower) ||
        lead.campaignObject.toLowerCase().includes(searchLower);
      const matchesPhase = phaseFilter === 'ALL' || lead.phase === phaseFilter;
      return isWaiting && matchesSearch && matchesPhase;
    });
  }, [leads, searchTerm, phaseFilter]);

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get('status') as LeadStatus;
    const lastMessage = formData.get('lastMessage') as string;

    if (newStatus === LeadStatus.REFUSED && !lastMessage?.trim()) {
      alert("Por favor, informe o motivo da recusa.");
      return;
    }

    const additionalData = {
      phase: formData.get('phase') as LeadPhase,
      responsible: formData.get('responsible'),
      proposedValue: Number(formData.get('proposedValue')),
      closedValue: Number(formData.get('closedValue')),
      scope: formData.get('scope'),
      startDate: formData.get('startDate'),
      lastMessage: lastMessage,
      campaignObject: formData.get('campaignObject')
    };

    onUpdateStatus(selectedLead!.id, newStatus, additionalData);
    setIsEditing(false);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Andamentos Ativos</h3>
          <p className="text-slate-500 text-sm mt-0.5">Ciclo de Prospecção & Negociação</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar marca ou objeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 w-56 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>
          <select
            value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Todas as Fases</option>
            <option value={LeadPhase.CONTACT}>1º Contato</option>
            <option value={LeadPhase.QUOTE}>Orçamento</option>
            <option value={LeadPhase.NEGOTIATION}>Negociação</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Marca / Objeto</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Assessorado</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Fase</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-800">{lead.brand}</p>
                  <p className="text-xs text-slate-500">{lead.campaignObject}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {lead.influencerIds.map(id => {
                      const inf = influencers.find(i => i.id === id);
                      return inf ? <span key={id} className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{inf.nome}</span> : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{lead.phase}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button onClick={() => { setSelectedLead(lead); setIsEditing(false); setActiveTab('GERAL'); }} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-800 hover:text-white transition-all">Detalhes</button>
                    {role === UserRole.ADMIN && (
                      <>
                        <button onClick={() => { setSelectedLead(lead); setIsEditing(true); setEditStatus(lead.status); }} className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">Editar</button>
                        <button onClick={() => onDeleteLead?.(lead.id)} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-600 hover:text-white transition-all">Excluir</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <p className="text-sm text-slate-400">Nenhum registro encontrado</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && isEditing && (
        <ModalBase
          title={`Atualizar: ${selectedLead.brand}`}
          subtitle="Edição de Andamento"
          onClose={() => setIsEditing(false)}
        >
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Fase do Funil">
                <Select name="phase" defaultValue={selectedLead.phase}>
                  <option value={LeadPhase.CONTACT}>1º Contato</option>
                  <option value={LeadPhase.QUOTE}>Orçamento</option>
                  <option value={LeadPhase.NEGOTIATION}>Negociação</option>
                </Select>
              </FormField>
              <FormField label="Status Operacional">
                <Select name="status" value={editStatus} onChange={(e) => setEditStatus(e.target.value as LeadStatus)}>
                  <option value={LeadStatus.WAITING}>Em Aberto</option>
                  <option value={LeadStatus.CLOSED}>Aprovar & Gerar Campanha</option>
                  <option value={LeadStatus.REFUSED}>Recusar Registro</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Objeto da Campanha" required><Input name="campaignObject" defaultValue={selectedLead.campaignObject} required /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Valor Proposto (R$)"><Input name="proposedValue" type="number" step="0.01" defaultValue={selectedLead.proposedValue} /></FormField>
              <FormField label="Valor Fechado (R$)"><Input name="closedValue" type="number" step="0.01" defaultValue={selectedLead.closedValue} /></FormField>
            </div>
            <FormField label="Última Atualização / Motivo"><Textarea name="lastMessage" placeholder="Descreva os próximos passos ou o motivo da alteração..." /></FormField>
            <Button type="submit" className="w-full py-4 uppercase tracking-widest">Confirmar Alterações</Button>
          </form>
        </ModalBase>
      )}

      {selectedLead && !isEditing && (
        <ModalBase
          title={selectedLead.brand}
          subtitle="Resumo da Prospecção"
          onClose={() => setSelectedLead(null)}
          tabs={[{ id: 'GERAL', label: 'Visão Geral' }, { id: 'HISTORICO', label: 'Histórico de Ações' }]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          footer={
            <div className={`flex ${role === UserRole.ADMIN ? 'justify-between' : 'justify-end'} w-full`}>
              {role === UserRole.ADMIN && (
                <Button variant="danger" onClick={() => { if (window.confirm('Excluir prospecção?')) { onDeleteLead?.(selectedLead.id); setSelectedLead(null); } }}>Excluir</Button>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setSelectedLead(null)}>Fechar</Button>
                {role === UserRole.ADMIN && (
                  <Button onClick={() => setIsEditing(true)}>Editar Ficha</Button>
                )}
              </div>
            </div>
          }
        >
          {activeTab === 'GERAL' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Expectativa Financeira</p>
                  <p className="text-xl font-black text-slate-900">R$ {selectedLead.proposedValue?.toLocaleString() || '0'}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Responsável Comercial</p>
                  <p className="text-xs font-bold text-slate-800 uppercase">{selectedLead.responsible || 'Sistema'}</p>
                </div>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Objeto do Job</p>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{selectedLead.campaignObject}</p>
                </div>
                {selectedLead.scope && (
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Escopo Preliminar</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{selectedLead.scope}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'HISTORICO' && (
            <div className="animate-in fade-in duration-300">
              <div className="relative pl-8 space-y-10 border-l-2 border-slate-50 ml-4 py-4">
                {selectedLead.timeline?.map((log, idx) => (
                  <div key={log.id} className="relative">
                    <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-md ${idx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-slate-200'}`}></div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{log.action}</p>
                        <span className="text-[9px] font-bold text-slate-300">{log.date}</span>
                      </div>
                      <p className="text-[9px] text-[#1F7A5F] font-black uppercase">Agente: {log.user}</p>
                      {log.notes && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                          <p className="text-[11px] text-slate-500 font-medium italic">"{log.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ModalBase>
      )}
    </div>
  );
};

export default Pipeline;
