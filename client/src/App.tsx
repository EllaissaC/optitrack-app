import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import LabOrders from "@/pages/lab-orders";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Setup from "@/pages/setup";
import Invite from "@/pages/invite";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

function AppShell() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const { data: setupStatus, isLoading: setupLoading } = useQuery<{ setupRequired: boolean }>({
    queryKey: ["/api/auth/setup-required"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 60 * 1000,
  });

  const ready = !isLoading && !setupLoading;

  useEffect(() => {
    if (!ready) return;

    if (setupStatus?.setupRequired) {
      if (location !== "/setup") navigate("/setup");
      return;
    }

    if (!user) {
      if (location !== "/login" && location !== "/invite") navigate("/login");
      return;
    }

    if (location === "/" || location === "/login" || location === "/setup") {
      navigate("/dashboard");
    }
  }, [ready, setupStatus, user, location, navigate]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (setupStatus?.setupRequired) {
    return (
      <Switch>
        <Route path="/setup" component={Setup} />
      </Switch>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/invite" component={Invite} />
      </Switch>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex-1 min-w-0" />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/lab-orders" component={LabOrders} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppShell />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
