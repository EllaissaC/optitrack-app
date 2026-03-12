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

export default function RefinedA() {
  const user = { username: "Dr. Rivera", role: "admin" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">OptiTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground" data-testid="text-home-username">
              {user.username}
            </span>
            <Badge
              variant={user.role === "admin" ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0 h-4"
            >
              {user.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground h-8"
            data-testid="button-home-logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Branding - tight unity */}
          <div className="text-center flex flex-col items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-baseline gap-1.5" data-testid="text-home-title">
                OptiTrack
                <sup className="text-[10px] font-medium text-muted-foreground/60 tracking-normal uppercase">
                  by OptiCore
                </sup>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Frame Inventory &amp; Lab Order Management
            </p>
          </div>

          {/* Navigation cards - No header */}
          <div className="grid grid-cols-2 gap-3">
            {navCards.map((card) => (
              <a key={card.url} href={card.url} data-testid={card.testId} className="block group">
                <div className="border border-border rounded-xl p-5 bg-card hover:border-primary/50 hover:shadow-sm hover:bg-primary/5 transition-all cursor-pointer flex items-center gap-4 h-full">
                  <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors flex-shrink-0">
                    <card.icon
                      className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 flex-shrink-0 transition-colors" />
                </div>
              </a>
            ))}
          </div>

          {/* Quick Actions - Subtle container */}
          <div className="bg-muted/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">
              Shortcuts
            </span>
            <div className="h-4 w-px bg-border hidden sm:block"></div>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="gap-2 h-8 text-xs bg-background hover:bg-background hover:border-primary/30"
                  asChild
                  data-testid={action.testId}
                >
                  <a href={action.url}>
                    <action.icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    {action.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}