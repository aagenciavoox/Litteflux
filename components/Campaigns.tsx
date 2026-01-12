
import React, { useState, useMemo } from 'react';
import { CampaignStatus, UserRole, Campaign, Influencer } from '../types';
import { ModalBase, Button, FormField, Input, Select, Textarea } from './Modals';
import { generateUUID } from '../services/supabase';

interface CampaignsProps {
  role: UserRole;
  campaigns: Campaign[];
  influencers: Influencer[];
  onUpdateCampaign?: (campaign: Campaign) => void;
  onEditCampaignInfo?: (campaign: Campaign) => void;
  onDeleteCampaign?: (id: string) => void;
  initialCampaignId?: string | null;
  onClearInitialId?: () => void;
}

const Campaigns: React.FC<CampaignsProps> = ({ role, campaigns, influencers, onUpdateCampaign, onEditCampaignInfo, onDeleteCampaign, initialCampaignId, onClearInitialId }) => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState('CONTRATO');
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-open campaign if requested via prop
  React.useEffect(() => {
    if (initialCampaignId && campaigns.length > 0) {
      const found = campaigns.find(c => c.id === initialCampaignId);
      if (found) {
        // If the campaign is found, open its checklist modal
        setSelectedCampaign(found);
        setIsFinModalOpen(false); // Ensure we are opening the checklist, not the financial modal
        // Clear the ID so it doesn't reopen if we close it and component updates
        onClearInitialId?.();
      }
    }
  }, [initialCampaignId, campaigns, onClearInitialId]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'ALL' | 'ACTIVE_ONLY'>('ACTIVE_ONLY');

  const isAdmin = role === UserRole.ADMIN;

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = c.brand.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower);

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE_ONLY') {
        matchesStatus = c.status !== CampaignStatus.COMPLETED;
      } else if (statusFilter !== 'ALL') {
        matchesStatus = c.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);

  const handleLocalUpdate = (field: keyof Campaign, value: any) => {
    if (!selectedCampaign) return;
    const updated = { ...selectedCampaign, [field]: value };
    setSelectedCampaign(updated);
  };

  const handleToggleStatus = () => {
    if (!selectedCampaign) return;
    const isCurrentlyCompleted = selectedCampaign.status === CampaignStatus.COMPLETED;
    const newStatus = isCurrentlyCompleted ? CampaignStatus.EXECUTION : CampaignStatus.COMPLETED;
    handleLocalUpdate('status', newStatus);
  };

  const handleSaveChanges = async () => {
    if (!selectedCampaign || !onUpdateCampaign) return;
    setIsSaving(true);
    try {
      await onUpdateCampaign(selectedCampaign);
      if (selectedCampaign.status === CampaignStatus.COMPLETED) {
        setSelectedCampaign(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openDrive = (url?: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      alert("Pasta do Google Drive não configurada ou link inválido.");
    }
  };

  const tabs = [
    { id: 'CONTRATO', label: '1. Contrato' },
    { id: 'PRODUTO', label: '2. Produto' },
    { id: 'ROTEIRO', label: '3. Roteiro' },
    { id: 'CONTEUDO', label: '4. Conteúdo & Postagem' },
    { id: 'METRICAS', label: '6. Métricas' },
    { id: 'NF', label: '7. Nota Fiscal' },
    { id: 'REPASSE', label: '8. Repasse' },
    { id: 'OBS', label: '9. Obs' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Painel de Operações</h3>
          <p className="text-slate-500 text-sm">Controle de campanhas Littê</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text" placeholder="Filtrar campanhas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 w-56 transition-all"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ACTIVE_ONLY">Jobs Ativos</option>
            <option value="ALL">Histórico Completo</option>
            <option value={CampaignStatus.PLANNING}>Planejamento</option>
            <option value={CampaignStatus.EXECUTION}>Em Execução</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.length > 0 ? filteredCampaigns.map(campaign => {
          const mainInf = influencers.find(i => i.id === campaign.influencerIds[0]);
          return (
            <div key={campaign.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between group hover:shadow-lg hover:border-emerald-200 transition-all relative">
              {isAdmin && (
                <button onClick={() => onDeleteCampaign?.(campaign.id)} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white text-sm">✕</button>
              )}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-xs font-medium">{campaign.brand}</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${campaign.status === CampaignStatus.COMPLETED ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                    <p className="text-xs text-slate-400">{campaign.status}</p>
                  </div>
                </div>
                <h4 className="font-semibold text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[2.5rem]">{campaign.title}</h4>
                <div className="flex items-center gap-2.5 py-3 border-y border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-medium">{mainInf?.nome?.charAt(0) || '?'}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{mainInf?.nome || 'Não definido'}</p>
                    <p className="text-xs text-emerald-600">@{mainInf?.usuario || 'perfil'}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                <button onClick={() => { setSelectedCampaign(campaign); setActiveTab('CONTRATO'); setIsFinModalOpen(false); }} className="flex flex-col items-center justify-center py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all col-span-2 md:col-span-1">
                  <span className="text-base mb-0.5">📋</span>
                  <span className="text-[10px] font-medium">{isAdmin ? 'Checklist' : 'Ver Checklist'}</span>
                </button>
                {isAdmin && (
                  <button onClick={() => onEditCampaignInfo?.(campaign)} className="flex flex-col items-center justify-center py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
                    <span className="text-base mb-0.5">⚙️</span>
                    <span className="text-[10px] font-medium">Editar</span>
                  </button>
                )}
                <button onClick={() => { setSelectedCampaign(campaign); setIsFinModalOpen(true); }} className={`flex flex-col items-center justify-center py-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all ${isAdmin ? '' : 'col-span-2 md:col-span-1'}`}>
                  <span className="text-base mb-0.5">💰</span>
                  <span className="text-[10px] font-medium">Financeiro</span>
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => openDrive(campaign.driveLink)} className="flex flex-col items-center justify-center py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                      <span className="text-base mb-0.5">📂</span>
                      <span className="text-[10px] font-medium">Pasta</span>
                    </button>
                    {campaign.status !== CampaignStatus.COMPLETED && (
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja concluir este Job? Ele será movido para o histórico.')) {
                            onUpdateCampaign?.({ ...campaign, status: CampaignStatus.COMPLETED });
                          }
                        }}
                        className="flex flex-col items-center justify-center py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all col-span-4 mt-2"
                        title="Finalizar Job e Mover para Histórico"
                      >
                        <span className="text-base mb-0.5">✅</span>
                        <span className="text-[10px] font-medium">Concluir Job</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-sm text-slate-400">Nenhuma campanha ativa encontrada</p>
          </div>
        )}
      </div>

      {selectedCampaign && !isFinModalOpen && (
        <ModalBase
          title={selectedCampaign.title}
          subtitle={`Checklist Operacional: ${selectedCampaign.brand}`}
          onClose={() => setSelectedCampaign(null)}
          maxWidth="max-w-5xl"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {selectedCampaign.id.slice(0, 8)}</p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setSelectedCampaign(null)}>{isAdmin ? 'Cancelar' : 'Fechar'}</Button>
                {isAdmin && (
                  <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'SALVANDO...' : 'SALVAR CHECKLIST'}</Button>
                )}
              </div>
            </div>
          }
        >
          <div className="min-h-[400px]">
            {activeTab === 'CONTRATO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div className="space-y-4 col-span-full">
                  <label className="text-xs font-medium text-slate-500 block">Precisa de Contrato?</label>
                  <div className="flex gap-3">
                    {['Sim', 'Não'].map(opt => (
                      <button key={opt} onClick={() => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, precisaContrato: opt })}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${selectedCampaign.contrato.precisaContrato === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCampaign.contrato.precisaContrato === 'Sim' && (
                  <>
                    <FormField label="Status do Contrato">
                      <Select value={selectedCampaign.contrato.statusContrato} onChange={e => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, statusContrato: e.target.value })}>
                        <option value="Pendente">Pendente</option>
                        <option value="Em Análise">Em Análise</option>
                        <option value="Assinado">Assinado</option>
                      </Select>
                    </FormField>
                    <FormField label="Data Prevista"><Input type="date" value={selectedCampaign.contrato.contratoDataPrevista} onChange={e => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, contratoDataPrevista: e.target.value })} /></FormField>
                    <FormField label="Data Real de Assinatura"><Input type="date" value={selectedCampaign.contrato.contratoDataReal} onChange={e => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, contratoDataReal: e.target.value })} /></FormField>
                    <FormField label="Link do Contrato"><Input value={selectedCampaign.contrato.contratoLink} onChange={e => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, contratoLink: e.target.value })} placeholder="https://..." /></FormField>
                    <div className="col-span-full"><FormField label="Observações do Contrato"><Textarea value={selectedCampaign.contrato.contratoObservacoes} onChange={e => handleLocalUpdate('contrato', { ...selectedCampaign.contrato, contratoObservacoes: e.target.value })} /></FormField></div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'PRODUTO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6 col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Precisa de Envio de Produto?</label>
                  <div className="flex gap-4">
                    {['Sim', 'Não'].map(opt => (
                      <button key={opt} onClick={() => handleLocalUpdate('produto', { ...selectedCampaign.produto, precisaProduto: opt })}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${selectedCampaign.produto.precisaProduto === opt ? 'bg-[#1F7A5F] text-white border-[#1F7A5F] shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-[#1F7A5F]'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCampaign.produto.precisaProduto === 'Sim' && (
                  <>
                    <FormField label="Descrição do Item"><Input value={selectedCampaign.produto.nomeProduto} onChange={e => handleLocalUpdate('produto', { ...selectedCampaign.produto, nomeProduto: e.target.value })} placeholder="Ex: Câmera Mirrorless G7" /></FormField>
                    <FormField label="Status da Logística">
                      <Select value={selectedCampaign.produto.produtoStatus} onChange={e => handleLocalUpdate('produto', { ...selectedCampaign.produto, produtoStatus: e.target.value })}>
                        <option value="Não Enviado">Pendente de Envio</option>
                        <option value="Enviado">Enviado pela Marca</option>
                        <option value="Em Trânsito">Em Rota de Entrega</option>
                        <option value="Entregue">Recebido pelo Criador</option>
                      </Select>
                    </FormField>
                    <FormField label="Código de Rastreamento"><Input value={selectedCampaign.produto.produtoCodigoRastreio} onChange={e => handleLocalUpdate('produto', { ...selectedCampaign.produto, produtoCodigoRastreio: e.target.value })} /></FormField>
                    <FormField label="Data Real da Entrega"><Input type="date" value={selectedCampaign.produto.produtoDataEnvio} onChange={e => handleLocalUpdate('produto', { ...selectedCampaign.produto, produtoDataEnvio: e.target.value })} /></FormField>
                  </>
                )}
              </div>
            )}

            {activeTab === 'ROTEIRO' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <div className="space-y-6 col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Job Requer Roteiro Prévio?</label>
                  <div className="flex gap-4">
                    {['Sim', 'Não'].map(opt => (
                      <button key={opt} onClick={() => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, precisaRoteiro: opt })}
                        className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${selectedCampaign.roteiro.precisaRoteiro === opt ? 'bg-[#1F7A5F] text-white border-[#1F7A5F] shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-[#1F7A5F]'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCampaign.roteiro.precisaRoteiro === 'Sim' && (
                  <>
                    <FormField label="Estado do Roteiro">
                      <Select value={selectedCampaign.roteiro.roteiroStatus} onChange={e => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, roteiroStatus: e.target.value })}>
                        <option value="Não Iniciado">Não Iniciado</option>
                        <option value="Em Elaboração">Em Escrita</option>
                        <option value="Aguardando Aprovação">Enviado para Marca</option>
                        <option value="Aprovado">Aprovado p/ Gravação</option>
                      </Select>
                    </FormField>
                    <FormField label="Link do Documento (Google Docs)"><Input value={selectedCampaign.roteiro.roteiroPastaGoogleDocs} onChange={e => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, roteiroPastaGoogleDocs: e.target.value })} placeholder="https://docs.google.com/..." /></FormField>
                    <FormField label="Previsão de Envio"><Input type="date" value={selectedCampaign.roteiro.roteiroDataPrevista} onChange={e => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, roteiroDataPrevista: e.target.value })} /></FormField>
                    <FormField label="Data Real Aprovação"><Input type="date" value={selectedCampaign.roteiro.roteiroDataAprovacao} onChange={e => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, roteiroDataAprovacao: e.target.value })} /></FormField>
                    <div className="col-span-full"><FormField label="Feedback e Notas de Alteração"><Textarea value={selectedCampaign.roteiro.roteiroFeedbackCliente} onChange={e => handleLocalUpdate('roteiro', { ...selectedCampaign.roteiro, roteiroFeedbackCliente: e.target.value })} placeholder="Insira aqui as observações feitas pelo cliente..." /></FormField></div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'CONTEUDO' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-5">
                  <FormField label="Volume de Entregas (Qtd)">
                    <Input
                      type="number"
                      min="1"
                      value={selectedCampaign.conteudo.quantidadeConteudos}
                      onChange={e => {
                        const qty = Number(e.target.value);
                        const currentItems = selectedCampaign.conteudo.items || [];
                        let newItems = [...currentItems];

                        if (qty > currentItems.length) {
                          for (let i = currentItems.length; i < qty; i++) {
                            newItems.push({
                              id: generateUUID(),
                              title: `Conteúdo ${i + 1}`,
                              type: 'Reels',
                              status: 'Pendente',
                              postDate: '',
                              postLink: '',
                              driveLink: '',
                              platform: 'Instagram'
                            });
                          }
                        } else if (qty < currentItems.length) {
                          newItems = newItems.slice(0, qty);
                        }

                        handleLocalUpdate('conteudo', {
                          ...selectedCampaign.conteudo,
                          quantidadeConteudos: qty,
                          items: newItems
                        });
                      }}
                    />
                  </FormField>
                  <FormField label="Pasta de Produção (Drive/WeTransfer)"><Input value={selectedCampaign.conteudo.linkPastaConteudo} onChange={e => handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, linkPastaConteudo: e.target.value })} placeholder="Link da pasta com arquivos brutos" /></FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedCampaign.conteudo.items || []).map((item: any, index: number) => (
                    <div key={item.id || index} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <h5 className="font-bold text-slate-700 text-sm">Item #{index + 1}</h5>
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <FormField label="Tipo de Conteúdo">
                          <Select
                            value={item.type}
                            onChange={e => {
                              const newItems = [...(selectedCampaign.conteudo.items || [])];
                              newItems[index] = { ...item, type: e.target.value };
                              handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                            }}
                          >
                            <option value="Reels">Reels</option>
                            <option value="Stories">Stories (Sequência)</option>
                            <option value="Foto Feed">Foto Feed</option>
                            <option value="Carrossel">Carrossel</option>
                            <option value="TikTok">TikTok Video</option>
                            <option value="YouTube Shorts">YouTube Shorts</option>
                            <option value="YouTube Video">YouTube Video (Longo)</option>
                            <option value="Live">Live / Transmissão</option>
                          </Select>
                        </FormField>

                        <FormField label="Plataforma">
                          <Select
                            value={item.platform}
                            onChange={e => {
                              const newItems = [...(selectedCampaign.conteudo.items || [])];
                              newItems[index] = { ...item, platform: e.target.value };
                              handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                            }}
                          >
                            <option value="Instagram">Instagram</option>
                            <option value="TikTok">TikTok</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Twitter">Twitter / X</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Outros">Outros</option>
                          </Select>
                        </FormField>

                        <FormField label="Link do Material (Drive)">
                          <Input
                            value={item.driveLink}
                            onChange={e => {
                              const newItems = [...(selectedCampaign.conteudo.items || [])];
                              newItems[index] = { ...item, driveLink: e.target.value };
                              handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                            }}
                            placeholder="Link específico"
                          />
                        </FormField>

                        <FormField label="Status da Produção">
                          <Select
                            value={item.status}
                            onChange={e => {
                              const newItems = [...(selectedCampaign.conteudo.items || [])];
                              newItems[index] = { ...item, status: e.target.value };
                              handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                            }}
                          >
                            <option value="Pendente">A Fazer</option>
                            <option value="Em Produção">Produzindo</option>
                            <option value="Aguardando Aprovação">Em Aprovação</option>
                            <option value="Aprovado">Aprovado</option>
                            <option value="Agendado">Agendado</option>
                            <option value="Postado">Postado</option>
                          </Select>
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                          <FormField label="Data Postagem">
                            <Input
                              type="date"
                              value={item.postDate}
                              onChange={e => {
                                const newItems = [...(selectedCampaign.conteudo.items || [])];
                                newItems[index] = { ...item, postDate: e.target.value };
                                handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                              }}
                            />
                          </FormField>

                          <FormField label="Link Post">
                            <Input
                              value={item.postLink}
                              onChange={e => {
                                const newItems = [...(selectedCampaign.conteudo.items || [])];
                                newItems[index] = { ...item, postLink: e.target.value };
                                handleLocalUpdate('conteudo', { ...selectedCampaign.conteudo, items: newItems });
                              }}
                              placeholder="URL"
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'METRICAS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <FormField label="Status do Report">
                  <Select value={selectedCampaign.metricas.metricasStatus} onChange={e => handleLocalUpdate('metricas', { ...selectedCampaign.metricas, metricasStatus: e.target.value })}>
                    <option value="Pendente">Aguardando 24h/7d</option>
                    <option value="Coletado">Métricas Coletadas</option>
                    <option value="Enviado ao Cliente">Report Final Enviado</option>
                  </Select>
                </FormField>
                <FormField label="Link do Dashboard/Report"><Input value={selectedCampaign.metricas.linkPastaMetricas} onChange={e => handleLocalUpdate('metricas', { ...selectedCampaign.metricas, linkPastaMetricas: e.target.value })} placeholder="Link da apresentação de resultados" /></FormField>
                <FormField label="Data Limite Coleta"><Input type="date" value={selectedCampaign.metricas.metricasDataPrevista} onChange={e => handleLocalUpdate('metricas', { ...selectedCampaign.metricas, metricasDataPrevista: e.target.value })} /></FormField>
              </div>
            )}

            {activeTab === 'NF' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <FormField label="Fluxo de Faturamento">
                  <Select value={selectedCampaign.nf.nfStatus} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfStatus: e.target.value })}>
                    <option value="Pendente">Nota Não Emitida</option>
                    <option value="Emitida">Emitida / Aguardando Envio</option>
                    <option value="Enviada">Fatura Enviada p/ Financeiro</option>
                  </Select>
                </FormField>
                <FormField label="Número do Documento (NF)"><Input value={selectedCampaign.nf.nfNumero} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfNumero: e.target.value })} /></FormField>
                <FormField label="Data de Emissão"><Input type="date" value={selectedCampaign.nf.nfDataEmissao} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfDataEmissao: e.target.value })} /></FormField>
                <FormField label="Vencimento da Fatura"><Input type="date" value={selectedCampaign.nf.nfDataPrevistaPagamento} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfDataPrevistaPagamento: e.target.value })} /></FormField>
                <FormField label="Valor Bruto Faturado"><Input type="number" value={selectedCampaign.nf.nfValor} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfValor: Number(e.target.value) })} /></FormField>
                <FormField label="Link PDF da Nota"><Input value={selectedCampaign.nf.nfLinkPdf} onChange={e => handleLocalUpdate('nf', { ...selectedCampaign.nf, nfLinkPdf: e.target.value })} placeholder="Google Drive Link" /></FormField>
              </div>
            )}

            {activeTab === 'REPASSE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                <FormField label="Status do Repasse Littê">
                  <Select value={selectedCampaign.repasse.repasseStatus} onChange={e => handleLocalUpdate('repasse', { ...selectedCampaign.repasse, repasseStatus: e.target.value })}>
                    <option value="Pendente">Aguardando Liquidação Cliente</option>
                    <option value="Processando">Em Trânsito Bancário</option>
                    <option value="Pago">Repasse Confirmado</option>
                  </Select>
                </FormField>
                <FormField label="Data do Depósito"><Input type="date" value={selectedCampaign.repasse.repasseData} onChange={e => handleLocalUpdate('repasse', { ...selectedCampaign.repasse, repasseData: e.target.value })} /></FormField>
                <FormField label="Valor Líquido Criador (R$)"><Input type="number" value={selectedCampaign.repasse.repasseInfluenciador} onChange={e => handleLocalUpdate('repasse', { ...selectedCampaign.repasse, repasseInfluenciador: Number(e.target.value) })} /></FormField>
                <FormField label="Link do Comprovante"><Input value={selectedCampaign.repasse.repasseLinkComprovante} onChange={e => handleLocalUpdate('repasse', { ...selectedCampaign.repasse, repasseLinkComprovante: e.target.value })} placeholder="Link do print/pdf do PIX" /></FormField>
              </div>
            )}

            {activeTab === 'OBS' && (
              <div className="animate-in fade-in duration-300">
                <Textarea value={selectedCampaign.observacoesCampanha} onChange={e => handleLocalUpdate('observacoesCampanha', e.target.value)} placeholder="Notas internas sobre o andamento do job, dificuldades ou elogios da marca..." className="h-80" />
              </div>
            )}
          </div>
        </ModalBase>
      )}

      {selectedCampaign && isFinModalOpen && (
        <ModalBase title="Resumo Financeiro" subtitle={`Job: ${selectedCampaign.brand}`} onClose={() => setIsFinModalOpen(false)} footer={<Button onClick={() => setIsFinModalOpen(false)}>Fechar</Button>}>
          <div className="space-y-8 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Budget Total do Job</p><p className="text-3xl font-black text-slate-900">R$ {selectedCampaign.financial.grossValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Líquido Criador (80%)</p><p className="text-3xl font-black text-emerald-700">R$ {(selectedCampaign.financial.grossValue * 0.8).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
            </div>
            <div className="p-8 bg-slate-900 rounded-[32px] text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Comissão Littê (20%)</p>
                  <p className="text-2xl font-black">R$ {(selectedCampaign.financial.grossValue * 0.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Pagamento</p>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase">{selectedCampaign.financial.statusPagCliente}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setIsFinModalOpen(false)} className="w-full py-5 font-black uppercase tracking-[0.3em]">Sair da Visão Financeira</Button>
          </div>
        </ModalBase>
      )}
    </div>
  );
};

export default Campaigns;
