import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import ClientStatusBadge from "./ClientStatusBadge";

const ClientTable = ({
  clients,
  navigate,
  onDelete,
}) => {
  return (
    <table className="w-full">

      <thead>

        <tr className="border-b">

          <th className="text-left p-4">
            Client ID
          </th>

          <th className="text-left p-4">
            Name
          </th>

          <th className="text-left p-4">
            Mobile
          </th>

          <th className="text-left p-4">
            Type
          </th>

          <th className="text-left p-4">
            Status
          </th>

          <th className="text-center p-4">
            Action
          </th>

        </tr>

      </thead>

      <tbody>

        {clients?.map((client) => {
          const clientId = client._id || client.id;
          return (

          <tr
            key={clientId}
            className="border-b hover:bg-muted"
          >

            <td className="p-4">
              {client.clientId}
            </td>

            <td className="p-4">
              {client.fullName}
            </td>

            <td className="p-4">
              {client.mobilePrimary}
            </td>

            <td className="p-4">
              {client.clientType}
            </td>

            <td className="p-4">

              <ClientStatusBadge
                status={client.status}
              />

            </td>

            <td className="p-4">

              <div className="flex justify-center gap-2">

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/dashboard/clients/${clientId}`
                    )
                  }
                >
                  <Eye size={18} />
                </Button>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/dashboard/clients/edit/${clientId}`
                    )
                  }
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