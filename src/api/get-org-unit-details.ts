import {
  GetOrgUnitDetailsResponse,
  OrgUnitDetails,
} from '../types/org-unit-details';
import axiosInstance from './base-api';

export async function getOrgUnitDetails(id: string): Promise<OrgUnitDetails[]> {
  const response = await axiosInstance.get<GetOrgUnitDetailsResponse>(
      `${process.env.REACT_APP_BASE_URL}/ovc/api/trackedEntityInstances/query.json?ou=${id}&ouMode=ALL&order=created:desc&program=IXxHJADVCkb&pageSize=50&page=1&totalPages=false`
      // `/ovc/api/trackedEntityInstances/query.json?ou=${id}&ouMode=ALL&order=created:desc&program=IXxHJADVCkb&pageSize=50&page=1&totalPages=false`
  );
  const rows = response.data.rows;
  // console.log("orgunit res", response);
  // console.log("id res", id);
  return rows.map((row) => ({
    id: row[0],
    code: row[8],
    name: row[9],
    groupType: row[11],
    subGroup: row[13],
    activity: row[14],
    description: row[15],
    dateOfActivity: row[16],
    venue: row[17],
  }));
}
