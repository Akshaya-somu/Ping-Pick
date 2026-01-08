import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Bell,
  Settings,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  LogOut,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PingRequestCard from "@/components/PingRequestCard";
import SettingsSheet from "@/components/SettingsSheet";
import ActiveReservationsSheet from "@/components/ActiveReservationsSheet";
import AnalyticsSheet from "@/components/AnalyticsSheet";
import NoShowReportsSheet from "@/components/NoShowReportsSheet";
import InventorySheet from "@/components/InventorySheet";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { listenToActivePings } from "@/lib/pharmacyPings";
import { auth, db } from "@/firebase";
import { respondToPing } from "@/lib/respondToPing";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// Default inventory
const defaultInventory: InventoryItem[] = [
  { id: "1", name: "Paracetamol 500mg", quantity: 50, price: 45 },
  { id: "2", name: "Cetrizine 10mg", quantity: 30, price: 25 },
  { id: "3", name: "Omeprazole 20mg", quantity: 40, price: 65 },
];

const stats = [
  { label: "Today's Pings", value: "12", icon: Bell },
  { label: "Responses", value: "8", icon: CheckCircle2 },
  { label: "Reservations", value: "5", icon: Clock },
  { label: "Success Rate", value: "92%", icon: TrendingUp },
];

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [pingRequests, setPingRequests] = useState<any[]>([]);

  // Authentication guard
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  // Pharmacy profile - dynamic based on user, can be customized via settings
  const [pharmacyProfile, setPharmacyProfile] = useState({
    name: "", // Will be set from user email or Firestore
    address: "",
    phone: "",
  });

  // Load pharmacy profile from Firestore
  useEffect(() => {
    const loadPharmacyProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("📄 Loaded user data from Firestore:", userData);

          // Set profile from Firestore data
          setPharmacyProfile({
            name: userData.pharmacyName || userData.name || "My Pharmacy",
            address: userData.address || "Not provided",
            phone: userData.phone || "+91 98765 43210",
          });

          console.log("🏥 Pharmacy profile loaded:", {
            name: userData.pharmacyName || userData.name,
            address: userData.address,
            phone: userData.phone,
          });
        } else {
          // Fallback to email-based default if no Firestore doc
          const emailUsername =
            auth.currentUser.email?.split("@")[0] || "Pharmacy";
          const defaultName = `${
            emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)
          } Pharmacy`;

          setPharmacyProfile({
            name: defaultName,
            address: `${emailUsername} Location, City`,
            phone: "+91 98765 43210",
          });

          console.log("⚠️ No Firestore data, using defaults:", defaultName);
        }
      } catch (error) {
        console.error("❌ Error loading pharmacy profile:", error);
      }
    };

    loadPharmacyProfile();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const startListener = () => {
      unsubscribe = listenToActivePings((pings) => {
        setPingRequests(
          pings.map((ping: any) => ({
            id: ping.id,
            medicine: ping.medicineName,
            distance: `${ping.radiusKm} km`,
            urgency: ping.urgency,
            timestamp: "Just now",
            userId: ping.userId, // Store userId for creating alerts
          }))
        );
      });
    };

    if (auth.currentUser) {
      startListener();
    } else {
      const unsubAuth = auth.onAuthStateChanged((user) => {
        if (user) {
          startListener();
          unsubAuth();
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [isOnline, setIsOnline] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultInventory);

  // Sheet states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reservationsOpen, setReservationsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [noShowsOpen, setNoShowsOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const handleLogout = () => {
    // Clear any stored session/token
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    sessionStorage.clear();

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

    navigate("/login");
  };

  const handleRespond = async (
    pingId: string,
    available: boolean,
    duration?: number
  ) => {
    if (!auth.currentUser) return;

    // Find the ping to get userId and medicine name
    const ping = pingRequests.find((p) => p.id === pingId);

    // If pharmacy says NOT available → just remove from UI
    if (!available) {
      setPingRequests((prev) => prev.filter((p) => p.id !== pingId));

      toast({
        title: "Response Sent",
        description: "Customer will see other pharmacies.",
      });
      return;
    }

    // Available but no duration selected → stop
    if (!duration) return;

    console.log("🏥 Pharmacy responding with:", {
      pingId,
      pharmacyProfile,
      duration,
      userId: ping?.userId,
      medicine: ping?.medicine,
    });

    try {
      await respondToPing(
        pingId,
        {
          pharmacyId: auth.currentUser.uid,
          pharmacyName: pharmacyProfile.name,
          distance: "1.2 km",
          price: "₹45",
          reservationMinutes: duration,
          address: pharmacyProfile.address,
          phone: pharmacyProfile.phone,
        },
        ping?.userId || "",
        ping?.medicine || "Medicine"
      );

      setPingRequests((prev) => prev.filter((p) => p.id !== pingId));

      toast({
        title: "Availability Confirmed ✓",
        description: `Medicine reserved for ${duration} minutes.`,
      });
    } catch (err) {
      console.error("❌ FAILED TO RESPOND TO PING:", err);
      toast({
        title: "Failed to respond",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                <Radio className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Ping & Pick
              </span>
              <Badge variant="secondary" className="ml-2">
                Pharmacy
              </Badge>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant={isOnline ? "success" : "outline"}
                size="sm"
                onClick={() => setIsOnline(!isOnline)}
                className="gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-success-foreground" : "bg-muted-foreground"
                  }`}
                />
                {isOnline ? "Online" : "Offline"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* Incoming Pings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Incoming Pings
              </h2>
              <p className="text-sm text-muted-foreground">
                {pingRequests.length} requests waiting for response
              </p>
            </div>
            {pingRequests.some((p) => p.urgency === "emergency") && (
              <Badge variant="emergency" className="gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emergency"></span>
                </span>
                Emergency
              </Badge>
            )}
          </div>

          {pingRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pingRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <PingRequestCard {...request} onRespond={handleRespond} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 glass-card rounded-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-soft flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                All caught up!
              </h3>
              <p className="text-muted-foreground">
                No pending requests at the moment. New pings will appear here.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* Inventory Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Inventory
              </h3>
              <p className="text-sm text-muted-foreground">
                {inventory.length} medicines in stock
              </p>
            </div>
            <Button
              variant="hero"
              onClick={() => setInventoryOpen(true)}
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Manage Inventory
            </Button>
          </div>

          {inventory.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {inventory.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} • ₹{item.price}
                    </p>
                  </div>
                  <Badge variant="available" className="text-xs">
                    In Stock
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No medicines in inventory</p>
            </div>
          )}
          {inventory.length > 6 && (
            <Button
              variant="link"
              className="mt-2 text-primary"
              onClick={() => setInventoryOpen(true)}
            >
              View all {inventory.length} items
            </Button>
          )}
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setReservationsOpen(true)}
            >
              <Clock className="w-5 h-5" />
              <span className="text-sm">Active Reservations</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setAnalyticsOpen(true)}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setNoShowsOpen(true)}
            >
              <XCircle className="w-5 h-5" />
              <span className="text-sm">No-Show Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </motion.section>
      </main>

      {/* Sheets */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userType="pharmacy"
        initialProfile={{
          name: pharmacyProfile.name,
          phone: pharmacyProfile.phone,
          address: pharmacyProfile.address,
        }}
        onProfileUpdate={async (updatedProfile) => {
          // Update local state
          setPharmacyProfile({
            name: updatedProfile.name,
            phone: updatedProfile.phone,
            address: updatedProfile.address || "",
          });

          // Save to Firestore
          if (auth.currentUser) {
            try {
              await setDoc(
                doc(db, "users", auth.currentUser.uid),
                {
                  pharmacyName: updatedProfile.name,
                  name: updatedProfile.name,
                  phone: updatedProfile.phone,
                  address: updatedProfile.address,
                },
                { merge: true }
              );
              console.log("✅ Pharmacy profile saved to Firestore");
            } catch (error) {
              console.error("❌ Error saving profile to Firestore:", error);
            }
          }
        }}
      />
      <ActiveReservationsSheet
        open={reservationsOpen}
        onOpenChange={setReservationsOpen}
      />
      <AnalyticsSheet open={analyticsOpen} onOpenChange={setAnalyticsOpen} />
      <NoShowReportsSheet open={noShowsOpen} onOpenChange={setNoShowsOpen} />
      <InventorySheet
        open={inventoryOpen}
        onOpenChange={setInventoryOpen}
        inventory={inventory}
        onInventoryChange={setInventory}
      />
    </div>
  );
};

export default PharmacyDashboard;
