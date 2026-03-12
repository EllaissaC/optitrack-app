import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  FlaskConical, 
  BarChart2, 
  Plus, 
  Barcode, 
  Truck, 
  LogOut, 
  User,
  Search,
  Command,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

export default function CommandBar() {
  const [searchValue, setSearchValue] = useState("");
  
  // Mock data
  const user = {
    username: "Dr. Rivera",
    role: "admin"
  };

  const navCards = [
    { title: "Frame Analytics", icon: LayoutDashboard },
    { title: "Inventory", icon: Package },
    { title: "Lab Orders", icon: FlaskConical },
    { title: "Weekly Metrics", icon: BarChart2 }
  ];

  const quickActions = [
    { label: "Add Frame", icon: Plus },
    { label: "Scan Barcode", icon: Barcode },
    { label: "Send to Lab", icon: Truck }
  ];

  const suggestionChips = [
    { label: "Lab Orders", icon: "🔍" },
    { label: "Add Frame", icon: "📦" },
    { label: "Analytics", icon: "📊" },
    { label: "Scan Barcode", icon: "🏷" }
  ];

  // Auto-focus logic simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("command-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">OptiTrack</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{user.username}</span>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 h-3.5 uppercase tracking-wider">
                {user.role}
              </Badge>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-4 h-4 text-primary" />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-full">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content - Centered Hero Zone */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-2xl flex flex-col items-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Command Area */}
          <div className="w-full space-y-5">
            <div className="text-center space-y-1 mb-6">
              <h1 className="text-2xl sm:text-3xl font-medium text-foreground tracking-tight">
                Good morning, {user.username}.
              </h1>
              <p className="text-muted-foreground">What would you like to do today?</p>
            </div>

            <div className="relative group w-full max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="command-input"
                type="text"
                className="flex h-14 w-full rounded-2xl border-2 border-border bg-background px-11 py-3 text-base shadow-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                placeholder="Search frames, lab orders, or type a command…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <div className="hidden sm:flex items-center gap-1 bg-muted/80 rounded px-1.5 py-0.5 border border-border/50">
                  <Command className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">K</span>
                </div>
              </div>
            </div>

            <div className="text-center max-w-lg mx-auto">
              <p className="text-[11px] text-muted-foreground/80 font-medium tracking-wide">
                Press <span className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">/</span> to focus &nbsp;&middot;&nbsp; Try: 'add frame', 'lab orders', 'reorder list'
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3.5 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-base leading-none">{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="w-32 bg-border/60" />

          {/* Secondary Zone: Minimal Nav Cards */}
          <div className="w-full max-w-xl">
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {navCards.map((card, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <card.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight transition-colors">
                    {card.title}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Tertiary: Quick Actions */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4">
            {quickActions.map((action, idx) => (
              <a 
                key={idx} 
                href="#" 
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                <action.icon className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                <span>{action.label}</span>
              </a>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
