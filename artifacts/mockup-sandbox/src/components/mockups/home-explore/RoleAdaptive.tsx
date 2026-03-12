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
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RoleAdaptive() {
  const user = {
    username: "Dr. Rivera",
    role: "admin",
  };

  const supportingDestinations = [
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

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Package className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">OptiTrack</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">{user.username}</span>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
                className="text-[10px] px-1.5 py-0 h-4 uppercase tracking-wider bg-primary text-primary-foreground"
              >
                {user.role}
              </Badge>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-8 py-10 max-w-6xl mx-auto w-full gap-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Good morning, {user.username.split(' ')[1]}</h1>
          <p className="text-muted-foreground">Here is what matters most to you today.</p>
        </div>

        {/* Hero Card (Role-Dependent) */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card shadow-lg flex flex-col md:flex-row items-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 pointer-events-none"></div>
          
          <div className="p-8 md:p-12 flex-1 relative z-10 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shadow-inner">
                <LayoutDashboard className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <div>
                <Badge variant="outline" className="text-primary border-primary/30 mb-1 bg-primary/5">Admin Priority</Badge>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Frame Analytics</h2>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              View performance trends, revenue, and stock analytics to make data-driven decisions for your clinic.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <Button size="lg" className="gap-2 px-8 font-semibold shadow-md h-12 text-base">
                Open Analytics
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Quick Actions inside Hero */}
          <div className="p-8 md:p-12 md:w-1/3 w-full border-t md:border-t-0 md:border-l border-primary/10 relative z-10 bg-background/50 backdrop-blur-sm flex flex-col justify-center gap-4 h-full">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
            </p>
            <Button variant="outline" className="w-full justify-start h-12 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all border-border shadow-sm">
              <Plus className="w-4 h-4 mr-3 text-muted-foreground" />
              <span className="font-medium">Add Frame</span>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all border-border shadow-sm">
              <Barcode className="w-4 h-4 mr-3 text-muted-foreground" />
              <span className="font-medium">Scan Barcode</span>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 bg-card hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all border-border shadow-sm">
              <Truck className="w-4 h-4 mr-3 text-muted-foreground" />
              <span className="font-medium">Send to Lab</span>
            </Button>
          </div>
        </section>

        {/* Supporting Grid */}
        <section className="space-y-4 pt-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            More Options
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportingDestinations.map((dest) => (
              <a 
                key={dest.title} 
                href={dest.url}
                className="group flex flex-col border border-border rounded-2xl p-6 bg-card hover:border-primary/30 hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <dest.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border group-hover:border-primary/20 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                  {dest.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {dest.description}
                </p>
              </a>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
