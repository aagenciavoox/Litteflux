
import React, { useState, useMemo } from 'react';
import { Influencer, UserRole, Campaign } from '../types';
import { ModalBase, Button } from './Modals';

interface InfluencerManagerProps {
  role: UserRole;
  influencers: Influencer[];
  campaigns: Campaign[];
  onAdd: () => void;
  onEdit: (influencer: Influencer) => void;
  onDelete?: (id: string) => void;
}

const InfluencerManager: React.FC<InfluencerManagerProps> = ({ role, influencers, campaigns, onAdd, onEdit, onDelete }) => {
  const [selectedInf, setSelectedInf] = useState<Influencer | null>(null);
  const [viewMode, setViewMode] = useState<'GERAL' | 'PESSOAL'>('GERAL');
  const [searchTerm, setSearchTerm] = useState('');
  const isAdmin = role === UserRole.ADMIN;

  const filteredInfluencers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return influencers.filter(inf =>
      inf.nome.toLowerCase().includes(searchLower) ||
      inf.usuario.toLowerCase().includes(searchLower)
    );
  }, [influencers, searchTerm]);

  const influencerCampaigns = useMemo(() => {
    if (!selectedInf) return [];
    return campaigns.filter(c => c.influencerIds.includes(selectedInf.id));
  }, [selectedInf, campaigns]);

  const handleOpenDrive = (url: string) => {
    if (url) window.open(url, '_blank');
  };

  const DetailItem = ({ label, value }: { label: string, value?: string | number }) => (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || '---'}</p>
    </div>
  );

  const formatDate = (d: string) => {
    if (!d) return '---';
    try { return new Date(d).toLocaleDateString('pt-BR'); } catch { return d; }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Base de Assessorados</h3>
          <p className="text-slate-500 text-sm">Gestão de Criadores</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Buscar por nome ou @usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-all"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
            )}
          </div>
          {isAdmin && (
            <button onClick={onAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-all shrink-0">
              Novo Assessorado
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInfluencers.length > 0 ? filteredInfluencers.map((inf) => (
          <div key={inf.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between group hover:shadow-lg hover:border-emerald-200 transition-all relative">
            {isAdmin && (
              <button onClick={() => onDelete?.(inf.id)} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white text-sm">✕</button>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">{inf.nome.charAt(0)}</div>
                <div>
                  <h4 className="font-semibold text-slate-800 leading-tight">{inf.nome}</h4>
                  <p className="text-xs text-emerald-600 font-medium">@{inf.usuario}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${inf.status === 'Ativo' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{inf.status}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 text-center">📧</span>
                  <span className="truncate">{inf.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 text-center">📱</span>
                  <span>{inf.telefone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-4 text-center">📅</span>
                  <span>Cadastrado em {formatDate(inf.dataCadastro)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-5">
              <button onClick={() => { setSelectedInf(inf); setViewMode('GERAL'); }} className="col-span-1 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all text-xs font-medium">
                Detalhes
              </button>
              {(isAdmin || role === UserRole.INFLUENCER) && (
                <button onClick={() => onEdit(inf)} className="py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-xs font-medium">
                  Editar
                </button>
              )}
              <button onClick={() => handleOpenDrive(inf.urlPastaDrive)} className="py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs font-medium flex items-center justify-center gap-1">
                <span>📂</span> Drive
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-sm text-slate-400">Nenhum assessorado encontrado</p>
          </div>
        )}
      </div>

      {selectedInf && (
        <ModalBase
          title={selectedInf.nome}
          subtitle={`@${selectedInf.usuario}`}
          onClose={() => setSelectedInf(null)}
          maxWidth="max-w-4xl"
          tabs={[
            { id: 'GERAL', label: 'Visão Geral' },
            { id: 'PESSOAL', label: 'Informações Pessoais' }
          ]}
          activeTab={viewMode}
          onTabChange={(id) => setViewMode(id as any)}
          footer={
            <div className="flex items-center gap-3 w-full justify-between">
              <div className="flex gap-2">
                {(isAdmin || role === UserRole.INFLUENCER) && (
                  <Button variant="secondary" onClick={() => { onEdit(selectedInf); setSelectedInf(null); }}>
                    Editar Cadastro
                  </Button>
                )}
                <Button variant="secondary" onClick={() => handleOpenDrive(selectedInf.urlPastaDrive)}>
                  Abrir Drive
                </Button>
              </div>
              <Button onClick={() => setSelectedInf(null)}>Fechar</Button>
            </div>
          }
        >
          {viewMode === 'GERAL' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DetailItem label="ID" value={selectedInf.id} />
                <DetailItem label="Status" value={selectedInf.status} />
                <DetailItem label="Data de Cadastro" value={formatDate(selectedInf.dataCadastro)} />
                <DetailItem label="Idade" value={selectedInf.idade ? `${selectedInf.idade} anos` : undefined} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Email" value={selectedInf.email} />
                <DetailItem label="Telefone" value={selectedInf.telefone} />
                <DetailItem label="Pasta Drive" value={selectedInf.urlPastaDrive ? 'Configurada' : 'Não configurada'} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <DetailItem label="Camiseta" value={selectedInf.camiseta} />
                <DetailItem label="Calça" value={selectedInf.calca} />
                <DetailItem label="Sapato" value={selectedInf.sapato} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Campanhas Vinculadas</p>
                {influencerCampaigns.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {influencerCampaigns.map(c => (
                      <span key={c.id} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded">{c.brand} - {c.title}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Nenhuma campanha vinculada</p>
                )}
              </div>
            </div>
          )}
          {viewMode === 'PESSOAL' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Dados Pessoais</h4>
              <div className="grid grid-cols-3 gap-6">
                <DetailItem label="CPF" value={selectedInf.cpf} />
                <DetailItem label="RG" value={selectedInf.rg} />
                <DetailItem label="CNPJ" value={selectedInf.cnpj} />
              </div>
              <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Endereço</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DetailItem label="Destinatário" value={selectedInf.enderecoNome} />
                <DetailItem label="Rua" value={selectedInf.rua} />
                <DetailItem label="Número" value={selectedInf.numero} />
                <DetailItem label="Complemento" value={selectedInf.complemento} />
                <DetailItem label="Bairro" value={selectedInf.bairro} />
                <DetailItem label="Cidade" value={selectedInf.cidade} />
                <DetailItem label="Estado" value={selectedInf.estado} />
                <DetailItem label="CEP" value={selectedInf.cep} />
              </div>
              <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Dados Bancários</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Tipo" value={selectedInf.bancoTipo} />
                <DetailItem label="Banco" value={selectedInf.bancoNome} />
                <DetailItem label="Agência" value={selectedInf.bancoAgencia} />
                <DetailItem label="Conta" value={selectedInf.bancoConta} />
                <DetailItem label="Chave PIX" value={selectedInf.bancoPix} />
              </div>
              <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Testemunha</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Nome" value={selectedInf.testemunhaNome} />
                <DetailItem label="Email" value={selectedInf.testemunhaEmail} />
                <DetailItem label="Telefone" value={selectedInf.testemunhaTelefone} />
                <DetailItem label="CPF" value={selectedInf.testemunhaCpf} />
                <DetailItem label="RG" value={selectedInf.testemunhaRg} />
              </div>
              <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Pessoa Jurídica</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <DetailItem label="Razão Social" value={selectedInf.pjRazaoSocial} />
                <DetailItem label="CNPJ" value={selectedInf.pjCnpj} />
                <DetailItem label="Data de Criação" value={selectedInf.pjDataCriacao} />
                <DetailItem label="Email" value={selectedInf.pjEmail} />
                <DetailItem label="Endereço" value={selectedInf.pjEndereco} />
                <DetailItem label="Inscrição Municipal" value={selectedInf.pjInscricaoMunicipal} />
                <DetailItem label="Inscrição Estadual" value={selectedInf.pjInscricaoEstadual} />
              </div>
              {selectedInf.observacoes && (
                <>
                  <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2">Observações</h4>
                  <p className="text-sm text-slate-600">{selectedInf.observacoes}</p>
                </>
              )}
            </div>
          )}
        </ModalBase>
      )}
    </div>
  );
};

export default InfluencerManager;
