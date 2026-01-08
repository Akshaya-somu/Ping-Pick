import { motion } from "framer-motion";
import {
  Radio,
  MapPin,
  Search,
  Bell,
  Shield,
  Clock,
  Users,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-image.png";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Search medicines across all connected pharmacies instantly",
  },
  {
    icon: Radio,
    title: "Ping Broadcast",
    description:
      "Send requests to nearby pharmacies for real-time availability",
  },
  {
    icon: Clock,
    title: "Quick Reserve",
    description: "Reserve medicines with customizable hold times",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your identity stays anonymous until you confirm",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Search Medicine",
    description: "Enter the medicine name and select urgency level",
  },
  {
    step: "02",
    title: "Ping Nearby",
    description: "Pharmacies in your area receive your request",
  },
  {
    step: "03",
    title: "Get Responses",
    description: "Pharmacies confirm availability in real-time",
  },
  {
    step: "04",
    title: "Reserve & Navigate",
    description: "Reserve your medicine and get directions",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen gradient-hero">
      {/* Navigation */}
      <nav className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Ping&Pick</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-soft text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              Find medicines in minutes, not hours
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Ping nearby pharmacies.{" "}
              <span className="text-primary">Get medicines faster.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              Connect with local pharmacies instantly. Search, ping, and reserve
              medicines with real-time availability—especially when every minute
              matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/user">
                <Button
                  variant="hero"
                  size="xl"
                  className="gap-2 w-full sm:w-auto"
                >
                  <MapPin className="w-5 h-5" />
                  Find Medicine Now
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pharmacy">
                <Button
                  variant="outline-primary"
                  size="xl"
                  className="w-full sm:w-auto"
                >
                  I'm a Pharmacy
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl rounded-full" />
            <img
              src={heroImage}
              alt="Ping & Pick - Find medicines faster"
              className="relative rounded-3xl shadow-xl w-full"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Ping & Pick?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for communities where quick access to medicine can save
              lives
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to find your medicine
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 mb-2">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
                {index < howItWorks.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-primary/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emergency-soft text-emergency text-sm font-medium mb-6">
                <Bell className="w-4 h-4" />
                Emergency-ready healthcare access
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-2xl mx-auto">
                Join the community making medicine access faster for everyone
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Whether you're a patient looking for medicines or a pharmacy
                wanting to serve your community better
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/user">
                  <Button variant="hero" size="xl" className="gap-2">
                    <Users className="w-5 h-5" />I Need Medicine
                  </Button>
                </Link>
                <Link to="/pharmacy">
                  <Button variant="outline-primary" size="xl" className="gap-2">
                    <Radio className="w-5 h-5" />
                    Register Pharmacy
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Radio className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Ping & Pick</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A trusted local healthcare companion
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Ping & Pick. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
