import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar, FileText, User, Scale, Building, 
  ShieldCheck, ArrowLeft, Save, BadgeIndianRupeeIcon, History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import api from "../../lib/axios.jsx"; 

const AddCaseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id; 

  const [loading, setLoading] = useState(false);
  const [onboardedClients, setOnboardedClients] = useState([]);
  const [fetchingClients, setFetchingClients] = useState(false);
  
  // Updated standard fields + New Hearing Tracking System
  const [formData, setFormData] = useState({
    caseRegisterDate: "",        // 1. Enter Case register Date with Calender
    caseNumber: "",              // 2. Enter Case Number
    firstPartyName: "",          // 3. First Party Name
    firstPartyRole: "Petitioner", // 3. First Party Name dropdown context
    oppositePartyName: "",      // 4. Opposite Party Name
    caseType: "",               // 5. Case Type
    caseStudy: "",              // 6. Case Study
    policeStationName: "",      // 7. Enter Police Station Name
    crnNumber: "",              // 8. CRN Number
    courtType: "High Court",    // 9. Court Type
    courtNameNumber: "",        // 10. Enter Court Name & Number
    firNumber: "",              // 11. Enter Fir Number
    caseStatus: "On-hold",      // 12. Case Status with dropdown Transfer, Disposed, On-hold
    otherDetails: "",           // 13. Other Details
    remarksNotes: "",           // 14. Remarks Notes
    caseTotalFees: "",          // 15. Enter Case Total Fees
    addClientFilter: "General", // 16. Add Client filter Dropdown
    nextHearingDate: "",        // ✨ 17. New Field: Upcoming/Current Hearing Date
    oldHearingDates: []         // ✨ 18. New Field: Array to preserve history logs in dropdown
  });

  // Single Standard Handler for all Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "caseTotalFees" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Pipeline 1: Client Onboarding API से ड्रॉपडाउन डेटा लाना
  useEffect(() => {
    const fetchOnboardedClients = async () => {
      try {
        setFetchingClients(true);
        const response = await api.get("/clients");
        console.log("response data", response.data);
        if (response.data.success) {
          setOnboardedClients(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch onboarded client sync layers:", error);
      } finally {
        setFetchingClients(false);
      }
    };
    fetchOnboardedClients();
  }, []);

  // Pipeline 2: अगर EDIT MODE है, तो सिंगल केस डिटेल्स लाना
  useEffect(() => {
    const fetchSingleCaseDetails = async () => {
      if (!isEditMode) return;
      try {
        setLoading(true);
        const response = await api.get(`/management/${id}`);
        if (response.data.success) {
          const item = response.data.data;
          setFormData({
            caseRegisterDate: item.caseRegisterDate ? item.caseRegisterDate.slice(0, 10) : "", 
            caseNumber: item.caseNumber || "",
            firstPartyName: item.firstPartyName || "",
            firstPartyRole: item.firstPartyRole || "Petitioner",
            oppositePartyName: item.oppositePartyName || "",
            caseType: item.caseType || "",
            caseStudy: item.caseStudy || "",
            policeStationName: item.policeStationName || "",
            crnNumber: item.crnNumber || "",
            courtType: item.courtType || "High Court",
            courtNameNumber: item.courtNameNumber || "",
            firNumber: item.firNumber || "",
            caseStatus: item.caseStatus || "On-hold",
            otherDetails: item.otherDetails || "",
            remarksNotes: item.remarksNotes || "",
            caseTotalFees: item.caseTotalFees || "",
            addClientFilter: item.addClientFilter || "General",
            nextHearingDate: item.nextHearingDate ? item.nextHearingDate.slice(0, 10) : "", // ✅ Safely slicing ISO to local date
            oldHearingDates: item.oldHearingDates || [] // ✅ Setting array array sequence for dropdown
          });
        }
      } catch (error) {
        console.error("Error fetching single dossier for edit view:", error);
        alert("Failed to load existing case data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleCaseDetails();
  }, [id, isEditMode]);

  // Dynamic Submit Logic (POST for Add, PUT for Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode) {
        const response = await api.put(`/management/${id}`, formData);
        if (response.data.success) {
          alert("Registry document updated successfully.");
          navigate("/dashboard/case-status"); 
        }
      } else {
        const response = await api.post("/management", formData);
        if (response.data.success) {
          navigate("/dashboard/case-status"); 
        }
      }
    } catch (error) {
      console.error("Submission breakdown error:", error);
      alert(error.response?.data?.error || "Failed to save data into database ledger.");
    } finally {
      setLoading(false);
    }
  };

  // Helper utility to turn saved timestamps into neat readable standard format
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
   <DashboardLayout title={isEditMode ? "Modify Case File" : "Create Case Entry"}>
    <div className="min-h-screen bg-[#fcfaf7] ">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Navigation Bar */}
        <Button 
          variant="ghost" 
          type="button"
          onClick={() => navigate("/dashboard/case-status")}
          className="mb-6 bg-gold/10 hover:text-white transition-colors gap-2 text-sm font-medium text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Cases
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PRIMARY COURT CASE DATA */}
          <Card className="border-gold/20 shadow-md bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-gold/20 via-gold/60 to-gold/20" />
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary flex items-center gap-3">
                <Scale className="h-5 w-5 text-gold" /> 
                {isEditMode ? "Update Litigation Parameters" : "Primary Litigation Parameters"}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 1. Enter Case register Date with Calender */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter Case register Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                  <input
                    type="date"
                    name="caseRegisterDate"
                    required
                    value={formData.caseRegisterDate}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>

              {/* 2. Enter Case Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter Case Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                  <input
                    type="text"
                    name="caseNumber"
                    required
                    placeholder="Enter Case Number"
                    value={formData.caseNumber}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>

              {/* 3. First Party Name with dropdown context */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Party Name *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                    <input
                      type="text"
                      name="firstPartyName"
                      required
                      placeholder="First Party Name"
                      value={formData.firstPartyName}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                  <select
                    name="firstPartyRole"
                    value={formData.firstPartyRole}
                    onChange={handleChange}
                    className="bg-background border border-border rounded-lg px-3 text-xs focus:outline-none focus:border-gold/60 font-medium"
                  >
                    <option value="Petitioner">Petitioner</option>
                    <option value="Plaintiff">Plaintiff</option>
                    <option value="Appellant">Appellant</option>
                    <option value="Complainant">Complainant</option>
                  </select>
                </div>
              </div>

              {/* 4. Opposite Party Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opposite Party Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                  <input
                    type="text"
                    name="oppositePartyName"
                    required
                    placeholder="Opposite Party Name"
                    value={formData.oppositePartyName}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>

              {/* 5. Case Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Case Type *</label>
                <input
                  type="text"
                  name="caseType"
                  required
                  placeholder="Case Type"
                  value={formData.caseType}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                />
              </div>

              {/* 16. Dynamic Onboarded Clients Filter Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Add Client Filter {fetchingClients && "(Loading...)"}
                </label>
                <select
                  name="addClientFilter"
                  value={formData.addClientFilter}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60 font-medium text-foreground"
                >
                  <option value="General">General (Default)</option>
                  <option value="Corporate Retainer">Corporate Retainer</option>
                  <option value="Individual Client">Individual Client</option>
                  <option value="High Priority Profile">High Priority Profile</option>
                  
                  {onboardedClients.length > 0 && (
                    <optgroup label="Onboarded Clients List">
                      {onboardedClients.map((client) => (
                        <option key={client._id} value={client.fullName}>
                          {client.fullName} ({client.clientId})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

            </CardContent>
          </Card>

          {/* ✨ NEW SECTION: HEARING SCHEDULE MANAGER */}
          <Card className="border-gold/20 shadow-md bg-card relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gold" /> Hearing Timeline Management
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 17. Next Hearing Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-amber-800">Next Hearing Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                  <input
                    type="date"
                    name="nextHearingDate"
                    value={formData.nextHearingDate}
                    onChange={handleChange}
                    className="w-full bg-background border border-amber-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60 font-medium"
                  />
                </div>
              </div>

              {/* 18. Old Hearing Dates Dropdown Log View */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <History className="h-3 w-3 text-neutral-500" /> Old Hearing Date History Log
                </label>
                <select
                  disabled={!formData.oldHearingDates || formData.oldHearingDates.length === 0}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60 font-medium text-muted-foreground disabled:bg-neutral-50 disabled:cursor-not-allowed"
                >
                  {formData.oldHearingDates && formData.oldHearingDates.length > 0 ? (
                    <>
                      <option value="">-- View Previous Hearing Dates ({formData.oldHearingDates.length}) --</option>
                      {formData.oldHearingDates.map((dateItem, idx) => (
                        <option key={idx} value={dateItem} disabled>
                          Hearing #{formData.oldHearingDates.length - idx}: {formatDisplayDate(dateItem)}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">No previous hearing record history logs found</option>
                  )}
                </select>
              </div>

            </CardContent>
          </Card>

          {/* SECTION 2: JURISDICTIONAL RECORD DETAILS */}
          <Card className="border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary flex items-center gap-3">
                <Building className="h-5 w-5 text-gold" /> Jurisdictional Forum & Police Authorities
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 9. Court Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Court Type</label>
                <select
                  name="courtType"
                  value={formData.courtType}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                >
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="District Court">District Court</option>
                  <option value="Sessions Court">Sessions Court</option>
                  <option value="RERA Tribunal">RERA Tribunal</option>
                  <option value="NCLT">NCLT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* 10. Enter Court Name & Number * */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter Court Name & Number *</label>
                <input
                  type="text"
                  name="courtNameNumber"
                  required
                  placeholder="Enter Court Name & Number"
                  value={formData.courtNameNumber}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                />
              </div>

              {/* 8. CRN Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CRN Number</label>
                <input
                  type="text"
                  name="crnNumber"
                  placeholder="CRN Number"
                  value={formData.crnNumber}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                />
              </div>

              {/* 7. Enter Police Station Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter Police Station Name</label>
                <input
                  type="text"
                  name="policeStationName"
                  placeholder="Enter Police Station Name"
                  value={formData.policeStationName}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                />
              </div>

              {/* 11. Enter Fir Number */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter FIR Number</label>
                <input
                  type="text"
                  name="firNumber"
                  placeholder="Enter Fir Number"
                  value={formData.firNumber}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                />
              </div>

            </CardContent>
          </Card>

          {/* SECTION 3: LEGAL DOSSIER BRIEF & FINANCIAL AUDIT SUMMARY */}
          <Card className="border-border shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-primary flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gold" /> Dossier Assessment & Financial Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 12. Case Status with dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Case Status *</label>
                  <select
                    name="caseStatus"
                    value={formData.caseStatus}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gold/60 font-semibold text-amber-700 bg-amber-50/20"
                  >
                    <option value="Transfer">Transfer</option>
                    <option value="Disposed">Disposed</option>
                    <option value="On-hold">On-hold</option>
                  </select>
                </div>

                {/* 15. Enter Case Total Fees */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enter Case Total Fees (₹) *</label>
                  <div className="relative">
                    <BadgeIndianRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
                    <input
                      type="number"
                      name="caseTotalFees"
                      required
                      placeholder="Enter Case Total Fees"
                      value={formData.caseTotalFees}
                      onChange={handleChange}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gold/60"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Case Study */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Case Study</label>
                <textarea
                  name="caseStudy"
                  rows={3}
                  placeholder="Case Study details..."
                  value={formData.caseStudy}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/60 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 13. Other Details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Other Details</label>
                  <textarea
                    name="otherDetails"
                    rows={3}
                    placeholder="Other Details..."
                    value={formData.otherDetails}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>

                {/* 14. Remarks Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Remarks Notes</label>
                  <textarea
                    name="remarksNotes"
                    rows={3}
                    placeholder="Remarks Notes..."
                    value={formData.remarksNotes}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* FORM ACTION CONTROLS */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/case-status")}
              className="px-6 h-11 text-xs uppercase tracking-widest font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gold text-white px-8 h-11 text-xs uppercase tracking-widest font-bold gap-2 shadow-md transition-all duration-300 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {loading ? "Saving..." : isEditMode ? "Update Case File" : "Save Case"}
            </Button>
          </div>

        </form>
      </div>
    </div>
   </DashboardLayout>
  );
};

export default AddCaseForm;