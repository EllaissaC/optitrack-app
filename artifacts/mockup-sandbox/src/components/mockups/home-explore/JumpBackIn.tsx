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
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock Data
const user = {
  username: "Dr. Rivera",
  role: "admin",
};

const recentActivities = [
  {
    id: 1,
    icon: FlaskConical,
    description: "Lab order for John Smith — Oakley Airdrop",
    timestamp: "2 hours ago",
    urgent: false,
    action: "Resume",
    iconColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: 2,
    icon: Package,
    description: "Added 3 frames: Ray-Ban RX5154 (Black, Brown, Tortoise)",
    timestamp: "Yesterday",
    urgent: false,
    action: "View",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: 3,
    icon: AlertTriangle,
    description: "Reorder alert: Oakley Gauge 6 is out of stock",
    timestamp: "2 days ago",
    urgent: true,
    action: "View",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: 4,
    icon: Truck,
    description: "Sent frame to lab: Silhouette 5515 for Maria C.",
    timestamp: "3 days ago",
    urgent: false,
    action: "View",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    id: 5,
    icon: BarChart2,
    description: "Saved weekly metrics — Week of Mar 10",
    timestamp: "Last week",
    urgent: false,
    action: "View",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  }
];

const navCards = [
  {
    title: "Analytics",
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "#",
    icon: Package,
  },
  {
    title: "Lab Orders",
    url: "#",
    icon: FlaskConical,
  },
  {
    title: "Metrics",
    url: "#",
    icon: BarChart2,
  },
];

const quickActions = [
  { label: "Add Frame", icon: Plus, url: "#" },
  { label: "Scan Barcode", icon: Barcode, url: "#" },
  { label: "Send to Lab", icon: Truck, url: "#" },
];

export default function JumpBackIn() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">OptiTrack</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 hidden sm:flex">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground leading-none">{user.username}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{user.role}</span>
              </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-3xl flex flex-col gap-10">
          
          {/* Primary Zone - Recent Activity */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold">
                Recent Activity
              </h2>
            </div>
            
            <div className="flex flex-col divide-y divide-border border-y border-border sm:border sm:rounded-2xl bg-card shadow-sm overflow-hidden">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`group relative flex items-center gap-4 p-4 hover:bg-accent/40 transition-colors cursor-pointer ${activity.urgent ? 'bg-amber-50/60 hover:bg-amber-100/60' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.urgent ? 'bg-amber-100 text-amber-600' : activity.bgColor + ' ' + activity.iconColor}`}>
                    <activity.icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-sm font-medium truncate ${activity.urgent ? 'text-amber-900' : 'text-foreground'}`}>
                      {activity.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-muted-foreground group-hover:hidden sm:group-hover:flex">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{activity.timestamp}</span>
                    </div>
                    
                    <div className="hidden group-hover:flex items-center gap-1 text-xs font-semibold text-primary absolute right-4 sm:relative sm:right-auto bg-background/80 sm:bg-transparent px-2 py-1 rounded sm:px-0 sm:py-0 backdrop-blur-sm sm:shadow-none">
                      {activity.action} <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Secondary Zone - Navigation */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground/80 font-semibold px-2">
              Sections
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {navCards.map((card) => (
                <a 
                  key={card.title} 
                  href={card.url}
                  className="flex flex-col items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm transition-all group"
                >
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <card.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {quickActions.map((action) => (
                <Button 
                  key={action.label} 
                  variant="outline" 
                  size="sm"
                  className="rounded-full gap-2 h-9 px-4 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="w-3.5 h-3.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
