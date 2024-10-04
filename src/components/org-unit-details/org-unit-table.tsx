import {useEffect, useState} from 'react';

import {Header} from '../header';
import {Table, TablePagination} from '../common/table';
import {orgUnitDetailsColumns} from '../../table/org-unit-details';
import {OrgUnitDetails} from '../../types/org-unit-details';
import {useTable} from '../../hooks/use-table';
import {useHistory} from 'react-router-dom';
import React from 'react';
import '../org-unit-about/form-styles.css';
import {useOrgUnitDetails} from "../../hooks/use-org-unit-details";
import {deleteGroup} from "../org-unit-about/deleteGroup";
import {handleDelete} from "./deleteRecord";

type Props = {
    orgUnitDetails: OrgUnitDetails[];
    orgUnitId: string;
};

export function OrgUnitTable(props: Props) {
    const [loading, setLoading] = useState(true); //fetching data
    const {data, isLoading, refetch} = useOrgUnitDetails(props.orgUnitId); //fetch data
    const credentials = btoa(`Skununka:Nomisr123$$$$}`);
    const [search, setSearch] = useState('');
    const history = useHistory();
    const [formVisible, setFormVisible] = useState(false);
    const [trigger, setTrigger] = useState(0); // State to trigger useEffect
    const [getCode, setGetCode] = useState(false); // loader for getting code
    const [userData, setUserData] = useState({
        username: '',
        surname: '',
        firstName: '',
        id: ''
    });
    const [formData, setFormData] = useState({
        name: 'ROM',
        code: '',
        groupType: '',
        other: '',
        subGroup: '',
        activity: '',
        activityCode: '',
        description: '',
        dateOfActivity: '',
        venue: ''
    }); // Add initial form data
    // console.log("orgUnitDetails", props.orgUnitDetails);
    const [message, setMessage] = useState(null); // State for success or error message
    const [isError, setIsError] = useState(false); // State to track if the message is an error
    const [saving, setSaving] = useState(false); //loader for saving entry
    const [orgUnitCode, setOrgUnitcode] = useState('');
    // const table = useTable({
    //     data: props.orgUnitDetails,
    //     columns: orgUnitDetailsColumns(credentials, setMessage, setIsError),
    //     globalFilter: search,
    //     setGlobalFilter: setSearch,
    // });

    useEffect(() => {
        // Set loading to false when data is available or an error occurs
        if (!isLoading) {
            setLoading(false);
        }
    }, [isLoading]);

    // Options for the "Sub Group" dropdown based on the "Group Type"
    const getSubGroupOptions = () => {
        switch (formData.groupType) {
            case '1. VSLA Group':
                return [
                    {value: 'Group VSLA methodology sessions ', label: 'Group VSLA methodology sessions'},
                    {value: 'VSLA monitoring & Support supervision ', label: 'VSLA monitoring & Support supervision'},
                    {value: 'VSLA saving and borrowing ', label: 'VSLA saving and borrowing'},
                    {value: 'VSLA TOT/ Refresher', label: 'VSLA TOT/ Refresher'},
                    {value: 'Financial Literacy', label: 'Financial Literacy'},
                    {value: 'Bank Linkages', label: 'Bank Linkages'},
                    {value: 'SPM Training Sessions', label: 'SPM Training Sessions'}
                ];
            case '2. Sinovuyo':
                return [
                    {value: 'SINOVUYO SESSIONS', label: 'SINOVUYO SESSIONS'},
                ];
            case '3. ECD':
                return [
                    {value: 'Early Childhood Development Sessions', label: 'Early Childhood Development Sessions'}
                ];
            case '4. AFLATEEN':
                return [
                    {value: 'AFLATEEN ', label: 'AFLATEEN '},
                ];
            case '5. NMN':
                return [
                    {value: 'No means No sessions (Boys)', label: 'No means No sessions (Boys)'},
                    {value: 'No means No sessions (Girls)', label: 'No means No sessions (Girls)'}
                ];
            case '6. Financial Literacy':
                return [
                    {value: 'Financial Literacy', label: 'Financial Literacy'},

                ];
            case '7. SPM':
                return [
                    {value: 'SPM Training Sessions', label: 'SPM Training Sessions'}
                ];
            case '8. Work Readiness':
                return [
                    {value: 'Work Readiness Assessment', label: 'Work Readiness Assessment'}
                ];
            default:
                return [];
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            setGetCode(true);

            try {
                // First request: Fetch the organization unit code
                const orgUnitCodeResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/ovc/api/organisationUnits/${props.orgUnitId}`,
                    // `/ovc/api/organisationUnits/${props.orgUnitId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            // 'Authorization': `Basic ${credentials}`,
                        },
                    }
                );
                const orgUnitCodeData = await orgUnitCodeResponse.json();
                const orgUnitCode = orgUnitCodeData.code;
                setOrgUnitcode(orgUnitCode);

                // Wait for the orgUnitCode to be set before making the second request
                if (orgUnitCode) {
                    // Second request: Fetch the generated code using the organization unit code
                    const codeResponse = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/ovc/api/trackedEntityAttributes/oqabsHE0ZUI/generate?ORG_UNIT_CODE=${orgUnitCode}`,
                        // `/ovc/api/trackedEntityAttributes/oqabsHE0ZUI/generate?ORG_UNIT_CODE=${orgUnitCode}`,
                        {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                // 'Authorization': `Basic ${credentials}`,
                            },
                        }
                    );
                    const codeData = await codeResponse.json();

                    // If the response contains a value, update the formData
                    if (codeData && codeData.value) {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            code: codeData.value,
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setGetCode(false);
            }
        };

        fetchData();

    }, [trigger]);

    function onAdd() {
        setFormVisible(true);
        setTrigger(prevTrigger => prevTrigger + 1);
    }

    const [selectedDate, setSelectedDate] = useState('');
    const handleDateChange = (event) => {
        const date = new Date(event.target.value);
        const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
        setSelectedDate(formattedDate);
    };

    // Function to fetch a new ID
    const fetchNewId = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/ovc/api/system/id?`,
                // `/ovc/api/system/id?`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                });
            const data = await response.json();
            return data.codes[0];
        } catch (error) {
            console.error('Error fetching new ID:', error);
            return null;
        }
    };

    // Function to fetch user
    const fetchUser = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/ovc/api/me`,
                // `/ovc/api/me`, //with proxy
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                });
            const data = await response.json();
            const userData = {
                username: data.username,
                surname: data.surname,
                firstName: data.firstName,
                id: data.id
            };
            setUserData(userData);

            return userData;

        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    };

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault();
        // console.log("formData", formData)
        setSaving(true);

        // Fetch new ID for the event
        const newId = await fetchNewId();
        if (!newId) {
            console.error('Failed to generate a new trackedEntityInstance ID.');
            setSaving(false);
            setMessage('Failed to generate a new trackedEntityInstance ID.');
            return;
        }
        // console.log("id", newId)

        // Fetch new ID for the event
        const userData = await fetchUser();
        if (!userData) {
            console.error('Failed to get username.');
            setSaving(false);
            setMessage('Failed to get username.');
            return;
        }

        const enteredValues = {
            created: new Date().toISOString(),
            orgUnit: props.orgUnitId,
            createdAtClient: new Date().toISOString(),
            trackedEntityInstance: newId,
            lastUpdated: new Date().toISOString(),
            trackedEntityType: "jUBCsJonWQ2",
            lastUpdatedAtClient: new Date().toISOString(),
            storedBy: userData.username,
            potentialDuplicate: false,
            deleted: false,
            inactive: false,
            featureType: "NONE",
            lastUpdatedByUserInfo:
                {
                    uid: userData.id,
                    firstName: userData.firstName,
                    surname: userData.surname,
                    username: userData.username
                },
            createdByUserInfo:
                {
                    uid: userData.id,
                    firstName: userData.firstName,
                    surname: userData.surname,
                    username: userData.username
                },
            programOwners: [],
            relationships: [],

            attributes: [
                {attribute: 'Ah4eyDOBf51', value: formData.name},
                {attribute: 'D7wRx9mgwns', value: formData.venue},
                {attribute: 'Pll79WEVWHj', value: formData.description},
                {attribute: 'VyACOoRKcCA', value: formData.activityCode},
                {attribute: 'b76aEJUPnLy', value: selectedDate},
                {attribute: 'bFnIjGJpf9t', value: formData.groupType},
                {attribute: 'cYDK0qZSri9', value: formData.other},
                {attribute: 'dqbuxC5GB1M', value: formData.activity},
                {attribute: 'mWyp85xIzXR', value: formData.subGroup},
                {attribute: 'oqabsHE0ZUI', value: formData.code}
            ],
            enrollments: [
                {
                    status: "ACTIVE",
                    trackedEntityInstance: newId,
                    program: 'IXxHJADVCkb',
                    orgUnit: props.orgUnitId,
                    enrollmentDate: new Date().toISOString(),
                    incidentDate: new Date().toISOString()
                }
            ]

        }


        try {
            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/ovc/api/trackedEntityInstances?`,
                // `/ovc/api/trackedEntityInstances?`, //wth proxy
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Basic ${credentials}`,
                    },
                    body: JSON.stringify(enteredValues),
                });

            if (!response.ok) {
                throw new Error('Failed to post data');
            }

            await refetch();
            // Hide the form after submission
            setFormData({
                name: 'ROM',
                code: '',
                groupType: '',
                other: '',
                subGroup: '',
                activity: '',
                activityCode: '',
                description: '',
                dateOfActivity: '',
                venue: ''
            }); // Reset form data
            setSelectedDate('');
            setMessage('Data successfully saved!');
            setIsError(false);
            setTrigger(prevTrigger => prevTrigger + 1);
        } catch (error) {
            console.error('Error posting data:', error);
            setMessage('Error saving data. Please try again.');
            setIsError(true);
        }
        setSaving(false);
    }

    function handleInputChange(event) {
        const {name, value} = event.target;
        setFormData((prevData) => ({...prevData, [name]: value}));
    }


    //pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // You can make this dynamic if needed

    // Calculate the total number of pages
    const totalPages = Math.ceil(data?.length / rowsPerPage);

    // Get the data to display on the current page
    const paginatedData = data?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);


    const renderTableRows = () => {

        const orgData = data;
        // console.log("org", orgData);

        if (!orgData || orgData.length === 0) {
            return (
                <tr>
                    <td colSpan={8}>No data available for the selected Entry, Please add new Beneficially</td>
                </tr>
            );
        }

        return paginatedData.map((row, index) => {

            return (
                <tr key={row.id || index}
                    onClick={() => {
                        const id = row.id;  // Assuming 'id' is the correct field from your row data
                        history.push(`/${props.orgUnitId}/${id}/about`);
                    }}>
                    <td>{row.id}</td>
                    <td>{row.code}</td>
                    <td>{row.name}</td>
                    <td>{row.groupType}</td>
                    <td>{row.subGroup}</td>
                    <td>{row.activity}</td>
                    <td>{row.description}</td>
                    <td>{row.dateOfActivity}</td>
                    <td>{row.venue}</td>

                    <td>
                        <button
                            onClick={(event) => {
                                event.stopPropagation();  // Prevent row click event
                                // const rowId = info.row.original.id;
                                handleDelete(row.id, credentials, setMessage, setIsError)
                            }}
                            className="delete-button"
                        >
                            x
                        </button>
                    </td>
                </tr>
            );
        });
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <main className="space-y-4">
            <Header onAdd={onAdd} search={search} onSearch={setSearch}/>

            {/*looader for saving entry*/}
            {saving && <div className="mt-4">
                <div className="loader-container">
                    <div className="spinner"></div>
                    <p>Saving Entry...</p>
                </div>
            </div>}

            {message && (
                <div className={isError ? 'error-message' : 'success-message'}>
                    {message}
                </div>
            )}

            {formVisible && (
                <div className="form-container">
                    <form onSubmit={handleFormSubmit} className="form">
                        {/*loader for getting code*/}
                        {getCode ? (
                            <div className="mt-4">
                                <div className="loader-container">
                                    <div className="spinner"></div>
                                    <p>Loading code, please wait...</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Code</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name of CSO/Partner</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group Type</label>
                            <select
                                name="groupType"
                                value={formData.groupType}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="1. VSLA Group">VSLA Group</option>
                                <option value="2. Sinovuyo">Sinovuyo</option>
                                <option value="3. ECD">ECD</option>
                                <option value="4. AFLATEEN">AFLATEEN</option>
                                <option value="5. NMN">NMN</option>
                                <option value="6. Financial Literacy">Financial Literacy</option>
                                <option value="7. SPM">SPM</option>
                                <option value="8. Work Readiness">Work Readiness</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Group/Club/Name/Other</label>
                            <input
                                type="text"
                                name="other"
                                value={formData.other}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sub Group</label>
                            <select
                                name="subGroup"
                                value={formData.subGroup}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            >
                                <option value="">Select a sub group</option>
                                {getSubGroupOptions().map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Activity</label>
                            <input
                                type="text"
                                name="activity"
                                value={formData.activity}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Activity Code</label>
                            <input
                                type="text"
                                name="activityCode"
                                value={formData.activityCode}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date of Activity</label>
                            <input
                                type="date"
                                name="dateOfActivity"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Venue</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                required
                            />
                        </div>
                        <div className="button-container">
                            <button type="submit" className="submit-button">
                                Save & Continue
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setFormVisible(false);
                                    setFormData({
                                        groupType: "", other: "", subGroup: "", venue: "",
                                        activityCode: '',
                                        name: '',
                                        code: '',
                                        activity: '',
                                        description: '',
                                        dateOfActivity: ''
                                    });
                                    setSelectedDate('');
                                }}
                                className="cancel-button"
                            >
                                Close
                            </button>
                        </div>
                    </form>
                </div>
            )}


            {loading ? (
                <div className="mt-4">
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p>Loading data, please wait...</p>
                    </div>
                </div>
            ) : (
                <>
                    {!formVisible && <><div className="table-responsive">
                        <table className="table table-striped table-bordered table-hover table-dark-header">
                            <thead className="text-nowrap">
                            <tr>
                                <th>ID</th>
                                <th>Code</th>
                                <th>Name of CSO/Partner</th>
                                <th>Group Type</th>
                                <th>Sub Group</th>
                                <th>Activity</th>
                                <th>Description</th>
                                <th>Date of Activity</th>
                                <th>Venue</th>
                                <th>Delete</th>
                            </tr>
                            </thead>
                            <tbody>{renderTableRows()}</tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="pagination-controls mt-3">
                        <button
                            className="btn btn-primary me-2"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            className="btn btn-primary ms-2"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                    </>}
                </>
            )}


            {/*{!formVisible && <Table*/}
            {/*    table={table}*/}
            {/*    onRowClick={(row) => {*/}
            {/*        const id = row.getValue('id');*/}
            {/*        history.push(`/${props.orgUnitId}/${id}/about`);*/}
            {/*    }}*/}
            {/*/>}*/}
            {/*{!formVisible && <TablePagination table={table}/>}*/}
        </main>
    );
}
