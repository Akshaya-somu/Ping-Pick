import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Shield,
  Users,
  Store,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Eye,
  Ban,
  Settings,
  LogOut,
  Bell,
  Search,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsSheet from "@/components/SettingsSheet";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { db, auth } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";

const ADMIN_EMAIL = "admin@pingpick.com";

// Helper function to format time ago
const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Mock data for users
const mockUsers = [
  {
    id: "u1",
    name: "Rahul Sharma",
    email: "rahul@example.com",
    noShowCount: 0,
    totalReservations: 12,
    status: "active",
  },
  {
    id: "u2",
    name: "Priya Patel",
    email: "priya@example.com",
    noShowCount: 3,
    totalReservations: 8,
    status: "active",
  },
  {
    id: "u3",
    name: "Amit Kumar",
    email: "amit@example.com",
    noShowCount: 5,
    totalReservations: 15,
    status: "restricted",
  },
  {
    id: "u4",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    noShowCount: 1,
    totalReservations: 20,
    status: "active",
  },
];

// Mock data for pharmacies
const mockPharmacies = [
  {
    id: "p1",
    name: "HealthFirst Pharmacy",
    email: "health@example.com",
    responseRate: 95,
    reservations: 45,
    status: "verified",
  },
  {
    id: "p2",
    name: "MedCare Plus",
    email: "medcare@example.com",
    responseRate: 88,
    reservations: 32,
    status: "verified",
  },
  {
    id: "p3",
    name: "Community Drugs",
    email: "community@example.com",
    responseRate: 45,
    reservations: 10,
    status: "pending",
  },
  {
    id: "p4",
    name: "QuickMeds",
    email: "quick@example.com",
    responseRate: 20,
    reservations: 5,
    status: "warned",
  },
];

// Mock ping requests data
const mockPingRequests = [
  {
    id: "ping1",
    medicine: "Amoxicillin 500mg",
    user: "Rahul S.",
    pharmacy: "HealthFirst",
    status: "completed",
    timestamp: "2 min ago",
  },
  {
    id: "ping2",
    medicine: "Insulin",
    user: "Priya P.",
    pharmacy: "-",
    status: "pending",
    timestamp: "5 min ago",
  },
  {
    id: "ping3",
    medicine: "Paracetamol 500mg",
    user: "Amit K.",
    pharmacy: "MedCare Plus",
    status: "completed",
    timestamp: "10 min ago",
  },
  {
    id: "ping4",
    medicine: "Cetrizine 10mg",
    user: "Sneha R.",
    pharmacy: "Community Drugs",
    status: "no-show",
    timestamp: "15 min ago",
  },
];

