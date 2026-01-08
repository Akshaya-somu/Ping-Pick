import { useState } from "react";
import { Radio, Clock, Target, MessageSquare, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PingSettings {
  reservationTime: number;
  radius: number;
  situation: string;
  searchTime: number;
}

interface CustomPingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: string;
  isEmergency: boolean;
  onConfirm: (settings: PingSettings) => void;
}

const CustomPingDialog = ({
  open,
  onOpenChange,
  medicine,
  isEmergency,
  onConfirm,
}: CustomPingDialogProps) => {
  const [reservationTime, setReservationTime] = useState(30);
  const [radius, setRadius] = useState(3);
  const [situation, setSituation] = useState("");
  const [searchTime, setSearchTime] = useState(2);

  const handleConfirm = () => {
    onConfirm({
      reservationTime,
      radius,
      situation,
      searchTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Customize Your Ping
          </DialogTitle>
          <DialogDescription>
            Configure your ping request for "{medicine}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Search Time (Wait for responses) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              Wait Time for Responses
            </Label>
            <Select
              value={searchTime.toString()}
              onValueChange={(val) => setSearchTime(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select wait time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="2">2 minutes</SelectItem>
                <SelectItem value="3">3 minutes</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long to wait for pharmacies to respond to your ping
            </p>
          </div>

          {/* Reservation Time */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Reservation Duration
            </Label>
            <Select
              value={reservationTime.toString()}
              onValueChange={(val) => setReservationTime(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long the pharmacy should hold the medicine for you
            </p>
          </div>

          {/* Radius Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Search Radius: {radius} km
            </Label>
            <Slider
              value={[radius]}
              onValueChange={([val]) => setRadius(val)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 km</span>
              <span>10 km</span>
            </div>
          </div>

          {/* Situation (Optional) */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Situation (Optional)
            </Label>
            <Textarea
              placeholder="e.g., Urgent for elderly patient, needed for child fever, etc."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Help pharmacies prioritize based on your situation
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant={isEmergency ? "emergency" : "hero"} 
            onClick={handleConfirm} 
            className="gap-2"
          >
            <Radio className="w-4 h-4" />
            Send Ping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomPingDialog;
