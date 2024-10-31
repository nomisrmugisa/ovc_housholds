import { IOrgUnit } from '../types/OrgUnit';
import axiosInstance from './baseApi';

export async function getOrgUnits(search: string) {
  const response = await axiosInstance.get<{ organisationUnits: IOrgUnit[] }>(
    `${process.env.REACT_APP_BASE_URL}/ovc/api/organisationUnits.json?filter=displayName:ilike:${search}`
        // `/api/organisationUnits.json?filter=displayName:ilike:${search}` //use wth proxy
  );
  return response.data.organisationUnits;
}
