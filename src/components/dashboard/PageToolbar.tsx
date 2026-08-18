import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PageToolbar({
  searchPlaceholder = "Search…",
  onSearch,
  onAdd,
  addLabel = "Add New",
  children,
}: {
  searchPlaceholder?: string;
  onSearch?: (v: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 bg-card"
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <Button variant="gold" onClick={onAdd}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
