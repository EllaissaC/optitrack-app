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
    testId: "nav-card-frame-analytics",
  },
  {
    title: "Inventory",
    description: "Manage frame stock",
    url: "#",
    icon: Package,
    testId: "nav-card-inventory",
  },
  {
    title: "Lab Orders",
    description: "Frames at the lab",
    url: "#",
    icon: FlaskConical,
    testId: "nav-card-lab-orders",
  },
  {
    title: "Weekly Metrics",
    description: "Performance tracking",
    url: "#",
    icon: BarChart2,
    testId: "nav-card-weekly-metrics",
  },
];

const quickActions = [
  {
    label: "Add Frame",
    icon: Plus,
    url: "#",
    testId: "quick-action-add-frame",
  },
  {
    label: "Scan Barcode",
    icon: Barcode,
    url: "#",
    testId: "quick-action-scan-barcode",
  },
  {
    label: "Send to Lab",
    icon: Truck,
    url: "#",
    testId: "quick-action-send-to-lab",
  },
];

export default function CompactList() {
  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden text-foreground antialiased">
      {/* Header Row */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-foreground" data-testid="text-home-title">
              OptiTrack
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Frame Inventory & Lab Order Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground" data-testid="text-home-username">
              Sarah Chen
            </span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 rounded-sm font-semibold uppercase tracking-wider">
              Admin
            </Badge>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground -mr-2"
            data-testid="button-home-logout"
          >
            <LogOut className="w-3 h-3 mr-1.5" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-0">
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          
          <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden flex flex-col">
            {/* Quick Actions Toolbar */}
            <div className="flex items-center gap-1.5 p-1.5 border-b border-border bg-muted/30">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs font-medium hover:bg-background hover:shadow-sm transition-all text-foreground/80 hover:text-foreground"
                  asChild
                  data-testid={action.testId}
                >
                  <a href={action.url} className="flex items-center">
                    <action.icon className="w-3.5 h-3.5 mr-2 text-muted-foreground" strokeWidth={2} />
                    {action.label}
                  </a>
                </Button>
              ))}
            </div>

            {/* Dense Nav List */}
            <div className="flex flex-col">
              {navCards.map((card, index) => (
                <a
                  key={card.url}
                  href={card.url}
                  data-testid={card.testId}
                  className={`group flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none ${
                    index !== navCards.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded border border-border/50 bg-background flex items-center justify-center shrink-0 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                    <card.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <span className="font-medium text-sm text-foreground flex-1">
                    {card.title}
                  </span>
                  
                  <span className="text-xs text-muted-foreground mr-2 group-hover:text-foreground/70 transition-colors">
                    {card.description}
                  </span>
                  
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-foreground transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
