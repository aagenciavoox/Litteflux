export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string
                    created_at: string | null
                    entity_id: string
                    entity_type: string
                    id: string
                    new_values: Json | null
                    old_values: Json | null
                    user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string | null
                    entity_id: string
                    entity_type: string
                    id?: string
                    new_values?: Json | null
                    old_values?: Json | null
                    user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string | null
                    entity_id?: string
                    entity_type?: string
                    id?: string
                    new_values?: Json | null
                    old_values?: Json | null
                    user_id?: string | null
                }
            }
            campaigns: {
                Row: {
                    brand: string
                    briefing: string | null
                    checklist: Json | null
                    conteudo: Json | null
                    contrato: Json | null
                    created_at: string | null
                    drive_link: string | null
                    end_date: string | null
                    financial: Json | null
                    id: string
                    influencer_ids: string[] | null
                    influencer_notes: string | null
                    internal_notes: string | null
                    metricas: Json | null
                    nf: Json | null
                    observacoes_campanha: string | null
                    postagem: Json | null
                    produto: Json | null
                    repasse: Json | null
                    roteiro: Json | null
                    start_date: string | null
                    status: Database["public"]["Enums"]["campaign_status"] | null
                    timeline: Json[] | null
                    title: string
                }
                Insert: {
                    brand: string
                    briefing?: string | null
                    checklist?: Json | null
                    conteudo?: Json | null
                    contrato?: Json | null
                    created_at?: string | null
                    drive_link?: string | null
                    end_date?: string | null
                    financial?: Json | null
                    id?: string
                    influencer_ids?: string[] | null
                    influencer_notes?: string | null
                    internal_notes?: string | null
                    metricas?: Json | null
                    nf?: Json | null
                    observacoes_campanha?: string | null
                    postagem?: Json | null
                    produto?: Json | null
                    repasse?: Json | null
                    roteiro?: Json | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["campaign_status"] | null
                    timeline?: Json[] | null
                    title: string
                }
                Update: {
                    brand?: string
                    briefing?: string | null
                    checklist?: Json | null
                    conteudo?: Json | null
                    contrato?: Json | null
                    created_at?: string | null
                    drive_link?: string | null
                    end_date?: string | null
                    financial?: Json | null
                    id?: string
                    influencer_ids?: string[] | null
                    influencer_notes?: string | null
                    internal_notes?: string | null
                    metricas?: Json | null
                    nf?: Json | null
                    observacoes_campanha?: string | null
                    postagem?: Json | null
                    produto?: Json | null
                    repasse?: Json | null
                    roteiro?: Json | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["campaign_status"] | null
                    timeline?: Json[] | null
                    title?: string
                }
            }
            influencers: {
                Row: {
                    avatar: string | null
                    banco_agencia: string | null
                    banco_conta: string | null
                    banco_nome: string | null
                    banco_pix: string | null
                    banco_tipo: string | null
                    bairro: string | null
                    calca: string | null
                    camiseta: string | null
                    cep: string | null
                    cidade: string | null
                    cnpj: string | null
                    complemento: string | null
                    cpf: string | null
                    created_at: string | null
                    data_cadastro: string | null
                    email: string
                    endereco_nome: string | null
                    estado: string | null
                    id: string
                    idade: number | null
                    nome: string
                    numero: string | null
                    observacoes: string | null
                    pj_cnpj: string | null
                    pj_data_criacao: string | null
                    pj_email: string | null
                    pj_endereco: string | null
                    pj_inscricao_estadual: string | null
                    pj_inscricao_municipal: string | null
                    pj_razao_social: string | null
                    rg: string | null
                    rua: string | null
                    sapato: string | null
                    status: string | null
                    telefone: string | null
                    testemunha_cpf: string | null
                    testemunha_email: string | null
                    testemunha_nome: string | null
                    testemunha_rg: string | null
                    testemunha_telefone: string | null
                    url_pasta_drive: string | null
                    usuario: string
                }
                Insert: {
                    avatar?: string | null
                    banco_agencia?: string | null
                    banco_conta?: string | null
                    banco_nome?: string | null
                    banco_pix?: string | null
                    banco_tipo?: string | null
                    bairro?: string | null
                    calca?: string | null
                    camiseta?: string | null
                    cep?: string | null
                    cidade?: string | null
                    cnpj?: string | null
                    complemento?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    data_cadastro?: string | null
                    email: string
                    endereco_nome?: string | null
                    estado?: string | null
                    id?: string
                    idade?: number | null
                    nome: string
                    numero?: string | null
                    observacoes?: string | null
                    pj_cnpj?: string | null
                    pj_data_criacao?: string | null
                    pj_email?: string | null
                    pj_endereco?: string | null
                    pj_inscricao_estadual?: string | null
                    pj_inscricao_municipal?: string | null
                    pj_razao_social?: string | null
                    rg?: string | null
                    rua?: string | null
                    sapato?: string | null
                    status?: string | null
                    telefone?: string | null
                    testemunha_cpf?: string | null
                    testemunha_email?: string | null
                    testemunha_nome?: string | null
                    testemunha_rg?: string | null
                    testemunha_telefone?: string | null
                    url_pasta_drive?: string | null
                    usuario: string
                }
                Update: {
                    avatar?: string | null
                    banco_agencia?: string | null
                    banco_conta?: string | null
                    banco_nome?: string | null
                    banco_pix?: string | null
                    banco_tipo?: string | null
                    bairro?: string | null
                    calca?: string | null
                    camiseta?: string | null
                    cep?: string | null
                    cidade?: string | null
                    cnpj?: string | null
                    complemento?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    data_cadastro?: string | null
                    email?: string
                    endereco_nome?: string | null
                    estado?: string | null
                    id?: string
                    idade?: number | null
                    nome?: string
                    numero?: string | null
                    observacoes?: string | null
                    pj_cnpj?: string | null
                    pj_data_criacao?: string | null
                    pj_email?: string | null
                    pj_endereco?: string | null
                    pj_inscricao_estadual?: string | null
                    pj_inscricao_municipal?: string | null
                    pj_razao_social?: string | null
                    rg?: string | null
                    rua?: string | null
                    sapato?: string | null
                    status?: string | null
                    telefone?: string | null
                    testemunha_cpf?: string | null
                    testemunha_email?: string | null
                    testemunha_nome?: string | null
                    testemunha_rg?: string | null
                    testemunha_telefone?: string | null
                    url_pasta_drive?: string | null
                    usuario?: string
                }
            }
            leads: {
                Row: {
                    brand: string
                    campaign_object: string | null
                    closed_value: number | null
                    created_at: string | null
                    id: string
                    influencer_ids: string[] | null
                    last_contact: string | null
                    phase: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value: number | null
                    responsible: string | null
                    scope: string | null
                    start_date: string | null
                    status: Database["public"]["Enums"]["lead_status"] | null
                    timeline: Json[] | null
                    value: number | null
                }
                Insert: {
                    brand: string
                    campaign_object?: string | null
                    closed_value?: number | null
                    created_at?: string | null
                    id?: string
                    influencer_ids?: string[] | null
                    last_contact?: string | null
                    phase?: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value?: number | null
                    responsible?: string | null
                    scope?: string | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    timeline?: Json[] | null
                    value?: number | null
                }
                Update: {
                    brand?: string
                    campaign_object?: string | null
                    closed_value?: number | null
                    created_at?: string | null
                    id?: string
                    influencer_ids?: string[] | null
                    last_contact?: string | null
                    phase?: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value?: number | null
                    responsible?: string | null
                    scope?: string | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    timeline?: Json[] | null
                    value?: number | null
                }
            }
            notifications: {
                Row: {
                    campaign_id: string | null
                    created_at: string | null
                    event_date: string | null
                    id: string
                    message: string | null
                    read: boolean | null
                    title: string
                    type: string | null
                    user_id: string | null
                }
                Insert: {
                    campaign_id?: string | null
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    message?: string | null
                    read?: boolean | null
                    title: string
                    type?: string | null
                    user_id?: string | null
                }
                Update: {
                    campaign_id?: string | null
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    message?: string | null
                    read?: boolean | null
                    title?: string
                    type?: string | null
                    user_id?: string | null
                }
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    email: string
                    full_name: string | null
                    id: string
                    role: Database["public"]["Enums"]["user_role"] | null
                    status: Database["public"]["Enums"]["user_status"] | null
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    updated_at?: string | null
                }
            }
            templates: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    tasks: string[] | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    tasks?: string[] | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    tasks?: string[] | null
                    title?: string
                }
            }
            settings: {
                Row: {
                    key: string
                    value: Json | null
                    updated_at: string | null
                }
                Insert: {
                    key: string
                    value?: Json | null
                    updated_at?: string | null
                }
                Update: {
                    key?: string
                    value?: Json | null
                    updated_at?: string | null
                }
            }
            system_notes: {
                Row: {
                    id: string
                    title: string
                    content: string
                    color: string
                    created_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    color: string
                    created_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    color?: string
                    created_at?: string | null
                    created_by?: string | null
                }
            }
            pre_approved_emails: {
                Row: {
                    id: string
                    email: string
                    role: Database["public"]["Enums"]["user_role"]
                    created_at: string | null
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    email: string
                    role: Database["public"]["Enums"]["user_role"]
                    created_at?: string | null
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    role?: Database["public"]["Enums"]["user_role"]
                    created_at?: string | null
                    created_by?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
            is_approved: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            campaign_status: "PLANEJAMENTO" | "EM ANDAMENTO" | "FINALIZADA"
            lead_phase: "1º CONTATO" | "ORÇAMENTO" | "NEGOCIAÇÃO"
            lead_status: "AGUARDANDO" | "RECUSADO" | "FECHADO"
            user_role: "ADMINISTRADOR" | "INFLUENCIADOR" | "CONVIDADO"
            user_status: "PENDENTE" | "APROVADO" | "BLOQUEADO"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
