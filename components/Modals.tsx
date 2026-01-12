
import React, { useRef, useState, useEffect } from 'react';
import { CampaignStatus, Influencer, Campaign, Template, UserRole, SystemNote } from '../types';
import { generateUUID } from '../services/supabase';

interface Tab {
  id: string;
  label: string;
}

interface ModalBaseProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-2xl' | 'max-w-4xl' | 'max-w-5xl';
}

export const ModalBase: React.FC<ModalBaseProps> = ({
  title, subtitle, onClose, children, footer, tabs, activeTab, onTabChange, maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`bg-white w-full ${maxWidth} max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200`} onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 flex justify-between items-start bg-white shrink-0 border-b border-slate-100">
          <div className="space-y-0.5">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-700">✕</button>
        </div>

        {tabs && tabs.length > 0 && onTabChange && (
          <div className="flex px-6 border-b border-slate-100 bg-white gap-6 shrink-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`py-3 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"></div>}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">{children}</div>
        {footer && <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

export const FormField = ({ label, required, children }: { label: string, required?: boolean, children?: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
      {label}{required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${inputClasses} ${props.className || ''}`} />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${inputClasses} appearance-none cursor-pointer ${props.className || ''}`} />
);

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${inputClasses} h-24 resize-none ${props.className || ''}`} />
);

export const Button = ({ children, variant = 'primary', ...props }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger' } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
    secondary: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
  };
  return <button {...props} className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all active:scale-[0.98] ${variants[variant]} ${props.className || ''}`}>{children}</button>;
};

export const FinancialAdjustmentModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleSave = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData.entries());
      if (!data.amount) { alert("Informe o valor."); return; }
      onSubmit(data);
    }
  };
  return (
    <ModalBase title="Ajuste de Saldo" subtitle="Conciliação Financeira Littê" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleSave}>Processar Ajuste</Button></>}>
      <form ref={formRef} className="space-y-6">
        <FormField label="Valor do Lançamento (R$)" required><Input name="amount" type="number" step="0.01" placeholder="0.00" required /></FormField>
        <FormField label="Tipo de Movimentação">
          <Select name="type"><option value="CREDIT">Entrada (Crédito)</option><option value="DEBIT">Saída (Débito)</option></Select>
        </FormField>
        <FormField label="Justificativa"><Textarea name="reason" placeholder="Descreva o motivo deste ajuste no caixa..." /></FormField>
      </form>
    </ModalBase>
  );
};

