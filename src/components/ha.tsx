import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable, Column } from 'react-table';
import '../styles/tableStyles.css';

interface DataRow {
  assessmentDate: string;
  organisationUnit: string;
  assessorName: string;
  serviceProvider: string;
  count: number;
}

const HouseholdsAssessed: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-01-31');
  const [orgUnitName, setOrgUnitName] = useState('');
  const [orgUnitId, setOrgUnitId] = useState('');

  useEffect(() => {
    if (orgUnitId) {
      fetchData();
    }
  }, [orgUnitId, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/ovc/api/40/analytics/events/query/HEWq6yr4cs5`, {
        params: {
          dimension: `IyKRQFkfwMk,ou:${orgUnitId},sYE3K7fFM4Y.QKgYbRzJWHB,tHCT4RKXoiU`,
          headers: 'eventdate,ouname,tHCT4RKXoiU,sYE3K7fFM4Y.QKgYbRzJWHB,IyKRQFkfwMk',
          totalPages: false,
          startDate: startDate.replace(/-/g, ''),
          endDate: endDate.replace(/-/g, ''),
          displayProperty: 'NAME',
          pageSize: 100,
          page: 1,
          includeMetadataDetails: true,
          outputType: 'EVENT',
          stage: 'sYE3K7fFM4Y',
        },
      });
      const filteredData = response.data.rows.filter((row: any) => {
        const assessmentDate = row[0].split(' ')[0];
        return assessmentDate >= startDate && assessmentDate <= endDate;
      });
      const aggregatedData = aggregateData(filteredData);
      setData(aggregatedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateData = (rows: any[]): DataRow[] => {
    const countMap: Record<string, { assessmentDate: string; organisationUnit: string; serviceProvider: string; count: number }> = {};

    rows.forEach(row => {
      const assessmentDate = row[0].split(' ')[0];
      const organisationUnit = row[1];
      const assessorName = row[3];
      const serviceProvider = row[4];

      if (countMap[assessorName]) {
        countMap[assessorName].count += 1;
      } else {
        countMap[assessorName] = { assessmentDate, organisationUnit, serviceProvider, count: 1 };
      }
    });

    return Object.entries(countMap).map(([assessorName, { assessmentDate, organisationUnit, serviceProvider, count }]) => ({
      assessmentDate,
      organisationUnit,
      assessorName,
      serviceProvider,
      count,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/ovc/api/organisationUnits?filter=displayName:ilike:${orgUnitName}&fields=id,displayName`);
      const orgUnit = response.data.organisationUnits.find((org_unit: any) =>
        org_unit.displayName.toLowerCase() === orgUnitName.toLowerCase()
      );

      if (orgUnit) {
        setOrgUnitId(orgUnit.id);
      } else {
        alert('Organisation Unit not found');
      }
    } catch (error) {
      console.error('Error fetching organisation units:', error);
    }
  };

  const columns: Column<DataRow>[] = React.useMemo(
    () => [
      { Header: 'HH Assessment Date', accessor: 'assessmentDate' },
      { Header: 'Organisation Unit', accessor: 'organisationUnit' },
      { Header: 'HVAT Assessor\'s Name', accessor: 'assessorName' },
      { Header: 'No. of HH Visited', accessor: 'count' },
      { Header: 'Name of Service Provider(PSW/SW)', accessor: 'serviceProvider' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
  } = useTable<DataRow>(
    {
      columns,
      data,
    }
  );

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </label>
        <label>
          Organisation Unit:
          <input
            type="text"
            value={orgUnitName}
            onChange={(e) => setOrgUnitName(e.target.value)}
            required
          />
        </label>
        <button type="submit">Search</button>
      </form>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table {...getTableProps()} style={{ border: 'solid 1px black' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} style={{ borderBottom: 'solid 3px black', background: 'aliceblue', color: 'black', fontWeight: 'bold' }}>
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return (
                      <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', background: 'aliceblue' }}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HouseholdsAssessed;
