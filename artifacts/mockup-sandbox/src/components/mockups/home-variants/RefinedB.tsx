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
    iconBg: "bg-violet-100/60 dark:bg-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
    testId: "nav-card-frame-analytics",
  },
  {
    title: "Inventory",
    description: "Manage frame stock",
    url: "#",
    icon: Package,
    iconBg: "bg-emerald-100/60 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    testId: "nav-card-inventory",
  },
  {
    title: "Lab Orders",
    description: "Frames at the lab",
    url: "#",
    icon: FlaskConical,
    iconBg: "bg-blue-100/60 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    testId: "nav-card-lab-orders",
  },
  {
    title: "Weekly Metrics",
    description: "Performance tracking",
    url: "#",
    icon: BarChart2,
    iconBg: "bg-amber-100/60 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
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

export default function RefinedB() {
  const user = { username: "Dr. Rivera", role: "admin" };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Subtle radial gradient background for warmth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,hsl(var(--primary))_0%,transparent_60%)] opacity-[0.03]"></div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="font-semibold text-foreground tracking-tight">OptiTrack</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center border border-border">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-medium text-foreground" data-testid="text-home-username">
                  {user.username}
                </span>
              </div>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4 ml-1"
              >
                {user.role}
              </Badge>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground h-8 px-2"
              data-testid="button-home-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-12">

          {/* Branding Block */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md mb-2">
              <Package className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-baseline justify-center gap-2" data-testid="text-home-title">
                OptiTrack
                <span className="text-xs font-medium text-muted-foreground/60 tracking-normal translate-y-[-2px]">by OptiCore</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Frame Inventory & Lab Order Management
              </p>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest pl-1">
              Navigate
            </p>

            {/* Navigation cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {navCards.map((card) => (
                <a key={card.url} href={card.url} data-testid={card.testId} className="block group">
                  <div className="border border-border rounded-xl p-5 bg-card/50 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-4 h-full">
                    <div className={`p-3 rounded-xl ${card.iconBg} transition-colors flex-shrink-0`}>
                      <card.icon
                        className={`w-5 h-5 ${card.iconColor}`}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground transition-colors">
                        {card.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{card.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 flex-shrink-0 transition-colors transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.url}
                  data-testid={action.testId}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 hover:bg-muted text-sm font-medium text-foreground transition-colors hover:shadow-sm"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  {action.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
