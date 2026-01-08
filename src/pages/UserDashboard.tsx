import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  MapPin,
  Bell,
  Navigation,
  Settings,
  LogOut,
  Search,
  QrCode,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MedicineSearch from "@/components/MedicineSearch";
import PharmacyCard from "@/components/PharmacyCard";
import PendingPingCard from "@/components/PendingPingCard";
import CustomPingDialog from "@/components/CustomPingDialog";
import PingStatusView, { PharmacyResponse } from "@/components/PingStatusView";
import SearchResultsView from "@/components/SearchResultsView";
import SettingsSheet from "@/components/SettingsSheet";
import AlertsSheet from "@/components/AlertsSheet";
import NavigationModal from "@/components/NavigationModal";
import QRScanDialog from "@/components/QRScanDialog";
import { searchMedicineInInventory } from "@/lib/mockData";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { createPing } from "@/lib/pings";
import { auth, db } from "@/firebase";
import { listenToUserPings } from "@/lib/userPings";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Pharmacy {
  id: string;
  name: string;
  distance: string;
  address: string;
  availability: "available" | "reserved" | "expired";
  medicine: string;
  price: string;
  reservationTime?: string;
  phone?: string;
}

interface PendingPing {
  id: string;
  medicine: string;
  urgency: "normal" | "emergency";
  status: "pending" | "waiting";
  radius: string;
  reservationTime?: number;
  situation?: string;
  searchTime: number;
}

type ViewState = "home" | "search-results" | "ping-status";

