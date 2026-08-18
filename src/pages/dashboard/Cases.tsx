import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  Trash2,
  Plus,
  Edit3,
  Lock,
  FileUp,
  Search,
  Loader2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  HardDrive,
  Clock,
  MoreVertical,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import api from "@/lib/axios";

const Cases = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newCaseNumber, setNewCaseNumber] = useState("");
  const [clientNameError, setClientNameError] = useState("");

  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editClientName, setEditClientName] = useState("");
  const [editClientNameError, setEditClientNameError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    id: null,
    name: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedFolder =
    folders.find((folder) => folder._id === selectedFolderId) || {};

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFolderId]);

  const fetchCases = async () => {
    try {
      const res = await api.get("/cases");
      setFolders(res.data.data || []);
      if (res.data.data && res.data.data.length > 0 && !selectedFolderId) {
        setSelectedFolderId(res.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleAddFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setClientNameError("Client name is required");
      return;
    }
    setClientNameError("");

    try {
      const res = await api.post("/cases", {
        clientName: newClientName.trim(),
        caseNumber: newCaseNumber.trim() || "N/A",
      });

      setFolders((prev) => [res.data.data, ...prev]);
      setSelectedFolderId(res.data.data._id);
      window.dispatchEvent(
        new CustomEvent("dashboard-notification", {
          detail: {
            title: "Folder Created",
            description: `${newClientName} (Case #${newCaseNumber || "N/A"})`,
          },
        })
      );

      setNewClientName("");
      setNewCaseNumber("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding folder:", error);
      setClientNameError(
        error.response?.data?.message || "Failed to create folder"
      );
    }
  };

  const promptDeleteFolder = (folder, e) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: "folder",
      id: folder._id,
      name: folder.clientName || "this folder",
    });
  };

  const executeDeleteFolder = async (id) => {
    setIsDeleting(true);
    try {
      await api.delete(`/cases/${id}`);
      const updated = folders.filter((folder) => folder._id !== id);
      setFolders(updated);
      if (updated.length > 0) {
        setSelectedFolderId(updated[0]._id);
      } else {
        setSelectedFolderId(null);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const startEditing = (folder, e) => {
    e.stopPropagation();
    setEditingFolderId(folder._id);
    setEditClientName(folder.clientName);
    setEditClientNameError("");
  };

  const saveEditFolder = async (id, e) => {
    e.stopPropagation();
    if (!editClientName.trim()) {
      setEditClientNameError("Name cannot be empty");
      return;
    }
    setEditClientNameError("");

    try {
      const res = await api.put(`/cases/${id}`, {
        clientName: editClientName.trim(),
      });
      setFolders(folders.map((f) => (f._id === id ? res.data.data : f)));
      setEditingFolderId(null);
    } catch (error) {
      setEditClientNameError(
        error.response?.data?.message || "Failed to update"
      );
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedFolder._id) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(
        `/cases/${selectedFolder._id}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data?.success) {
        await fetchCases();
        window.dispatchEvent(
          new CustomEvent("dashboard-notification", {
            detail: {
              title: "File Uploaded",
              description: `"${file.name}" added to ${selectedFolder.clientName}`,
            },
          })
        );
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const promptDeleteFile = (file) => {
    setDeleteModal({
      isOpen: true,
      type: "file",
      id: file.fileId,
      name: file.fileName || "this file",
    });
  };

  const executeDeleteFile = async (imageKitFileId) => {
    if (!imageKitFileId || !selectedFolder._id) {
      closeDeleteModal();
      return;
    }
    setIsDeleting(true);
    try {
      const safeFileId = encodeURIComponent(imageKitFileId);
      const res = await api.delete(
        `/cases/${selectedFolder._id}/file/${safeFileId}`
      );
      if (res.data?.success) {
        const updatedCase = res.data.data;
        if (updatedCase) {
          setFolders(
            folders.map((folder) =>
              folder._id === updatedCase._id ? updatedCase : folder
            )
          );
        } else {
          await fetchCases();
        }
      } else {
        await fetchCases();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      await fetchCases();
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: null, name: "" });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.type === "folder") {
      executeDeleteFolder(deleteModal.id);
    } else if (deleteModal.type === "file") {
      executeDeleteFile(deleteModal.id);
    }
  };

  const allFiles = selectedFolder.files || [];
  const totalFiles = allFiles.length;
  const totalPages = Math.ceil(totalFiles / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentFiles = allFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalFiles, totalPages, currentPage]);

  return (
    <DashboardLayout title="Case Vault">
      <div className="h-[calc(100vh-80px)] flex rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
        
        {/* ─── SIDEBAR ─── */}
        <aside className="w-80 bg-slate-950 flex flex-col border-r border-slate-800">
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Lock className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Case Vault
                </h2>
                <p className="text-[11px] text-slate-500 font-medium">
                  {folders.length} folders
                </p>
              </div>
            </div>

            {!isAdding ? (
              <button
                onClick={() => {
                  setIsAdding(true);
                  setClientNameError("");
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all"
              >
                <Plus size={15} strokeWidth={2.5} /> New Folder
              </button>
            ) : (
              <form
                onSubmit={handleAddFolderSubmit}
                className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2.5"
              >
                <div>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={newClientName}
                    onChange={(e) => {
                      setNewClientName(e.target.value);
                      if (e.target.value.trim()) setClientNameError("");
                    }}
                    className={`w-full bg-slate-950 text-white py-2 px-3 rounded-lg text-xs outline-none border transition-all ${
                      clientNameError
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-slate-800 focus:border-blue-500"
                    } placeholder-slate-600`}
                  />
                  {clientNameError && (
                    <p className="text-[10px] text-red-400 mt-1 pl-0.5 font-medium">
                      {clientNameError}
                    </p>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Case # (Optional)"
                  value={newCaseNumber}
                  onChange={(e) => setNewCaseNumber(e.target.value)}
                  className="w-full bg-slate-950 text-white py-2 px-3 rounded-lg text-xs outline-none border border-slate-800 focus:border-blue-500 placeholder-slate-600 transition-all"
                />
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setClientNameError("");
                    }}
                    className="px-3 py-1.5 text-[11px] text-slate-400 hover:text-white font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white font-bold text-[11px] rounded-lg hover:bg-blue-500 transition shadow-md shadow-blue-600/20"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="px-4 pt-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                size={14}
              />
              <input
                placeholder="Search folders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 text-white py-2.5 pl-9 pr-3 rounded-xl text-xs outline-none border border-slate-800 focus:border-blue-500/50 placeholder-slate-600 transition-all"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto mt-3 px-3 pb-4 space-y-1 custom-scrollbar">
            {folders
              .filter((f) =>
                f.clientName?.toLowerCase().includes(search.toLowerCase())
              )
              .map((folder) => {
                const isSelected = selectedFolderId === folder._id;
                const isEditing = editingFolderId === folder._id;

                return (
                  <div
                    key={folder._id}
                    onClick={() => !isEditing && setSelectedFolderId(folder._id)}
                    className={`group relative cursor-pointer p-3 rounded-xl flex items-center justify-between transition-all duration-200 border ${
                      isSelected
                        ? "bg-blue-600/10 border-blue-500/30 text-white"
                        : "text-slate-400 border-transparent hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isSelected ? (
                        <FolderOpen
                          className="text-blue-500 flex-shrink-0"
                          size={17}
                        />
                      ) : (
                        <Folder
                          className="text-slate-600 flex-shrink-0 group-hover:text-slate-400"
                          size={17}
                        />
                      )}

                      {isEditing ? (
                        <div className="w-full min-w-0">
                          <input
                            type="text"
                            value={editClientName}
                            onChange={(e) => {
                              setEditClientName(e.target.value);
                              if (e.target.value.trim())
                                setEditClientNameError("");
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full bg-slate-950 text-white py-1 px-2 rounded text-xs outline-none border ${
                              editClientNameError
                                ? "border-red-500"
                                : "border-blue-500"
                            }`}
                            autoFocus
                          />
                          {editClientNameError && (
                            <p className="text-[9px] text-red-400 mt-0.5">
                              {editClientNameError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <span className="text-xs font-semibold truncate block tracking-wide">
                            {folder.clientName}
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium">
                            {folder.files?.length || 0} files
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex items-center gap-1 transition-all ${
                        isEditing
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {isEditing ? (
                        <>
                          <button
                            onClick={(e) => saveEditFolder(folder._id, e)}
                            className="p-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingFolderId(null);
                            }}
                            className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white transition"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startEditing(folder, e)}
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={(e) => promptDeleteFolder(folder, e)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

            {folders.filter((f) =>
              f.clientName?.toLowerCase().includes(search.toLowerCase())
            ).length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-slate-600">No folders found</p>
              </div>
            )}
          </nav>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 flex flex-col bg-slate-50">
          {selectedFolderId ? (
            <>
              <header className="px-8 py-5 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <HardDrive className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                      {selectedFolder.clientName}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        Case #{selectedFolder.caseNumber || "N/A"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={11} />
                        {totalFiles} document{totalFiles !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <label
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer font-bold text-xs transition-all active:scale-95 ${
                    uploading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp size={14} /> Upload Document
                    </>
                  )}
                  {!uploading && (
                    <input type="file" hidden onChange={handleFileUpload} />
                  )}
                </label>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar-light">
                {currentFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentFiles.map((file, i) => (
                      <div
                        key={file.fileId || i}
                        className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 hover:border-blue-300 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                            <FileText size={22} strokeWidth={1.5} />
                          </div>
                          <button
                            onClick={() => promptDeleteFile(file)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <h3
                          className="text-sm font-bold text-slate-800 mb-1 truncate"
                          title={file.fileName}
                        >
                          {file.fileName}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium mb-4">
                          Document
                        </p>

                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-full py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-blue-600 transition-all duration-200"
                        >
                          View Document
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-4">
                      <FileText size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 mb-1">
                      Empty Vault
                    </h3>
                    <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
                      This case folder has no documents yet. Upload files to build the case record.
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalFiles > 0 && totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500 font-medium">
                      Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span>–
                      <span className="font-semibold text-slate-800">
                        {Math.min(startIndex + ITEMS_PER_PAGE, totalFiles)}
                      </span>{" "}
                      of <span className="font-semibold text-slate-800">{totalFiles}</span>
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
              <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-300 mb-4">
                <FolderOpen size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                Select a Case
              </h3>
              <p className="text-xs text-slate-400 text-center max-w-xs">
                Choose a folder from the sidebar or create a new one to manage case documents.
              </p>
            </div>
          )}
        </main>

        {/* ─── DELETE CONFIRMATION MODAL ─── */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-4 mb-5">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Delete {deleteModal.type === "folder" ? "Folder" : "File"}?
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    This action is permanent.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-6">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-slate-900">
                    "{deleteModal.name}"
                  </span>
                  ?
                  {deleteModal.type === "folder" && (
                    <span className="block mt-1 text-red-500 font-medium">
                      All {selectedFolder.files?.length || 0} files inside will also be deleted.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 shadow-lg shadow-red-500/20 transition disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Cases;