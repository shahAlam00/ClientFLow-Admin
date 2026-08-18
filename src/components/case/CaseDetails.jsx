import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scale, Clock, ShieldCheck, ArrowLeft,
  Calendar, FileText, User, Building, Landmark, Gavel, DollarSign,
  Fingerprint, HelpCircle, ShieldAlert, FileWarning, History
} from "lucide-react";

export function CaseDetails({ selectedCase, onBack }) {
  if (!selectedCase) return null;

  
  console.log("Selected Case Complete Metadata Object:", selectedCase);

  const clientFilterValue = 
    selectedCase.addClientFilter || 
    selectedCase.clientFilter || 
    selectedCase.filter || 
    "General";

  // Utility helper to format YYYY-MM-DD string cleanly to Indian Standard Format DD-MM-YYYY
  const formatDateToIndian = (dateString) => {
    if (!dateString) return "—";
    const cleanDate = dateString.slice(0, 10);
    const parts = cleanDate.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // Reversing to DD-MM-YYYY format
    }
    return cleanDate;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Controller Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="h-10 w-10 border-border hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-serif text-primary tracking-tight">Case Dossier View</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-inner ${
                selectedCase.caseStatus === "Disposed" 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}>
                {selectedCase.caseStatus || "On-hold"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive digital record configuration for File Reference No: <span className="font-mono font-bold text-foreground">{selectedCase.caseNumber}</span>
            </p>
          </div>
        </div>
        
        {/* RIGHT SIDE ACCOUNT/CLIENT TAGS */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 px-3 py-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
            Linked Client / Tag: {clientFilterValue}
          </span>
        </div>
      </div>

      {/* Layout Configuration System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left & Center Combined Grid Blocks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Block A: Primary Litigation Parameters */}
          <Card className="border-border/80 shadow-sm bg-card relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-600/20 via-amber-600/60 to-amber-600/20" />
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-serif text-primary flex items-center gap-2.5">
                <Scale className="h-4 w-4 text-amber-600" /> Primary Litigation Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-600/60" /> Case Register Date
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDateToIndian(selectedCase.caseRegisterDate)}
                </p>
              </div>

              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3 text-amber-600/60" /> Case File Reference
                </p>
                <p className="text-sm font-mono font-bold text-primary">{selectedCase.caseNumber}</p>
              </div>

              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-amber-600/60" /> Litigant / Core First Party
                </p>
                <p className="text-sm font-bold text-foreground">{selectedCase.firstPartyName}</p>
              </div>

              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Fingerprint className="h-3 w-3 text-amber-600/60" /> First Party Role Context
                </p>
                <p className="text-sm font-semibold text-foreground">{selectedCase.firstPartyRole || "Petitioner"}</p>
              </div>

              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3 text-destructive/60" /> Respondent / Opposite Party Name
                </p>
                <p className="text-sm font-bold text-foreground">{selectedCase.oppositePartyName}</p>
              </div>

              <div className="p-3 bg-secondary/20 border border-border/40 rounded-xl space-y-1 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-amber-600/60" /> Practice Track Category (Case Type)
                </p>
                <p className="text-sm font-medium text-foreground">{selectedCase.caseType}</p>
              </div>

              {/* एक्स्ट्रा सेफ्टी ब्लॉक: अगर कोई स्पेसिफिक क्लाइंट फ़िल्टर टैग जुड़ा है तो नीचे भी साफ़ दिखे */}
              <div className="p-3 bg-amber-500/[0.02] border border-amber-500/20 rounded-xl space-y-1 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Client</p>
                <p className="text-sm font-bold text-amber-900">{clientFilterValue}</p>
              </div>

            </CardContent>
          </Card>

          {/* Card Block B: Legal Assessment and Detailed Briefing */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-serif text-primary flex items-center gap-2.5">
                <Gavel className="h-4 w-4 text-amber-600" /> Dossier Briefing & Core Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3 text-amber-600/70" /> Case Study Summary
                </h4>
                <div className="p-4 bg-background border border-border rounded-xl text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {selectedCase.caseStudy || "No comprehensive study logs uploaded for this trial profile."}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-amber-600/70" /> Auxiliary Structural Details
                </h4>
                <div className="p-4 bg-background border border-border rounded-xl text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {selectedCase.otherDetails || "No auxiliary structural configuration profiles attached."}
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <FileWarning className="h-3 w-3 text-amber-600/70" /> Internal Remarks & Office Notes
                </h4>
                <div className="p-4 bg-background border border-border rounded-xl text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {selectedCase.remarksNotes || "No active internal annotations or office remarks available."}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Side Jurisdictional Summary Panels */}
        <div className="space-y-6">
          
          {/* Card Block C: Dynamic Litigation Schedules (Old & Next Hearing Dates) */}
          <Card className="border-border/80 shadow-sm bg-card relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-serif text-primary flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-600" /> Litigation Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Next Hearing Target Date Block */}
              <div className="p-3.5 bg-amber-500/[0.03] border border-amber-500/20 rounded-xl space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Next Hearing Date
                </p>
                <p className="text-md font-bold text-amber-900">
                  {formatDateToIndian(selectedCase.nextHearingDate)}
                </p>
              </div>

              {/* History Timeline Logs Array */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <History className="h-3.5 w-3.5 text-amber-600/70" /> Old Hearing Logs History
                </p>
                <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 max-h-[160px] overflow-y-auto space-y-2 divide-y divide-border/40">
                  {selectedCase.oldHearingDates && Array.isArray(selectedCase.oldHearingDates) && selectedCase.oldHearingDates.length > 0 ? (
                    selectedCase.oldHearingDates.map((dateItem, dateIdx) => (
                      <div key={dateIdx} className={`text-xs font-medium text-foreground/95 flex justify-between items-center ${dateIdx > 0 ? "pt-2" : ""}`}>
                        <span className="text-muted-foreground">Session Log #{dateIdx + 1}:</span>
                        <span className="font-semibold font-mono bg-background px-2 py-0.5 rounded border border-border/40">
                          {formatDateToIndian(dateItem)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-2">No preceding hearing log logs cataloged.</p>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Card Block D: Forum Jurisdictions */}
          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-serif text-primary flex items-center gap-2.5">
                <Building className="h-4 w-4 text-amber-600" /> Jurisdictional Arena
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-xs text-muted-foreground font-medium">Jurisdiction Court Level:</span>
                <span className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1">
                  <Landmark className="h-3 w-3 text-amber-600/80" /> {selectedCase.courtType || "High Court"}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Court Name & Bench Room ID</p>
                <p className="text-xs font-semibold text-foreground bg-secondary/40 p-2.5 border border-border/40 rounded-lg">
                  {selectedCase.courtNameNumber || "N/A"}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CRN Registry Number</p>
                <p className="text-xs font-mono font-medium text-foreground bg-secondary/40 px-2.5 py-1.5 border border-border/40 rounded-lg">
                  {selectedCase.crnNumber || "N/A"}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Police Station Jurisdiction</p>
                <p className="text-xs font-semibold text-foreground bg-secondary/40 px-2.5 py-1.5 border border-border/40 rounded-lg">
                  {selectedCase.policeStationName || "N/A"}
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">FIR Code Index</p>
                <p className="text-xs font-mono font-medium text-foreground bg-secondary/40 px-2.5 py-1.5 border border-border/40 rounded-lg">
                  {selectedCase.firNumber || "N/A"}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Card Block E: Commercial Account Ledger Summary */}
          <Card className="border-border/80 shadow-sm bg-card bg-gradient-to-b from-card to-emerald-500/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-md font-serif text-primary flex items-center gap-2.5">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Account Audit Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/80">Retainer Allocation Budget</p>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600">
                    ₹{selectedCase.caseTotalFees ? parseFloat(selectedCase.caseTotalFees).toLocaleString('en-IN') : "0"}
                  </p>
                </div>
                <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center italic">
                Financial balances structured via automated corporate retainer profiles.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}