import { useState } from "react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageToolbar } from "@/components/dashboard/PageToolbar";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { Pencil, Trash2 } from "lucide-react";

import { toast } from "@/hooks/use-toast";

// ==========================================
// TYPES
// ==========================================
type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "time-am-pm"
  | "switch"
  | "select"
  | "file"
  | "number";

export interface CrudField {
  name: string;
  label: string;
  type?: FieldType;
  options?: string[];
  placeholder?: string;
  description?: string;
}

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  className?: string;
}

interface CrudPageProps {
  title: string;

  pageDescription?: string;

  columns?: Column[];

  rows?: any[];

  fields?: CrudField[];

  addLabel?: string;

  searchKeys?: string[];

  loading?: boolean;

  onCreate?: (data: any) => Promise<void> | void;

  onUpdate?: (
    id: string,
    data: any
  ) => Promise<void> | void;

  onDelete?: (id: string) => Promise<void> | void;
}

// ==========================================
// COMPONENT
// ==========================================
export function CrudPage({
  title,

  pageDescription,

  columns = [],

  rows = [],

  fields = [],

  addLabel = "Add New",

  searchKeys = ["title", "name"],

  loading = false,

  onCreate,

  onUpdate,

  onDelete,
}: CrudPageProps) {
  // ==========================================
  // STATE
  // ==========================================
  const [search, setSearch] = useState("");
 const [formError, setFormError] = useState("");
  const [open, setOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<any | null>(
    null
  );

  const [form, setForm] = useState<any>({});

  // ==========================================
  // FILTER
  // ==========================================
  const filtered = (rows || []).filter((r) =>
    !search
      ? true
      : (searchKeys || []).some((k) =>
        String(r?.[k] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
  );

  // ==========================================
  // OPEN NEW
  // ==========================================
  const openNew = () => {
    setEditing(null);

    const emptyForm = Object.fromEntries(
      fields.map((f) => [
        f.name,
        f.type === "switch" ? false : "",
      ])
    );

    setForm(emptyForm);

    setOpen(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================
  const openEdit = (row: any) => {
    setEditing(row);

    setForm({
      ...row,
    });

    setOpen(true);
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================
  const handleChange = (
    name: string,
    value: any
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE
  // ==========================================
  const save = async () => {
    try {
      setSaving(true);

      console.log("FORM DATA:", form);

      if (editing) {
        await onUpdate?.(
          editing._id || editing.id,
          form
        );

        toast({
          title: "Updated",
          description: `${title} updated successfully`,
        });
      } else {
        await onCreate?.(form);

        toast({
          title: "Created",
          description: `${title} created successfully`,
        });
      }

      // RESET
      setForm({});

      setEditing(null);

      setOpen(false);
    } catch (error) {
      console.log("SAVE ERROR:", error);

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================
  const remove = async (row: any) => {
    try {
      await onDelete?.(row._id || row.id);

      // toast({
      //   title: "Deleted",
      //   description: `${title} deleted`,
      // });
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <DashboardLayout title={title}>
      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}
      {pageDescription && (
        <p className="text-sm text-muted-foreground mb-4">
          {pageDescription}
        </p>
      )}

      {/* ========================================== */}
      {/* TOOLBAR */}
      {/* ========================================== */}
      <PageToolbar
        onSearch={setSearch}
        onAdd={openNew}
        addLabel={addLabel}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
      />

      {/* ========================================== */}
      {/* TABLE */}
      {/* ========================================== */}
      <Card className="overflow-hidden">

        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>
                  {c.label}
                </TableHead>
              ))}

              <TableHead className="w-32">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-10"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-10"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow
                  key={row._id || row.id}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render
                        ? c.render(row)
                        : row[c.key]}
                    </TableCell>
                  ))}

                  {/* ACTIONS */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          openEdit(row)
                        }
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() =>
                          remove(row)
                        }
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ========================================== */}
      {/* DIALOG */}
      {/* ========================================== */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Create"}{" "}
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* ========================================== */}
          {/* FORM */}
          {/* ========================================== */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="space-y-4"
          >
            {fields.map((f) => (
              <div
                key={f.name}
                className="space-y-2"
              >
                <Label>{f.label}</Label>

                {/* ========================================== */}
                {/* TEXTAREA */}
                {/* ========================================== */}
                {f.type === "textarea" ? (
                  <Textarea
                    placeholder={
                      f.placeholder
                    }
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                  />

                  /* ========================================== */
                  /* SWITCH */
                  /* ========================================== */
                ) : f.type === "switch" ? (
                  <div className="pt-2">
                    <Switch
                      checked={
                        !!form[f.name]
                      }
                      onCheckedChange={(v) =>
                        handleChange(
                          f.name,
                          v
                        )
                      }
                    />
                  </div>

                  /* ========================================== */
                  /* SELECT */
                  /* ========================================== */
                ) : f.type === "select" ? (
                  <select
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                    className="w-full border rounded-md h-10 px-3 bg-background"
                  >
                    <option value="">
                      Select
                    </option>

                    {f.options?.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>

                  /* ========================================== */
                  /* NUMBER */
                  /* ========================================== */
                ) : f.type === "number" ? (
                  <Input
                    type="number"
                    placeholder={
                      f.placeholder
                    }
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        Number(
                          e.target.value
                        )
                      )
                    }
                  />

                  /* ========================================== */
                  /* DATE */
                  /* ========================================== */
                ) : f.type === "date" ? (
                  <Input
                    type="date"
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                  />

                  /* ========================================== */
                  /* TIME */
                  /* ========================================== */
                ) : f.type === "time" ? (
                  <Input
                    type="time"
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                  />

                  /* ========================================== */
                  /* TIME AM/PM */
                  /* ========================================== */
                ) : f.type === "time-am-pm" ? (
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 12:30 PM"
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                  />

                  /* ========================================== */
                  /* TEXT INPUT */
                  /* ========================================== */
                ) : (
                  <Input
                    type="text"
                    placeholder={
                      f.placeholder
                    }
                    value={
                      form[f.name] || ""
                    }
                    onChange={(e) =>
                      handleChange(
                        f.name,
                        e.target.value
                      )
                    }
                  />
                )}

                {/* DESCRIPTION */}
                {f.description && (
                  <p className="text-xs text-muted-foreground">
                    {f.description}
                  </p>
                )}
              </div>
            ))}

            {/* ========================================== */}
            {/* FOOTER */}
            {/* ========================================== */}
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}