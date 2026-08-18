import React, { useEffect, useState } from 'react';
import {
    Calendar, Bell, Search, ChevronDown, ChevronRight, HelpCircle,
    Plus, Sparkles, Edit, X, User, Scale, Briefcase, FileText,
    AlertTriangle, Info, Landmark as CourtIcon, Users, MessageSquare, SlidersHorizontal
} from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";

const emptyCase = {
    clientId: '', clientName: '', caseTitle: '', retainerFee: '', partyPositions: '',
    primaryPartyType: 'Petitioner', primaryPartyName: '', primaryPartyNumber: '1',
    primaryPartyPhone: '', primaryPartyEmail: '', primaryPartyAddress: '', filingType: '',
    caseCategory: '', sectionsActs: '', courtCaseNumber: '', cnrNumber: '',
    leadAdvocate: '', supervisingPartner: '', assistingCounsels: '', supportStaff: '',
    caseSuitValue: '', claimAmount: '', retainerAmount: '', briefFacts: '', legalIssues: '', caseNotes: ''
};

const extractClients = (payload) => {
    const candidates = [
        payload,
        payload?.data,
        payload?.clients,
        payload?.data?.clients,
        payload?.data?.data,
        payload?.results
    ];
    return candidates.find(Array.isArray) || [];
};

const normalizeClient = (client) => ({
    ...client,
    id: client._id || client.id,
    fullName: client.fullName || client.displayName || client.organizationName || [client.firstName, client.middleName, client.lastName].filter(Boolean).join(' ') || 'Unnamed client',
    mobilePrimary: client.mobilePrimary || client.primaryPhone || client.mobile || '',
    email: client.email || client.primaryEmail || '',
    addressCurrent: client.addressCurrent || client.residentialAddress || ''
});

const toOptionalNumber = (value, label) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`${label} must be a valid number.`);
    return number;
};

