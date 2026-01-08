import { useState } from "react";
import {
  Pill,
  MapPin,
  Clock,
  AlertTriangle,
  Check,
  X,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PingRequestCardProps {
  id: string;
  medicine: string;
  distance: string;
  urgency: "normal" | "emergency";
  timestamp: string;
  onRespond: (id: string, available: boolean, duration?: number) => void;
}

const reservationDurations = [10, 20, 30, 45, 60];

const PingRequestCard = ({
  id,
  medicine,
  distance,
  urgency,
  timestamp,
  onRespond,
}: PingRequestCardProps) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAvailable = () => {
    setShowDurationPicker(true);
  };

  const handleConfirmDuration = () => {
    if (submitting) return;

    setSubmitting(true);
    onRespond(id, true, selectedDuration);
  };

  const handleNotAvailable = () => {
    if (submitting) return;

    setSubmitting(true);
    onRespond(id, false);
  };

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 animate-fade-in",
        urgency === "emergency" &&
          "border-emergency/40 emergency-glow ping-pulse"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              urgency === "emergency" ? "bg-emergency-soft" : "bg-primary-soft"
            )}
          >
            <Pill
              className={cn(
                "w-6 h-6",
                urgency === "emergency" ? "text-emergency" : "text-primary"
              )}
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg">{medicine}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{distance} away</span>
            </div>
          </div>
        </div>

        <Badge variant={urgency === "emergency" ? "emergency" : "normal"}>
          {urgency === "emergency" && (
            <AlertTriangle className="w-3 h-3 mr-1" />
          )}
          {urgency}
        </Badge>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Clock className="w-4 h-4" />
        <span>Requested {timestamp}</span>
      </div>

      {/* Actions */}
      {showDurationPicker ? (
        <div className="space-y-3 animate-fade-in">
          <p className="text-sm font-medium">Select reservation duration</p>

          <div className="flex flex-wrap gap-2">
            {reservationDurations.map((duration) => (
              <Button
                key={duration}
                variant={selectedDuration === duration ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDuration(duration)}
                className="gap-1"
                disabled={submitting}
              >
                <Timer className="w-3.5 h-3.5" />
                {duration} min
              </Button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleConfirmDuration}
              variant="success"
              disabled={submitting}
              className="flex-1 gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm Available
            </Button>

            <Button
              onClick={() => setShowDurationPicker(false)}
              variant="outline"
              disabled={submitting}
            >
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            onClick={handleAvailable}
            variant="success"
            className="flex-1 gap-2"
            disabled={submitting}
          >
            <Check className="w-4 h-4" />
            Available
          </Button>

          <Button
            onClick={handleNotAvailable}
            variant="outline"
            className="flex-1 gap-2"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
            Not Available
          </Button>
        </div>
      )}
    </div>
  );
};

export default PingRequestCard;
