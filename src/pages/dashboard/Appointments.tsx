import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";

import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "@/api/appointments";

const normalizeAppointmentPayload = (data: any) => {
  const date = data?.date ? String(data.date).slice(0, 10) : "";
  let time = data?.time ? String(data.time) : "";

  if (!time && data?.slot) {
    time = String(data.slot);
  }

  if (time && !time.includes(":")) {
    time = `${time}:00`;
  }

  return {
    ...data,
    date,
    time,
    scheduledAt: date && time ? `${date}T${time}` : undefined,
  };
};

const Appointments = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Form
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Inline Validation Warning State
  const [inlineWarning, setInlineWarning] = useState<string>("");

  // Delete Confirmation Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 🔄 Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAppointments();
      const data =
        res?.data?.appointments ||
        res?.data?.data ||
        res?.data ||
        [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🛡️ Form Input Validation (All fields including notes are now required)
  const validateFormPayload = (data: any) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\d+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.name || !String(data.name).trim()) {
      setInlineWarning("Error: Client name field cannot be empty.");
      return false;
    }

    if (!nameRegex.test(String(data.name).trim())) {
      setInlineWarning("Error: Client name must contain alphabetic text only (no numbers or symbols).");
      return false;
    }

    if (!data.email || !String(data.email).trim()) {
      setInlineWarning("Error: Email field cannot be empty.");
      return false;
    }

    if (!emailRegex.test(String(data.email).trim())) {
      setInlineWarning("Error: Please provide a valid email address.");
      return false;
    }

    if (!data.phone || !String(data.phone).trim()) {
      setInlineWarning("Error: Phone field cannot be empty.");
      return false;
    }

    if (!phoneRegex.test(String(data.phone).trim())) {
      setInlineWarning("Error: Phone input must contain numbers only (no alphabets or special characters).");
      return false;
    }

    if (!data.date || !String(data.date).trim()) {
      setInlineWarning("Error: Date field is required.");
      return false;
    }

    if (!data.time || !String(data.time).trim()) {
      setInlineWarning("Error: Time field is required.");
      return false;
    }

    if (!data.status || !String(data.status).trim()) {
      setInlineWarning("Error: Status field is required.");
      return false;
    }

    if (!data.notes || !String(data.notes).trim()) {
      setInlineWarning("Error: Notes field is required and cannot be empty.");
      return false;
    }

    setInlineWarning("");
    return true;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ status: "Pending", timeFormat: "AM" });
    setInlineWarning("");
    setFormOpen(true);
  };

  const handleOpenEdit = (row: any) => {
    setEditingId(row.id || row._id);
    
    // Parse time string if it exists to separate time and AM/PM format
    let rawTime = row.time || "";
    let timeVal = rawTime;
    let formatVal = "AM";

    if (rawTime.toLowerCase().includes("am") || rawTime.toLowerCase().includes("pm")) {
      const parts = rawTime.split(" ");
      timeVal = parts[0];
      formatVal = parts[1] ? parts[1].toUpperCase() : "AM";
    }

    setForm({ ...row, time: timeVal, timeFormat: formatVal });
    setInlineWarning("");
    setFormOpen(true);
  };

  const handleChange = (field: string, value: any) => {
    // Agar field 'name' hai, toh sirf alphabets aur spaces hi allow honge
    if (field === "name") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    // Agar field 'phone' hai, toh sirf digits hi allow hongi
    if (field === "phone") {
      value = value.replace(/\D/g, "");
    }

    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // Save / Submit Form
  const handleSave = async () => {
    if (!validateFormPayload(form)) {
      return;
    }

    try {
      setSaving(true);
      
      // Combine time and AM/PM format before normalizing payload
      const combinedTime = form.time ? `${form.time} ${form.timeFormat || "AM"}` : "";
      const payloadToNormalize = { ...form, time: combinedTime };
      
      const payload = normalizeAppointmentPayload(payloadToNormalize);

      if (editingId) {
        await updateAppointment(editingId, payload);
      } else {
        await createAppointment(payload);
      }

      setFormOpen(false);
      await fetchAppointments();
    } catch (err: any) {
      console.error("Save error:", err);
      setInlineWarning("Failed to save appointment to server.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteExecute = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await deleteAppointment(deleteId);
      setDeleteId(null);
      await fetchAppointments();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Pagination logic
  const filteredRows = rows.filter((r) => {
    const term = searchTerm.toLowerCase();
    const name = String(r.name || "").toLowerCase();
    const email = String(r.email || "").toLowerCase();
    const phone = String(r.phone || "").toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const displayRows = loading
    ? Array.from({ length: 5 }).map((_, index) => ({
        id: `skeleton-${index}`,
        name: <div className="h-4 w-32 bg-muted animate-pulse rounded" />,
        email: <div className="h-4 w-44 bg-muted animate-pulse rounded" />,
        phone: <div className="h-3 w-24 bg-muted animate-pulse rounded mt-1" />,
        date: <div className="h-4 w-20 bg-muted animate-pulse rounded" />,
        time: <div className="h-4 w-16 bg-muted animate-pulse rounded" />,
        status: <div className="h-5 w-20 bg-muted animate-pulse rounded" />,
        isSkeleton: true,
      }))
    : paginatedRows;

  const fields = [
    { name: "name", label: "Client Name *", placeholder: "Enter full name " },
    { name: "email", label: "Email *", placeholder: "client@example.com" },
    { name: "phone", label: "Phone *", placeholder: "Enter phone numbers " },
    { name: "date", label: "Date *", type: "date" },
    { name: "time", label: "Time *", type: "time-custom" },
    { name: "status", label: "Status *", type: "select", options: ["Pending", "Confirmed", "Completed", "Rejected"] },
    { name: "notes", label: "Notes *", type: "textarea", placeholder: "Enter appointment notes " },
  ];

  return (
    <DashboardLayout title="appointment">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-sm text-muted-foreground">
              Approve, reject, and manage client booking requests.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Appointment
          </Button>
        </div>

        {/* Search & Table Wrapper */}
        <div className="border rounded-lg bg-card shadow-sm">
          <div className="p-4 border-b flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm border-0 focus-visible:ring-0 px-0 shadow-none"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                displayRows.map((r: any) => (
                  <TableRow key={r.id || r._id}>
                    <TableCell className="font-medium">
                      {r.isSkeleton ? r.name : r.name}
                    </TableCell>
                    <TableCell>
                      {r.isSkeleton ? (
                        r.email
                      ) : (
                        <div className="text-xs">
                          <div>{r.email}</div>
                          <div className="text-muted-foreground">{r.phone}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>
                      {r.isSkeleton ? (
                        r.status
                      ) : (
                        (() => {
                          const map: Record<string, string> = {
                            Pending: "bg-yellow-500/15 text-yellow-700",
                            Confirmed: "bg-blue-500/15 text-blue-700",
                            Completed: "bg-emerald-500/15 text-emerald-700",
                            Rejected: "bg-red-500/15 text-red-700",
                          };
                          return (
                            <span className={`text-[10px] uppercase px-2 py-1 rounded font-medium ${map[r.status] || "bg-muted"}`}>
                              {r.status || "Pending"}
                            </span>
                          );
                        })()
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!r.isSkeleton && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(r)}
                          >
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(r.id || r._id)}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500 hover:text-rose-700" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="p-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div>
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Add / Edit Form Dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
              <DialogTitle>{editingId ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
              <DialogDescription>
                Fill out all the details below. All fields are required.
              </DialogDescription>
            </DialogHeader>

            {/* Scrollable Container for Form Body */}
            <div className="px-6 overflow-y-auto flex-1 space-y-4 py-2">
              {/* INLINE WARNING FIELD NOTICE */}
              {inlineWarning && (
                <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Notice:</span> {inlineWarning}
                  </div>
                  <button onClick={() => setInlineWarning("")} className="text-amber-600 hover:text-amber-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form
                id="appointment-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-4"
              >
                {fields.map((f) => (
                  <div key={f.name} className="space-y-1.5">
                    <Label className="text-xs font-medium">{f.label}</Label>

                    {f.type === "textarea" ? (
                      <Textarea
                        placeholder={f.placeholder}
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        className="resize-none h-20"
                      />
                    ) : f.type === "select" ? (
                      <select
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        className="w-full border rounded-md h-9 px-3 bg-background text-sm"
                      >
                        <option value="">Select</option>
                        {f.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "time-custom" ? (
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={form["time"] || ""}
                          onChange={(e) => handleChange("time", e.target.value)}
                          className="h-9 flex-1"
                        />
                        <select
                          value={form["timeFormat"] || "AM"}
                          onChange={(e) => handleChange("timeFormat", e.target.value)}
                          className="border rounded-md h-9 px-3 bg-background text-sm w-24"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    ) : f.type === "number" ? (
                      <Input
                        type="number"
                        placeholder={f.placeholder}
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, Number(e.target.value))}
                        className="h-9"
                      />
                    ) : f.type === "date" ? (
                      <Input
                        type="date"
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        className="h-9"
                      />
                    ) : f.type === "time" ? (
                      <Input
                        type="time"
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        className="h-9"
                      />
                    ) : (
                      <Input
                        type="text"
                        placeholder={f.placeholder}
                        value={form[f.name] || ""}
                        onChange={(e) => handleChange(f.name, e.target.value)}
                        className="h-9"
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>

            <DialogFooter className="px-6 py-4 border-t shrink-0 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" form="appointment-form" size="sm" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This appointment record will be permanently deleted from the database.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setDeleteId(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button type="button" className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleDeleteExecute} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;