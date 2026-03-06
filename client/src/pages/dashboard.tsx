import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, FlaskConical, CheckCircle, Archive, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Frame } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";

const STATUS_CONFIG = {
  on_board: { label: "On Board", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  at_lab: { label: "At Lab", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", dot: "bg-amber-500" },
  sold: { label: "Sold", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", dot: "bg-blue-500" },
};

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  description,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-card-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${bgColor} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function daysAtLab(dateSentToLab: string): number {
  const sent = new Date(dateSentToLab);
  const today = new Date();
  return Math.floor((today.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const { data: frames = [], isLoading } = useQuery<Frame[]>({
    queryKey: ["/api/frames"],
  });

  const { data: settingsMap = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const reminderDays = parseInt(settingsMap.labReminderDays || "14");

  const onBoard = frames.filter((f) => f.status === "on_board").length;
  const atLab = frames.filter((f) => f.status === "at_lab").length;
  const sold = frames.filter((f) => f.status === "sold").length;
  const total = frames.length;

  const totalRetail = frames.reduce((acc, f) => acc + parseFloat(f.retailPrice as string), 0);
  const totalCost = frames.reduce((acc, f) => acc + parseFloat(f.cost as string), 0);
  const soldRevenue = frames
    .filter((f) => f.status === "sold")
    .reduce((acc, f) => acc + parseFloat(f.retailPrice as string), 0);

  const recentFrames = [...frames]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const overdueLabFrames = frames.filter(
    (f) => f.status === "at_lab" && f.dateSentToLab && daysAtLab(f.dateSentToLab) >= reminderDays
  ).sort((a, b) => daysAtLab(b.dateSentToLab!) - daysAtLab(a.dateSentToLab!));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Overview of your optical frame inventory</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Frames"
          value={total}
          icon={Archive}
          iconColor="text-violet-600 dark:text-violet-400"
          bgColor="bg-violet-100 dark:bg-violet-900/30"
          loading={isLoading}
        />
        <StatCard
          title="On Board"
          value={onBoard}
          icon={Package}
          iconColor="text-emerald-600 dark:text-emerald-400"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          loading={isLoading}
        />
        <StatCard
          title="At Lab"
          value={atLab}
          icon={FlaskConical}
          iconColor="text-amber-600 dark:text-amber-400"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
          loading={isLoading}
        />
        <StatCard
          title="Sold"
          value={sold}
          icon={CheckCircle}
          iconColor="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
          loading={isLoading}
        />
      </div>

      {!isLoading && overdueLabFrames.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3 px-6 pt-5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-amber-900 dark:text-amber-200">
                Frames Needing Lab Follow-Up
              </CardTitle>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {overdueLabFrames.length} frame{overdueLabFrames.length !== 1 ? "s" : ""} at lab for {reminderDays}+ days
              </p>
            </div>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" asChild className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200">
                <Link href="/inventory" data-testid="link-lab-followup-inventory">
                  View in Inventory <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="rounded-md overflow-hidden border border-amber-200 dark:border-amber-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-100/60 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300">Brand / Model</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hidden sm:table-cell">Lab</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hidden md:table-cell">Vision Plan</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hidden md:table-cell">Lab Order #</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300">Days at Lab</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLabFrames.map((frame) => {
                    const days = daysAtLab(frame.dateSentToLab!);
                    return (
                      <tr
                        key={frame.id}
                        className="border-b border-amber-100 dark:border-amber-900/50 last:border-0 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                        data-testid={`row-overdue-frame-${frame.id}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{frame.brand}</p>
                          <p className="text-xs text-muted-foreground">{frame.model}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {frame.labName || <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {frame.visionPlan || <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {frame.labOrderNumber || <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge
                            variant="outline"
                            className="border-amber-400 text-amber-700 dark:text-amber-400 dark:border-amber-600 font-semibold"
                            data-testid={`text-days-at-lab-${frame.id}`}
                          >
                            {days} days
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-card-border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2 px-6 pt-5">
            <CardTitle className="text-base font-semibold">Recent Frames</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/inventory" data-testid="link-view-all">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentFrames.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No frames yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentFrames.map((frame) => {
                  const config = STATUS_CONFIG[frame.status as keyof typeof STATUS_CONFIG];
                  return (
                    <div
                      key={frame.id}
                      data-testid={`row-recent-frame-${frame.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-md bg-muted/40"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {frame.brand} {frame.model}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {frame.manufacturer} · {frame.color}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                          ${parseFloat(frame.retailPrice as string).toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader className="space-y-0 pb-2 px-6 pt-5">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="p-3 rounded-md bg-muted/40 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Total Wholesale Cost</p>
                  <p className="text-lg font-bold text-foreground" data-testid="text-total-cost">
                    ${totalCost.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-muted/40 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Total Retail Value</p>
                  <p className="text-lg font-bold text-foreground" data-testid="text-total-retail">
                    ${totalRetail.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-md bg-muted/40 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Revenue from Sales</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-revenue">
                    ${soldRevenue.toFixed(2)}
                  </p>
                </div>
                {total > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-muted-foreground">Status Breakdown</p>
                    {[
                      { label: "On Board", count: onBoard, color: "bg-emerald-500" },
                      { label: "At Lab", count: atLab, color: "bg-amber-500" },
                      { label: "Sold", count: sold, color: "bg-blue-500" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{ width: `${(count / total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {label} ({count})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
