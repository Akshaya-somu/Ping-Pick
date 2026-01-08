import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: string;
  radius?: string;
  onConfirm: () => void;
}

const PingConfirmDialog = ({
  open,
  onOpenChange,
  medicine,
  radius = "3km",
  onConfirm,
}: PingConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ping Nearby Pharmacies</DialogTitle>
          <DialogDescription>
            Send a request to pharmacies within {radius} to check if they have "{medicine}" in stock.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onConfirm} className="gap-2">
            <Radio className="w-4 h-4" />
            Send Ping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PingConfirmDialog;
