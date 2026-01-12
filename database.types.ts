export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
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
                Relationships: [
                    {
                        foreignKeyName: "audit_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            campaigns: {
                Row: {
                    brand: string
                    briefing: string | null
                    checklist: Json | null
                    conteudo: Json | null
                    contrato: Json | null
                    created_at: string | null
                    deleted_at: string | null
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
                    timeline: Json | null
                    title: string
                }
                Insert: {
                    brand: string
                    briefing?: string | null
                    checklist?: Json | null
                    conteudo?: Json | null
                    contrato?: Json | null
                    created_at?: string | null
                    deleted_at?: string | null
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
                    timeline?: Json | null
                    title: string
                }
                Update: {
                    brand?: string
                    briefing?: string | null
                    checklist?: Json | null
                    conteudo?: Json | null
                    contrato?: Json | null
                    created_at?: string | null
                    deleted_at?: string | null
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
                    timeline?: Json | null
                    title?: string
                }
                Relationships: []
            }
            influencers: {
                Row: {
                    avatar: string | null
                    bairro: string | null
                    banco_agencia: string | null
                    banco_conta: string | null
                    banco_nome: string | null
                    banco_pix: string | null
                    banco_tipo: string | null
                    calca: string | null
                    camiseta: string | null
                    cep: string | null
                    cidade: string | null
                    cnpj: string | null
                    complemento: string | null
                    cpf: string | null
                    created_at: string | null
                    data_cadastro: string | null
                    deleted_at: string | null
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
                    bairro?: string | null
                    banco_agencia?: string | null
                    banco_conta?: string | null
                    banco_nome?: string | null
                    banco_pix?: string | null
                    banco_tipo?: string | null
                    calca?: string | null
                    camiseta?: string | null
                    cep?: string | null
                    cidade?: string | null
                    cnpj?: string | null
                    complemento?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    data_cadastro?: string | null
                    deleted_at?: string | null
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
                    bairro?: string | null
                    banco_agencia?: string | null
                    banco_conta?: string | null
                    banco_nome?: string | null
                    banco_pix?: string | null
                    banco_tipo?: string | null
                    calca?: string | null
                    camiseta?: string | null
                    cep?: string | null
                    cidade?: string | null
                    cnpj?: string | null
                    complemento?: string | null
                    cpf?: string | null
                    created_at?: string | null
                    data_cadastro?: string | null
                    deleted_at?: string | null
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
                Relationships: []
            }
            leads: {
                Row: {
                    brand: string
                    campaign_object: string | null
                    closed_value: number | null
                    created_at: string | null
                    deleted_at: string | null
                    id: string
                    influencer_ids: string[] | null
                    last_contact: string | null
                    phase: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value: number | null
                    responsible: string | null
                    scope: string | null
                    start_date: string | null
                    status: Database["public"]["Enums"]["lead_status"] | null
                    timeline: Json | null
                    value: number | null
                }
                Insert: {
                    brand: string
                    campaign_object?: string | null
                    closed_value?: number | null
                    created_at?: string | null
                    deleted_at?: string | null
                    id?: string
                    influencer_ids?: string[] | null
                    last_contact?: string | null
                    phase?: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value?: number | null
                    responsible?: string | null
                    scope?: string | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    timeline?: Json | null
                    value?: number | null
                }
                Update: {
                    brand?: string
                    campaign_object?: string | null
                    closed_value?: number | null
                    created_at?: string | null
                    deleted_at?: string | null
                    id?: string
                    influencer_ids?: string[] | null
                    last_contact?: string | null
                    phase?: Database["public"]["Enums"]["lead_phase"] | null
                    proposed_value?: number | null
                    responsible?: string | null
                    scope?: string | null
                    start_date?: string | null
                    status?: Database["public"]["Enums"]["lead_status"] | null
                    timeline?: Json | null
                    value?: number | null
                }
                Relationships: []
            }
            notifications: {
                Row: {
                    campaign_id: string | null
                    created_at: string | null
                    event_date: string | null
                    id: string
                    message: string
                    read: boolean | null
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    campaign_id?: string | null
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    message: string
                    read?: boolean | null
                    title: string
                    type: string
                    user_id: string
                }
                Update: {
                    campaign_id?: string | null
                    created_at?: string | null
                    event_date?: string | null
                    id?: string
                    message?: string
                    read?: boolean | null
                    title?: string
                    type?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            pre_approved_emails: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    email: string
                    role: Database["public"]["Enums"]["user_role"] | null
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    email: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    email?: string
                    role?: Database["public"]["Enums"]["user_role"] | null
                }
                Relationships: [
                    {
                        foreignKeyName: "pre_approved_emails_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    created_at: string | null
                    email: string
                    full_name: string | null
                    id: string
                    is_admin: boolean | null
                    permissions: Json | null
                    role: Database["public"]["Enums"]["user_role"] | null
                    status: Database["public"]["Enums"]["user_status"] | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    full_name?: string | null
                    id: string
                    is_admin?: boolean | null
                    permissions?: Json | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    full_name?: string | null
                    id?: string
                    is_admin?: boolean | null
                    permissions?: Json | null
                    role?: Database["public"]["Enums"]["user_role"] | null
                    status?: Database["public"]["Enums"]["user_status"] | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            settings: {
                Row: {
                    key: string
                    updated_at: string | null
                    value: Json
                }
                Insert: {
                    key: string
                    updated_at?: string | null
                    value: Json
                }
                Update: {
                    key?: string
                    updated_at?: string | null
                    value?: Json
                }
                Relationships: []
            }
            system_notes: {
                Row: {
                    color: string | null
                    content: string
                    created_at: string | null
                    created_by: string | null
                    id: string
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    color?: string | null
                    content: string
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    color?: string | null
                    content?: string
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    title?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "system_notes_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            templates: {
                Row: {
                    content: string
                    created_at: string | null
                    id: string
                    name: string
                    type: string
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: string
                    name: string
                    type: string
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: string
                    name?: string
                    type?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            check_user_permission: {
                Args: {
                    p_user_id: string
                    p_module: string
                    p_action: string
                }
                Returns: boolean
            }
            get_user_profile: {
                Args: {
                    target_id: string
                }
                Returns: Json
            }
            get_user_profile_with_permissions: {
                Args: {
                    p_user_id: string
                }
                Returns: {
                    id: string
                    email: string
                    full_name: string | null
                    role: Database["public"]["Enums"]["user_role"] | null
                    status: Database["public"]["Enums"]["user_status"] | null
                    is_admin: boolean | null
                    permissions: Json | null
                    created_at: string | null
                    updated_at: string | null
                }[]
            }
            promote_to_admin: {
                Args: {
                    p_user_id: string
                }
                Returns: boolean
            }
            update_user_permissions: {
                Args: {
                    p_user_id: string
                    p_permissions: Json
                }
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

type DefaultSchema = Database["public"]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
}
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            campaign_status: ["PLANEJAMENTO", "EM ANDAMENTO", "FINALIZADA"],
            lead_phase: ["1º CONTATO", "ORÇAMENTO", "NEGOCIAÇÃO"],
            lead_status: ["AGUARDANDO", "RECUSADO", "FECHADO"],
            user_role: ["ADMINISTRADOR", "INFLUENCIADOR", "CONVIDADO"],
            user_status: ["PENDENTE", "APROVADO", "BLOQUEADO"],
        },
    },
} as const
