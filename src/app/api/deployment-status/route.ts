import { NextResponse } from "next/server";

export const revalidate = 60; // cache for 60 seconds

export interface DeploymentStatus {
  vercel: "ok" | "error" | "building" | "unknown";
  railway: "ok" | "error" | "building" | "unknown";
}

async function getVercelStatus(): Promise<DeploymentStatus["vercel"]> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) return "unknown";

  try {
    const params = new URLSearchParams({ limit: "1", projectId });
    if (teamId) params.set("teamId", teamId);

    const res = await fetch(
      `https://api.vercel.com/v6/deployments?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return "unknown";

    const data = await res.json();
    const latest = data?.deployments?.[0];
    if (!latest) return "unknown";

    const state: string = latest.state ?? latest.readyState ?? "";
    if (state === "READY") return "ok";
    if (state === "ERROR" || state === "CANCELED") return "error";
    if (state === "BUILDING" || state === "INITIALIZING" || state === "QUEUED")
      return "building";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function getRailwayStatus(): Promise<DeploymentStatus["railway"]> {
  const token = process.env.RAILWAY_API_TOKEN;
  const serviceId = process.env.RAILWAY_SERVICE_ID;
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID;

  if (!token || !serviceId) return "unknown";

  try {
    const query = `
      query {
        deployments(
          input: {
            serviceId: "${serviceId}"
            ${environmentId ? `environmentId: "${environmentId}"` : ""}
          }
          first: 1
        ) {
          edges {
            node {
              status
            }
          }
        }
      }
    `;

    const res = await fetch("https://backboard.railway.app/graphql/v2", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    if (!res.ok) return "unknown";

    const data = await res.json();
    const status: string =
      data?.data?.deployments?.edges?.[0]?.node?.status ?? "";

    if (status === "SUCCESS") return "ok";
    if (status === "FAILED" || status === "CRASHED" || status === "REMOVED")
      return "error";
    if (
      status === "BUILDING" ||
      status === "DEPLOYING" ||
      status === "INITIALIZING"
    )
      return "building";
    return "unknown";
  } catch {
    return "unknown";
  }
}

export async function GET() {
  const [vercel, railway] = await Promise.all([
    getVercelStatus(),
    getRailwayStatus(),
  ]);

  return NextResponse.json({ vercel, railway });
}
