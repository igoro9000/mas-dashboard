import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

// Status color mappers
export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

export function getStatusColor(status: string): StatusVariant {
  const normalized = status.toLowerCase();

  const successStatuses = [
    "active",
    "success",
    "completed",
    "approved",
    "online",
    "enabled",
    "running",
    "healthy",
    "resolved",
    "done",
  ];
  const warningStatuses = [
    "pending",
    "warning",
    "in_progress",
    "in-progress",
    "review",
    "processing",
    "partial",
    "degraded",
    "waiting",
  ];
  const dangerStatuses = [
    "error",
    "failed",
    "failure",
    "inactive",
    "disabled",
    "rejected",
    "offline",
    "critical",
    "down",
    "cancelled",
    "canceled",
    "expired",
  ];
  const infoStatuses = [
    "info",
    "scheduled",
    "queued",
    "new",
    "open",
    "draft",
    "staged",
  ];
  const mutedStatuses = ["archived", "closed", "unknown", "none", "na", "n/a"];

  if (successStatuses.includes(normalized)) return "success";
  if (warningStatuses.includes(normalized)) return "warning";
  if (dangerStatuses.includes(normalized)) return "danger";
  if (infoStatuses.includes(normalized)) return "info";
  if (mutedStatuses.includes(normalized)) return "muted";

  return "default";
}

export function getStatusBadgeClasses(status: string): string {
  const variant = getStatusColor(status);

  const variantClasses: Record<StatusVariant, string> = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    muted:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  return variantClasses[variant];
}

export function getStatusDotClasses(status: string): string {
  const variant = getStatusColor(status);

  const variantClasses: Record<StatusVariant, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    muted: "bg-gray-400",
    default: "bg-gray-500",
  };

  return variantClasses[variant];
}

export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatStatus(status: string): string {
  return status
    .replace(/[_-]/g, " ")
    .split(" ")
    .map(capitalize)
    .join(" ");
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function isNullOrUndefined<T>(
  value: T | null | undefined
): value is null | undefined {
  return value === null || value === undefined;
}

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}