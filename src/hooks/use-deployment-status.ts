"use client";

import { useEffect, useState } from "react";

export type ServiceStatus = "ok" | "error" | "building" | "unknown";

export interface DeploymentStatus {
  vercel: ServiceStatus;
  railway: ServiceStatus;
}

const POLL_INTERVAL = 60_000; // every 60 seconds

export function useDeploymentStatus() {
  const [status, setStatus] = useState<DeploymentStatus>({
    vercel: "unknown",
    railway: "unknown",
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/deployment-status");
        if (!res.ok) return;
        const data: DeploymentStatus = await res.json();
        if (!cancelled) setStatus(data);
      } catch {
        // silently ignore – keep previous state
      }
    }

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return status;
}
