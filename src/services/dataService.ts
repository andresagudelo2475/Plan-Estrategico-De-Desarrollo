import { Initiative, FinancialSummary, FilterState } from './types';

export const initialFilters: FilterState = {
    client: '',
    manager: '',
    isDigital: 'Todos',
    status: 'Todos',
    digitalProduct: '',
};

export const mockInitiatives: Initiative[] = [
    {
        id_cxm_strategic_development_plan: 13,
        id_dp_clientes: 171,
        initiative_name: 'CX Sura Panamá y Republica Dominicana',
        general_description: 'Televenta - seguros autos, hogar etc para republica dominica, panama',
        identified_need: 'Atención de seguros autos para otras regiones que generan mayor ingreso',
        execution_detail: 'Aceptado por el cliente',
        initiative_nature_id: 1,
        digital_nature: 0,
        client_strategic_pillar: 'Por definir gerente',
        visibility_level_id: 50,
        responsible_company_id: 53,
        analyst_participation: 0,
        implementation_analyst_name: '\\N',
        operational_responsible_konecta: 'Jaime Humberto Gallego',
        client_responsible: 'BiBiana Patricia Mira',
        client: 'Sura Panamá',
        director: 'Jaime Humberto Gallego',
        expected_start_date: '2026-06-01',
        expected_end_date: '2026-06-01',
        first_impact_indicator: 'Nivel de servicio',
        current_status_first_indicator: 80,
        goal_first_indicator: '80/20',
        current_status_id: 14,
        current_progress_percentage: 1,
        expected_progress_percentage: 1,
        execution_punctuality_id: 57,
        commercial_margin: 0,
        annual_total_income: 541439000,
        annual_total_value: 315840000,
        total_contract_value: 541439000,
        digital_products: '',
        created_at: '2026-01-26 07:59:34',
    },
    {
        id_cxm_strategic_development_plan: 14,
        id_dp_clientes: 171,
        initiative_name: 'P&S Suratech Colombia',
        general_description: 'Propuesta de plataformas integrar ecosistema de sura chile.',
        identified_need: 'Integración de los procesos y transversalizar plataformas',
        execution_detail: 'Aceptado por el cliente',
        initiative_nature_id: 1,
        digital_nature: 1,
        client_strategic_pillar: 'Por definir gerente',
        visibility_level_id: 50,
        responsible_company_id: 53,
        analyst_participation: 0,
        implementation_analyst_name: '\\N',
        operational_responsible_konecta: 'Jaime Humberto Gallego',
        client_responsible: 'BiBiana Patricia Mira',
        client: 'Suratech Colombia',
        director: 'Jaime Humberto Gallego',
        expected_start_date: '2026-04-01',
        expected_end_date: '2026-04-01',
        first_impact_indicator: 'Por definir gerente',
        current_status_first_indicator: 100,
        goal_first_indicator: '100',
        current_status_id: 14,
        current_progress_percentage: 0,
        expected_progress_percentage: 0,
        execution_punctuality_id: 57,
        commercial_margin: 0,
        annual_total_income: 384026000,
        annual_total_value: 288020000,
        total_contract_value: 384026000,
        digital_products: 'Cloud CRM, Analytics Pro',
        created_at: '2026-01-26 07:59:34',
    },
    {
        id_cxm_strategic_development_plan: 15,
        id_dp_clientes: 172,
        initiative_name: 'Eficiencia Operativa Bancolombia',
        general_description: 'Optimización de procesos de cartera',
        identified_need: 'Reducción de tiempos de respuesta',
        execution_detail: 'En ejecución',
        initiative_nature_id: 2,
        digital_nature: 1,
        client_strategic_pillar: 'Eficiencia',
        visibility_level_id: 10,
        responsible_company_id: 53,
        analyst_participation: 1,
        implementation_analyst_name: 'Andres Agudelo',
        operational_responsible_konecta: 'Maria Paula Velez',
        client_responsible: 'Carlos Rodriguez',
        client: 'Bancolombia',
        director: 'Maria Paula Velez',
        expected_start_date: '2026-01-01',
        expected_end_date: '2026-12-31',
        first_impact_indicator: 'Tiempo de respuesta',
        current_status_first_indicator: 45,
        goal_first_indicator: '30 seg',
        current_status_id: 10,
        current_progress_percentage: 65,
        expected_progress_percentage: 70,
        execution_punctuality_id: 57,
        commercial_margin: 25.5,
        annual_total_income: 1200000000,
        annual_total_value: 1000000000,
        total_contract_value: 2400000000,
        digital_products: 'Data Warehouse, Mobile App',
        created_at: '2026-01-20 08:00:00',
    }
];

export const filterInitiatives = (data: Initiative[], filters: FilterState): Initiative[] => {
    return data.filter(item => {
        if (filters.client && item.client !== filters.client) return false;
        if (filters.manager && item.director !== filters.manager) return false;
        if (filters.isDigital === 'Sí' && item.digital_nature !== 1) return false;
        if (filters.isDigital === 'No' && item.digital_nature !== 0) return false;
        if (filters.status !== 'Todos' && String(item.current_status_id) !== filters.status) return false;
        if (filters.digitalProduct && (!item.digital_products || !item.digital_products.includes(filters.digitalProduct))) return false;
        return true;
    });
};

export const calculateFinancials = (data: Initiative[]): FinancialSummary => {
    if (data.length === 0) return { ity: 0, tav: 0, tcv: 0, mc: 0 };

    const ity = data.reduce((sum, item) => sum + item.annual_total_income, 0);
    const tav = data.reduce((sum, item) => sum + item.annual_total_value, 0);
    const tcv = data.reduce((sum, item) => sum + item.total_contract_value, 0);

    const totalWeight = data.reduce((sum, item) => sum + item.total_contract_value, 0);
    const weightedMC = totalWeight > 0
        ? data.reduce((sum, item) => sum + (item.commercial_margin * item.total_contract_value), 0) / totalWeight
        : 0;

    return { ity, tav, tcv, mc: weightedMC };
};

export const getDigitalProductsCount = (data: Initiative[]): Record<string, number> => {
    const counts: Record<string, number> = {};
    data.filter(i => i.digital_nature === 1).forEach(item => {
        if (item.digital_products) {
            const products = item.digital_products.split(',').map(p => p.trim());
            products.forEach(product => {
                if (product) {
                    counts[product] = (counts[product] || 0) + 1;
                }
            });
        }
    });
    return counts;
};
