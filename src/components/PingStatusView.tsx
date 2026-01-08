import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Radio,
  MapPin,
  Clock,
  Loader2,
  X,
  Check,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PharmacyResponse {
  id: string;
  pharmacyName: string;
  distance: string;
  address: string;
  price: string;
  reservationTime: number;
  phone?: string;
}

interface PingStatusViewProps {
  medicine: string;
  urgency: "normal" | "emergency";
  radius: string;
  searchTime: number; // in minutes
  onBack: () => void;
  onTimeout: () => void;
  onExpandRadius?: () => void;
  onCancel: () => void;
  onSelectPharmacy: (pharmacy: PharmacyResponse) => void;
  responses: PharmacyResponse[];
}

const PingStatusView = ({
  medicine,
  urgency,
  radius,
  searchTime,
  onBack,
  onTimeout,
  onExpandRadius,
  onCancel,
  onSelectPharmacy,
  responses,
}: PingStatusViewProps) => {
  const [timeRemaining, setTimeRemaining] = useState(searchTime * 60); // Convert minutes to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeout();
    }
  }, [timeRemaining, onTimeout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Ping Status</h2>
          <p className="text-sm text-muted-foreground">{medicine}</p>
        </div>
      </div>

      {/* Ping Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                urgency === "emergency"
                  ? "bg-emergency-soft"
                  : "bg-primary-soft"
              )}
            >
              <Radio
                className={cn(
                  "w-5 h-5",
                  urgency === "emergency" ? "text-emergency" : "text-primary"
                )}
              />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{medicine}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{radius} radius</span>
              </div>
            </div>
          </div>
          <Badge variant={urgency === "emergency" ? "emergency" : "normal"}>
            {urgency}
          </Badge>
        </div>
      </motion.div>

      {/* Pharmacy Responses */}
      {responses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-muted-foreground">
            {responses.length} pharmacy response
            {responses.length > 1 ? "s" : ""}
          </h3>
          {responses.map((pharmacy, index) => (
            <motion.div
              key={pharmacy.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-available-soft flex items-center justify-center">
                    <Store className="w-5 h-5 text-available" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {pharmacy.pharmacyName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{pharmacy.distance}</span>
                      <span>•</span>
                      <span>{pharmacy.price}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onSelectPharmacy(pharmacy)}
                  className="gap-1"
                >
                  <Check className="w-4 h-4" />
                  Reserve
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {pharmacy.address}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Waiting State */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-8"
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {responses.length > 0
                ? "Still searching for more pharmacies..."
                : "Waiting for pharmacy responses..."}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          </div>

          {/* Show expand option when less than 30 seconds remaining */}
          {timeRemaining <= 30 && timeRemaining > 0 && onExpandRadius && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExpandRadius}
              className="mt-4"
            >
              Expand search to 10km?
            </Button>
          )}

          {/* Cancel Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="gap-1 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
            Cancel Ping
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PingStatusView;
