import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IOrgUnit } from './types/OrgUnit';
import { getOrgUnits } from './apis/getOrgUnits';
import React from 'react';
import '../styles/orgUnitSearch.css';

export function OrgUnitSearch() {
    const [search, setSearch] = useState('');
    const [orgUnits, setOrgUnits] = useState<IOrgUnit[]>([]);
    const history = useHistory();

    return (
        <header className="org-unit-search-header">
            <input
                className="search-input"
                placeholder="Search for org unit"
                value={search}
                onChange={async (e) => {
                    const inputValue = e.target.value;
                    setSearch(inputValue);

                    if (inputValue.length === 0) {
                        setOrgUnits([]);
                        return;
                    }

                    try {
                        const data = await getOrgUnits(inputValue);
                        setOrgUnits(data || []);
                    } catch (error) {
                        console.error("Error fetching org units:", error);
                        setOrgUnits([]);
                    }
                }}
            />
            <ul className="org-unit-list">
                {search && Array.isArray(orgUnits) && orgUnits.length > 0 ? (
                    orgUnits.map((orgUnit) => (
                        <li
                            onClick={() => {
                                setSearch(orgUnit.displayName);
                                history.push(`/${orgUnit.id}`);
                                setOrgUnits([]);
                            }}
                            key={orgUnit.id}
                            className="org-unit-item"
                        >
                            {orgUnit.displayName}
                        </li>
                    ))
                ) : (
                    search && <li className="no-results">No results found</li>
                )}
            </ul>
        </header>
    );
}