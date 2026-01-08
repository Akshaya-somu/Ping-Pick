import { motion } from "framer-motion";
import { ArrowLeft, Search, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsViewProps {
  medicine: string;
  hasResults: boolean;
  onBack: () => void;
  onPingPharmacies: () => void;
  children?: React.ReactNode;
}

const SearchResultsView = ({
  medicine,
  hasResults,
  onBack,
  onPingPharmacies,
  children,
}: SearchResultsViewProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Search Results</h2>
          <p className="text-sm text-muted-foreground">"{medicine}"</p>
        </div>
      </div>

      {/* No Results State */}
      {!hasResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Search className="w-16 h-16 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">No results found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Medicine not found in registered pharmacies' digital inventory.
              </p>
            </div>
            <Button variant="hero" onClick={onPingPharmacies} className="gap-2 mt-4">
              <Radio className="w-4 h-4" />
              Ping Nearby Pharmacies
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {hasResults && children}
    </div>
  );
};

export default SearchResultsView;
