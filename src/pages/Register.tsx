import { useState } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Mail,
  Lock,
  User,
  Store,
  ArrowRight,
  ArrowLeft,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { registerUser } from "@/lib/firebaseAuth";

type UserRole = "user" | "pharmacy";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    // Pharmacy specific
    pharmacyName: "",
    address: "",
    license: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerUser(formData.email, formData.password, role, {
        name: formData.name,
        phone: formData.phone,
        pharmacyName: role === "pharmacy" ? formData.pharmacyName : null,
        address: role === "pharmacy" ? formData.address : null,
        verified: role === "pharmacy" ? false : true,
      });

      toast({
        title: "Account created 🎉",
        description:
          role === "pharmacy"
            ? "Pharmacy registered. Pending verification."
            : "Welcome to Ping & Pick!",
      });

      navigate(role === "user" ? "/user" : "/pharmacy");
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                <Radio className="w-6 h-6 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground mt-1">
              Join the Ping & Pick community
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                role === "user"
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/50"
              )}
            >
              <User
                className={cn(
                  "w-5 h-5",
                  role === "user" ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-medium text-sm",
                    role === "user" ? "text-primary" : "text-foreground"
                  )}
                >
                  Patient
                </p>
                <p className="text-xs text-muted-foreground">Find medicines</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("pharmacy")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                role === "pharmacy"
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Store
                className={cn(
                  "w-5 h-5",
                  role === "pharmacy" ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-medium text-sm",
                    role === "pharmacy" ? "text-primary" : "text-foreground"
                  )}
                >
                  Pharmacy
                </p>
                <p className="text-xs text-muted-foreground">Register store</p>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "pharmacy" && (
              <div className="space-y-2">
                <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="pharmacyName"
                    placeholder="HealthFirst Pharmacy"
                    value={formData.pharmacyName}
                    onChange={(e) =>
                      updateField("pharmacyName", e.target.value)
                    }
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                {role === "user" ? "Full Name" : "Owner Name"}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            {role === "pharmacy" && (
              <div className="space-y-2">
                <Label htmlFor="address">Pharmacy Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="123 Main Street, Downtown"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
};

export default Register;
