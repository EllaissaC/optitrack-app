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
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BriefingRefinedB() {
  const user = { username: "Dr. Rivera", role: "admin" };

  const statusCards = [
    {
      title: "Frames in Stock",
      value: "247",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "bg-emerald-400",
      trend: "▲ 4%",
      trendColor: "text-emerald-600 bg-emerald-50",
      alert: false,
    },
    {
      title: "Lab Orders Pending",
      value: "12",
      icon: FlaskConical,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "bg-blue-400",
      trend: "▲ 2%",
      trendColor: "text-blue-600 bg-blue-50",
      alert: false,
    },
    {
      title: "Reorder Alerts",
      value: "3",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "bg-amber-400",
      trend: "Needs attention",
      trendColor: "text-amber-700 bg-amber-100/50",
      alert: true,
    },
    {
      title: "Weekly Sales",
      value: "$4,820",
      icon: BarChart2,
      color: "text-violet-600",
      bgColor: "bg-violet-100",
      borderColor: "bg-violet-400",
      trend: "▲ 12%",
      trendColor: "text-violet-600 bg-violet-50",
      alert: false,
    },
  ];

  const navCards = [
    {
      title: "Frame Analytics",
      icon: LayoutDashboard,
      url: "#",
      dot: "bg-violet-500",
    },
    {
      title: "Inventory",
      icon: Package,
      url: "#",
      dot: "bg-emerald-500",
    },
    {
      title: "Lab Orders",
      icon: FlaskConical,
      url: "#",
      dot: "bg-blue-500",
    },
    {
      title: "Weekly Metrics",
      icon: BarChart2,
      url: "#",
      dot: "bg-amber-500",
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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            OptiTrack
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-foreground">
                {user.username}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                {user.role}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-2 h-8"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">Sign out</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full sm:hidden"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col px-6 py-8 max-w-5xl mx-auto w-full justify-center">
        
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">
            Good morning, {user.username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your clinic overview for today.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Status Area */}
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 mb-3">
              Today's Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statusCards.map((card, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col p-5 rounded-xl shadow-sm border ${
                    card.alert
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-card border-border"
                  } overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] ${card.borderColor}`} />
                  <div className="flex items-start justify-between mb-4 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bgColor}`}
                    >
                      <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={2} />
                    </div>
                    <div className={`text-[10px] font-medium rounded px-1.5 py-0.5 ${card.trendColor}`}>
                      {card.trend}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">
                      {card.value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium">
                      {card.title}
                    </div>
                  </div>
                  {card.alert && (
                    <a href="#" className="text-xs text-amber-700 underline mt-4 font-medium hover:text-amber-800 transition-colors">
                      View reorders →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Take Action Section */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/40 mb-2">
              Go to
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {navCards.map((card) => (
                <a
                  key={card.title}
                  href={card.url}
                  className="group flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                  <div className="w-8 h-8 rounded-md bg-muted group-hover:bg-primary/5 flex items-center justify-center flex-shrink-0 transition-colors">
                    <card.icon
                      className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {card.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                </a>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium whitespace-nowrap">
                Shortcuts
              </span>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-8 px-3 rounded-full text-xs font-medium gap-1.5 bg-background hover:bg-muted"
                    asChild
                  >
                    <a href={action.url}>
                      <action.icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
                      {action.label}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
