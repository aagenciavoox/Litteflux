import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { Lead, Campaign, Influencer, UserProfile, Template, UserRole } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zfjfonvjfjtqmhfjjfua.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jWM31YiwKgt6DfGrG-Adpg_S2NCwwLM';

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY === 'PLACEHOLDER') {
  console.error("Supabase credentials missing or invalid. Check your MPC integration.");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mapLeadToFE = (dbLead: any): Lead => ({
  id: dbLead.id,
  brand: dbLead.brand || '',
  campaignObject: dbLead.campaign_object || '',
  influencerIds: Array.isArray(dbLead.influencer_ids) ? dbLead.influencer_ids : [],
  proposedValue: Number(dbLead.proposed_value) || 0,
  closedValue: Number(dbLead.closed_value) || 0,
  value: Number(dbLead.value) || 0,
  phase: dbLead.phase as any,
  status: dbLead.status as any,
  responsible: dbLead.responsible || '',
  scope: dbLead.scope || '',
  startDate: dbLead.start_date || '',
  lastContact: dbLead.last_contact || '',
  timeline: Array.isArray(dbLead.timeline) ? dbLead.timeline : [],
  createdAt: dbLead.created_at || new Date().toISOString()
});

const mapCampaignToFE = (dbCamp: any): Campaign => {
  // Garantir estruturas mínimas para rotinas automáticas de UI
  const defaultContrato = { precisaContrato: 'Sim', statusContrato: 'Pendente', contratoDataPrevista: '', contratoDataReal: '', contratoLink: '', contratoObservacoes: '' };
  const defaultProduto = { precisaProduto: 'Não', nomeProduto: '', produtoQuantidade: 0, produtoStatus: 'Não Enviado', produtoEnderecoEnvio: '', produtoDataEnvio: '', produtoCodigoRastreio: '', produtoLinkRastreamento: '' };
  const defaultRoteiro = { precisaRoteiro: 'Sim', roteiroTipo: '', numeroVersoes: 1, roteiroStatus: 'Não Iniciado', roteiroDataPrevista: '', roteiroDataReal: '', roteiroDataAprovacao: '', roteiroPastaGoogleDocs: '', roteiroFeedbackCliente: '' };
  const defaultConteudo = { quantidadeConteudos: 1, linkPastaConteudo: '', items: [] };
  const defaultPostagem = { postagemStatus: 'Não Postado', postagemRedeSocial: 'Instagram', postagemTipo: 'Reels', postagemData: '', dataRealPostagem: '', postagemHorario: '', postagemLink: '' };
  const defaultMetricas = { metricasDataPrevista: '', metricasStatus: 'Pendente', linkPastaMetricas: '' };
  const defaultNF = { nfStatus: 'Pendente', nfTipo: 'NFSe', nfNumero: '', nfCnpjEmissor: '', nfDataEmissao: '', nfDataPrevistaPagamento: '', nfValor: 0, nfLinkPdf: '' };
  const defaultRepasse = { valorTotal: 0, repasseInfluenciador: 0, repasseTaxaLitte: 0, repasseStatus: 'Pendente', repasseData: '', repasseLinkComprovante: '' };
  const defaultFinancial = { grossValue: 0, influencerCut: 0, litteTax: 0, partnerSplit: 0, withdrawalStatus: 'PENDENTE', expectedPaymentDate: '', statusPagCliente: 'Pendente', statusRepasse: 'Pendente', statusNF: 'Pendente', dataCriacao: '', ultimaAtualizacao: '' };

  return {
    id: dbCamp.id,
    title: dbCamp.title || '',
    brand: dbCamp.brand || '',
    influencerIds: Array.isArray(dbCamp.influencer_ids) ? dbCamp.influencer_ids : [],
    status: dbCamp.status as any,
    startDate: dbCamp.start_date || '',
    endDate: dbCamp.end_date || '',
    briefing: dbCamp.briefing || '',
    driveLink: dbCamp.drive_link || '',
    internalNotes: dbCamp.internal_notes || '',
    influencerNotes: dbCamp.influencer_notes || '',
    contrato: { ...defaultContrato, ...dbCamp.contrato },
    produto: { ...defaultProduto, ...dbCamp.produto },
    roteiro: { ...defaultRoteiro, ...dbCamp.roteiro },
    conteudo: { ...defaultConteudo, ...dbCamp.conteudo },
    postagem: { ...defaultPostagem, ...dbCamp.postagem },
    metricas: { ...defaultMetricas, ...dbCamp.metricas },
    nf: { ...defaultNF, ...dbCamp.nf },
    repasse: { ...defaultRepasse, ...dbCamp.repasse },
    observacoesCampanha: dbCamp.observacoes_campanha || '',
    financial: { ...defaultFinancial, ...dbCamp.financial },
    checklist: Array.isArray(dbCamp.checklist) ? dbCamp.checklist : [],
    timeline: Array.isArray(dbCamp.timeline) ? dbCamp.timeline : []
  };
};

const mapInfluencerToFE = (dbInf: any): Influencer => ({
  id: dbInf.id,
  nome: dbInf.nome || '',
  usuario: dbInf.usuario || '',
  email: dbInf.email || '',
  telefone: dbInf.telefone || '',
  status: dbInf.status || 'Ativo',
  dataCadastro: dbInf.data_cadastro || '',
  urlPastaDrive: dbInf.url_pasta_drive || '',
  idade: dbInf.idade,
  avatar: dbInf.avatar,
  camiseta: dbInf.camiseta,
  calca: dbInf.calca,
  sapato: dbInf.sapato,
  enderecoNome: dbInf.endereco_nome,
  rua: dbInf.rua,
  numero: dbInf.numero,
  complemento: dbInf.complemento,
  bairro: dbInf.bairro,
  cidade: dbInf.cidade,
  estado: dbInf.estado,
  cep: dbInf.cep,
  cpf: dbInf.cpf,
  rg: dbInf.rg,
  cnpj: dbInf.cnpj,
  testemunhaNome: dbInf.testemunha_nome,
  testemunhaEmail: dbInf.testemunha_email,
  testemunhaTelefone: dbInf.testemunha_telefone,
  testemunhaCpf: dbInf.testemunha_cpf,
  testemunhaRg: dbInf.testemunha_rg,
  pjRazaoSocial: dbInf.pj_razao_social,
  pjCnpj: dbInf.pj_cnpj,
  pjDataCriacao: dbInf.pj_data_criacao || '',
  pjEmail: dbInf.pj_email,
  pjEndereco: dbInf.pj_endereco,
  pjInscricaoMunicipal: dbInf.pj_inscricao_municipal,
  pjInscricaoEstadual: dbInf.pj_inscricao_estadual,
  bancoTipo: (dbInf.banco_tipo as 'PF' | 'PJ') || 'PF',
  bancoNome: dbInf.banco_nome,
  bancoAgencia: dbInf.banco_agencia,
  bancoConta: dbInf.banco_conta,
  bancoPix: dbInf.banco_pix,
  observacoes: dbInf.observacoes,
  created_at: dbInf.created_at
});

const mapLeadToDB = (lead: Partial<Lead>) => {
  const db: any = {};
  if (lead.id) db.id = lead.id;
  if (lead.brand) db.brand = lead.brand;
  if (lead.campaignObject) db.campaign_object = lead.campaignObject;
  if (lead.influencerIds) db.influencer_ids = lead.influencerIds;
  if (lead.proposedValue !== undefined) db.proposed_value = lead.proposedValue;
  if (lead.closedValue !== undefined) db.closed_value = lead.closedValue;
  if (lead.value !== undefined) db.value = lead.value;
  if (lead.phase) db.phase = lead.phase;
  if (lead.status) db.status = lead.status;
  if (lead.responsible) db.responsible = lead.responsible;
  if (lead.scope) db.scope = lead.scope;
  if (lead.startDate) db.start_date = lead.startDate;
  if (lead.lastContact) db.last_contact = lead.lastContact;
  if (lead.timeline) db.timeline = lead.timeline;
  return db;
};

const mapCampaignToDB = (camp: Partial<Campaign>) => {
  const db: any = {};
  if (camp.id) db.id = camp.id;
  if (camp.title) db.title = camp.title;
  if (camp.brand) db.brand = camp.brand;
  if (camp.influencerIds) db.influencer_ids = camp.influencerIds;
  if (camp.status) db.status = camp.status;
  if (camp.startDate) db.start_date = camp.startDate;
  if (camp.endDate) db.end_date = camp.endDate;
  if (camp.briefing) db.briefing = camp.briefing;
  if (camp.driveLink !== undefined) db.drive_link = camp.driveLink;
  if (camp.internalNotes !== undefined) db.internal_notes = camp.internalNotes;
  if (camp.influencerNotes !== undefined) db.influencer_notes = camp.influencerNotes;
  if (camp.contrato) db.contrato = camp.contrato;
  if (camp.produto) db.produto = camp.produto;
  if (camp.roteiro) db.roteiro = camp.roteiro;
  if (camp.conteudo) db.conteudo = camp.conteudo;
  if (camp.postagem) db.postagem = camp.postagem;
  if (camp.metricas) db.metricas = camp.metricas;
  if (camp.nf) db.nf = camp.nf;
  if (camp.repasse) db.repasse = camp.repasse;
  if (camp.observacoesCampanha !== undefined) db.observacoes_campanha = camp.observacoesCampanha;
  if (camp.financial) db.financial = camp.financial;
  if (camp.checklist) db.checklist = camp.checklist;
  if (camp.timeline) db.timeline = camp.timeline;
  return db;
};

const mapInfluencerToDB = (inf: Partial<Influencer>) => {
  const db: any = {};
  if (inf.id) db.id = inf.id;
  if (inf.nome) db.nome = inf.nome;
  if (inf.usuario) db.usuario = inf.usuario;
  if (inf.email) db.email = inf.email;
  if (inf.telefone) db.telefone = inf.telefone;
  if (inf.status) db.status = inf.status;
  if (inf.dataCadastro) db.data_cadastro = inf.dataCadastro;
  if (inf.urlPastaDrive) db.url_pasta_drive = inf.urlPastaDrive;
  if (inf.idade) db.idade = inf.idade;
  if (inf.avatar) db.avatar = inf.avatar;
  if (inf.camiseta) db.camiseta = inf.camiseta;
  if (inf.calca) db.calca = inf.calca;
  if (inf.sapato) db.sapato = inf.sapato;
  if (inf.enderecoNome) db.endereco_nome = inf.enderecoNome;
  if (inf.rua) db.rua = inf.rua;
  if (inf.numero) db.numero = inf.numero;
  if (inf.complemento) db.complemento = inf.complemento;
  if (inf.bairro) db.bairro = inf.bairro;
  if (inf.cidade) db.cidade = inf.cidade;
  if (inf.estado) db.estado = inf.estado;
  if (inf.cep) db.cep = inf.cep;
  if (inf.cpf) db.cpf = inf.cpf;
  if (inf.rg) db.rg = inf.rg;
  if (inf.cnpj) db.cnpj = inf.cnpj;
  if (inf.testemunhaNome) db.testemunha_nome = inf.testemunhaNome;
  if (inf.testemunhaEmail) db.testemunha_email = inf.testemunhaEmail;
  if (inf.testemunhaTelefone) db.testemunha_telefone = inf.testemunhaTelefone;
  if (inf.testemunhaCpf) db.testemunha_cpf = inf.testemunhaCpf;
  if (inf.testemunhaRg) db.testemunha_rg = inf.testemunhaRg;
  if (inf.pjRazaoSocial) db.pj_razao_social = inf.pjRazaoSocial;
  if (inf.pjCnpj) db.pj_cnpj = inf.pjCnpj;
  if (inf.pjDataCriacao) db.pj_data_criacao = inf.pjDataCriacao;
  if (inf.pjEmail) db.pj_email = inf.pjEmail;
  if (inf.pjEndereco) db.pj_endereco = inf.pjEndereco;
  if (inf.pjInscricaoMunicipal) db.pj_inscricao_municipal = inf.pjInscricaoMunicipal;
  if (inf.pjInscricaoEstadual) db.pj_inscricao_estadual = inf.pjInscricaoEstadual;
  if (inf.bancoTipo) db.banco_tipo = inf.bancoTipo;
  if (inf.bancoNome) db.banco_nome = inf.bancoNome;
  if (inf.bancoAgencia) db.banco_agencia = inf.bancoAgencia;
  if (inf.bancoConta) db.banco_conta = inf.bancoConta;
  if (inf.bancoPix) db.banco_pix = inf.bancoPix;
  if (inf.observacoes) db.observacoes = inf.observacoes;
  if (inf.created_at) db.created_at = inf.created_at;
  return db;
};

export const auth = {
  async signUp(email: string, pass: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: fullName } }
    });
    if (error) throw error;
    return data;
  },
  async signIn(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data;
  },
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  },
  async signOut() {
    await supabase.auth.signOut();
    // Limpar local storage opcionalmente se houver resíduos
    localStorage.removeItem('supabase.auth.token');
  },
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) {
      console.error("Erro ao buscar perfil no banco:", error.message);
      throw error;
    }
    return data as UserProfile;
  }
};

