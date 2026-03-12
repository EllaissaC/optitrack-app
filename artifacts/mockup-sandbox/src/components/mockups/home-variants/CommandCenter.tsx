import React from "react";
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
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navCards = [
  {
    title: "Frame Analytics",
    description: "Overview & analytics",
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    description: "Manage frame stock",
    url: "#",
    icon: Package,
  },
  {
    title: "Lab Orders",
    description: "Frames at the lab",
    url: "#",
    icon: FlaskConical,
  },
  {
    title: "Weekly Metrics",
    description: "Performance tracking",
    url: "#",
    icon: BarChart2,
  },
];

const quickActions = [
  {
    label: "Add Frame",
    description: "Manually add a new frame to inventory",
    icon: Plus,
    url: "#",
  },
  {
    label: "Scan Barcode",
    description: "Use camera to scan a frame barcode",
    icon: Barcode,
    url: "#",
  },
  {
    label: "Send to Lab",
    description: "Process and dispatch lab orders",
    icon: Truck,
    url: "#",
  },
];

export default function CommandCenter() {
  const user = { username: "admin", role: "admin" };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-[280px] bg-card border-r flex flex-col h-screen sticky top-0">
        {/* Brand */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">
                OptiTrack
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                by OptiCore
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Frame Inventory & Lab Order Management
          </p>
        </div>

        {/* Nav */}
        <nav className="p-4 flex-1 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
            Navigation
          </p>
          {navCards.map((card) => (
            <a
              key={card.title}
              href={card.url}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent group transition-all"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <card.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-none mb-1.5">
                  {card.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">{card.description}</p>
              </div>
            </a>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t bg-muted/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground leading-none mb-1.5">
                  {user.username}
                </p>
                <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[9px] px-1.5 py-0 h-3.5">
                  {user.role}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto h-screen">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Command Center</h2>
            <p className="text-muted-foreground text-lg">Quick access to essential tasks and operations.</p>
          </div>

          <div className="grid gap-4">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.url}
                className="group flex items-center p-6 bg-card border rounded-2xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-6 group-hover:bg-primary/20 transition-colors">
                  <action.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>

                <div className="w-10 h-10 rounded-full border bg-background flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
