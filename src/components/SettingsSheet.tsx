import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { User, Bell, MapPin, Shield, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userType: "user" | "pharmacy";
  initialProfile?: {
    name: string;
    email?: string;
    phone: string;
    address?: string;
  };
  onProfileUpdate?: (profile: {
    name: string;
    phone: string;
    address?: string;
  }) => void;
}

const SettingsSheet = ({
  open,
  onOpenChange,
  userType,
  initialProfile,
  onProfileUpdate,
}: SettingsSheetProps) => {
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: false,
    emergencyAlerts: true,
    reservationUpdates: true,
  });

  const [profile, setProfile] = useState(
    initialProfile || {
      name: userType === "user" ? "John Doe" : "HealthFirst Pharmacy",
      email: "demo@pharmaping.com",
      phone: "+91 98765 43210",
      address:
        userType === "pharmacy" ? "123 Main Street, Downtown" : undefined,
    }
  );

  // Sync profile with initialProfile when it changes
  useEffect(() => {
    if (initialProfile) {
      console.log(
        "🔄 SettingsSheet: Syncing with initialProfile:",
        initialProfile
      );
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleSave = () => {
    console.log("💾 Settings being saved:", profile);

    if (userType === "pharmacy" && onProfileUpdate) {
      console.log("🏥 Calling onProfileUpdate with:", {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
      onProfileUpdate({
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
      });
    }
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your account and preferences
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="w-4 h-4" />
              Profile Details
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>
              {userType === "pharmacy" && (
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                    placeholder="123 Main Street, City"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Notification Preferences */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Bell className="w-4 h-4" />
              Notification Preferences
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive push notifications on your device
                  </p>
                </div>
                <Switch
                  checked={notifications.pushEnabled}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushEnabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailEnabled}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emailEnabled: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Emergency Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified about emergency requests
                  </p>
                </div>
                <Switch
                  checked={notifications.emergencyAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      emergencyAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reservation Updates</Label>
                  <p className="text-xs text-muted-foreground">
                    Status changes for your reservations
                  </p>
                </div>
                <Switch
                  checked={notifications.reservationUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      reservationUpdates: checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="w-4 h-4" />
              Location Settings
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Location Access</Label>
                <p className="text-xs text-muted-foreground">
                  Allow app to access your location
                </p>
              </div>
              <Switch
                checked={locationEnabled}
                onCheckedChange={setLocationEnabled}
              />
            </div>
            {!locationEnabled && (
              <p className="text-xs text-destructive">
                Location is required for finding nearby pharmacies
              </p>
            )}
          </div>

          <Separator />

          {/* Privacy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 pt-4 pb-2 bg-background">
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
