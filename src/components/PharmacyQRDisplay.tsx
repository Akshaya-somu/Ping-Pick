import { useState, useEffect } from "react";
import { QrCode, CheckCircle2, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PharmacyQRDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  customerName?: string;
  medicine: string;
  onConfirmPickup: () => void;
}

const PharmacyQRDisplay = ({
  open,
  onOpenChange,
  reservationId,
  customerName = "Customer",
  medicine,
  onConfirmPickup,
}: PharmacyQRDisplayProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsConfirmed(false);
    }
  }, [open]);

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      onConfirmPickup();
    }, 1500);
  };

  // Generate a simple QR-like pattern (mock)
  const generateQRPattern = () => {
    const pattern = [];
    for (let i = 0; i < 7; i++) {
      const row = [];
      for (let j = 0; j < 7; j++) {
        // Create a pattern that looks like QR code
        const isCorner = 
          (i < 2 && j < 2) || 
          (i < 2 && j > 4) || 
          (i > 4 && j < 2);
        const isData = Math.random() > 0.5;
        row.push(isCorner || isData);
      }
      pattern.push(row);
    }
    return pattern;
  };

  const qrPattern = generateQRPattern();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Customer Pickup QR
          </DialogTitle>
          <DialogDescription>
            Show this QR code to the customer to confirm their pickup
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {isConfirmed ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-12 h-12 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Pickup Confirmed!
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Reservation completed successfully
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* QR Code Display */}
              <div className="bg-white p-4 rounded-xl mb-4">
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {qrPattern.map((row, i) =>
                    row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`w-6 h-6 ${cell ? 'bg-black' : 'bg-white'}`}
                      />
                    ))
                  )}
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Reservation ID: {reservationId}
              </p>

              {/* Customer Info */}
              <div className="w-full glass-card rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{customerName}</p>
                    <p className="text-xs text-muted-foreground">Waiting for pickup</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Medicine:</span>
                  <span className="font-medium">{medicine}</span>
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full gap-2"
                onClick={handleConfirm}
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm Customer Pickup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyQRDisplay;
