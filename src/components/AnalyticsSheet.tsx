import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

interface AnalyticsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StatData {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: any;
}

const AnalyticsSheet = ({ open, onOpenChange }: AnalyticsSheetProps) => {
  const [stats, setStats] = useState<StatData[]>([
    {
      label: "Total Pings Received",
      value: "0",
      change: "--",
      trend: "up",
      icon: Users,
    },
    {
      label: "Response Rate",
      value: "0%",
      change: "--",
      trend: "up",
      icon: CheckCircle2,
    },
    {
      label: "Avg. Response Time",
      value: "-- min",
      change: "--",
      trend: "up",
      icon: Clock,
    },
    {
      label: "Successful Pickups",
      value: "0%",
      change: "--",
      trend: "up",
      icon: TrendingUp,
    },
    {
      label: "No-Show Rate",
      value: "0%",
      change: "--",
      trend: "up",
      icon: XCircle,
    },
  ]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!auth.currentUser) return;

      try {
        console.log("📊 Loading analytics for pharmacy:", auth.currentUser.uid);

        // Get all pings (not just ones with pharmacyResponse)
        const allPingsQuery = query(collection(db, "pings"));
        const allPingsSnapshot = await getDocs(allPingsQuery);

        console.log("📊 Total pings in database:", allPingsSnapshot.size);

        // Debug: Check what pharmacyResponse data looks like
        allPingsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.pharmacyResponse) {
            console.log("📊 Ping with response:", {
              pingId: doc.id,
              pharmacyId: data.pharmacyResponse.pharmacyId,
              pharmacyName: data.pharmacyResponse.pharmacyName,
              currentUserId: auth.currentUser!.uid,
              matches:
                data.pharmacyResponse.pharmacyId === auth.currentUser!.uid,
            });
          }
        });

        // Filter for pings that this pharmacy responded to
        const pings = allPingsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (ping: any) =>
              ping.pharmacyResponse?.pharmacyId === auth.currentUser!.uid
          );

        console.log("📊 Pings for this pharmacy:", pings.length);
        console.log("📊 Sample ping data:", pings[0]);

        // Calculate stats
        const totalPings = pings.length;
        const respondedPings = pings.filter(
          (p: any) => p.pharmacyResponse
        ).length;
        const completedPings = pings.filter(
          (p: any) => p.status === "completed"
        ).length;
        const expiredPings = pings.filter(
          (p: any) => p.status === "expired"
        ).length;

        console.log("📊 Stats:", {
          totalPings,
          respondedPings,
          completedPings,
          expiredPings,
        });

        // Calculate response times
        const responseTimes: number[] = [];
        pings.forEach((ping: any) => {
          if (ping.pharmacyResponse?.respondedAt && ping.createdAt) {
            const created =
              ping.createdAt instanceof Timestamp
                ? ping.createdAt.toDate()
                : new Date(ping.createdAt);
            const responded =
              ping.pharmacyResponse.respondedAt instanceof Timestamp
                ? ping.pharmacyResponse.respondedAt.toDate()
                : new Date(ping.pharmacyResponse.respondedAt);
            const diff = (responded.getTime() - created.getTime()) / 60000; // minutes
            if (diff > 0) responseTimes.push(diff);
          }
        });

        const avgResponseTime =
          responseTimes.length > 0
            ? (
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
              ).toFixed(1)
            : "0";

        const responseRate =
          totalPings > 0 ? Math.round((respondedPings / totalPings) * 100) : 0;
        const successRate =
          respondedPings > 0
            ? Math.round((completedPings / respondedPings) * 100)
            : 0;
        const noShowRate =
          respondedPings > 0
            ? Math.round((expiredPings / respondedPings) * 100)
            : 0;

        console.log("📊 Final stats:", {
          responseRate,
          successRate,
          noShowRate,
          avgResponseTime,
        });

        setStats([
          {
            label: "Total Pings Received",
            value: totalPings.toString(),
            change: "--",
            trend: "up",
            icon: Users,
          },
          {
            label: "Response Rate",
            value: `${responseRate}%`,
            change: "--",
            trend: responseRate >= 80 ? "up" : "down",
            icon: CheckCircle2,
          },
          {
            label: "Avg. Response Time",
            value: `${avgResponseTime} min`,
            change: "--",
            trend: "up",
            icon: Clock,
          },
          {
            label: "Successful Pickups",
            value: `${successRate}%`,
            change: "--",
            trend: successRate >= 70 ? "up" : "down",
            icon: TrendingUp,
          },
          {
            label: "No-Show Rate",
            value: `${noShowRate}%`,
            change: "--",
            trend: noShowRate <= 10 ? "up" : "down",
            icon: XCircle,
          },
        ]);
      } catch (error) {
        console.error("❌ Error loading analytics:", error);
      }
    };

    if (open) {
      loadAnalytics();
    }
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Analytics
          </SheetTitle>
          <SheetDescription>
            Your pharmacy performance this month
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === "up" ? "text-success" : "text-destructive"
                }`}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-primary-soft border border-primary/20">
          <h4 className="font-medium text-primary mb-1">Great Performance!</h4>
          <p className="text-sm text-muted-foreground">
            Your response rate is above average. Keep up the good work to
            maintain your trusted pharmacy status.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AnalyticsSheet;