export const PartnerSplitModal = ({ initialValues, onClose, onSubmit }: { initialValues?: { gestor: number, operacional: number, reserva: number }, onClose: () => void, onSubmit: (data: any) => void }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleSave = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const data = Object.fromEntries(formData.entries());
      const total = Number(data.gestor) + Number(data.operacional) + Number(data.reserva);
      if (total !== 100) { alert("A soma das porcentagens deve ser 100%. Total: " + total + "%"); return; }
      onSubmit(data);
    }
  };
  return (
    <ModalBase title="Configuração de Split" subtitle="Distribuição de Lucros" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleSave}>Salvar Configuração</Button></>}>
      <form ref={formRef} className="space-y-8">
        <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-6">Regra de Divisão (%)</p>
          <div className="space-y-5">
            <FormField label="Sócio Gestor (%)"><Input name="gestor" type="number" defaultValue={initialValues?.gestor || 30} min="0" max="100" /></FormField>
            <FormField label="Sócio Operacional (%)"><Input name="operacional" type="number" defaultValue={initialValues?.operacional || 30} min="0" max="100" /></FormField>
            <FormField label="Reserva de Emergência (%)"><Input name="reserva" type="number" defaultValue={initialValues?.reserva || 40} min="0" max="100" /></FormField>
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export const NewLeadModal = ({ influencers, onClose, onSubmit }: { influencers: Influencer[], onClose: () => void, onSubmit: (data: any) => void }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      const data = Object.fromEntries(fd.entries());
      if (!data.brand || !data.object || !data.influencer) { alert("Preencha os campos obrigatórios."); return; }
      onSubmit({
        id: generateUUID(),
        brand: String(data.brand),
        campaignObject: String(data.object),
        influencerIds: [String(data.influencer)],
        proposedValue: Number(data.proposedValue) || 0,
        startDate: String(data.startDate),
        scope: String(data.scope),
        status: String(data.status),
        phase: String(data.phase),
        timeline: []
      });
    }
  };
  return (
    <ModalBase title="Nova Prospecção" subtitle="Registro Littê Flux" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleFormSubmit}>Salvar Registro</Button></>}>
      <form ref={formRef} onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-6">
        <FormField label="Marca / Cliente" required><Input name="brand" required placeholder="Ex: Samsung" /></FormField>
        <FormField label="Objeto da Campanha" required><Input name="object" required placeholder="Ex: Lançamento Verão" /></FormField>
        <div className="col-span-2">
          <FormField label="Influenciador Assessorado" required>
            <Select name="influencer" required>
              <option value="">Selecione...</option>
              {influencers.map(i => <option key={i.id} value={i.id}>{i.nome} (@{i.usuario})</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Valor Proposto (R$)" required><Input name="proposedValue" type="number" step="0.01" required placeholder="0.00" /></FormField>
        <FormField label="Previsão de Início"><Input name="startDate" defaultValue={new Date().toLocaleDateString('pt-BR')} /></FormField>

        <FormField label="Fase Inicial">
          <Select name="phase" defaultValue="1º CONTATO">
            <option value="1º CONTATO">1º Contato</option>
            <option value="ORÇAMENTO">Orçamento</option>
            <option value="NEGOCIAÇÃO">Negociação</option>
          </Select>
        </FormField>
        <FormField label="Status Inicial">
          <Select name="status" defaultValue="AGUARDANDO">
            <option value="AGUARDANDO">Aguardando Resposta</option>
            <option value="RECUSADO">Recusado</option>
            <option value="FECHADO">Fechado</option>
          </Select>
        </FormField>

        <div className="col-span-2"><FormField label="Escopo"><Textarea name="scope" /></FormField></div>
      </form>
    </ModalBase>
  );
};

export const NewCampaignModal = ({ influencers, onClose, onSubmit }: { influencers: Influencer[], onClose: () => void, onSubmit: (data: any) => void }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      const data = Object.fromEntries(fd.entries());
      if (!data.brand || !data.title || !data.influencer || !data.closedValue) { alert("Preencha os campos obrigatórios."); return; }
      onSubmit({
        id: generateUUID(),
        brand: String(data.brand),
        title: String(data.title),
        influencerIds: [String(data.influencer)],
        status: 'PLANEJAMENTO',
        startDate: String(data.startDate),
        endDate: '',
        briefing: String(data.briefing),
        financial: {
          grossValue: Number(data.closedValue) || 0,
          influencerCut: 0,
          litteTax: 0,
          partnerSplit: 0,
          withdrawalStatus: 'PENDENTE',
          expectedPaymentDate: '',
          statusPagCliente: 'Pendente',
          statusRepasse: 'Pendente',
          statusNF: 'Pendente',
          dataCriacao: new Date().toISOString(),
          ultimaAtualizacao: new Date().toISOString()
        },
        timeline: [],
        checklist: []
      });
    }
  };
  return (
    <ModalBase title="Nova Campanha Direta" subtitle="Criação Direta" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleFormSubmit}>Gerar Campanha</Button></>}>
      <form ref={formRef} onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-6">
        <FormField label="Marca / Cliente" required><Input name="brand" required placeholder="Ex: Nike" /></FormField>
        <FormField label="Título da Campanha" required><Input name="title" required placeholder="Ex: Lançamento Air Max" /></FormField>
        <div className="col-span-2">
          <FormField label="Influenciador Assessorado" required>
            <Select name="influencer" required>
              <option value="">Selecione...</option>
              {influencers.map(i => <option key={i.id} value={i.id}>{i.nome} (@{i.usuario})</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Budget Fechado (R$)" required><Input name="closedValue" type="number" step="0.01" required placeholder="0.00" /></FormField>
        <FormField label="Data de Início"><Input name="startDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} /></FormField>
        <div className="col-span-2"><FormField label="Briefing"><Textarea name="briefing" /></FormField></div>
      </form>
    </ModalBase>
  );
};

