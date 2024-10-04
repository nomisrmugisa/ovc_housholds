export interface OrgUnitDetails {
  id: string;
  code: string;
  name: string;
  groupType: string;
  subGroup: string;
  activity: string;
  description: string;
  dateOfActivity: string;
  venue: string;
}

export interface GetOrgUnitDetailsResponse {
  rows: string[];
}
