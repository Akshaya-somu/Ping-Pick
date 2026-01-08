import { useState } from "react";
import { QrCode, Camera, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface QRScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacyName: string;
  medicine: string;
  onScanComplete: () => void;
}

const QRScanDialog = ({
  open,
  onOpenChange,
  pharmacyName,
  medicine,
  onScanComplete,
}: QRScanDialogProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSimulateScan = async () => {
    setIsScanning(true);
    // Simulate QR scanning
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsScanning(false);
    setIsSuccess(true);
    
    // Wait and then complete
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onScanComplete();
    setIsSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scan QR to Complete Pickup
          </DialogTitle>
          <DialogDescription>
            Scan the QR code at {pharmacyName} to confirm your pickup
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Pickup Confirmed!
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  Your reservation for {medicine} is complete
                </p>
              </motion.div>
            ) : isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="relative w-48 h-48 border-2 border-primary rounded-lg flex items-center justify-center mb-4">
                  <motion.div
                    className="absolute inset-0 border-2 border-primary rounded-lg"
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                  <Camera className="w-16 h-16 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scanning QR code...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-4"
              >
                <div className="w-48 h-48 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center mb-4 bg-muted/30">
                  <QrCode className="w-16 h-16 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Point your camera at the pharmacy's QR code
                  </p>
                </div>
                
                <div className="space-y-3 w-full">
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    onClick={handleSimulateScan}
                  >
                    <Camera className="w-5 h-5" />
                    Start Scanning
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    The pharmacy will show you a QR code when you arrive
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Medicine:</span>
            <span className="font-medium">{medicine}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Pharmacy:</span>
            <span className="font-medium">{pharmacyName}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanDialog;
