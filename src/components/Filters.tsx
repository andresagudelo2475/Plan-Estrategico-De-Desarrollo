"use client";

import React from 'react';
import { FilterState } from '../services/types';

interface FiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    options: {
        clients: string[];
        directors: string[];
        managers: string[];
        creationDates: string[];
        startDates: string[];
    };
}

const Filters: React.FC<FiltersProps> = ({ filters, onChange, options }) => {
    const handleChange = (key: keyof FilterState, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="filters-container glass">
            <div className="filter-group">
                <label>Cliente</label>
                <select value={filters.client} onChange={(e) => handleChange('client', e.target.value)}>
                    <option value="">Todos los Clientes</option>
                    {options.clients.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Director</label>
                <select value={filters.director} onChange={(e) => handleChange('director', e.target.value)}>
                    <option value="">Todos</option>
                    {options.directors.map(d => d && <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Gerente</label>
                <select value={filters.manager} onChange={(e) => handleChange('manager', e.target.value)}>
                    <option value="">Todos</option>
                    {options.managers.map(m => m && <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Digital</label>
                <select value={filters.isDigital} onChange={(e) => handleChange('isDigital', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="Sí">Digital</option>
                    <option value="No">No Digital</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Estado</label>
                <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)}>
                    <option value="Todos">Todos</option>
                    <option value="10">En Curso</option>
                    <option value="14">Aceptado por Cliente</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Fecha Creación</label>
                <input
                    type="date"
                    value={filters.createdAt}
                    onChange={(e) => handleChange('createdAt', e.target.value)}
                />
            </div>

            <div className="filter-group">
                <label>Inicio Esperado</label>
                <input
                    type="date"
                    value={filters.expectedStartDate}
                    onChange={(e) => handleChange('expectedStartDate', e.target.value)}
                />
            </div>

            <style jsx>{`
        .filters-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: var(--border-radius-lg);
          margin-bottom: 2rem;
          border: 1px solid rgba(15, 15, 114, 0.1);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          text-transform: uppercase;
        }

        select, input[type="date"] {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: var(--border-radius-md);
          background: white;
          font-size: 0.9rem;
          color: var(--color-black);
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        select:focus, input[type="date"]:focus {
          border-color: var(--color-primary-main);
        }
      `}</style>
        </div>
    );
};

export default Filters;
