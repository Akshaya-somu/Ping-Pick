import { MapPin, Clock, Pill, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PharmacyCardProps {
  name: string;
  distance: string;
  address: string;
  availability: "available" | "reserved" | "expired";
  medicine: string;
  price?: string;
  reservationTime?: string;
  isEmergency?: boolean;
  onReserve?: () => void;
  onNavigate?: () => void;
  onCancel?: () => void;
}

const PharmacyCard = ({
  name,
  distance,
  address,
  availability,
  medicine,
  price,
  reservationTime,
  isEmergency,
  onReserve,
  onNavigate,
  onCancel,
}: PharmacyCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-xl animate-fade-in",
        isEmergency && "border-emergency/30 emergency-glow"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-foreground">{name}</h3>
            {isEmergency && (
              <AlertTriangle className="w-4 h-4 text-emergency animate-pulse" />
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>{distance} away</span>
          </div>
        </div>
        <Badge variant={availability}>{availability}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Pill className="w-4 h-4 text-primary" />
          <span className="font-medium">{medicine}</span>
          {price && (
            <span className="ml-auto text-foreground font-semibold">{price}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{address}</p>
        {reservationTime && availability === "reserved" && (
          <div className="flex items-center gap-2 text-sm text-reserved">
            <Clock className="w-4 h-4" />
            <span>Reserved for {reservationTime}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {availability === "available" && (
          <Button onClick={onReserve} variant="default" className="flex-1">
            Reserve
          </Button>
        )}
        {availability === "reserved" && (
          <>
            <Button onClick={onNavigate} variant="success" className="flex-1">
              Navigate
            </Button>
            <Button onClick={onCancel} variant="outline" size="default">
              Cancel
            </Button>
          </>
        )}
        {availability === "expired" && (
          <Button disabled variant="secondary" className="flex-1">
            Expired
          </Button>
        )}
      </div>
    </div>
  );
};

export default PharmacyCard;
