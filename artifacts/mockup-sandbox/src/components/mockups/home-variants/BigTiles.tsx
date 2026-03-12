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
} from "lucide-react";

export default function BigTiles() {
  const user = { username: "Dr. Smith", role: "admin" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-border bg-card/50">
        {/* Brand Block - Left Aligned */}
        <div className="flex items-center gap-3 w-full sm:w-auto mb-4 sm:mb-0">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0">
            <Package className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                OptiTrack
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                by OptiCore
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden md:block">
              Frame Inventory & Lab Order Management
            </p>
          </div>
        </div>

        {/* User Info - Right Aligned */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {user.username}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground font-semibold uppercase">
              {user.role}
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Content - Full Width Grid */}
      <main className="flex-1 p-6 md:p-8 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1">
          
          {/* Tile 1: Frame Analytics */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col p-8 lg:p-12">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <LayoutDashboard className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Frame Analytics</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Get a comprehensive overview of your frame inventory performance. Track fast-moving items, monitor profit margins, and analyze sales trends to make data-driven purchasing decisions.
              </p>
            </div>
            
            <div className="mt-auto pt-8 flex items-center justify-between">
              <a href="#" className="inline-flex items-center justify-center rounded-xl bg-blue-500 text-white px-6 py-3 font-semibold hover:bg-blue-600 transition-colors">
                View Dashboard
              </a>
            </div>
          </div>

          {/* Tile 2: Inventory */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col p-8 lg:p-12">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <Package className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Inventory</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Manage your physical frame stock in real-time. Search, filter, and track every item in your dispensary. Stay on top of low stock alerts and streamline your physical counts.
              </p>
            </div>
            
            <div className="mt-auto pt-8 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 text-white px-6 py-3 font-semibold hover:bg-emerald-600 transition-colors gap-2">
                Browse Stock
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#" className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 font-semibold hover:bg-emerald-100 transition-colors gap-2 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/20">
                <Plus className="w-4 h-4" />
                Add Frame
              </a>
              <a href="#" className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-3 font-semibold hover:bg-muted transition-colors gap-2">
                <Barcode className="w-4 h-4" />
                Scan
              </a>
            </div>
          </div>

          {/* Tile 3: Lab Orders */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col p-8 lg:p-12">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <FlaskConical className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Lab Orders</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Track frames currently at the lab for patient orders. Monitor job statuses, manage patient dispensing, and ensure timely delivery of complete eyewear.
              </p>
            </div>
            
            <div className="mt-auto pt-8 flex flex-wrap gap-3">
              <a href="#" className="inline-flex items-center justify-center rounded-xl bg-amber-500 text-white px-6 py-3 font-semibold hover:bg-amber-600 transition-colors gap-2">
                View Orders
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#" className="inline-flex items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 font-semibold hover:bg-amber-100 transition-colors gap-2 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20">
                <Truck className="w-4 h-4" />
                Send to Lab
              </a>
            </div>
          </div>

          {/* Tile 4: Weekly Metrics */}
          <div className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col p-8 lg:p-12">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <BarChart2 className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">Weekly Metrics</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Review your practice's key performance indicators week over week. Set goals, track progress, and celebrate team achievements with easy-to-read charts.
              </p>
            </div>
            
            <div className="mt-auto pt-8 flex items-center justify-between">
              <a href="#" className="inline-flex items-center justify-center rounded-xl bg-purple-500 text-white px-6 py-3 font-semibold hover:bg-purple-600 transition-colors gap-2">
                See Weekly Report
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
