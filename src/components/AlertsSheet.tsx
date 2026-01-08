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
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Store,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

interface Alert {
  id: string;
  type: "response" | "reservation" | "emergency" | "expiry";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface AlertsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertsSheet = ({ open, onOpenChange }: AlertsSheetProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Load alerts from Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      console.log("⚠️ No auth user, alerts listener not started");
      return;
    }

    console.log("🔔 Starting alerts listener for user:", auth.currentUser.uid);

    const alertsQuery = query(
      collection(db, "alerts"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      alertsQuery,
      (snapshot) => {
        console.log("📬 Alerts snapshot received, count:", snapshot.size);

        const loadedAlerts: Alert[] = [];
        snapshot.forEach((doc) => {
          console.log("📄 Alert document:", doc.id, doc.data());
          loadedAlerts.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
          } as Alert);
        });

        // Sort by timestamp in JavaScript instead of Firestore
        loadedAlerts.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        console.log("✅ Loaded alerts:", loadedAlerts.length);
        setAlerts(loadedAlerts);
      },
      (error) => {
        console.error("❌ Alerts listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "response":
        return <Store className="w-4 h-4" />;
      case "reservation":
        return <CheckCircle2 className="w-4 h-4" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4" />;
      case "expiry":
        return <Clock className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: Alert["type"]) => {
    switch (type) {
      case "response":
        return "bg-primary/10 text-primary";
      case "reservation":
        return "bg-success/10 text-success";
      case "emergency":
        return "bg-emergency/10 text-emergency";
      case "expiry":
        return "bg-reserved/10 text-reserved";
    }
  };

  const markAllRead = async () => {
    if (!auth.currentUser) return;

    const batch = writeBatch(db);
    alerts.forEach((alert) => {
      if (!alert.read) {
        const alertRef = doc(db, "alerts", alert.id);
        batch.update(alertRef, { read: true });
      }
    });
    await batch.commit();
  };

  const clearAll = async () => {
    if (!auth.currentUser) return;

    const batch = writeBatch(db);
    alerts.forEach((alert) => {
      const alertRef = doc(db, "alerts", alert.id);
      batch.delete(alertRef);
    });
    await batch.commit();
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alerts
              {unreadCount > 0 && (
                <Badge variant="emergency" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </SheetTitle>
          </div>
          <SheetDescription>
            Pharmacy responses and reservation updates
          </SheetDescription>
        </SheetHeader>

        {alerts.length > 0 ? (
          <>
            <div className="flex items-center justify-between py-4">
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3 pr-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      alert.read
                        ? "bg-muted/30 border-border"
                        : "bg-card border-primary/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getAlertColor(
                          alert.type
                        )}`}
                      >
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground">
                            {alert.title}
                          </h4>
                          {!alert.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {getTimeAgo(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">No alerts yet</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              You'll see pharmacy responses and reservation updates here
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default AlertsSheet;