export const CampaignFormModal = ({ campaign, influencers, onClose, onSubmit }: { campaign: Campaign, influencers: Influencer[], onClose: () => void, onSubmit: (campaign: Campaign) => void }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      const data = Object.fromEntries(fd.entries());
      onSubmit({
        ...campaign,
        title: String(data.title),
        brand: String(data.brand),
        influencerIds: [String(data.influencer)],
        status: data.status as any,
        startDate: String(data.startDate),
        briefing: String(data.briefing),
        driveLink: String(data.driveLink),
        internalNotes: String(data.internalNotes),
        financial: {
          ...campaign.financial,
          grossValue: Number(data.grossValue) || campaign.financial.grossValue || 0
        }
      });
    }
  };
  return (
    <ModalBase title="Editar Campanha" subtitle={campaign.brand} onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleFormSubmit}>Salvar Alterações</Button></>}>
      <form ref={formRef} onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-6">
        <FormField label="Marca / Cliente" required><Input name="brand" defaultValue={campaign.brand} required /></FormField>
        <FormField label="Título da Campanha" required><Input name="title" defaultValue={campaign.title} required /></FormField>
        <div className="col-span-2">
          <FormField label="Influenciador" required>
            <Select name="influencer" defaultValue={campaign.influencerIds[0]} required>
              {influencers.map(i => <option key={i.id} value={i.id}>{i.nome} (@{i.usuario})</option>)}
            </Select>
          </FormField>
        </div>
        <FormField label="Status"><Select name="status" defaultValue={campaign.status}><option value="PLANEJAMENTO">Planejamento</option><option value="EM ANDAMENTO">Em Execução</option><option value="FINALIZADA">Finalizada</option></Select></FormField>
        <FormField label="Data Início"><Input name="startDate" type="date" defaultValue={campaign.startDate} /></FormField>
        <div className="col-span-2"><FormField label="Link Drive"><Input name="driveLink" defaultValue={campaign.driveLink} /></FormField></div>
        <FormField label="Budget Atual (R$)"><Input name="grossValue" type="number" step="0.01" defaultValue={campaign.financial?.grossValue} /></FormField>
        <div className="col-span-2"><FormField label="Briefing"><Textarea name="briefing" defaultValue={campaign.briefing} /></FormField></div>
        <div className="col-span-2"><FormField label="Notas Internas"><Textarea name="internalNotes" defaultValue={campaign.internalNotes} /></FormField></div>
      </form>
    </ModalBase>
  );
};

