import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable, Column } from 'react-table';
import '../styles/tableStyles.css';

interface DataRow {
  organisationUnit: string;
  assessorName: string;
  serviceProvider: string;
  count: number;
}

const HouseholdsAssessed: React.FC = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/ovc/api/40/analytics/events/query/HEWq6yr4cs5?dimension=ou%3ATNPKjBNN2gy,tHCT4RKXoiU,sYE3K7fFM4Y.QKgYbRzJWHB,IyKRQFkfwMk&headers=eventdate,ouname,tHCT4RKXoiU,sYE3K7fFM4Y.QKgYbRzJWHB,IyKRQFkfwMk&totalPages=false&eventDate=202409&displayProperty=NAME&pageSize=100&page=1&includeMetadataDetails=true&outputType=EVENT&stage=sYE3K7fFM4Y&desc=IyKRQFkfwMk`);
        const aggregatedData = aggregateData(response.data.rows);
        setData(aggregatedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const aggregateData = (rows: any[]): DataRow[] => {
    const countMap: Record<string, { organisationUnit: string; serviceProvider: string; count: number }> = {};

    rows.forEach(row => {
      const organisationUnit = row[1]; // Assuming the organisation unit is in the 2nd column
      const assessorName = row[3]; // Assuming the assessor's name is in the 4th column
      const serviceProvider = row[4]; // Assuming the service provider is in the 5th column

      if (countMap[assessorName]) {
        countMap[assessorName].count += 1;
      } else {
        countMap[assessorName] = { organisationUnit, serviceProvider, count: 1 };
      }
    });

    return Object.entries(countMap).map(([assessorName, { organisationUnit, serviceProvider, count }]) => ({
      organisationUnit,
      assessorName,
      serviceProvider,
      count,
    }));
  };

  const columns: Column<DataRow>[] = React.useMemo(
    () => [
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
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table {...getTableProps()} style={{ border: 'solid 1px black' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} style={{ borderBottom: 'solid 3px red', background: 'aliceblue', color: 'black', fontWeight: 'bold' }}>
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
                      <td {...cell.getCellProps()} style={{ padding: '10px', border: 'solid 1px gray', background: 'papayawhip' }}>
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
