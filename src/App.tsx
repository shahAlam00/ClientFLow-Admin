import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import ProtectedRoute from "./components/ProtectedRoute";

// Admin dashboard
import DashLogin from "./pages/dashboard/Login.tsx";
import DashOverview from "./pages/dashboard/Overview.tsx";
import DashAbout from "./pages/dashboard/About.tsx";
import DashContact from "./pages/dashboard/Contact.tsx";
import DashUpdates from "./pages/dashboard/Updates.tsx";
import DashNews from "./pages/dashboard/News.tsx";
import DashBlogs from "./pages/dashboard/Blogs.tsx";
import DashPodcasts from "./pages/dashboard/Podcasts.tsx";
import DashCases from "./pages/dashboard/Cases.tsx";
import DashCalendar from "./pages/dashboard/Calendar.tsx";
import DashAppointments from "./pages/dashboard/Appointments.tsx";
import DashReels from "./pages/dashboard/Reels.tsx";
import DashProjects from "./pages/dashboard/Projects.tsx";
import DashTeam from "./pages/dashboard/Team.tsx";
import DashSettings from "./pages/dashboard/Settings.tsx";
import CreateBlog from "./pages/dashboard/CreateBlog";
import AdminLead from "./pages/dashboard/AdminLead.jsx";
import CaseStatus from "./pages/dashboard/CaseStatus.jsx";
import ClientBoarding from "./pages/dashboard/ClientBoarding.jsx";
import Clients from "./pages/dashboard/Clients.jsx";
import ClientDetails from "./pages/dashboard/ClientDetails.jsx";
import EditClient from "./pages/dashboard/EditClient.jsx";
import AddCaseForm from "./components/case/AddCaseForm.jsx";
import SmartService from "./pages/dashboard/SmartService.jsx";
import Reminders from "./pages/dashboard/Reminders.jsx";
import Announcements from "./pages/dashboard/Announcements.jsx";
import Referrers from "./pages/dashboard/Referrers.jsx";
import Invoices from "./pages/dashboard/Invoice/Invoices.jsx";
import CreateInvoice from "./components/CreateInvoice.jsx";
import Proforma from "./pages/dashboard/Invoice/Proforma.jsx";
import CreateProforma from "./components/CreateProforma.jsx";
import CreditNotes from "./pages/dashboard/Invoice/CreditNotes.jsx";
import CreateCreditNote from "./components/CreateCreditNote.jsx";
import Payments from "./pages/dashboard/Invoice/Payments.jsx";
import MoneyPulse from "./pages/dashboard/Analytics/MoneyPuls.jsx";
import Practice from "./pages/dashboard/Analytics/Practice.jsx";
import CaseIntelligence from "./pages/dashboard/Analytics/CaseIntelligence.jsx";
import Matters from "./pages/dashboard/Matters/Matters.jsx";
import Litigation from "./pages/dashboard/Matters/Litigation.jsx";
import Nonlitigation from "./pages/dashboard/Matters/Nonlitigation.jsx";
import NewCaseForm from "./components/NewCaseForm.jsx";
import AddNewMatter from "./components/AddNewMatter.jsx";
import Expenses from "./pages/dashboard/Matters/Expenses.jsx";
import AddStudentNotePage from "./components/AddStudentNotePage.jsx";
import AdmissionsPipeline from "./pages/dashboard/AdmissionPipeline.tsx";
import Applications from "./pages/dashboard/Applications.tsx";
import Admissions from "./pages/dashboard/Admissions.tsx";
import EnrolledStudents from "./pages/dashboard/EnrolledStudents.tsx";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Public Route */}
            <Route path="/" element={<DashLogin />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <></>
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashOverview />} />
              <Route path="/dashboard/about" element={<DashAbout />} />
              <Route path="/dashboard/contact" element={<DashContact />} />
              <Route path="/dashboard/updates" element={<DashUpdates />} />
              <Route path="/dashboard/news" element={<DashNews />} />
              <Route path="/dashboard/blogs" element={<DashBlogs />} />
              <Route path="/create-blog" element={<CreateBlog />} />
              <Route path="/dashboard/podcasts" element={<DashPodcasts />} />
              <Route path="/dashboard/cases" element={<DashCases />} />
              <Route path="/dashboard/calendar" element={<DashCalendar />} />
              <Route path="/dashboard/appointments" element={<DashAppointments />} />
              <Route path="/dashboard/reels" element={<DashReels />} />
              <Route path="/dashboard/projects" element={<DashProjects />} />
              <Route path="/dashboard/team" element={<DashTeam />} />
              <Route path="/dashboard/settings" element={<DashSettings />} />

              <Route path="/dashboard/leads" element={<AdminLead />} />
              <Route path="/dashboard/leads/:leadId/add-note" element={<AddStudentNotePage />} />

              <Route path="/dashboard/case-status" element={<CaseStatus />} />
              <Route path="/dashboard/cases/adds" element={<AddCaseForm />} />
              <Route path="/dashboard/cases/edit/:id" element={<AddCaseForm />} />

              <Route path="/dashboard/smart-services" element={<SmartService />} />
              {/* Addmission */}
              <Route path="/dashboard/admissions" element={<AdmissionsPipeline />} />
              <Route path="/dashboard/applications" element={<Applications />} />
              <Route path="/dashboard/admissionss" element={<Admissions />} />
              <Route path="/dashboard/enrollment" element={<EnrolledStudents />} />

              <Route path="/dashboard/clients" element={<Clients />} />
              <Route path="/dashboard/client" element={<ClientBoarding />} />
              <Route path="/dashboard/clients/edit/:id" element={<EditClient />} />
              <Route path="/dashboard/clients/:id" element={<ClientDetails />} />

              <Route path="/dashboard/reminders" element={<Reminders />} />
              <Route path="/dashboard/announcements" element={<Announcements />} />

              <Route path="/dashboard/referrers" element={<Referrers />} />

              <Route path="/dashboard/invoices" element={<Invoices />} />
              <Route path="/dashboard/create-new" element={<CreateInvoice />} />
              <Route path="/dashboard/proforma-invoices" element={<Proforma />} />
              <Route
                path="/dashboard/proforma-invoices/create-new"
                element={<CreateProforma />}
              />
              <Route
                path="/dashboard/credit-notes"
                element={<CreditNotes />}
              />
              <Route
                path="/dashboard/credit-notes/create-new"
                element={<CreateCreditNote />}
              />
              <Route path="/dashboard/payments" element={<Payments />} />
              <Route path="/dashboard/cash-flow" element={<MoneyPulse />} />

              <Route
                path="/dashboard/case-intelligence"
                element={<CaseIntelligence />}
              />

              <Route path="/dashboard/add" element={<Matters />} />
              <Route
                path="/dashboard/litigation"
                element={<Litigation />}
              />
              <Route
                path="/dashboard/nonlitigation"
                element={<Nonlitigation />}
              />
              <Route
                path="/dashboard/matters/new-case"
                element={<NewCaseForm />}
              />
              <Route
                path="/dashboard/matters/new-case/:id"
                element={<NewCaseForm />}
              />
              <Route
                path="/dashboard/add-noncase"
                element={<AddNewMatter />}
              />
              <Route
                path="/dashboard/add-noncase/:id"
                element={<AddNewMatter />}
              />
              <Route path="/dashboard/expenses" element={<Expenses />} />
              <Route path="/dashboard/practice" element={<Practice />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;