import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const ClientSearch = ({
  search,
  setSearch,
}) => {
  return (
    <div className="relative w-full md:w-96">

      <Search
        className="absolute left-3 top-3"
        size={18}
      />

      <Input
        placeholder="Search client..."
        className="pl-10"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

    </div>
  );
};

export default ClientSearch;