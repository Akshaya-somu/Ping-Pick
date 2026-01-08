import { Activity, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PendingPingCardProps {
  medicine: string;
  status: "pending" | "waiting";
  urgency: "normal" | "emergency";
  radius?: string;
}

const PendingPingCard = ({ medicine, status, urgency, radius = "3 km" }: PendingPingCardProps) => {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4 transition-all duration-300",
        urgency === "emergency" && "border-emergency/40"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              urgency === "emergency" ? "bg-emergency-soft" : "bg-primary-soft"
            )}
          >
            <Activity
              className={cn(
                "w-5 h-5",
                urgency === "emergency" ? "text-emergency" : "text-primary"
              )}
            />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{medicine}</h3>
            <p className="text-sm text-muted-foreground">
              {status === "pending" ? "Waiting for responses..." : `@ ${radius} radius`}
            </p>
          </div>
        </div>
        <Badge variant={status === "pending" ? "outline" : urgency === "emergency" ? "emergency" : "normal"}>
          {status === "pending" ? "Pending" : urgency}
        </Badge>
      </div>
    </div>
  );
};

export default PendingPingCard;
