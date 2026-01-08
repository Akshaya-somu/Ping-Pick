import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { XCircle, Calendar, Clock, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

interface NoShowReport {
  id: string;
  medicine: string;
  reservedAt: string;
  expiredAt: string;
  duration: string;
}

interface NoShowReportsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NoShowReportsSheet = ({
  open,
  onOpenChange,
}: NoShowReportsSheetProps) => {
  const [reports, setReports] = useState<NoShowReport[]>([]);

  useEffect(() => {
    const loadNoShowReports = async () => {
      if (!auth.currentUser) {
        console.log("⚠️ No auth user for no-show reports");
        return;
      }

      try {
        console.log(
          "📊 Loading no-show reports for pharmacy:",
          auth.currentUser.uid
        );

        // Get all pings
        const allPingsQuery = query(collection(db, "pings"));
        const allPingsSnapshot = await getDocs(allPingsQuery);

        console.log("📦 Total pings in database:", allPingsSnapshot.size);

        // Filter for expired pings where this pharmacy responded
        const noShowPings = allPingsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((ping: any) => {
            const isExpired = ping.status === "expired";
            const isThisPharmacy =
              ping.pharmacyResponse?.pharmacyId === auth.currentUser!.uid;

            if (isExpired && isThisPharmacy) {
              console.log("❌ Found no-show:", ping.id, ping.medicineName);
            }

            return isExpired && isThisPharmacy;
          });

        console.log("📋 No-show pings found:", noShowPings.length);

        const loadedReports: NoShowReport[] = noShowPings.map((ping: any) => {
          const respondedAt =
            ping.pharmacyResponse?.respondedAt instanceof Timestamp
              ? ping.pharmacyResponse.respondedAt.toDate()
              : new Date();
          const reservationMinutes =
            ping.pharmacyResponse?.reservationMinutes || 30;
          const expiredAt = new Date(
            respondedAt.getTime() + reservationMinutes * 60000
          );

          return {
            id: ping.id,
            medicine: ping.medicineName || "Medicine",
            reservedAt: respondedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            expiredAt: expiredAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
            duration: `${reservationMinutes} min`,
          };
        });

        console.log("✅ No-show reports loaded:", loadedReports.length);
        setReports(loadedReports);
      } catch (error) {
        console.error("❌ Error loading no-show reports:", error);
      }
    };

    if (open) {
      loadNoShowReports();
    }
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            No-Show Reports
            <Badge variant="secondary" className="ml-2">
              {reports.length} this week
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Reservations where customers didn't arrive
          </SheetDescription>
        </SheetHeader>

        {reports.length > 0 ? (
          <>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-reserved-soft border border-reserved/20 mt-4">
              <AlertTriangle className="w-5 h-5 text-reserved shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-reserved">Impact on Users</p>
                <p className="text-muted-foreground">
                  Users with repeated no-shows may be temporarily restricted
                  from making reservations.
                </p>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)] mt-4">
              <div className="space-y-3 pr-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-foreground">
                        {report.medicine}
                      </h4>
                      <Badge variant="destructive">No-Show</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Reserved: {report.reservedAt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Duration: {report.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="w-4 h-4" />
                        <span>Expired: {report.expiredAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-success" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              No reports this week
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              All customers arrived for their reservations
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NoShowReportsSheet;
