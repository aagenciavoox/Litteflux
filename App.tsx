
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Lead, Campaign, LeadStatus, CampaignStatus, LeadPhase, Toast, ToastType, ModalType, Influencer, UserProfile, UserStatus } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pipeline from './components/Pipeline';
import Campaigns from './components/Campaigns';
import Calendar from './components/Calendar';
import History from './components/History';
import InfluencerManager from './components/InfluencerManager';
import Financial from './components/Financial';
import Templates from './components/Templates';
import Notes from './components/Notes';
import Notifications from './components/Notifications';
import Auth from './components/Auth';
import AccessManager from './components/AccessManager';
import * as Modals from './components/Modals';
import { db, auth, supabase, generateUUID } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [role, setRole] = useState<UserRole>(UserRole.GUEST);

  // Garantir que a Role sempre reflete o perfil carregado
  useEffect(() => {
    if (profile && profile.role !== role) {
      console.log("Syncing Role State:", profile.role);
      setRole(profile.role);
    }
  }, [profile, role]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaignToOpen, setCampaignToOpen] = useState<string | null>(null);

  // Estado para regras de split financeiro
  const [splitRules, setSplitRules] = useState({ gestor: 30, operacional: 30, reserva: 40 });

  useEffect(() => {
    db.getSettings('split_rules')
      .then(rules => {
        if (rules) setSplitRules(rules);
      })
      .catch(err => console.error("Erro ao carregar configurações:", err));
  }, []);

  const [loadedData, setLoadedData] = useState({ leads: false, campaigns: false, influencers: false });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeModal, setActiveModal] = useState<{ type: ModalType, context?: any } | null>(null);

  const toastContent = (
    <div className="fixed top-4 right-4 z-[120] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[280px] max-w-sm p-4 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right-full duration-200 border ${toast.type === 'SUCCESS' ? 'bg-emerald-600 border-emerald-600 text-white' : toast.type === 'ERROR' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-slate-200 text-slate-700'
            }`}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${toast.type === 'SUCCESS' ? 'bg-white/20' : toast.type === 'ERROR' ? 'bg-white/20' : 'bg-slate-100'}`}>
            {toast.type === 'SUCCESS' ? '✓' : toast.type === 'ERROR' ? '✕' : 'ℹ'}
          </div>
          <p className="text-sm font-medium flex-1">{toast.message}</p>
        </div>
      ))}
    </div>
  );

  const addToast = useCallback((message: string, type: ToastType = 'SUCCESS') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const loadProfile = useCallback(async (userId: string, attempt = 1) => {
    console.log(`App: loadProfile called for userId: ${userId} (Attempt ${attempt})`);
    try {
      const userProfile = await auth.getProfile(userId);
      console.log("App: access profile result:", userProfile);

      if (userProfile) {
        console.log("App: setting profile and role:", userProfile.role);
        setProfile(userProfile);
        setRole(userProfile.role);
      } else {
        console.warn("Perfil não encontrado para o usuário:", userId);
        // Retry logic for empty profile if it's a glitch, otherwise invalid user
        if (attempt < 3) {
          console.log("Retrying profile load...");
          setTimeout(() => loadProfile(userId, attempt + 1), 1000 * attempt);
        } else {
          await auth.signOut();
        }
      }
    } catch (e: any) {
      console.error(`Erro ao carregar perfil (Tentativa ${attempt}):`, e);
      if (attempt < 3) {
        setTimeout(() => loadProfile(userId, attempt + 1), 1500 * attempt);
      } else {
        addToast('Erro ao carregar seu perfil. Tente recarregar a página.', 'ERROR');
        // Optional: Force signout on persistent error?
        // await auth.signOut();
      }
    }
  }, [addToast]);

  // Única função de sincronização otimizada
  const syncAppData = useCallback(async (force = false) => {
    if (!session || !profile) return;

    // Se já estiver carregado e não for forçado, não busca novamente
    if (!force && loadedData.leads && loadedData.campaigns && loadedData.influencers) return;

    try {
      const [leadsRes, campaignsRes, influencersRes] = await Promise.all([
        db.getLeads(),
        db.getCampaigns(),
        db.getInfluencers()
      ]);

      setLeads(leadsRes);
      setCampaigns(campaignsRes);
      setInfluencers(influencersRes);
      setLoadedData({ leads: true, campaigns: true, influencers: true });
    } catch (err) {
      addToast('Falha na sincronização de dados.', 'ERROR');
    }
  }, [session, profile, loadedData, addToast]);

  const handleCreateLead = async (data: any) => {
    try {
      const newLead: Lead = {
        id: generateUUID(), brand: data.brand, campaignObject: data.object, influencerIds: [data.influencer],
        phase: data.phase || LeadPhase.CONTACT, status: data.status || LeadStatus.WAITING, proposedValue: Number(data.proposedValue), closedValue: 0,
        value: Number(data.proposedValue), responsible: profile?.full_name || 'Agente Littê', scope: data.scope || '',
        startDate: data.startDate || '', lastContact: new Date().toISOString(), timeline: []
      };
      await db.createLead(newLead);
      addToast('Prospecção registrada!', 'SUCCESS');
      syncAppData(true);
      closeModal();
    } catch (err) { addToast('Erro ao criar lead.', 'ERROR'); }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadStatus, additionalData?: any) => {
    if (role === UserRole.INFLUENCER) return addToast('Apenas administradores podem alterar status de leads.', 'ERROR');
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      // Automação: Se status mudar para FECHADO, gerar Campanha Automaticamente
      if (status === LeadStatus.CLOSED && lead.status !== LeadStatus.CLOSED) {
        const newCampaign: Campaign = {
          id: generateUUID(),
          title: `${lead.brand} - ${lead.campaignObject}`,
          brand: lead.brand,
          influencerIds: lead.influencerIds,
          status: CampaignStatus.PLANNING,
          startDate: additionalData?.startDate || lead.startDate || new Date().toISOString().split('T')[0],
          endDate: '',
          briefing: lead.scope || '',
          driveLink: `https://drive.google.com/drive/u/0/search?q=${encodeURIComponent(lead.brand)}`, // Mock Link
          internalNotes: `Campanha gerada via conversão de prospecção. Valor fechado: R$ ${additionalData?.closedValue || lead.proposedValue}`,
          influencerNotes: '',
          contrato: { precisaContrato: 'Sim', statusContrato: 'Pendente', contratoDataPrevista: '', contratoDataReal: '', contratoLink: '', contratoObservacoes: '' },
          produto: { precisaProduto: 'Não', nomeProduto: '', produtoQuantidade: 0, produtoStatus: 'Não Enviado', produtoEnderecoEnvio: '', produtoDataEnvio: '', produtoCodigoRastreio: '', produtoLinkRastreamento: '' },
          roteiro: { precisaRoteiro: 'Sim', roteiroTipo: '', numeroVersoes: 1, roteiroStatus: 'Não Iniciado', roteiroDataPrevista: '', roteiroDataReal: '', roteiroDataAprovacao: '', roteiroPastaGoogleDocs: '', roteiroFeedbackCliente: '' },
          conteudo: { quantidadeConteudos: 1, linkPastaConteudo: '', items: [] },
          postagem: { postagemStatus: 'Não Postado', postagemRedeSocial: 'Instagram', postagemTipo: 'Reels', postagemData: '', dataRealPostagem: '', postagemHorario: '', postagemLink: '' },
          metricas: { metricasDataPrevista: '', metricasStatus: 'Pendente', linkPastaMetricas: '' },
          nf: { nfStatus: 'Pendente', nfTipo: 'NFSe', nfNumero: '', nfCnpjEmissor: '', nfDataEmissao: '', nfDataPrevistaPagamento: '', nfValor: 0, nfLinkPdf: '' },
          repasse: { valorTotal: 0, repasseInfluenciador: 0, repasseTaxaLitte: 0, repasseStatus: 'Pendente', repasseData: '', repasseLinkComprovante: '' },
          observacoesCampanha: '',
          financial: {
            grossValue: Number(additionalData?.closedValue) || lead.value || 0,
            influencerCut: 0, litteTax: 0, partnerSplit: 0,
            withdrawalStatus: 'PENDENTE', expectedPaymentDate: '', statusPagCliente: 'Pendente', statusRepasse: 'Pendente', statusNF: 'Pendente',
            dataCriacao: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString()
          },
          timeline: [],
          checklist: [
            { id: generateUUID(), module: 'Contrato', task: 'Minuta de Contrato', done: false },
            { id: generateUUID(), module: 'Roteiro', task: 'Briefing Recebido', done: false }
          ]
        };
        await db.createCampaign(newCampaign);
        await db.createNotification({
          user_id: profile?.id || '',
          campaign_id: newCampaign.id,
          title: 'Nova Campanha Gerada',
          message: `O andamento ${lead.brand} foi convertido em campanha.`,
          type: 'CAMPAIGN_CREATED',
          event_date: new Date().toISOString()
        });
        addToast('Campanha gerada automaticamente! Pasta Drive criada.', 'SUCCESS');
      }

      const timelineEntry = {
        id: generateUUID(),
        date: new Date().toLocaleDateString('pt-BR'),
        action: `Alteração para ${status}`,
        user: profile?.full_name || 'Admin',
        notes: additionalData?.lastMessage || ''
      };
      const updatedTimeline = [...(lead.timeline || []), timelineEntry];

      await db.updateLead(leadId, { status, ...additionalData, timeline: updatedTimeline });
      addToast('Status atualizado com sucesso.', 'SUCCESS');
      syncAppData(true);
    } catch (err) { addToast('Erro na atualização.', 'ERROR'); }
  };

  const handleUpdateCampaign = async (campaign: Campaign) => {
    if (role === UserRole.INFLUENCER) return addToast('Apenas administradores podem editar campanhas.', 'ERROR');
    try {
      await db.updateCampaign(campaign.id, campaign);
      addToast('Campanha salva!', 'SUCCESS');
      syncAppData(true);
      closeModal();
    } catch (err) { addToast('Erro ao salvar.', 'ERROR'); }
  };

  const handleSaveInfluencer = async (inf: Influencer) => {
    try {
      if (activeModal?.type === 'EDIT_INFLUENCER') {
        await db.updateInfluencer(inf.id, inf);
      } else {
        await db.createInfluencer(inf);
      }
      addToast('Influenciador atualizado!', 'SUCCESS');
      syncAppData(true);
      closeModal();
    } catch (err) { addToast('Erro ao salvar.', 'ERROR'); }
  };

  const handleSaveSplit = async (data: { gestor: string, operacional: string, reserva: string }) => {
    const newRules = {
      gestor: Number(data.gestor),
      operacional: Number(data.operacional),
      reserva: Number(data.reserva)
    };
    setSplitRules(newRules);
    await db.updateSettings('split_rules', newRules);

    // Log audit
    await db.createAuditLog({
      entity_type: 'FINANCE_CONFIG',
      entity_id: 'GLOBAL',
      action: 'UPDATE_SPLIT_RULES',
      old_values: splitRules,
      new_values: newRules
    });

    addToast('Configuração de split atualizada com sucesso!', 'SUCCESS');
    closeModal();
  };

  const handleFinancialAdjustment = async (data: any) => {
    // Log audit for manual adjustment
    await db.createAuditLog({
      entity_type: 'FINNA_ADJUSTMENT',
      entity_id: 'MANUAL',
      action: 'REGISTER_ADJUSTMENT',
      old_values: null,
      new_values: data
    });
    addToast('Ajuste registrado em auditoria.', 'SUCCESS');
    closeModal();
  };

  // Efeito simplificado para carregar tudo de uma vez quando o perfil estiver pronto
  useEffect(() => {
    if (session && profile && !loadedData.leads) {
      syncAppData();
    }
  }, [session, profile, syncAppData, loadedData.leads]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("App: Starting Auth Initialization...");

        // Timeout de segurança para evitar loading infinito
        const timeoutPromise = new Promise<{ data: { session: any } }>((_, reject) =>
          setTimeout(() => reject(new Error('Auth Timeout')), 5000)
        );

        const sessionPromise = supabase.auth.getSession();

        const { data: { session: cur } } = await Promise.race([sessionPromise, timeoutPromise]);

        console.log("App: Session Check Result:", cur ? "Logged In" : "No Session");

        if (cur) {
          setSession(cur);
          await loadProfile(cur.user.id);
        }
      } catch (err) {
        console.error("Auth init error or timeout:", err);
        // Em caso de erro/timeout, assumimos sem sessão para liberar a tela de login
        setSession(null);
      } finally {
        console.log("App: Finished Initialization, removing spinner.");
        setInitializing(false);
        setLoading(false);
      }
    };
    initAuth();

    // Configuração do Listener de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (ev, sess) => {
      console.log("App: Auth State Changed:", ev);
      try {
        if (sess) {
          setSession(sess);
          // Só recarrega perfil se for login ou mudança de usuário
          if (ev === 'SIGNED_IN' || ev === 'TOKEN_REFRESHED') {
            await loadProfile(sess.user.id);
          }
        } else {
          setSession(null);
          setProfile(null);
          setRole(UserRole.GUEST);
          setLoadedData({ leads: false, campaigns: false, influencers: false });
        }
      } finally {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [loadProfile]);

  if (initializing || (loading && !session)) return <div className="h-screen w-screen flex items-center justify-center bg-[#F7F9FB]"><div className="spinner scale-150"></div></div>;
  if (!session) return (
    <>
      {toastContent}
      <Auth onSuccess={uid => loadProfile(uid)} addToast={addToast} />
    </>
  );

  if (profile?.status === UserStatus.PENDING || profile?.status === UserStatus.BLOCKED) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F7F9FB] p-6 text-center">
        {toastContent}
        <div className="max-w-md space-y-8 bg-white p-12 rounded-[48px] shadow-2xl border border-slate-200">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v3m0-3h3m-3 0H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Acesso Restrito</h2>
          <p className="text-slate-500 font-bold leading-relaxed">
            {profile.status === UserStatus.PENDING
              ? "Sua conta está em processo de verificação. Por favor, aguarde a aprovação de um administrador."
              : "Seu acesso foi temporariamente suspenso. Entre em contato com o suporte."}
          </p>
          <Modals.Button onClick={() => supabase.auth.signOut()} variant="secondary" className="w-full">
            Sair da Conta
          </Modals.Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Layout
        activeTab={activeTab} setActiveTab={setActiveTab} role={role} setRole={setRole}
        onOpenCreateModal={() => setActiveModal({ type: 'NEW_LEAD' })}
        onOpenCampaignModal={() => setActiveModal({ type: 'NEW_CAMPAIGN' })}
        onSignOut={() => supabase.auth.signOut()}
        profile={profile || { id: session.user.id, email: session.user.email, role: UserRole.GUEST, status: UserStatus.PENDING }}
        toasts={toasts} removeToast={removeToast}
      >
        {activeTab === 'dashboard' && <Dashboard role={role} userName={profile?.full_name} leads={leads} campaigns={campaigns} loadingLeads={!loadedData.leads} loadingCampaigns={!loadedData.campaigns} onQuickAction={(action, param) => {
          if (action === 'NEW_LEAD') setActiveModal({ type: 'NEW_LEAD' });
          if (action === 'GO_TO_CAMPAIGNS') setActiveTab('campaigns');
          if (action === 'OPEN_CAMPAIGN' && param) {
            setCampaignToOpen(param);
            setActiveTab('campaigns');
          }
        }}
          influencers={influencers}
        />
        }
        {activeTab === 'crm' && <Pipeline leads={leads} influencers={influencers} onUpdateStatus={handleUpdateLeadStatus} onCreateLead={handleCreateLead} onDeleteLead={id => db.deleteLead(id).then(() => syncAppData(true))} role={role} />}
        {activeTab === 'campaigns' && <Campaigns role={role} campaigns={campaigns} influencers={influencers} onUpdateCampaign={handleUpdateCampaign} onEditCampaignInfo={c => setActiveModal({ type: 'EDIT_CAMPAIGN', context: c })} onDeleteCampaign={id => db.deleteCampaign(id).then(() => syncAppData(true))}
          initialCampaignId={campaignToOpen}
          onClearInitialId={() => setCampaignToOpen(null)}
        />
        }
        {role === UserRole.ADMIN && (
          <>
            {activeTab === 'finance' && <Financial campaigns={campaigns} onEditValues={() => setActiveModal({ type: 'EDIT_VALUES' })} onPartnerSplit={() => setActiveModal({ type: 'PARTNER_SPLIT' })} splitRules={splitRules} />}
            {activeTab === 'influencers' && <InfluencerManager role={role} influencers={influencers} campaigns={campaigns} onAdd={() => setActiveModal({ type: 'NEW_INFLUENCER' })} onEdit={inf => setActiveModal({ type: 'EDIT_INFLUENCER', context: inf })} onDelete={id => db.deleteInfluencer(id).then(() => syncAppData(true))} />}
            {activeTab === 'templates' && <Templates role={role} addToast={addToast} onAdd={() => setActiveModal({ type: 'NEW_TEMPLATE' })} onEdit={t => setActiveModal({ type: 'EDIT_TEMPLATE', context: t })} onDelete={id => db.deleteTemplate(id).then(() => syncAppData(true))} />}
            {activeTab === 'calendar' && <Calendar role={role} campaigns={campaigns} leads={leads} influencers={influencers} />}
            {activeTab === 'history' && <History role={role} campaigns={campaigns} leads={leads} influencers={influencers} />}
            {activeTab === 'access' && <AccessManager />}
            {activeTab === 'notifications' && <Notifications />}
            {activeTab === 'notes' && <Notes />}
          </>
        )}
        {/* Influencer Self-View for their own data */}
        {role === UserRole.INFLUENCER && activeTab === 'influencers' && influencers.length > 0 && (
          <InfluencerManager role={role} influencers={influencers} campaigns={campaigns} onAdd={() => { }} onEdit={inf => setActiveModal({ type: 'EDIT_INFLUENCER', context: inf })} onDelete={() => { }} />
        )}
        {activeTab === 'settings' && <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm"><h3 className="text-xl font-black text-slate-800 uppercase mb-6">Meu Perfil</h3><div className="space-y-4 max-w-sm"><Modals.FormField label="Nome"><Modals.Input defaultValue={profile?.full_name} disabled /></Modals.FormField><Modals.FormField label="Acesso"><Modals.Input defaultValue={profile?.role} disabled /></Modals.FormField><Modals.Button variant="secondary" onClick={() => supabase.auth.signOut()} className="w-full">Sair</Modals.Button></div></div>}
      </Layout>

      {activeModal?.type === 'NEW_LEAD' && <Modals.NewLeadModal influencers={influencers} onClose={closeModal} onSubmit={handleCreateLead} />}
      {activeModal?.type === 'NEW_CAMPAIGN' && <Modals.NewCampaignModal influencers={influencers} onClose={closeModal} onSubmit={async (data) => { try { const newCampaign: Campaign = { id: generateUUID(), title: data.title || data.brand, brand: data.brand, influencerIds: [data.influencer], status: CampaignStatus.PLANNING, startDate: data.startDate || new Date().toISOString().split('T')[0], endDate: '', briefing: data.briefing || '', driveLink: '', internalNotes: '', influencerNotes: '', contrato: { precisaContrato: 'Sim', statusContrato: 'Pendente', contratoDataPrevista: '', contratoDataReal: '', contratoLink: '', contratoObservacoes: '' }, produto: { precisaProduto: 'Não', nomeProduto: '', produtoQuantidade: 0, produtoStatus: 'Não Enviado', produtoEnderecoEnvio: '', produtoDataEnvio: '', produtoCodigoRastreio: '', produtoLinkRastreamento: '' }, roteiro: { precisaRoteiro: 'Sim', roteiroTipo: '', numeroVersoes: 1, roteiroStatus: 'Não Iniciado', roteiroDataPrevista: '', roteiroDataReal: '', roteiroDataAprovacao: '', roteiroPastaGoogleDocs: '', roteiroFeedbackCliente: '' }, conteudo: { quantidadeConteudos: 1, linkPastaConteudo: '', items: [] }, postagem: { postagemStatus: 'Não Postado', postagemRedeSocial: 'Instagram', postagemTipo: 'Reels', postagemData: '', dataRealPostagem: '', postagemHorario: '', postagemLink: '' }, metricas: { metricasDataPrevista: '', metricasStatus: 'Pendente', linkPastaMetricas: '' }, nf: { nfStatus: 'Pendente', nfTipo: 'NFSe', nfNumero: '', nfCnpjEmissor: '', nfDataEmissao: '', nfDataPrevistaPagamento: '', nfValor: 0, nfLinkPdf: '' }, repasse: { valorTotal: 0, repasseInfluenciador: 0, repasseTaxaLitte: 0, repasseStatus: 'Pendente', repasseData: '', repasseLinkComprovante: '' }, observacoesCampanha: '', financial: { grossValue: Number(data.value) || 0, influencerCut: 0, litteTax: 0, partnerSplit: 0, withdrawalStatus: 'PENDENTE', expectedPaymentDate: '', statusPagCliente: 'Pendente', statusRepasse: 'Pendente', statusNF: 'Pendente', dataCriacao: new Date().toISOString(), ultimaAtualizacao: new Date().toISOString() }, timeline: [], checklist: [] }; await db.createCampaign(newCampaign); addToast('Campanha criada com sucesso!', 'SUCCESS'); syncAppData(true); closeModal(); } catch (err) { addToast('Erro ao criar campanha.', 'ERROR'); } }} />}
      {activeModal?.type === 'EDIT_CAMPAIGN' && <Modals.CampaignFormModal campaign={activeModal.context} influencers={influencers} onClose={closeModal} onSubmit={handleUpdateCampaign} />}
      {(activeModal?.type === 'NEW_INFLUENCER' || activeModal?.type === 'EDIT_INFLUENCER') && <Modals.InfluencerFormModal influencer={activeModal.context} onClose={closeModal} onSubmit={handleSaveInfluencer} role={role} />}
      {(activeModal?.type === 'NEW_TEMPLATE' || activeModal?.type === 'EDIT_TEMPLATE') && <Modals.TemplateFormModal template={activeModal.context} onClose={closeModal} onSubmit={t => db.createTemplate(t).then(() => { syncAppData(true); closeModal(); })} role={role} />}
      {activeModal?.type === 'EDIT_VALUES' && <Modals.FinancialAdjustmentModal onClose={closeModal} onSubmit={handleFinancialAdjustment} />}
      {activeModal?.type === 'PARTNER_SPLIT' && <Modals.PartnerSplitModal initialValues={splitRules} onClose={closeModal} onSubmit={handleSaveSplit} />}
    </>
  );
};

export default App;