export const TemplateFormModal = ({ template, onClose, onSubmit, role }: { template?: Template, onClose: () => void, onSubmit: (data: any) => void, role: UserRole }) => {
  const [tasks, setTasks] = useState<string[]>(template?.tasks || ['']);
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get('title') as string;
    if (!title) { alert("Título é obrigatório."); return; }
    onSubmit({ id: template?.id || generateUUID(), title, description: fd.get('description'), tasks: tasks.filter(t => t.trim() !== '') });
  };
  return (
    <ModalBase title={template ? "Editar Template" : "Novo Template"} subtitle="Padronização de Checklist" onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="template-form">Salvar Template</Button></>}>
      <form id="template-form" onSubmit={handleSave} className="space-y-8">
        <FormField label="Título do Template" required><Input name="title" defaultValue={template?.title} required /></FormField>
        <FormField label="Descrição"><Textarea name="description" defaultValue={template?.description} /></FormField>
        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h5 className="text-[11px] font-black text-[#1F7A5F] uppercase tracking-widest">Escopo do Checklist</h5>
            <button type="button" onClick={() => setTasks([...tasks, ''])} className="text-[10px] font-black text-[#1F7A5F] uppercase tracking-widest">+ Adicionar Item</button>
          </div>
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={i} className="flex gap-3">
                <Input value={task} onChange={e => { const n = [...tasks]; n[i] = e.target.value; setTasks(n); }} placeholder={`Tarefa ${i + 1}`} className="flex-1" />
                <button type="button" onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))} className="p-3 text-rose-400 hover:text-rose-600 transition-all">✕</button>
              </div>
            ))}
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export const InfluencerFormModal = ({ influencer, onClose, onSubmit, role }: { influencer?: Influencer, onClose: () => void, onSubmit: (inf: Influencer) => void, role: UserRole }): React.ReactElement => {
  const formRef = useRef<HTMLFormElement>(null);
  const isAdmin = role === UserRole.ADMIN;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRef.current) {
      const fd = new FormData(formRef.current);
      const data = Object.fromEntries(fd.entries());

      // Se não for admin, pegamos o email original para garantir que não mude (mesmo se o campo estiver desabilitado)
      const email = isAdmin ? String(data.email) : (influencer?.email || '');
      const status = isAdmin ? ((data.status as any) || 'Ativo') : (influencer?.status || 'Ativo');
      const usuario = isAdmin ? String(data.usuario).replace('@', '') : (influencer?.usuario || '');
      const observacoes = isAdmin ? String(data.observacoes || '') : (influencer?.observacoes || '');

      if (!data.nome || !data.usuario || !email || !data.telefone) {
        alert("Nome, Usuário, Email e Telefone são obrigatórios.");
        return;
      }

      onSubmit({
        id: influencer?.id || generateUUID(),
        nome: String(data.nome),
        usuario: usuario,
        email: email,
        telefone: String(data.telefone),
        status: status,
        dataCadastro: influencer?.dataCadastro || new Date().toISOString(),
        urlPastaDrive: String(data.urlPastaDrive || ''),
        idade: data.idade ? Number(data.idade) : undefined,
        camiseta: String(data.camiseta || ''),
        calca: String(data.calca || ''),
        sapato: String(data.sapato || ''),
        enderecoNome: String(data.enderecoNome || ''),
        rua: String(data.rua || ''),
        numero: String(data.numero || ''),
        complemento: String(data.complemento || ''),
        bairro: String(data.bairro || ''),
        cidade: String(data.cidade || ''),
        estado: String(data.estado || ''),
        cep: String(data.cep || ''),
        cpf: String(data.cpf || ''),
        rg: String(data.rg || ''),
        cnpj: String(data.cnpj || ''),
        testemunhaNome: String(data.testemunhaNome || ''),
        testemunhaEmail: String(data.testemunhaEmail || ''),
        testemunhaTelefone: String(data.testemunhaTelefone || ''),
        testemunhaCpf: String(data.testemunhaCpf || ''),
        testemunhaRg: String(data.testemunhaRg || ''),
        pjRazaoSocial: String(data.pjRazaoSocial || ''),
        pjCnpj: String(data.pjCnpj || ''),
        pjDataCriacao: String(data.pjDataCriacao || ''),
        pjEmail: String(data.pjEmail || ''),
        pjEndereco: String(data.pjEndereco || ''),
        pjInscricaoMunicipal: String(data.pjInscricaoMunicipal || ''),
        pjInscricaoEstadual: String(data.pjInscricaoEstadual || ''),
        bancoTipo: (data.bancoTipo as any) || 'PF',
        bancoNome: String(data.bancoNome || ''),
        bancoAgencia: String(data.bancoAgencia || ''),
        bancoConta: String(data.bancoConta || ''),
        bancoPix: String(data.bancoPix || ''),
        observacoes: observacoes
      });
    }
  };
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-xs font-semibold text-emerald-600 border-b border-slate-100 pb-2 mb-4">{children}</h4>
  );
  return (
    <ModalBase title={influencer ? (isAdmin ? "Editar Assessorado" : "Meus Dados") : "Novo Assessorado"} subtitle="Cadastro Littê Flux" onClose={onClose} maxWidth="max-w-4xl" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleFormSubmit}>{influencer ? 'Salvar' : 'Finalizar'}</Button></>}>
      <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
        <SectionTitle>Informações Básicas</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Nome Completo" required><Input name="nome" defaultValue={influencer?.nome} required /></FormField>
          <FormField label="Usuário (@)" required><Input name="usuario" defaultValue={influencer?.usuario} required disabled={!isAdmin} /></FormField>
          <FormField label="Email" required><Input name="email" type="email" defaultValue={influencer?.email} required disabled={!isAdmin} /></FormField>
          <FormField label="Telefone" required><Input name="telefone" defaultValue={influencer?.telefone} required /></FormField>
          <FormField label="Idade"><Input name="idade" type="number" defaultValue={influencer?.idade} /></FormField>
          <FormField label="Status"><Select name="status" defaultValue={influencer?.status || 'Ativo'} disabled={!isAdmin}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></Select></FormField>
        </div>

        <SectionTitle>Medidas</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Camiseta"><Input name="camiseta" defaultValue={influencer?.camiseta} placeholder="Ex: M, G, GG" /></FormField>
          <FormField label="Calça"><Input name="calca" defaultValue={influencer?.calca} placeholder="Ex: 40, 42" /></FormField>
          <FormField label="Sapato"><Input name="sapato" defaultValue={influencer?.sapato} placeholder="Ex: 38, 40" /></FormField>
        </div>

        <SectionTitle>Endereço</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Nome do Destinatário"><Input name="enderecoNome" defaultValue={influencer?.enderecoNome} /></FormField>
          <FormField label="Rua"><Input name="rua" defaultValue={influencer?.rua} /></FormField>
          <FormField label="Número"><Input name="numero" defaultValue={influencer?.numero} /></FormField>
          <FormField label="Complemento"><Input name="complemento" defaultValue={influencer?.complemento} /></FormField>
          <FormField label="Bairro"><Input name="bairro" defaultValue={influencer?.bairro} /></FormField>
          <FormField label="Cidade"><Input name="cidade" defaultValue={influencer?.cidade} /></FormField>
          <FormField label="Estado"><Input name="estado" defaultValue={influencer?.estado} /></FormField>
          <FormField label="CEP"><Input name="cep" defaultValue={influencer?.cep} /></FormField>
        </div>

        <SectionTitle>Dados Pessoais</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="CPF"><Input name="cpf" defaultValue={influencer?.cpf} /></FormField>
          <FormField label="RG"><Input name="rg" defaultValue={influencer?.rg} /></FormField>
          <FormField label="CNPJ (se PJ)"><Input name="cnpj" defaultValue={influencer?.cnpj} /></FormField>
        </div>

        <SectionTitle>Testemunha</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Nome"><Input name="testemunhaNome" defaultValue={influencer?.testemunhaNome} /></FormField>
          <FormField label="Email"><Input name="testemunhaEmail" defaultValue={influencer?.testemunhaEmail} /></FormField>
          <FormField label="Telefone"><Input name="testemunhaTelefone" defaultValue={influencer?.testemunhaTelefone} /></FormField>
          <FormField label="CPF"><Input name="testemunhaCpf" defaultValue={influencer?.testemunhaCpf} /></FormField>
          <FormField label="RG"><Input name="testemunhaRg" defaultValue={influencer?.testemunhaRg} /></FormField>
        </div>

        <SectionTitle>Pessoa Jurídica</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Razão Social"><Input name="pjRazaoSocial" defaultValue={influencer?.pjRazaoSocial} /></FormField>
          <FormField label="CNPJ"><Input name="pjCnpj" defaultValue={influencer?.pjCnpj} /></FormField>
          <FormField label="Data de Criação"><Input name="pjDataCriacao" type="date" defaultValue={influencer?.pjDataCriacao} /></FormField>
          <FormField label="Email"><Input name="pjEmail" defaultValue={influencer?.pjEmail} /></FormField>
          <FormField label="Endereço"><Input name="pjEndereco" defaultValue={influencer?.pjEndereco} /></FormField>
          <FormField label="Inscrição Municipal"><Input name="pjInscricaoMunicipal" defaultValue={influencer?.pjInscricaoMunicipal} /></FormField>
          <FormField label="Inscrição Estadual"><Input name="pjInscricaoEstadual" defaultValue={influencer?.pjInscricaoEstadual} /></FormField>
        </div>

        <SectionTitle>Dados Bancários</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Tipo de Conta"><Select name="bancoTipo" defaultValue={influencer?.bancoTipo || 'PF'}><option value="PF">Pessoa Física</option><option value="PJ">Pessoa Jurídica</option></Select></FormField>
          <FormField label="Banco"><Input name="bancoNome" defaultValue={influencer?.bancoNome} /></FormField>
          <FormField label="Agência"><Input name="bancoAgencia" defaultValue={influencer?.bancoAgencia} /></FormField>
          <FormField label="Conta"><Input name="bancoConta" defaultValue={influencer?.bancoConta} /></FormField>
          <FormField label="Chave PIX"><Input name="bancoPix" defaultValue={influencer?.bancoPix} /></FormField>
        </div>

        <SectionTitle>Observações</SectionTitle>
        <FormField label="Notas Internas"><Textarea name="observacoes" defaultValue={influencer?.observacoes} disabled={!isAdmin} /></FormField>

        <FormField label="URL Pasta Google Drive"><Input name="urlPastaDrive" defaultValue={influencer?.urlPastaDrive} placeholder="https://drive.google.com/..." /></FormField>
      </form>
    </ModalBase>
  );
};

