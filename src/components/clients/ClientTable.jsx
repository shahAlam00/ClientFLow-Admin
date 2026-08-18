import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientStatusBadge from "./ClientStatusBadge";

const generateClientId = (name, index) => {
  if (!name) return `ST-${String(index + 1).padStart(2, '0')}`;
  const prefix = name.trim().slice(0, 2).replace(/\s/g, '');
  return `${prefix}-${String(index + 1).padStart(2, '0')}`;
};

const ClientTable = ({ clients, navigate, onDelete }) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-4">Client ID</th>
          <th className="text-left p-4">Name</th>
          <th className="text-left p-4">Mobile</th>
          <th className="text-left p-4">Status</th>
          <th className="text-center p-4">Action</th>
        </tr>
      </thead>

      <tbody>
        {clients?.map((client, index) => {
          const clientId = client._id || client.id;
          const autoId = generateClientId(client.studentName || client.fullName, index);
          return (
            <tr key={clientId} className="border-b hover:bg-muted">

              <td className="p-4 font-mono text-xs font-bold text-blue-700">
                {autoId}
              </td>

              <td className="p-4">
                {client.studentName || client.fullName}
              </td>

              <td className="p-4">
                {client.personalPhone || client.mobilePrimary}
              </td>

              <td className="p-4">
                <ClientStatusBadge status={client.status || client.projectStatus} />
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => navigate(`/dashboard/students/${clientId}`)}
                  >
                    <Eye size={18} />
                  </Button>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => navigate(`/dashboard/student/edit/${clientId}`)}
                  >
                    <Pencil size={18} />
                  </Button>

                  <Button
                    onClick={() => onDelete(client)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ClientTable;