const UserDashboard = () => {
  const navigate = useNavigate();

  // Authentication guard
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!auth.currentUser) {
      console.log("⚠️ No auth.currentUser - listener not started");
      return;
    }

    console.log("🎧 Starting user pings listener for:", auth.currentUser.uid);

    const unsubscribe = listenToUserPings(auth.currentUser.uid, (pings) => {
      console.log("📲 USER DASHBOARD CALLBACK RECEIVED:", pings);

      // helpful for debugging
      (window as any).__AUTH_UID__ = auth.currentUser.uid;

      if (pings.length === 0) {
        console.log("ℹ️ No pings received yet");
        return;
      }

      const ping = pings[0];
      console.log("📦 Processing ping:", ping);

      // 🟢 SAFETY CHECK
      if (!ping.pharmacyResponse) {
        console.log("⚠️ Ping has no pharmacyResponse field");
        return;
      }

      console.log("✅ Pharmacy response found:", ping.pharmacyResponse);
      console.log("📱 Phone from response:", ping.pharmacyResponse.phone);

      // 1️⃣ Set current ping (VERY IMPORTANT for PingStatusView)
      const currentPingData = {
        id: ping.id,
        medicine: ping.medicineName,
        urgency: ping.urgency,
        radius: `${ping.radiusKm} km`,
        searchTime: ping.pharmacyResponse.reservationMinutes,
        status: "waiting" as const,
      };

      console.log("🔄 Setting current ping:", currentPingData);
      setCurrentPing(currentPingData);

      // 2️⃣ Build pharmacy object ONCE (this fixes "pharmacy not defined")
      const pharmacy = {
        id: ping.pharmacyResponse.pharmacyId,
        name: ping.pharmacyResponse.pharmacyName,
        distance: ping.pharmacyResponse.distance,
        address: ping.pharmacyResponse.address || "Nearby pharmacy",
        availability: "reserved" as const,
        medicine: ping.medicineName || "",
        price: ping.pharmacyResponse.price,
        reservationTime: `${ping.pharmacyResponse.reservationMinutes} min`,
        phone: ping.pharmacyResponse.phone || undefined,
      };

      console.log("🏥 Built pharmacy object:", pharmacy);

      // 3️⃣ Show response in PingStatusView
      const responseData = {
        id: pharmacy.id,
        pharmacyName: pharmacy.name,
        distance: pharmacy.distance,
        address: pharmacy.address,
        price: pharmacy.price,
        reservationTime: ping.pharmacyResponse.reservationMinutes,
        phone: ping.pharmacyResponse.phone || undefined,
      };

      console.log("📋 Setting ping responses:", [responseData]);
      setPingResponses([responseData]);

      // 5️⃣ Store selected pharmacy (for banner / navigation / QR)

      setSelectedPharmacy(pharmacy);
      setActiveReservation(pharmacy.id);
      setReservedMedicine(ping.medicineName);

      // 6️⃣ KEEP USER ON STATUS SCREEN
      setViewState("ping-status");
    });

    return () => unsubscribe();
  }, []);

  const [medicineName, setMedicineName] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "emergency">("normal");
  const [loading, setLoading] = useState(false);
  const handlePing = async () => {
    if (!medicineName) {
      alert("Please enter a medicine name");
      return;
    }

    if (!auth.currentUser) {
      alert("User not logged in");
      return;
    }

    setLoading(true);

    try {
      // Get user location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          await createPing(
            medicineName,
            urgency,
            auth.currentUser!.uid,
            location
          );

          alert("Ping sent to nearby pharmacies 🚀");
          setMedicineName("");
        },
        () => {
          alert("Location permission required");
        }
      );
    } catch (err) {
      console.error(err);
      alert("Failed to send ping");
    } finally {
      setLoading(false);
    }
  };
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Pharmacy[] | null>(null);
  const [currentSearch, setCurrentSearch] = useState<{
    query: string;
    isEmergency: boolean;
  } | null>(null);
  const [activeReservation, setActiveReservation] = useState<string | null>(
    null
  );

  // View state
  const [viewState, setViewState] = useState<ViewState>("home");

  // Pending pings
  const [pendingPings, setPendingPings] = useState<PendingPing[]>([]);

  // Ping dialog state
  const [pingDialogOpen, setPingDialogOpen] = useState(false);
  const [pendingPingRequest, setPendingPingRequest] = useState<{
    medicine: string;
    isEmergency: boolean;
  } | null>(null);

  // Current ping for status view
  const [currentPing, setCurrentPing] = useState<PendingPing | null>(null);

  // Sheet states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null
  );

  // QR Scan states
  const [qrScanOpen, setQrScanOpen] = useState(false);
  const [reservedMedicine, setReservedMedicine] = useState<string>("");

  // Ping responses state
  const [pingResponses, setPingResponses] = useState<PharmacyResponse[]>([]);

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

  const handleSearch = async (query: string, isEmergency: boolean) => {
    setIsSearching(true);
    setCurrentSearch({ query, isEmergency });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Search in mock inventory
    const inventoryResults = searchMedicineInInventory(query);

    if (inventoryResults.length > 0) {
      const pharmacyResults: Pharmacy[] = inventoryResults.map(
        (result, index) => ({
          id: `result-${index}`,
          name: result.pharmacyName,
          distance: result.distance,
          address: result.address,
          availability: "available" as const,
          medicine: result.medicine,
          price: `₹${result.price}`,
          phone: result.phone,
        })
      );
      setSearchResults(pharmacyResults);
    } else {
      setSearchResults([]);
    }

    setIsSearching(false);
    setViewState("search-results");
  };

  const handlePingRequest = (query: string, isEmergency: boolean) => {
    setPendingPingRequest({ medicine: query, isEmergency });
    setPingDialogOpen(true);
  };

  const handleConfirmPing = (settings: {
    reservationTime: number;
    radius: number;
    situation: string;
    searchTime: number;
  }) => {
    if (!pendingPingRequest || !auth.currentUser) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await createPing(
          pendingPingRequest.medicine,
          pendingPingRequest.isEmergency ? "emergency" : "normal",
          auth.currentUser!.uid,
          {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        );
      },
      () => {
        toast({
          title: "Location required",
          description: "Please allow location access",
          variant: "destructive",
        });
      }
    );

    const newPing: PendingPing = {
      id: Date.now().toString(),
      medicine: pendingPingRequest.medicine,
      urgency: pendingPingRequest.isEmergency ? "emergency" : "normal",
      status: "waiting",
      radius: `${settings.radius} km`,
      reservationTime: settings.reservationTime,
      situation: settings.situation || undefined,
      searchTime: settings.searchTime,
    };

    setPendingPings((prev) => [...prev, { ...newPing, status: "pending" }]);
    setCurrentPing(newPing);
    setPingResponses([]);
    setPingDialogOpen(false);
    setPendingPingRequest(null);
    setViewState("ping-status");

    toast({
      title: pendingPingRequest.isEmergency
        ? "🚨 Emergency Ping Sent!"
        : "Ping Sent!",
      description: `Request sent to pharmacies within ${settings.radius}km for ${pendingPingRequest.medicine}. Waiting ${settings.searchTime} minute(s) for responses.`,
    });
  };

  const handlePingTimeout = useCallback(() => {
    // Remove expired ping from pending list
    if (currentPing) {
      setPendingPings((prev) => prev.filter((p) => p.id !== currentPing.id));
    }
    setPingResponses([]);
    toast({
      title: "⏰ Search Time Expired!",
      description:
        "No pharmacies responded within your selected time. Try expanding the search radius or ping again.",
      variant: "destructive",
    });
    setViewState("home");
    setCurrentPing(null);
  }, [currentPing]);

  const handleCancelPing = useCallback(() => {
    if (currentPing) {
      setPendingPings((prev) => prev.filter((p) => p.id !== currentPing.id));
    }
    setPingResponses([]);
    setViewState("home");
    setCurrentPing(null);
    toast({
      title: "Ping Cancelled",
      description: "Your medicine request has been cancelled.",
    });
  }, [currentPing]);

  const handleSelectPharmacy = async (pharmacy: PharmacyResponse) => {
    console.log("🏥 handleSelectPharmacy called with:", pharmacy);

    if (!auth.currentUser) return;

    // Create a reservation from the ping response
    setActiveReservation(pharmacy.id);
    setReservedMedicine(currentPing?.medicine || "");

    // Remove ping from pending
    if (currentPing) {
      setPendingPings((prev) => prev.filter((p) => p.id !== currentPing.id));
    }

    // Store pharmacy info for navigation - INCLUDE PHONE!
    const selectedPharmacyData = {
      id: pharmacy.id,
      name: pharmacy.pharmacyName,
      distance: pharmacy.distance,
      address: pharmacy.address,
      availability: "reserved" as const,
      medicine: currentPing?.medicine || "",
      price: pharmacy.price,
      reservationTime: `${pharmacy.reservationTime} min`,
      phone: pharmacy.phone || undefined,
    };

    console.log(
      "💾 Setting selectedPharmacy with phone:",
      selectedPharmacyData
    );
    setSelectedPharmacy(selectedPharmacyData);

    // Create alert for reservation confirmation
    try {
      await addDoc(collection(db, "alerts"), {
        userId: auth.currentUser.uid,
        type: "reservation",
        title: "Reservation Confirmed",
        message: `Your medicine is reserved for ${pharmacy.reservationTime} minutes at ${pharmacy.pharmacyName}`,
        timestamp: serverTimestamp(),
        read: false,
        pharmacyId: pharmacy.id,
      });
    } catch (error) {
      console.error("Error creating reservation alert:", error);
    }

    setPingResponses([]);
    setViewState("home");
    setCurrentPing(null);

    toast({
      title: "Medicine Reserved! ✓",
      description: `Your medicine is held for ${pharmacy.reservationTime} minutes at ${pharmacy.pharmacyName}.`,
    });
  };

  const handleExpandRadius = () => {
    if (currentPing) {
      setCurrentPing({ ...currentPing, radius: "10 km" });
      toast({
        title: "Radius Expanded",
        description: "Search expanded to 10km radius.",
      });
    }
  };

  const handleReserve = (pharmacyId: string) => {
    if (activeReservation && activeReservation !== pharmacyId) {
      toast({
        title: "Active Reservation Exists",
        description:
          "Please cancel your current reservation before making a new one.",
        variant: "destructive",
      });
      return;
    }

    const pharmacy = searchResults?.find((p) => p.id === pharmacyId);
    setActiveReservation(pharmacyId);
    setReservedMedicine(pharmacy?.medicine || "");
    setSearchResults(
      (prev) =>
        prev?.map((p) => ({
          ...p,
          availability:
            p.id === pharmacyId ? ("reserved" as const) : p.availability,
          reservationTime: p.id === pharmacyId ? "30 min" : p.reservationTime,
        })) || null
    );

    toast({
      title: "Medicine Reserved! ✓",
      description:
        "Your medicine is held for 30 minutes. Head to the pharmacy now.",
    });
  };

  const handleScanQR = () => {
    // If we already have a selected pharmacy (from ping response), use it
    if (selectedPharmacy) {
      setQrScanOpen(true);
      return;
    }

    // Otherwise, find it in search results
    const pharmacy = searchResults?.find((p) => p.id === activeReservation);
    if (pharmacy) {
      setSelectedPharmacy(pharmacy);
      setQrScanOpen(true);
    }
  };

  const handleQRScanComplete = () => {
    setQrScanOpen(false);
    setActiveReservation(null);
    setReservedMedicine("");
    setSearchResults(
      (prev) =>
        prev?.map((p) => ({
          ...p,
          availability:
            p.availability === "reserved"
              ? ("available" as const)
              : p.availability,
          reservationTime: undefined,
        })) || null
    );

    toast({
      title: "Pickup Complete! 🎉",
      description:
        "Thank you for using Ping & Pick. Your reservation is complete.",
    });
  };

  const handleCancel = (pharmacyId: string) => {
    setActiveReservation(null);
    setSearchResults(
      (prev) =>
        prev?.map((p) => ({
          ...p,
          availability:
            p.id === pharmacyId ? ("available" as const) : p.availability,
          reservationTime: p.id === pharmacyId ? undefined : p.reservationTime,
        })) || null
    );

    toast({
      title: "Reservation Cancelled",
      description: "The medicine is now available for others.",
    });
  };

  const handleCancelReservation = () => {
    setActiveReservation(null);
    setReservedMedicine("");
    setSelectedPharmacy(null);

    toast({
      title: "Reservation Cancelled",
      description: "The medicine is now available for others.",
    });
  };

  const handleNavigate = (pharmacyId?: string) => {
    // If we already have a selected pharmacy (from ping response), use it
    if (selectedPharmacy && !pharmacyId) {
      setNavigationOpen(true);
      return;
    }

    // Otherwise, find it in search results
    if (pharmacyId) {
      const pharmacy = searchResults?.find((p) => p.id === pharmacyId);
      if (pharmacy) {
        setSelectedPharmacy(pharmacy);
        setNavigationOpen(true);
      }
    }
  };

  const handleBackToHome = () => {
    setViewState("home");
    setSearchResults(null);
    setCurrentSearch(null);
    setCurrentPing(null);
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
              <div>
                <span className="text-lg font-bold text-foreground">
                  Ping & Pick
                </span>
                <p className="text-xs text-muted-foreground">
                  Find medicines nearby
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setAlertsOpen(true)}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emergency rounded-full" />
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
        {/* Ping Status View */}
        {viewState === "ping-status" && currentPing && (
          <PingStatusView
            medicine={currentPing.medicine}
            urgency={currentPing.urgency}
            radius={currentPing.radius}
            searchTime={currentPing.searchTime}
            onBack={handleBackToHome}
            onTimeout={handlePingTimeout}
            onExpandRadius={handleExpandRadius}
            onCancel={handleCancelPing}
            onSelectPharmacy={handleSelectPharmacy}
            responses={pingResponses}
          />
        )}

        {/* Search Results View */}
        {viewState === "search-results" && currentSearch && (
          <SearchResultsView
            medicine={currentSearch.query}
            hasResults={searchResults !== null && searchResults.length > 0}
            onBack={handleBackToHome}
            onPingPharmacies={() =>
              handlePingRequest(currentSearch.query, currentSearch.isEmergency)
            }
          >
            {searchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {searchResults.length} pharmacies found nearby
                  </p>
                  {currentSearch.isEmergency && (
                    <Badge variant="emergency">Emergency</Badge>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((pharmacy, index) => (
                    <motion.div
                      key={pharmacy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PharmacyCard
                        {...pharmacy}
                        isEmergency={currentSearch.isEmergency}
                        onReserve={() => handleReserve(pharmacy.id)}
                        onCancel={() => handleCancel(pharmacy.id)}
                        onNavigate={() => handleNavigate(pharmacy.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </SearchResultsView>
        )}

        {/* Home View */}
        {viewState === "home" && (
          <>
            {/* Pending Pings Section */}
            {pendingPings.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {pendingPings.map((ping) => (
                  <PendingPingCard
                    key={ping.id}
                    medicine={ping.medicine}
                    status={ping.status}
                    urgency={ping.urgency}
                    radius={ping.radius}
                  />
                ))}
              </motion.section>
            )}

            {/* Search Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-foreground" />
                <div>
                  <h2 className="text-lg font-semibold">Search Medicine</h2>
                  <p className="text-sm text-muted-foreground">
                    Find medicine availability in nearby pharmacies
                  </p>
                </div>
              </div>
              <MedicineSearch
                onSearch={handleSearch}
                onPing={handlePingRequest}
                isSearching={isSearching}
              />
            </motion.section>

            {/* Active Reservation Banner */}
            {activeReservation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-reserved-soft border border-reserved/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-reserved/20 flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-reserved" />
                  </div>
                  <div>
                    <p className="font-medium text-reserved">
                      Active Reservation
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You have 1 medicine reserved. Only one reservation allowed
                      at a time.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleScanQR}
                    className="gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    Scan QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleNavigate(
                        selectedPharmacy ? undefined : activeReservation
                      )
                    }
                    className="gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReservation}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Badge variant="reserved">Reserved</Badge>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!isSearching && pendingPings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-soft flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Search for medicines nearby
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Enter a medicine name above to find availability at pharmacies
                  near you. Toggle emergency mode for urgent needs.
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>

      {/* Custom Ping Dialog */}
      <CustomPingDialog
        open={pingDialogOpen}
        onOpenChange={setPingDialogOpen}
        medicine={pendingPingRequest?.medicine || ""}
        isEmergency={pendingPingRequest?.isEmergency || false}
        onConfirm={handleConfirmPing}
      />

      {/* QR Scan Dialog */}
      <QRScanDialog
        open={qrScanOpen}
        onOpenChange={setQrScanOpen}
        pharmacyName={selectedPharmacy?.name || ""}
        medicine={reservedMedicine}
        onScanComplete={handleQRScanComplete}
      />

      {/* Sheets and Modals */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userType="user"
      />
      <AlertsSheet open={alertsOpen} onOpenChange={setAlertsOpen} />
      <NavigationModal
        open={navigationOpen}
        onOpenChange={setNavigationOpen}
        pharmacy={selectedPharmacy}
      />
    </div>
  );
};

export default UserDashboard;
