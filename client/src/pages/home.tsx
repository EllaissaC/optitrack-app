import { Link } from "wouter";
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
import { useAuth, useLogout } from "@/hooks/use-auth";

const navCards = [
  {
    title: "Dashboard",
    description: "Overview & analytics",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "nav-card-dashboard",
  },
  {
    title: "Inventory",
    description: "Manage frame stock",
    url: "/inventory",
    icon: Package,
    testId: "nav-card-inventory",
  },
  {
    title: "Lab Orders",
    description: "Frames at the lab",
    url: "/lab-orders",
    icon: FlaskConical,
    testId: "nav-card-lab-orders",
  },
  {
    title: "Weekly Metrics",
    description: "Performance tracking",
    url: "/weekly-metrics",
    icon: BarChart2,
    testId: "nav-card-weekly-metrics",
  },
];

const quickActions = [
  {
    label: "Add Frame",
    icon: Plus,
    url: "/inventory",
    testId: "quick-action-add-frame",
  },
  {
    label: "Scan Barcode",
    icon: Barcode,
    url: "/inventory",
    testId: "quick-action-scan-barcode",
  },
  {
    label: "Send to Lab",
    icon: Truck,
    url: "/lab-orders",
    testId: "quick-action-send-to-lab",
  },
];

export default function Home() {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-end gap-3 px-6 py-4 border-b border-border">
        {user && (
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
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              data-testid="button-home-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              {logout.isPending ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-10">

          {/* Branding */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Package className="w-6 h-6 text-primary-foreground" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight" data-testid="text-home-title">
              OptiTrack
            </h1>
            <p className="text-base text-muted-foreground">
              Frame Inventory &amp; Lab Order Management
            </p>
          </div>

          {/* Navigation prompt */}
          <div className="space-y-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Where would you like to go?
            </p>

            {/* Navigation cards */}
            <div className="grid grid-cols-2 gap-3">
              {navCards.map((card) => (
                <Link key={card.url} href={card.url} data-testid={card.testId}>
                  <div className="group border border-border rounded-xl p-5 bg-card hover:border-primary/40 hover:shadow-sm hover:bg-accent/30 transition-all cursor-pointer flex items-center gap-4">
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
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="gap-2 h-10 px-4"
                  asChild
                  data-testid={action.testId}
                >
                  <Link href={action.url}>
                    <action.icon className="w-4 h-4" strokeWidth={1.5} />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
