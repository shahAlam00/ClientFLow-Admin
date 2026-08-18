const colors = {
  Active:
    "bg-green-100 text-green-700 border-green-300",

  Inactive:
    "bg-gray-100 text-gray-700 border-gray-300",

  Blacklisted:
    "bg-red-100 text-red-700 border-red-300",
};

const ClientStatusBadge = ({ status }) => {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[status]
      }`}
    >
      {status}
    </span>
  );
};

export default ClientStatusBadge;