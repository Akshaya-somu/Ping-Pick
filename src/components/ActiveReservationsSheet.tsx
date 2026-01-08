import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, MapPin, User, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import PharmacyQRDisplay from "@/components/PharmacyQRDisplay";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

interface Reservation {
  id: string;
  customerName: string;
  medicine: string;
  quantity: string;
  timeRemaining: string;
  distance: string;
  status: "active" | "completed" | "expired";
  reservationMinutes?: number;
  respondedAt?: Date;
}

interface ActiveReservationsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ActiveReservationsSheet = ({
  open,
  onOpenChange,
}: ActiveReservationsSheetProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Load active reservations from Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      console.log("⚠️ No auth user for reservations");
      return;
    }

    console.log(
      "🔍 Starting reservations listener for pharmacy:",
      auth.currentUser.uid
    );

    // Get all pings and filter in JavaScript to avoid composite index
    const reservationsQuery = query(
      collection(db, "pings"),
      where("status", "==", "reserved-pending")
    );

    const unsubscribe = onSnapshot(
      reservationsQuery,
      (snapshot) => {
        console.log(
          "📦 Reservations snapshot received, total docs:",
          snapshot.size
        );

        const loadedReservations: Reservation[] = [];
        const now = new Date();

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Filter for this pharmacy's responses
          if (data.pharmacyResponse?.pharmacyId !== auth.currentUser?.uid) {
            console.log("⏭️ Skipping ping - different pharmacy:", doc.id);
            return;
          }

          console.log("✅ Found reservation:", doc.id, data);

          const respondedAt =
            data.pharmacyResponse?.respondedAt instanceof Timestamp
              ? data.pharmacyResponse.respondedAt.toDate()
              : new Date();
          const reservationMinutes =
            data.pharmacyResponse?.reservationMinutes || 30;
          const expiresAt = new Date(
            respondedAt.getTime() + reservationMinutes * 60000
          );
          const timeLeft = Math.max(
            0,
            Math.floor((expiresAt.getTime() - now.getTime()) / 60000)
          );

          loadedReservations.push({
            id: doc.id,
            customerName: "Anonymous User",
            medicine: data.medicineName || "Medicine",
            quantity: "1 strip",
            timeRemaining: `${timeLeft} min`,
            distance: data.pharmacyResponse?.distance || "-- km",
            status: timeLeft > 0 ? "active" : "expired",
            reservationMinutes,
            respondedAt,
          });
        });

        console.log("📋 Loaded reservations count:", loadedReservations.length);
        setReservations(loadedReservations);
      },
      (error) => {
        console.error("❌ Reservations listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setReservations((prev) =>
        prev.map((reservation) => {
          if (!reservation.respondedAt || !reservation.reservationMinutes)
            return reservation;

          const now = new Date();
          const expiresAt = new Date(
            reservation.respondedAt.getTime() +
              reservation.reservationMinutes * 60000
          );
          const timeLeft = Math.max(
            0,
            Math.floor((expiresAt.getTime() - now.getTime()) / 60000)
          );

          return {
            ...reservation,
            timeRemaining: `${timeLeft} min`,
            status: timeLeft > 0 ? ("active" as const) : ("expired" as const),
          };
        })
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const handleShowQR = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setQrOpen(true);
  };

  const handleComplete = async (id: string) => {
    try {
      // Update ping status in Firestore
      await updateDoc(doc(db, "pings", id), {
        status: "completed",
      });

      setQrOpen(false);
      setSelectedReservation(null);
      toast({
        title: "Pickup Complete! 🎉",
        description: "Customer has picked up the medicine successfully.",
      });
    } catch (error) {
      console.error("Error completing pickup:", error);
      toast({
        title: "Error",
        description: "Failed to complete pickup. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeCount = reservations.filter((r) => r.status === "active").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Reservations
            {activeCount > 0 && (
              <Badge variant="reserved" className="ml-2">
                {activeCount} active
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Medicines currently reserved by customers
          </SheetDescription>
        </SheetHeader>

        {reservations.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-150px)] mt-4">
            <div className="space-y-3 pr-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`p-4 rounded-xl border ${
                    reservation.status === "active"
                      ? "bg-card border-reserved/30"
                      : "bg-muted/30 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {reservation.medicine}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {reservation.quantity}
                      </p>
                    </div>
                    <Badge
                      variant={
                        reservation.status === "active"
                          ? "reserved"
                          : reservation.status === "completed"
                          ? "available"
                          : "secondary"
                      }
                    >
                      {reservation.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {reservation.customerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {reservation.distance}
                    </span>
                  </div>

                  {reservation.status === "active" && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-reserved">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Expires in {reservation.timeRemaining}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="hero"
                        onClick={() => handleShowQR(reservation)}
                        className="gap-1"
                      >
                        <QrCode className="w-4 h-4" />
                        Show QR
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              No active reservations
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Customer reservations will appear here
            </p>
          </div>
        )}

        {/* QR Display Dialog */}
        {selectedReservation && (
          <PharmacyQRDisplay
            open={qrOpen}
            onOpenChange={setQrOpen}
            reservationId={selectedReservation.id}
            customerName={selectedReservation.customerName}
            medicine={selectedReservation.medicine}
            onConfirmPickup={() => handleComplete(selectedReservation.id)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ActiveReservationsSheet;
