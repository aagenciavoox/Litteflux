
export enum UserRole {
  ADMIN = 'ADMINISTRADOR',
  INFLUENCER = 'INFLUENCIADOR',
  GUEST = 'CONVIDADO'
}

export enum UserStatus {
  PENDING = 'PENDENTE',
  APPROVED = 'APROVADO',
  BLOCKED = 'BLOQUEADO'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  full_name?: string;
  avatar_url?: string;
}

export enum LeadStatus {
  WAITING = 'AGUARDANDO',
  REFUSED = 'RECUSADO',
  CLOSED = 'FECHADO'
}

export enum LeadPhase {
  CONTACT = '1º CONTATO',
  QUOTE = 'ORÇAMENTO',
  NEGOTIATION = 'NEGOCIAÇÃO'
}

export enum CampaignStatus {
  PLANNING = 'PLANEJAMENTO',
  EXECUTION = 'EM ANDAMENTO',
  COMPLETED = 'FINALIZADA'
}

export interface Influencer {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  dataCadastro: string;
  created_at?: string;
  urlPastaDrive: string;
  idade?: number;
  avatar?: string;
  camiseta?: string;
  calca?: string;
  sapato?: string;
  enderecoNome?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  cpf?: string;
  rg?: string;
  cnpj?: string;
  testemunhaNome?: string;
  testemunhaEmail?: string;
  testemunhaTelefone?: string;
  testemunhaCpf?: string;
  testemunhaRg?: string;
  pjRazaoSocial?: string;
  pjCnpj?: string;
  pjDataCriacao?: string;
  pjEmail?: string;
  pjEndereco?: string;
  pjInscricaoMunicipal?: string;
  pjInscricaoEstadual?: string;
  bancoTipo: 'PF' | 'PJ';
  bancoNome?: string;
  bancoAgencia?: string;
  bancoConta?: string;
  bancoPix?: string;
  observacoes?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  tasks: string[];
  created_at?: string;
}

export interface TimelineEntry {
  id: string;
  date: string;
  action: string;
  user: string;
  notes?: string;
}

export interface Lead {
  id: string;
  influencerIds: string[];
  brand: string;
  campaignObject: string;
  phase: LeadPhase;
  status: LeadStatus;
  proposedValue: number;
  closedValue: number;
  value: number;
  responsible: string;
  scope: string;
  lastContact: string;
  startDate: string;
  lastMessage?: string;
  timeline: TimelineEntry[];
  createdAt?: string;
}

export interface CampaignFinancial {
  grossValue: number;
  influencerCut: number;
  litteTax: number;
  partnerSplit: number;
  withdrawalStatus: 'PENDENTE' | 'SOLICITADO' | 'PAGO';
  expectedPaymentDate: string;
  statusPagCliente: 'Pendente' | 'Pago';
  statusRepasse: 'Pendente' | 'Processando' | 'Pago';
  statusNF: 'Pendente' | 'Emitida' | 'Enviada';
  dataCriacao: string;
  ultimaAtualizacao: string;
}

export interface ChecklistItem {
  id: string;
  module: string;
  task: string;
  done: boolean;
  completedAt?: string;
}

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  influencerIds: string[];
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  briefing: string;
  driveLink?: string;
  internalNotes?: string;
  influencerNotes?: string;
  contrato: any;
  produto: any;
  roteiro: any;
  conteudo: any;
  postagem: any;
  metricas: any;
  nf: any;
  repasse: any;
  observacoesCampanha: string;
  financial: CampaignFinancial;
  timeline: TimelineEntry[];
  checklist: ChecklistItem[];
}

export type ToastType = 'SUCCESS' | 'ERROR' | 'INFO';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export type ModalType =
  | 'NEW_LEAD'
  | 'NEW_CAMPAIGN'
  | 'EDIT_CAMPAIGN'
  | 'NEW_INFLUENCER'
  | 'EDIT_INFLUENCER'
  | 'NEW_TEMPLATE'
  | 'EDIT_TEMPLATE'
  | 'EDIT_VALUES'
  | 'PARTNER_SPLIT'
  | 'NEW_NOTE' | 'EDIT_NOTE';

export interface SystemNote {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at?: string;
  created_by?: string;
  is_pinned?: boolean;
}
