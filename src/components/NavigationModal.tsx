import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NavigationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: {
    name: string;
    address: string;
    distance: string;
    phone?: string;
    reservationTime?: string;
  } | null;
}

const NavigationModal = ({
  open,
  onOpenChange,
  pharmacy,
}: NavigationModalProps) => {
  if (!pharmacy) return null;

  // Debug: Log pharmacy data to check phone field
  console.log("🔍 NavigationModal pharmacy data:", pharmacy);
  console.log("📞 Phone field:", pharmacy.phone);
  console.log("📞 Phone exists?:", !!pharmacy.phone);
  console.log("📞 Phone type:", typeof pharmacy.phone);

  const handleOpenGoogleMaps = () => {
    // Encode the address for Google Maps URL
    const encodedAddress = encodeURIComponent(pharmacy.address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

    // Check if geolocation is available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrlWithOrigin = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${encodedAddress}`;
          window.open(mapsUrlWithOrigin, "_blank");
          toast({
            title: "Navigation Started",
            description: `Directions to ${pharmacy.name}`,
          });
        },
        (error) => {
          // Fallback without origin if location denied
          console.error("Geolocation error:", error);
          window.open(mapsUrl, "_blank");
          toast({
            title: "Navigation Started",
            description: "Location access denied. Using destination only.",
            variant: "destructive",
          });
        }
      );
    } else {
      window.open(mapsUrl, "_blank");
    }
    onOpenChange(false);
  };

  const handleCall = () => {
    if (pharmacy.phone) {
      window.open(`tel:${pharmacy.phone}`, "_self");
      toast({
        title: "Calling Pharmacy",
        description: `Initiating call to ${pharmacy.name}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Navigate to Pharmacy
          </DialogTitle>
          <DialogDescription>
            Get directions to pick up your reserved medicine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pharmacy Info */}
          <div className="p-4 rounded-xl bg-muted/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {pharmacy.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {pharmacy.address}
                </p>
              </div>
              <Badge variant="secondary">{pharmacy.distance}</Badge>
            </div>

            {pharmacy.reservationTime && (
              <div className="flex items-center gap-2 text-sm text-reserved">
                <Clock className="w-4 h-4" />
                <span>Reservation expires in {pharmacy.reservationTime}</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-reserved-soft border border-reserved/20">
            <AlertCircle className="w-5 h-5 text-reserved shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-reserved">Important</p>
              <p className="text-muted-foreground">
                Please arrive before your reservation expires. The pharmacy may
                release the medicine after the time limit.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={handleOpenGoogleMaps} className="w-full gap-2">
              <ExternalLink className="w-4 h-4" />
              Open in Google Maps
            </Button>

            <Button
              variant="outline"
              onClick={handleCall}
              className="w-full gap-2"
              disabled={!pharmacy.phone}
            >
              <Phone className="w-4 h-4" />
              Call Pharmacy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationModal;
