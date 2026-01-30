"use client";

import React, { useState, useMemo } from 'react';
import {
    Filter,
    LayoutList,
    TrendingUp,
    X,
    ChevronRight,
    LayoutDashboard,
    FileText,
    Users,
    Activity,
    Target,
    AlertCircle,
    Play,
    CheckCircle,
    Clock
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LabelList,
    Legend
} from 'recharts';
import KPICard from './KPICard';
import Filters from './Filters';
import Modal from './Modal';
import {
    mockInitiatives,
    filterInitiatives,
    calculateFinancials,
    calculateFinancialsByClient,
    getDigitalProductsCount,
    initialFilters
} from '@/services/dataService';

const COLORS = ['#0F0F72', '#2800c8', '#A6B7FF', '#F0FA00', '#DB1F51', '#FD6221', '#0DCA61', '#09BFB0', '#04B4FD'];

type Dimension = 'client' | 'director';

export default function Dashboard() {
    const [filters, setFilters] = useState(initialFilters);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [quantityDimension, setQuantityDimension] = useState<Dimension>('client');
    const [natureTableDigitalFilter, setNatureTableDigitalFilter] = useState<'Todos' | 'Digital' | 'No Digital'>('Todos');
    const [financialTableStatusFilter, setFinancialTableStatusFilter] = useState<'Todos' | '10' | '14'>('Todos');

    const filteredData = useMemo(() => filterInitiatives(mockInitiatives, filters), [filters]);
    const financialData = useMemo(() => calculateFinancials(filteredData), [filteredData]);
    const digitalProductsCount = useMemo(() => getDigitalProductsCount(filteredData), [filteredData]);

    const chartData = useMemo(() => {
        const counts: Record<string, { name: string, digital: number, nonDigital: number, total: number }> = {};

        filteredData.forEach(item => {
            const key = item[quantityDimension] || 'Sin Especificar';
            if (!counts[key]) {
                counts[key] = { name: key, digital: 0, nonDigital: 0, total: 0 };
            }
            if (item.digital_nature === 1) counts[key].digital++;
            else counts[key].nonDigital++;
            counts[key].total++;
        });

        return Object.values(counts).sort((a, b) => b.total - a.total);
    }, [filteredData, quantityDimension]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        const statusMap: Record<number, string> = {
            10: 'En Ejecución',
            14: 'Aceptado por Cliente',
        };
        filteredData.forEach(i => {
            const label = statusMap[i.current_status_id] || 'Otro';
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const digitalProductsTableData = useMemo(() => {
        return Object.entries(digitalProductsCount).map(([name, value]) => ({ name, value }));
    }, [digitalProductsCount]);

    const financialSummaryByClient = useMemo(() => {
        let data = filteredData;
        if (financialTableStatusFilter !== 'Todos') {
            data = data.filter(i => String(i.current_status_id) === financialTableStatusFilter);
        }
        return calculateFinancialsByClient(data);
    }, [filteredData, financialTableStatusFilter]);

    const natureData = useMemo(() => {
        let data = filteredData;
        if (natureTableDigitalFilter === 'Digital') data = data.filter(i => i.digital_nature === 1);
        if (natureTableDigitalFilter === 'No Digital') data = data.filter(i => i.digital_nature === 0);

        const counts: Record<string, number> = {};
        const natureMap: Record<number, string> = {
            1: 'Crecimiento',
            2: 'Eficiencia',
            3: 'Innovación',
            4: 'Retención'
        };

        data.forEach(item => {
            const client = item.client || 'Sin Cliente';
            const nature = natureMap[item.initiative_nature_id] || 'Otro';
            const origin = item.origin || 'N/A';
            const pillar = item.konecta_strategic_pillar || 'N/A';
            const visibility = item.visibility_level || 'N/A';

            const key = `${client}|${nature}|${origin}|${pillar}|${visibility}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        const result = Object.entries(counts).map(([key, count]) => {
            const [client, nature, origin, pillar, visibility] = key.split('|');
            return { client, nature, origin, pillar, visibility, count };
        });
        return result.sort((a, b) => b.count - a.count);
    }, [filteredData, natureTableDigitalFilter]);

    const filterOptions = useMemo(() => ({
        clients: Array.from(new Set(mockInitiatives.map(i => i.client))).sort(),
        directors: Array.from(new Set(mockInitiatives.map(i => i.director))).sort(),
        managers: Array.from(new Set(mockInitiatives.map(i => i.operational_responsible_konecta))).sort(),
        creationDates: Array.from(new Set(mockInitiatives.map(i => i.created_at.split(' ')[0]))).sort().reverse(),
        startDates: Array.from(new Set(mockInitiatives.map(i => i.expected_start_date))).sort().reverse(),
    }), []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.client) count++;
        if (filters.director) count++;
        if (filters.manager) count++;
        if (filters.isDigital !== 'Todos') count++;
        if (filters.status !== 'Todos') count++;
        if (filters.digitalProduct) count++;
        if (filters.createdAt) count++;
        if (filters.expectedStartDate) count++;
        return count;
    }, [filters]);

    const chronologicalStats = useMemo(() => {
        const today = new Date('2026-01-29');
        let overdue = 0;
        let notStarted = 0;
        let completed = 0;
        let expiringSoon = 0;

        filteredData.forEach(item => {
            const endDate = new Date(item.expected_end_date);
            const progress = item.current_progress_percentage;

            if (progress === 100) {
                completed++;
            } else if (progress === 0) {
                notStarted++;
            }

            if (progress < 100 && endDate < today) {
                overdue++;
            }

            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (progress < 100 && diffDays > 0 && diffDays <= 30) {
                expiringSoon++;
            }
        });

        return { overdue, notStarted, completed, expiringSoon };
    }, [filteredData]);

    const punctualityScore = useMemo(() => {
        if (filteredData.length === 0) return 0;
        const onTime = filteredData.filter(i => i.current_progress_percentage >= i.expected_progress_percentage).length;
        return (onTime / filteredData.length) * 100;
    }, [filteredData]);

    return (
        <div className="app-container">
            <header className="page-header-integrated">
                <div className="integrated-header-content">
                    <div className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>Plan Estrategico de Desarrollo</div>
                    <div className="header-actions">
                        {activeFiltersCount > 0 && (
                            <button className="premium-btn text-only" onClick={() => setFilters(initialFilters)}>
                                Limpiar Filtros
                            </button>
                        )}
                        <button className={`premium-btn ${activeFiltersCount > 0 ? 'active' : ''}`} onClick={() => setIsFiltersModalOpen(true)}>
                            <Filter size={18} />
                            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>
                        <button className="premium-btn secondary" onClick={() => setIsManualModalOpen(true)}>
                            <LayoutList size={18} />
                            Manual
                        </button>
                    </div>
                </div>
            </header>

            <main className="content">
                <div className="dashboard-grid">
                    {/* Indicators Row */}
                    <div className="top-stats-row">
                        <div className="card gauge-stat-card">
                            <div className="stat-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '1rem' }}>Puntualidad de Ejecución</div>
                            <div className="gauge-container">
                                <ResponsiveContainer width="100%" height={120}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Value', value: punctualityScore, fill: punctualityScore >= 90 ? '#0DCA61' : punctualityScore >= 70 ? '#F0FA00' : '#DB1F51' },
                                                { name: 'Rest', value: 100 - punctualityScore, fill: '#edf2f7' }
                                            ]}
                                            cx="50%"
                                            cy="100%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="gauge-value">{punctualityScore.toFixed(1)}%</div>
                                <div className="gauge-subtitle">{punctualityScore >= 90 ? 'Óptimo' : punctualityScore >= 70 ? 'Satisfactorio' : 'En Riesgo'}</div>
                            </div>
                        </div>

                        <KPICard title="ITY Estimado (USD)" value={financialData.ity.toLocaleString()} icon={<TrendingUp size={20} />} trend="up" trendValue="+12.5%" />
                        <KPICard title="MC Ponderado" value={`${financialData.mc.toFixed(1)}%`} icon={<Activity size={20} />} trend="up" trendValue="+2.1%" />
                        <KPICard title="TAV Proyectado" value={financialData.tav.toLocaleString()} icon={<Target size={20} />} trend="up" trendValue="+5.4%" />
                        <KPICard title="TCV Total" value={financialData.tcv.toLocaleString()} icon={<TrendingUp size={20} />} trend="up" trendValue="+8.2%" />

                        <div className="card" style={{ padding: '1rem' }}>
                            <div className="stat-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estado Cronológico</div>
                            <div className="chronological-kpi-group">
                                <div className="kpi-mini-item" style={{ borderLeftColor: '#DB1F51' }}>
                                    <div className="title">Vencidas</div>
                                    <div className="value-row">
                                        <AlertCircle size={14} color="#DB1F51" />
                                        <div className="value">{chronologicalStats.overdue}</div>
                                    </div>
                                </div>
                                <div className="kpi-mini-item" style={{ borderLeftColor: '#718096' }}>
                                    <div className="title">Sin Iniciar</div>
                                    <div className="value-row">
                                        <Play size={14} color="#718096" />
                                        <div className="value">{chronologicalStats.notStarted}</div>
                                    </div>
                                </div>
                                <div className="kpi-mini-item" style={{ borderLeftColor: '#0DCA61' }}>
                                    <div className="title">Completadas</div>
                                    <div className="value-row">
                                        <CheckCircle size={14} color="#0DCA61" />
                                        <div className="value">{chronologicalStats.completed}</div>
                                    </div>
                                </div>
                                <div className="kpi-mini-item" style={{ borderLeftColor: '#FFAD0D' }}>
                                    <div className="title">Próximas</div>
                                    <div className="value-row">
                                        <Clock size={14} color="#FFAD0D" />
                                        <div className="value">{chronologicalStats.expiringSoon}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Charts Row - TRIPLE COLUMN */}
                    {/* Main Charts Row - SYMMETRIC DOUBLE COLUMN */}
                    <div className="main-charts-row-double">
                        <div className="card">
                            <div className="section-header-modern">
                                <h4>Resumen de Cantidades por {quantityDimension === 'client' ? 'Cliente' : 'Director'}</h4>
                                <div className="dimension-switch">
                                    <button className={quantityDimension === 'client' ? 'active' : ''} onClick={() => setQuantityDimension('client')}>Cliente</button>
                                    <button className={quantityDimension === 'director' ? 'active' : ''} onClick={() => setQuantityDimension('director')}>Director</button>
                                </div>
                            </div>

                            <div className="horizontal-split-content">
                                <div className="table-zone-small">
                                    <table className="compact-detail-table">
                                        <thead>
                                            <tr>
                                                <th>{quantityDimension === 'client' ? 'Cliente' : 'Director'}</th>
                                                <th style={{ textAlign: 'center' }}>Digital</th>
                                                <th style={{ textAlign: 'center' }}>No Digital</th>
                                                <th style={{ textAlign: 'center' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.map((item, idx) => (
                                                <tr key={idx} onClick={() => {
                                                    const field = quantityDimension === 'client' ? 'client' : 'director';
                                                    setFilters(prev => ({ ...prev, [field]: item.name }));
                                                }} style={{ cursor: 'pointer' }}>
                                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                                    <td style={{ textAlign: 'center', color: '#0F0F72', fontWeight: 700 }}>{item.digital}</td>
                                                    <td style={{ textAlign: 'center', color: '#2800c8', fontWeight: 700 }}>{item.nonDigital}</td>
                                                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{item.total}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="chart-zone-small">
                                    <div className="legend-custom-bar">
                                        <div className="legend-item"><span className="dot digital"></span> Digital</div>
                                        <div className="legend-item"><span className="dot nondigital"></span> No Digital</div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart
                                            data={chartData}
                                            onClick={(data) => {
                                                if (data && data.activeLabel) {
                                                    const field = quantityDimension === 'client' ? 'client' : 'director';
                                                    setFilters(prev => ({ ...prev, [field]: String(data.activeLabel) }));
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} />
                                            <YAxis axisLine={false} tickLine={false} fontSize={11} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="digital" fill="#0F0F72" radius={[4, 4, 0, 0]} barSize={20} />
                                            <Bar dataKey="nonDigital" fill="#2800c8" radius={[4, 4, 0, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="section-header-modern">
                                <h4>Detalle Portafolio Digital</h4>
                            </div>
                            <div className="horizontal-split-content">
                                <div className="table-zone-small">
                                    <table className="compact-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cant.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {digitalProductsTableData.map((item, idx) => (
                                                <tr key={idx} onClick={() => setFilters(prev => ({ ...prev, digitalProduct: item.name }))} style={{ cursor: 'pointer' }}>
                                                    <td>{item.name}</td>
                                                    <td>{item.value}</td>
                                                </tr>
                                            ))}
                                            {digitalProductsTableData.length === 0 && (
                                                <tr><td colSpan={2} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No hay datos digitales</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="chart-zone-small">
                                    <ResponsiveContainer width="100%" height={220}>
                                        {digitalProductsTableData.length > 5 ? (
                                            <BarChart
                                                data={digitalProductsTableData}
                                                layout="vertical"
                                                margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                                                onClick={(data) => {
                                                    if (data && data.activeLabel) {
                                                        setFilters(prev => ({ ...prev, digitalProduct: String(data.activeLabel) }));
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} width={80} />
                                                <Tooltip />
                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                    {digitalProductsTableData.map((entry, index) => (
                                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        ) : (
                                            <PieChart>
                                                <Pie
                                                    data={digitalProductsTableData}
                                                    innerRadius={0}
                                                    outerRadius={70}
                                                    paddingAngle={0}
                                                    dataKey="value"
                                                    label={({ value }) => `${value}`}
                                                    onClick={(data) => {
                                                        if (data && data.name) {
                                                            setFilters(prev => ({ ...prev, digitalProduct: data.name }));
                                                        }
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {digitalProductsTableData.map((entry, index) => (
                                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                                            </PieChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Row - SYMMETRIC DOUBLE COLUMN */}
                    <div className="main-charts-row-double">
                        <div className="card">
                            <div className="section-header-modern">
                                <h4>Distribución por Estado</h4>
                            </div>
                            <div style={{ height: '220px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            innerRadius={0}
                                            outerRadius={110}
                                            dataKey="value"
                                            label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                            onClick={(data) => {
                                                if (data && data.name) {
                                                    const statusMap: Record<number, string> = {
                                                        10: 'En Ejecución',
                                                        14: 'Aceptado por Cliente',
                                                    };
                                                    const entry = Object.entries(statusMap).find(([id, name]) => name === data.name);
                                                    if (entry) {
                                                        setFilters(prev => ({ ...prev, status: entry[0] }));
                                                    }
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {statusData.map((entry: any, index: number) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card">
                            <div className="section-header-modern">
                                <h4>Resumen por Naturaleza</h4>
                                <div className="dimension-switch">
                                    <button className={natureTableDigitalFilter === 'Todos' ? 'active' : ''} onClick={() => setNatureTableDigitalFilter('Todos')}>Todos</button>
                                    <button className={natureTableDigitalFilter === 'Digital' ? 'active' : ''} onClick={() => setNatureTableDigitalFilter('Digital')}>Digital</button>
                                    <button className={natureTableDigitalFilter === 'No Digital' ? 'active' : ''} onClick={() => setNatureTableDigitalFilter('No Digital')}>No Digital</button>
                                </div>
                            </div>
                            <div className="table-zone-small" style={{ height: '220px', overflowY: 'auto', overflowX: 'auto' }}>
                                <table className="compact-detail-table">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Naturaleza</th>
                                            <th>Origen</th>
                                            <th>Pilar Konecta</th>
                                            <th>Visibilidad</th>
                                            <th style={{ textAlign: 'center' }}>Cuenta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {natureData.map((item: any, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 600 }}>{item.client}</td>
                                                <td>{item.nature}</td>
                                                <td>{item.origin}</td>
                                                <td>{item.pillar}</td>
                                                <td>{item.visibility}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-primary-main)' }}>{item.count}</td>
                                            </tr>
                                        ))}
                                        {natureData.length === 0 && (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No hay datos disponibles</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="card">
                        <div className="section-header-modern">
                            <div>
                                <h4>Resumen Financiero</h4>
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>ITY: Ingreso Año | TAV: Ingreso 12m | TCV: Total Contrato</p>
                            </div>
                            <div className="dimension-switch">
                                <button className={financialTableStatusFilter === 'Todos' ? 'active' : ''} onClick={() => setFinancialTableStatusFilter('Todos')}>Todos</button>
                                <button className={financialTableStatusFilter === '10' ? 'active' : ''} onClick={() => setFinancialTableStatusFilter('10')}>En Ejecución</button>
                                <button className={financialTableStatusFilter === '14' ? 'active' : ''} onClick={() => setFinancialTableStatusFilter('14')}>Cerrados</button>
                            </div>
                        </div>
                        <div className="table-wrapper-scroll" style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                            <table className="compact-detail-table financial-table">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Cliente</th>
                                        <th style={{ textAlign: 'center' }}>Iniciativas</th>
                                        <th style={{ textAlign: 'right' }}>ITY (USD)</th>
                                        <th style={{ textAlign: 'right' }}>TAV (USD)</th>
                                        <th style={{ textAlign: 'right' }}>TCV (USD)</th>
                                        <th style={{ textAlign: 'center' }}>MC Ponderado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financialSummaryByClient.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 600, textAlign: 'left' }}>{item.client}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.count}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>${item.ity.toLocaleString()}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>${item.tav.toLocaleString()}</td>
                                            <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-main)' }}>${item.tcv.toLocaleString()}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: item.mc > 25 ? '#e6fffa' : '#fff5f5',
                                                    color: item.mc > 25 ? '#0DCA61' : '#DB1F51',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {item.mc.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {financialSummaryByClient.length === 0 && (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>No hay datos financieros para los filtros seleccionados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="card">
                        <div className="section-header-modern">
                            <h4>Iniciativas Recientes</h4>
                        </div>
                        <div className="table-wrapper-scroll" style={{ overflowX: 'auto', maxHeight: '350px', overflowY: 'auto' }}>
                            <table className="detail-table-impact" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #edf2f7', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Iniciativa</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Origen</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Pilar Konecta</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Visibilidad</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Primer Impacto</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Director</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Estado</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Progreso</th>
                                        <th style={{ padding: '1rem', fontSize: '0.8rem', color: '#666' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.slice(0, 8).map(item => (
                                        <tr key={item.id_cxm_strategic_development_plan} style={{ borderBottom: '1px solid #f7fafc' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 700, color: '#2d3748' }}>{item.initiative_name}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>{item.client}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.origin}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.konecta_strategic_pillar}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.visibility_level}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{item.first_impact_indicator}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{item.director}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    background: item.current_progress_percentage >= item.expected_progress_percentage ? '#e6fffa' : '#fff5f5',
                                                    color: item.current_progress_percentage >= item.expected_progress_percentage ? '#0DCA61' : '#DB1F51'
                                                }}>
                                                    {item.current_status_id === 10 ? 'EJECUCIÓN' : 'ACEPTADO'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: '#edf2f7', borderRadius: '3px' }}>
                                                        <div style={{ width: `${item.current_progress_percentage}%`, height: '100%', background: 'var(--color-primary-main)', borderRadius: '3px' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.current_progress_percentage}%</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button style={{
                                                    background: 'transparent',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '4px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer'
                                                }}>Detalle</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            <Modal isOpen={isFiltersModalOpen} onClose={() => setIsFiltersModalOpen(false)} title="Filtros del Dashboard">
                <Filters
                    filters={filters}
                    onChange={setFilters}
                    options={filterOptions}
                />
            </Modal>

            <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Manual de Usuario">
                <div className="manual-content">
                    <div className="section">
                        <h5>🎯 Propósito</h5>
                        <p>Visualizar el desempeño estratégico de las iniciativas de CXM, permitiendo un seguimiento real de la puntualidad y el impacto financiero.</p>
                    </div>
                    <div className="section">
                        <h5>🖱️ Interactividad Exploratoria</h5>
                        <ul>
                            <li><strong>Clic en Barras</strong>: Haz clic en una barra para filtrar todo el dashboard por ese Cliente o Director.</li>
                            <li><strong>Clic en Tortas</strong>: Haz clic en un segmento de las gráficas circulares para filtrar por Estado o Producto Digital.</li>
                            <li><strong>Limpiar</strong>: Usa el botón "Limpiar Filtros" en el header para volver a la vista global.</li>
                        </ul>
                    </div>
                    <div className="section">
                        <h5>📊 Indicadores</h5>
                        <ul>
                            <li><strong>Puntualidad</strong>: Compara el progreso actual vs el esperado. Verde indica cumplimiento.</li>
                            <li><strong>ITY/TAV/TCV</strong>: Métricas financieras proyectadas para el año en curso.</li>
                        </ul>
                    </div>
                </div>
            </Modal>
        </div >
    );
}