export const db = {
  async getLeads() {
    const { data, error } = await supabase.from('leads').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapLeadToFE);
  },
  async createLead(lead: Lead) {
    const dbData = mapLeadToDB(lead);
    const { error } = await supabase.from('leads').insert(dbData);
    if (error) throw error;
  },
  async updateLead(leadId: string, updates: Partial<Lead>) {
    const dbData = mapLeadToDB(updates);
    const { error } = await (supabase.from('leads') as any).update(dbData).eq('id', leadId);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'LEAD', entity_id: leadId, action: 'UPDATE', old_values: null, new_values: updates });
  },
  async deleteLead(leadId: string) {
    const { error } = await (supabase.from('leads') as any).update({ deleted_at: new Date() }).eq('id', leadId);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'LEAD', entity_id: leadId, action: 'DELETE', old_values: null, new_values: null });
  },
  async getCampaigns() {
    const { data, error } = await supabase.from('campaigns').select('*').is('deleted_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCampaignToFE);
  },
  async createCampaign(campaign: Campaign) {
    const dbData = mapCampaignToDB(campaign);
    const { error } = await supabase.from('campaigns').insert(dbData);
    if (error) throw error;
  },
  async updateCampaign(campaignId: string, updates: Partial<Campaign>) {
    const dbData = mapCampaignToDB(updates);
    const { error } = await (supabase.from('campaigns') as any).update(dbData).eq('id', campaignId);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'CAMPAIGN', entity_id: campaignId, action: 'UPDATE', old_values: null, new_values: updates });
  },
  async getInfluencers() {
    const { data, error } = await supabase.from('influencers').select('*').is('deleted_at', null).order('nome');
    if (error) throw error;
    return (data || []).map(mapInfluencerToFE);
  },
  async createInfluencer(inf: Influencer) {
    const dbData = mapInfluencerToDB(inf);
    const { error } = await supabase.from('influencers').insert(dbData);
    if (error) throw error;
  },
  async updateInfluencer(infId: string, updates: Partial<Influencer>) {
    const dbData = mapInfluencerToDB(updates);
    const { error } = await (supabase.from('influencers') as any).update(dbData).eq('id', infId);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'INFLUENCER', entity_id: infId, action: 'UPDATE', old_values: null, new_values: updates });
  },
  async deleteInfluencer(infId: string) {
    const { error } = await (supabase.from('influencers') as any).update({ deleted_at: new Date() }).eq('id', infId);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'INFLUENCER', entity_id: infId, action: 'DELETE', old_values: null, new_values: null });
  },
  async deleteCampaign(campaign_id: string) {
    const { error } = await (supabase.from('campaigns') as any).update({ deleted_at: new Date() }).eq('id', campaign_id);
    if (error) throw error;
    await db.createAuditLog({ entity_type: 'CAMPAIGN', entity_id: campaign_id, action: 'DELETE', old_values: null, new_values: null });
  },
  async getTemplates(): Promise<Template[]> {
    const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async createTemplate(template: Omit<Template, 'created_at'>) {
    const { error } = await (supabase.from('templates') as any).insert(template);
    if (error) throw error;
  },
  async updateTemplate(id: string, updates: Partial<Template>) {
    const { error } = await (supabase.from('templates') as any).update(updates).eq('id', id);
    if (error) throw error;
  },
  async deleteTemplate(id: string) {
    const { error } = await (supabase.from('templates') as any).delete().eq('id', id);
    if (error) throw error;
  },
  async getNotifications(userId: string) {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async createAuditLog(log: { entity_type: string, entity_id: string, action: string, old_values: any, new_values: any }) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await (supabase.from('audit_logs') as any).insert({
      ...log,
      user_id: session?.user?.id
    });
    if (error) console.error("Erro ao gravar auditoria:", error);
  },
  async createNotification(notif: { user_id: string, campaign_id: string, title: string, message: string, type: string, event_date?: string }) {
    const { error } = await (supabase.from('notifications') as any).insert({
      user_id: notif.user_id,
      campaign_id: notif.campaign_id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      event_date: notif.event_date
    });
    if (error) console.error("Erro ao criar notificação:", error);
  },
  async getProfiles() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as UserProfile[];
  },
  async updateProfile(id: string, updates: Partial<UserProfile>) {
    const { error } = await (supabase.from('profiles') as any).update(updates).eq('id', id);
    if (error) throw error;
  },
  async getPreApprovedEmails() {
    const { data, error } = await supabase.from('pre_approved_emails').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async addPreApprovedEmail(email: string, role: UserRole) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await (supabase.from('pre_approved_emails') as any).insert({
      email,
      role,
      created_by: session?.user?.id
    });
    if (error) throw error;
  },
  async deletePreApprovedEmail(email: string) {
    const { error } = await supabase.from('pre_approved_emails').delete().eq('email', email);
    if (error) throw error;
  },
  async getSettings(key: string) {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error && error.code !== 'PGRST116') throw error; // Ignorar erro de não encontrado
    return data?.value || null;
  },
  async updateSettings(key: string, value: any) {
    const { error } = await (supabase.from('settings') as any).upsert({ key, value, updated_at: new Date() });
    if (error) throw error;
  },

  // SYSTEM NOTES
  async getSystemNotes() {
    const { data, error } = await supabase.from('system_notes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async createSystemNote(note: { title: string, content: string, color: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await (supabase.from('system_notes') as any).insert({
      ...note,
      created_by: session?.user?.id
    });
    if (error) throw error;
  },
  async updateSystemNote(id: string, updates: any) {
    const { error } = await (supabase.from('system_notes') as any).update(updates).eq('id', id);
    if (error) throw error;
  },
  async deleteSystemNote(id: string) {
    const { error } = await (supabase.from('system_notes') as any).delete().eq('id', id);
    if (error) throw error;
  }
};
