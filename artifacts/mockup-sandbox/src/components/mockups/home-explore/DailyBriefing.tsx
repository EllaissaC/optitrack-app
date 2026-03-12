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
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DailyBriefing() {
  const user = { username: "Dr. Rivera", role: "admin" };

  const statusCards = [
    {
      title: "Frames in Stock",
      value: "247",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      alert: false,
    },
    {
      title: "Lab Orders Pending",
      value: "12",
      icon: FlaskConical,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      alert: false,
    },
    {
      title: "Reorder Alerts",
      value: "3",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      alert: true,
    },
    {
      title: "Weekly Sales",
      value: "$4,820",
      icon: BarChart2,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
      alert: false,
    },
  ];

  const navCards = [
    {
      title: "Frame Analytics",
      icon: LayoutDashboard,
      url: "#",
    },
    {
      title: "Inventory",
      icon: Package,
      url: "#",
    },
    {
      title: "Lab Orders",
      icon: FlaskConical,
      url: "#",
    },
    {
      title: "Weekly Metrics",
      icon: BarChart2,
      url: "#",
    },
  ];

  const quickActions = [
    {
      label: "Add Frame",
      icon: Plus,
      url: "#",
    },
    {
      label: "Scan Barcode",
      icon: Barcode,
      url: "#",
    },
    {
      label: "Send to Lab",
      icon: Truck,
      url: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top bar: Compact, no border */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            OptiTrack
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline-block">
              {user.username}
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 hidden sm:inline-flex"
            >
              {user.role}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>
      {/* Main content */}
      <main className="flex-1 flex flex-col px-6 py-6 sm:py-10 max-w-5xl mx-auto w-full gap-10">
        
        {/* Status Area - The Hero */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Today's Briefing
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statusCards.map((card, i) => (
              <div
                key={i}
                className={`flex flex-col p-5 rounded-xl shadow-sm border ${
                  card.alert
                    ? "bg-amber-50 border-amber-200"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgColor}`}
                  >
                    <card.icon className={`w-4 h-4 ${card.color}`} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">
                    {card.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Take Action Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Take Action
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mt-[250px]">
            {navCards.map((card) => (
              <a
                key={card.title}
                href={card.url}
                className="group flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                <div className="w-8 h-8 rounded-md bg-muted group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                  <card.icon
                    className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {card.title}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Quick Actions at bottom */}
        <div className="mt-auto pt-6 border-t border-border/50 flex flex-wrap justify-center gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="secondary"
              className="h-9 px-4 rounded-full text-xs font-medium gap-2"
              asChild
            >
              <a href={action.url}>
                <action.icon className="w-3.5 h-3.5" strokeWidth={2} />
                {action.label}
              </a>
            </Button>
          ))}
        </div>

      </main>
    </div>
  );
}
