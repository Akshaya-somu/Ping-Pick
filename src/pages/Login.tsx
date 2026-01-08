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
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { loginUser, fetchUserRole } from "@/lib/firebaseAuth";

type UserRole = "user" | "pharmacy" | "admin";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginUser(email, password);
      const role = await fetchUserRole(user.uid);

      toast({
        title: "Welcome back!",
        description: `Signed in as ${role}`,
      });

      navigate(
        role === "user" ? "/user" : role === "pharmacy" ? "/pharmacy" : "/admin"
      );
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
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
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1">
              Sign in to your Ping & Pick account
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
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
                <p className="text-xs text-muted-foreground">Find meds</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("pharmacy")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
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
                <p className="text-xs text-muted-foreground">Manage</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                role === "admin"
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Shield
                className={cn(
                  "w-5 h-5",
                  role === "admin" ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-medium text-sm",
                    role === "admin" ? "text-primary" : "text-foreground"
                  )}
                >
                  Admin
                </p>
                <p className="text-xs text-muted-foreground">Manage</p>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline"
              >
                Create one
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

export default Login;