// Stats
const stats = [
  { label: "Total Users", value: "1,247", icon: Users, color: "text-primary" },
  { label: "Pharmacies", value: "89", icon: Store, color: "text-success" },
  { label: "Today's Pings", value: "156", icon: Bell, color: "text-reserved" },
  {
    label: "Success Rate",
    value: "87%",
    icon: TrendingUp,
    color: "text-primary",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [pingRequests, setPingRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    if (auth.currentUser?.email !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [navigate]);

  // Stats
  const [stats, setStats] = useState([
    { label: "Total Users", value: "0", icon: Users, color: "text-primary" },
    { label: "Pharmacies", value: "0", icon: Store, color: "text-success" },
    { label: "Today's Pings", value: "0", icon: Bell, color: "text-reserved" },
    {
      label: "Success Rate",
      value: "0%",
      icon: TrendingUp,
      color: "text-primary",
    },
  ]);

  // Load all data from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Users
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "user")
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status: doc.data().restricted ? "restricted" : "active",
        }));
        setUsers(usersData);
        console.log("👥 Loaded users:", usersData.length);

        // Load Pharmacies
        const pharmaciesQuery = query(
          collection(db, "users"),
          where("role", "==", "pharmacy")
        );
        const pharmaciesSnapshot = await getDocs(pharmaciesQuery);
        const pharmaciesData = pharmaciesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status:
            doc.data().verified === false
              ? "pending"
              : doc.data().suspended
              ? "suspended"
              : "verified",
        }));
        setPharmacies(pharmaciesData);
        console.log("🏥 Loaded pharmacies:", pharmaciesData.length);

        // Load Recent Pings - avoid orderBy to prevent index requirement
        console.log("📡 Loading pings for admin...");
        const pingsQuery = query(collection(db, "pings"), limit(50));
        const pingsSnapshot = await getDocs(pingsQuery);

        console.log("📡 Total pings fetched:", pingsSnapshot.size);

        const pingsData = pingsSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const timestamp = data.createdAt?.toDate?.() || new Date();
            const timeAgo = getTimeAgo(timestamp);

            return {
              id: doc.id,
              medicine: data.medicineName || "Unknown",
              user: data.userId || "Unknown",
              pharmacy: data.pharmacyResponse?.pharmacyName || "-",
              status:
                data.status === "reserved-pending"
                  ? "completed"
                  : data.status === "completed"
                  ? "completed"
                  : data.status === "active"
                  ? "pending"
                  : data.status === "expired" || data.status === "no-show"
                  ? "no-show"
                  : "pending",
              timestamp: timeAgo,
              timestampRaw: data.createdAt,
              rawStatus: data.status,
            };
          })
          // Sort by timestamp in JavaScript
          .sort((a, b) => {
            const timeA = a.timestampRaw?.toMillis?.() || 0;
            const timeB = b.timestampRaw?.toMillis?.() || 0;
            return timeB - timeA;
          })
          .slice(0, 20);

        console.log("📡 Loaded pings:", pingsData.length);
        console.log("📡 Sample ping:", pingsData[0]);
        setPingRequests(pingsData);

        // Calculate stats
        const completedPings = pingsData.filter(
          (p) => p.status === "completed"
        ).length;
        const successRate =
          pingsData.length > 0
            ? Math.round((completedPings / pingsData.length) * 100)
            : 0;

        setStats([
          {
            label: "Total Users",
            value: usersData.length.toString(),
            icon: Users,
            color: "text-primary",
          },
          {
            label: "Pharmacies",
            value: pharmaciesData.length.toString(),
            icon: Store,
            color: "text-success",
          },
          {
            label: "Today's Pings",
            value: pingsData.length.toString(),
            icon: Bell,
            color: "text-reserved",
          },
          {
            label: "Success Rate",
            value: `${successRate}%`,
            icon: TrendingUp,
            color: "text-primary",
          },
        ]);
      } catch (error) {
        console.error("❌ Error loading admin data:", error);
        toast({
          title: "Error Loading Data",
          description: "Failed to load admin dashboard data.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    sessionStorage.clear();

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });

    navigate("/login");
  };

  const handleUserAction = async (
    userId: string,
    action: "restrict" | "unrestrict"
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        restricted: action === "restrict",
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: action === "restrict" ? "restricted" : "active",
                restricted: action === "restrict",
              }
            : u
        )
      );

      toast({
        title: action === "restrict" ? "User Restricted" : "User Unrestricted",
        description: `User has been ${
          action === "restrict" ? "temporarily restricted" : "unrestricted"
        }.`,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const handlePharmacyAction = async (
    pharmacyId: string,
    action: "verify" | "warn" | "suspend"
  ) => {
    try {
      const updates: any = {};
      if (action === "verify") updates.verified = true;
      if (action === "warn") updates.warned = true;
      if (action === "suspend") updates.suspended = true;

      await updateDoc(doc(db, "users", pharmacyId), updates);

      setPharmacies((prev) =>
        prev.map((p) =>
          p.id === pharmacyId
            ? {
                ...p,
                status:
                  action === "verify"
                    ? "verified"
                    : action === "warn"
                    ? "warned"
                    : "suspended",
                ...updates,
              }
            : p
        )
      );

      const messages = {
        verify: "Pharmacy has been verified.",
        warn: "Warning issued to pharmacy.",
        suspend: "Pharmacy has been suspended.",
      };

      toast({
        title: action.charAt(0).toUpperCase() + action.slice(1) + " Action",
        description: messages[action],
      });
    } catch (error) {
      console.error("Error updating pharmacy:", error);
      toast({
        title: "Error",
        description: "Failed to update pharmacy status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return <Badge variant="available">{status}</Badge>;
      case "restricted":
      case "suspended":
        return <Badge variant="destructive">{status}</Badge>;
      case "pending":
        return <Badge variant="secondary">{status}</Badge>;
      case "warned":
        return <Badge variant="emergency">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPingStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="available">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "no-show":
        return <Badge variant="destructive">No-Show</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
              <Badge className="ml-2 bg-purple-500/20 text-purple-600 border-purple-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </Link>
            <div className="flex items-center gap-2">
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
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search users, pharmacies, or pings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="w-full justify-start bg-card border border-border">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="gap-2">
              <Store className="w-4 h-4" />
              Pharmacies
            </TabsTrigger>
            <TabsTrigger value="pings" className="gap-2">
              <Bell className="w-4 h-4" />
              Ping Requests
            </TabsTrigger>
            <TabsTrigger value="no-shows" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              No-Shows
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4">User Accounts</h3>
              <div className="space-y-3">
                {users
                  .filter(
                    (u) =>
                      u.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {user.noShowCount} no-shows /{" "}
                            {user.totalReservations} reservations
                          </p>
                          {user.noShowCount >= 3 && (
                            <p className="text-emergency text-xs">
                              High no-show rate
                            </p>
                          )}
                        </div>
                        {getStatusBadge(user.status)}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toast({
                                title: "View Profile",
                                description: "Profile details would open here.",
                              })
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUserAction(user.id, "restrict")
                              }
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUserAction(user.id, "unrestrict")
                              }
                              className="text-muted-foreground hover:text-success"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Pharmacies Tab */}
          <TabsContent value="pharmacies" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4">Pharmacy Accounts</h3>
              <div className="space-y-3">
                {pharmacies
                  .filter(
                    (p) =>
                      p.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      p.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((pharmacy) => (
                    <div
                      key={pharmacy.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success-soft flex items-center justify-center">
                          <Store className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {pharmacy.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pharmacy.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {pharmacy.responseRate}% response rate
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {pharmacy.reservations} reservations
                          </p>
                        </div>
                        {getStatusBadge(pharmacy.status)}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              toast({
                                title: "View Profile",
                                description:
                                  "Pharmacy details would open here.",
                              })
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {pharmacy.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handlePharmacyAction(pharmacy.id, "verify")
                              }
                              className="text-muted-foreground hover:text-success"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {pharmacy.status !== "suspended" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handlePharmacyAction(pharmacy.id, "warn")
                                }
                                className="text-muted-foreground hover:text-emergency"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handlePharmacyAction(pharmacy.id, "suspend")
                                }
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Ban className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Ping Requests Tab */}
          <TabsContent value="pings" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4">
                Recent Ping Requests
              </h3>
              <div className="space-y-3">
                {pingRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No ping requests found</p>
                  </div>
                ) : (
                  pingRequests.map((ping) => (
                    <div
                      key={ping.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                          <Bell className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {ping.medicine}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            By {ping.user} • {ping.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            Pharmacy: {ping.pharmacy}
                          </p>
                        </div>
                        {getPingStatusBadge(ping.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* No-Shows Tab */}
          <TabsContent value="no-shows" className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-xl p-4"
            >
              <h3 className="text-lg font-semibold mb-4">No-Show Reports</h3>
              <div className="space-y-3">
                {pingRequests.filter((p) => p.status === "no-show").length ===
                0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No no-show reports found</p>
                  </div>
                ) : (
                  pingRequests
                    .filter((p) => p.status === "no-show")
                    .map((ping) => (
                      <div
                        key={ping.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emergency/10 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-emergency" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {ping.medicine}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              User: {ping.user} • {ping.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Pharmacy: {ping.pharmacy}
                            </p>
                            <Badge variant="destructive">No-Show</Badge>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Sheet */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userType="pharmacy"
      />
    </div>
  );
};

export default AdminDashboard;