interface NoteFormModalProps {
  note?: SystemNote;
  onClose: () => void;
  onSubmit: (note: { title: string, content: string, color: string }) => void;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({ note, onClose, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    onSubmit({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      color: formData.get('color') as string
    });
  };

  const colors = [
    { label: 'Amarelo', value: 'bg-amber-50 border-amber-100 text-amber-900' },
    { label: 'Branco', value: 'bg-white border-slate-200 text-slate-800' },
    { label: 'Azul', value: 'bg-blue-50 border-blue-100 text-blue-900' },
    { label: 'Verde', value: 'bg-emerald-50 border-emerald-100 text-emerald-900' },
    { label: 'Rosa', value: 'bg-rose-50 border-rose-100 text-rose-900' },
    { label: 'Roxo', value: 'bg-purple-50 border-purple-100 text-purple-900' }
  ];

  return (
    <ModalBase title={note ? "Editar Nota" : "Nova Nota"} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <FormField label="Título">
          <Input name="title" defaultValue={note?.title} required placeholder="Ex: Ideias para Q4" />
        </FormField>

        <FormField label="Conteúdo">
          <Textarea name="content" defaultValue={note?.content} required placeholder="Digite sua nota aqui..." className="min-h-[150px]" />
        </FormField>

        <FormField label="Cor do Cartão">
          <div className="grid grid-cols-3 gap-3">
            {colors.map(c => (
              <label key={c.value} className={`cursor-pointer border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80 ${c.value}`}>
                <input type="radio" name="color" value={c.value} defaultChecked={note?.color === c.value || (!note && c.label === 'Branco')} className="accent-slate-900" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{c.label}</span>
              </label>
            ))}
          </div>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit">{note ? "Salvar Alterações" : "Criar Nota"}</Button>
        </div>
      </form>
    </ModalBase>
  );
};
