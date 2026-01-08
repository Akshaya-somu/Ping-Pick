import { useState, useEffect } from "react";
import { Search, MapPin, AlertTriangle, Loader2, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MedicineSearchProps {
  onSearch: (query: string, isEmergency: boolean) => void;
  onPing: (query: string, isEmergency: boolean) => void;
  isSearching?: boolean;
}

const MedicineSearch = ({ onSearch, onPing, isSearching }: MedicineSearchProps) => {
  const [query, setQuery] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback location
          setLocation({ lat: 16.5627, lng: 81.5267 });
        }
      );
    } else {
      setLocation({ lat: 16.5627, lng: 81.5267 });
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, isEmergency);
    }
  };

  const handlePing = () => {
    if (query.trim()) {
      onPing(query, isEmergency);
    }
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Medicine Name Input */}
      <div className="space-y-2">
        <Label htmlFor="medicine" className="text-sm font-medium">Medicine Name</Label>
        <Input
          id="medicine"
          type="text"
          placeholder="e.g., Paracetamol, Amoxicillin..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 text-base rounded-xl border-border bg-card"
        />
      </div>

      {/* Emergency Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn("w-4 h-4", isEmergency ? "text-emergency" : "text-muted-foreground")} />
          <Label htmlFor="emergency" className="text-sm font-medium">Emergency</Label>
        </div>
        <Switch
          id="emergency"
          checked={isEmergency}
          onCheckedChange={setIsEmergency}
        />
      </div>

      {/* Location Display */}
      {location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button
          type="submit"
          variant="outline"
          size="lg"
          disabled={!query.trim() || isSearching}
          className="gap-2 h-14 rounded-xl"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Search Medicine
        </Button>

        <Button
          type="button"
          variant="hero"
          size="lg"
          disabled={!query.trim() || isSearching}
          onClick={handlePing}
          className="gap-2 h-14 rounded-xl"
        >
          <Radio className="w-5 h-5" />
          Ping Pharmacies
        </Button>
      </div>
    </form>
  );
};

export default MedicineSearch;
