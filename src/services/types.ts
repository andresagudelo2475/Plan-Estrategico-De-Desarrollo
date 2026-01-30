export interface Initiative {
    id_cxm_strategic_development_plan: number;
    client: string;
    director: string;
    id_dp_clientes: number;
    initiative_name: string;
    general_description: string;
    identified_need: string;
    execution_detail: string;
    initiative_nature_id: number;
    digital_nature: 0 | 1; // 0 = No, 1 = Yes
    client_strategic_pillar: string;
    visibility_level_id: number;
    responsible_company_id: number;
    analyst_participation: number;
    implementation_analyst_name: string;
    operational_responsible_konecta: string; // The "Manager"
    client_responsible: string;
    expected_start_date: string;
    expected_end_date: string;
    first_impact_indicator: string;
    current_status_first_indicator: number;
    goal_first_indicator: string;
    current_status_id: number;
    current_progress_percentage: number;
    expected_progress_percentage: number;
    execution_punctuality_id: number;
    commercial_margin: number;
    annual_total_income: number; // ITY
    annual_total_value: number; // TAV
    total_contract_value: number; // TCV
    digital_products: string; // Comma separated list of products
    created_at: string;
    origin: string;
    konecta_strategic_pillar: string;
    visibility_level: string;
}

export interface FinancialSummary {
    ity: number;
    tav: number;
    tcv: number;
    mc: number; // Weighted average margin
}

export interface ClientFinancialSummary {
    client: string;
    ity: number;
    tav: number;
    tcv: number;
    mc: number;
    count: number;
}

export interface FilterState {
    client: string;
    director: string;
    manager: string;
    isDigital: 'Todos' | 'Sí' | 'No';
    status: string;
    digitalProduct: string;
    createdAt: string;
    expectedStartDate: string;
}