export default function NewCaseForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);
    const [formData, setFormData] = useState(emptyCase);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState({
        basicInfo: true,
        partiesInfo: true,
        caseClassification: true,
        courtDetails: true,
        oppositeParty: true,
        teamAssignment: true,
        billingSettings: true,
        additionalDetails: true,
    });

    const [additionalParties, setAdditionalParties] = useState([]);
    const [inheritFromClient, setInheritFromClient] = useState(true);

    const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
    const bind = (field) => ({ value: formData[field], onChange: (event) => updateField(field, event.target.value) });

    useEffect(() => {
        const loadFormData = async () => {
            try {
                const clientsResponse = await api.get('/clients');
                setClients(extractClients(clientsResponse.data).map(normalizeClient));

                if (!id) return;
                setLoading(true);
                const caseResponse = await api.get(`/litigation/${id}`);
                const caseData = caseResponse.data?.data ?? caseResponse.data;
                setFormData({ ...emptyCase, ...caseData });
                setAdditionalParties(caseData.additionalParties || []);
                setInheritFromClient(caseData.inheritFromClient ?? true);
            } catch (error) {
                console.error('Unable to load case form:', error);
                alert(error.response?.data?.message || 'Unable to load case details.');
            } finally {
                setLoading(false);
            }
        };
        loadFormData();
    }, [id]);

    const toggleSection = (section) => {
        setActiveSection(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const addAnotherParty = () => {
        const newParty = {
            id: Date.now(),
            partyType: 'Petitioner',
            partyName: '',
            partyNumber: additionalParties.length + 2,
            phone: '',
            email: '',
            address: '',
            showAttorney: false,
            attorneyName: '',
            lawFirm: '',
            attorneyPhone: ''
        };
        setAdditionalParties([...additionalParties, newParty]);
    };

    const removeParty = (id) => {
        setAdditionalParties(additionalParties.filter(party => party.id !== id));
    };

    const handlePartyChange = (id, field, value) => {
        setAdditionalParties(additionalParties.map(party =>
            party.id === id ? { ...party, [field]: value } : party
        ));
    };

    const handleClientChange = (event) => {
        const clientId = event.target.value;
        const client = clients.find((item) => item.id === clientId);
        setFormData((current) => ({
            ...current,
            clientId,
            clientName: client?.fullName || '',
            primaryPartyName: current.primaryPartyName || client?.fullName || '',
            primaryPartyPhone: current.primaryPartyPhone || client?.mobilePrimary || '',
            primaryPartyEmail: current.primaryPartyEmail || client?.email || '',
            primaryPartyAddress: current.primaryPartyAddress || client?.addressCurrent || ''
        }));
    };

    const handleSubmit = async () => {
        if (!formData.clientId || !formData.caseTitle || !formData.primaryPartyName) {
            alert('Please select a client and fill the required case details.');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                ...formData,
                // Backend litigation schema uses these names as required fields.
                client: formData.clientId,
                primaryParty: {
                    partyType: formData.primaryPartyType,
                    partyName: formData.primaryPartyName,
                    partyNumber: formData.primaryPartyNumber,
                    phone: formData.primaryPartyPhone,
                    email: formData.primaryPartyEmail,
                    address: formData.primaryPartyAddress
                },
                retainerFee: toOptionalNumber(formData.retainerFee, 'Retainer fee'),
                retainerAmount: toOptionalNumber(formData.retainerAmount, 'Retainer amount'),
                claimAmount: toOptionalNumber(formData.claimAmount, 'Claim amount'),
                caseSuitValue: toOptionalNumber(formData.caseSuitValue, 'Case/suit value'),
                additionalParties,
                inheritFromClient
            };
            if (isEditMode) await api.put(`/litigation/${id}`, payload);
            else await api.post('/litigation', payload);
            alert(isEditMode ? 'Case updated successfully.' : 'Case created successfully.');
            navigate('/dashboard/litigation');
        } catch (error) {
            console.error('Unable to save case:', error);
            alert(error.response?.data?.message || error.response?.data?.error || error.message || 'Unable to save case.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex min-h-screen  bg-[#F8FAFC] text-slate-700 font-sans antialiased overflow-x-hidden">

                <div className="flex-1 flex flex-col w-full min-w-0 overflow-x-hidden">

                    {/* HEADER */}
                    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm w-full">
                        <div className="w-96 relative max-w-xs md:max-w-sm">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search clients, cases..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><SlidersHorizontal size={18} /></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Calendar size={18} /></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><MessageSquare size={18} /></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Bell size={18} /></button>
                            <div className="h-px w-4 bg-slate-200"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">S</div>
                                <div className="text-left hidden md:block">
                                    <div className="text-xs font-semibold text-slate-800 leading-tight">Ashish Panwar</div>
                                    <div className="text-[10px] text-slate-400">Super Admin</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* WORKSPACE CONTENT */}
<main className="flex-1 p-7 max-w-7xl space-y-8 pb-20 overflow-x-hidden box-border">

                        {/* Form Title Heading */}
                        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm w-full">
                            <div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1.5 font-medium">
                                    <Plus size={16} /> <span>New Case</span>
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEditMode ? 'Edit Case' : 'New Case'}</h1>
                                <p className="text-sm text-slate-500 mt-0.5">Enter case details below</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 shrink-0 transition">
                                <HelpCircle size={16} /> Manage Workflows <X size={16} className="ml-1 text-slate-400" />
                            </button>
                        </div>

                        {/* Workflow Entry Selector */}
                     

                        {/* SECTION 1: BASIC INFORMATION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<User size={18} className="text-blue-500" />}
                                title="Basic Information"
                                subtitle="Client, case title and party"
                                isOpen={activeSection.basicInfo}
                                onToggle={() => toggleSection('basicInfo')}
                            />
                            {activeSection.basicInfo && (
                                <div className="p-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white w-full box-border">
                                    <FormGroup label="Client" required>
                                        <select value={formData.clientId} onChange={handleClientChange} className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none box-border">
                                            <option value="">Search client...</option>
                                            {clients.map((client) => <option key={client.id} value={client.id}>{client.fullName}{client.clientId ? ` (${client.clientId})` : ''}</option>)}
                                        </select>
                                    </FormGroup>
                                    <FormGroup label="Case Title" required>
                                        <input type="text" placeholder="e.g., State vs. Ram Kumar" {...bind('caseTitle')} className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none box-border" />
                                    </FormGroup>
                                    <FormGroup label="Retainer Fee" extra={<span className="text-blue-600 text-xs font-medium cursor-pointer">+ Add New</span>}>
                                        <input type="text" placeholder="Enter retainer fee" {...bind('retainerFee')} className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none box-border" />
                                    </FormGroup>
                                    <FormGroup label="Party Positions">
                                        <input type="text" placeholder="e.g., Accused No. 2" {...bind('partyPositions')} className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none box-border" />
                                    </FormGroup>
                                </div>
                            )}
                        </div>

                        {/* SECTION 2: PARTIES INFORMATION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<Users size={18} className="text-blue-500" />}
                                title="Parties Information"
                                subtitle="Petitioner, respondents and their counsel"
                                isOpen={activeSection.partiesInfo}
                                onToggle={() => toggleSection('partiesInfo')}
                            />
                            {activeSection.partiesInfo && (
                                <div className="p-6 border-t border-slate-100 space-y-6 bg-slate-50/30 w-full box-border">
                                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative w-full box-border">
                                        <div className="flex items-center gap-2 mb-5">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <h4 className="text-sm font-bold text-slate-800">Plaintiff / Petitioner / Complainant / Appellant</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                            <FormGroup label="Party Type" required>
                                                <select {...bind('primaryPartyType')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border"><option>Petitioner</option><option>Respondent</option><option>Plaintiff</option><option>Complainant</option></select>
                                            </FormGroup>
                                            <FormGroup label="Party Name" required>
                                                <input type="text" placeholder="Full name of party" {...bind('primaryPartyName')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                            </FormGroup>
                                            <FormGroup label="Party #">
                                                <input type="text" {...bind('primaryPartyNumber')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                            </FormGroup>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                            <FormGroup label="Phone"><input type="text" placeholder="Phone number" {...bind('primaryPartyPhone')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" /></FormGroup>
                                            <FormGroup label="Email">
                                                <input type="email" placeholder="Email address" {...bind('primaryPartyEmail')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                                {formData.primaryPartyEmail && !formData.primaryPartyEmail.includes('@') && (
                                                    <span className="text-xs text-red-500 mt-1.5 block font-medium">Please enter a valid email address.</span>
                                                )}
                                            </FormGroup>
                                        </div>
                                        <div className="mb-2">
                                            <FormGroup label="Address"><textarea rows="3" placeholder="Full address" {...bind('primaryPartyAddress')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none resize-none box-border"></textarea></FormGroup>
                                        </div>
                                    </div>

                                    {additionalParties.map((party, index) => (
                                        <div key={party.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative w-full box-border">
                                            <span onClick={() => removeParty(party.id)} className="absolute top-6 right-6 text-xs font-semibold text-red-500 cursor-pointer hover:underline">Remove</span>
                                            <div className="flex items-center gap-2 mb-5">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <h4 className="text-sm font-bold text-slate-800">Additional Party #{index + 1}</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
                                                <FormGroup label="Party Type" required>
                                                    <select value={party.partyType} onChange={(e) => handlePartyChange(party.id, 'partyType', e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border">
                                                        <option>Petitioner</option>
                                                        <option>Respondent</option>
                                                    </select>
                                                </FormGroup>
                                                <FormGroup label="Party Name" required>
                                                    <input type="text" placeholder="Full name of party" value={party.partyName} onChange={(e) => handlePartyChange(party.id, 'partyName', e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                                </FormGroup>
                                                <FormGroup label="Party #">
                                                    <input type="text" value={party.partyNumber} onChange={(e) => handlePartyChange(party.id, 'partyNumber', e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                                </FormGroup>
                                            </div>
                                        </div>
                                    ))}

                                    <button type="button" onClick={addAnotherParty} className="w-full py-3.5 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/10 rounded-xl text-sm font-semibold text-slate-600 flex items-center justify-center gap-2 transition">
                                        <Plus size={16} /> Add Another Party
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* SECTION 3: CASE CLASSIFICATION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<Scale size={18} className="text-blue-500" />}
                                title="Case Classification"
                                subtitle="Category, acts, stage and priority"
                                isOpen={activeSection.caseClassification}
                                onToggle={() => toggleSection('caseClassification')}
                            />
                            {activeSection.caseClassification && (
                                <div className="p-6 border-t border-slate-100 space-y-5 bg-white w-full box-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormGroup label="Filing Type" extra={<span className="text-blue-600 text-xs font-medium cursor-pointer">+ Add New</span>}>
                                            <input type="text" placeholder="Search Filing Type..." {...bind('filingType')} className="w-full text-sm border border-slate-200 rounded-lg p-3 bg-slate-50 box-border" />
                                        </FormGroup>
                                        <FormGroup label="Case Category" required extra={<span className="text-blue-600 text-xs font-medium cursor-pointer">+ Add New</span>}>
                                            <input type="text" placeholder="Select Case Category" {...bind('caseCategory')} className="w-full text-sm font-medium border border-slate-200 rounded-lg p-3 bg-slate-50 box-border" />
                                        </FormGroup>
                                    </div>
                                    <div>
                                        <FormGroup label="Sections & Acts involved">
                                            <textarea rows="3" placeholder="e.g., Section 420, 406 IPC; Section 138 NI Act; Order 39 Rule 1 & 2 CPC" {...bind('sectionsActs')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none resize-none box-border"></textarea>
                                        </FormGroup>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 4: COURT DETAILS */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<CourtIcon size={18} className="text-blue-500" />}
                                title="Court Details"
                                subtitle="Court, judge, filing and hearing dates"
                                isOpen={activeSection.courtDetails}
                                onToggle={() => toggleSection('courtDetails')}
                            />
                            {activeSection.courtDetails && (
                                <div className="p-6 border-t border-slate-100 space-y-5 bg-white w-full box-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormGroup label="Court Case Number"><input type="text" placeholder="e.g., CS/123/2024" {...bind('courtCaseNumber')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" /></FormGroup>
                                        <FormGroup label="CNR Number"><input type="text" placeholder="e.g., MLDL01-001234-2024" {...bind('cnrNumber')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" /></FormGroup>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* TEAM ASSIGNMENT SECTION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<Users size={18} className="text-blue-500" />}
                                title="Team Assignment"
                                subtitle="Lead advocate and supporting team"
                                isOpen={activeSection.teamAssignment}
                                onToggle={() => toggleSection('teamAssignment')}
                            />
                            {activeSection.teamAssignment && (
                                <div className="p-6 border-t border-slate-100 space-y-5 bg-white w-full box-border">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormGroup label="Lead Advocate" required extra={<span className="text-slate-400 text-xs font-normal">(Appears in Cause List)</span>}>
                                            <div className="relative w-full">
                                                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                                                <input type="text" placeholder="Search advocate..." {...bind('leadAdvocate')} className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none box-border" />
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Supervising Partner">
                                            <div className="relative w-full">
                                                <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                                                <input type="text" placeholder="Search partner..." {...bind('supervisingPartner')} className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white outline-none box-border" />
                                            </div>
                                        </FormGroup>
                                    </div>
                                    <FormGroup label="Assisting Counsels" extra={<span className="text-slate-400 text-xs font-normal">(Select multiple advocates)</span>}>
                                        <input type="text" {...bind('assistingCounsels')} className="w-full py-3 px-3.5 text-sm border border-slate-200 rounded-lg outline-none bg-slate-50 box-border" />
                                    </FormGroup>
                                    <FormGroup label="Support Staff" extra={<span className="text-slate-400 text-xs font-normal">(Clerks, Paralegals, Interns)</span>}>
                                        <input type="text" {...bind('supportStaff')} className="w-full py-3 px-3.5 text-sm border border-slate-200 rounded-lg outline-none bg-slate-50 box-border" />
                                    </FormGroup>
                                </div>
                            )}
                        </div>

                        {/* BILLING & FEE SETTINGS SECTION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<FileText size={18} className="text-blue-500" />}
                                title="Billing & Fee Settings"
                                subtitle="Fee structure and case value"
                                isOpen={activeSection.billingSettings}
                                onToggle={() => toggleSection('billingSettings')}
                            />
                            {activeSection.billingSettings && (
                                <div className="p-6 border-t border-slate-100 space-y-5 bg-white w-full box-border">
                                    <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 shadow-sm w-full box-border">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-blue-900">Fee Structure</span>
                                            <label className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={inheritFromClient}
                                                    onChange={(e) => setInheritFromClient(e.target.checked)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                Inherit from Client
                                            </label>
                                        </div>
                                        {inheritFromClient && (
                                            <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-3 w-full box-border">
                                                Fee settings will be inherited from the client's fee agreement.
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormGroup label="Case/Suit Value">
                                            <input type="text" placeholder="For court fee" {...bind('caseSuitValue')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                        </FormGroup>
                                        <FormGroup label="Claim Amount">
                                            <input type="text" {...bind('claimAmount')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                        </FormGroup>
                                        <FormGroup label="Retainer Amount">
                                            <input type="text" {...bind('retainerAmount')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none box-border" />
                                        </FormGroup>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ADDITIONAL DETAILS SECTION */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden w-full">
                            <SectionHeader
                                icon={<Info size={18} className="text-blue-500" />}
                                title="Additional Details"
                                subtitle="Brief facts, legal issues and notes"
                                isOpen={activeSection.additionalDetails}
                                onToggle={() => toggleSection('additionalDetails')}
                            />
                            {activeSection.additionalDetails && (
                                <div className="p-6 border-t border-slate-100 space-y-5 bg-white w-full box-border">
                                    <FormGroup label="Brief Facts">
                                        <textarea rows="3" placeholder="Summary of case facts..." {...bind('briefFacts')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none resize-none box-border"></textarea>
                                    </FormGroup>
                                    <FormGroup label="Legal Issues">
                                        <textarea rows="3" placeholder="Key legal issues..." {...bind('legalIssues')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none resize-none box-border"></textarea>
                                    </FormGroup>
                                    <FormGroup label="Case Notes">
                                        <textarea rows="3" placeholder="Internal notes..." {...bind('caseNotes')} className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none resize-none box-border"></textarea>
                                    </FormGroup>
                                </div>
                            )}
                        </div>

                    </main>

                    {/* FOOTER FORM ACTION BUTTONS */}
                    <footer className="fixed bottom-0 right-0 left-0 bg-white border-t border-slate-200 py-3 px-6 flex justify-end gap-3 items-center z-10 shadow-lg w-full">
                        <button type="button" onClick={() => navigate('/dashboard/litigation')} className="px-5 py-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1.5 transition">
                            <X size={14} /> Cancel
                        </button>
                        <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-xs font-semibold text-white bg-gold hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition disabled:opacity-60">
                            <Briefcase size={14} /> {loading ? 'Saving...' : isEditMode ? 'Update Case' : 'Create Case'}
                        </button>
                    </footer>

                </div>
            </div>
        </DashboardLayout>
    );
}

function SectionHeader({ icon, title, subtitle, isOpen, onToggle }) {
    return (
        <div className="p-4 flex justify-between items-center cursor-pointer select-none hover:bg-slate-50/50 w-full box-border" onClick={onToggle}>
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 leading-tight truncate">{title}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>
                </div>
            </div>
            <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
    );
}

function FormGroup({ label, required = false, extra = null, children }) {
    return (
        <div className="w-full text-left box-border">
            <div className="flex items-center flex-wrap gap-1 mb-1">
                <label className="text-[11px] font-bold text-slate-700 tracking-wide whitespace-nowrap">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                {extra}
            </div>
            {children}
        </div>
    );
}
