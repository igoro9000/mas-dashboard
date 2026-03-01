import { NextResponse } from "next/server";

export const revalidate = 60; // cache for 60 seconds

export interface DeploymentStatus {
  vercel: "ok" | "error" | "building" | "unknown";
  railway: "ok" | "error" | "building" | "unknown";
}

// Check Vercel by pinging the live dashboard URL
async function getVercelStatus(): Promise<DeploymentStatus["vercel"]> {
  // If private token is available, use the Vercel API for accurate build status
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID ?? "team_QC58f8yI21M4wPYrPafc9RiX";

  if (token && projectId) {
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

      if (res.ok) {
        const data = await res.json();
        const latest = data?.deployments?.[0];
        if (latest) {
          const state: string = latest.state ?? latest.readyState ?? "";
          if (state === "READY") return "ok";
          if (state === "ERROR" || state === "CANCELED") return "error";
          if (["BUILDING", "INITIALIZING", "QUEUED"].includes(state))
            return "building";
        }
      }
    } catch {
      // fall through to health-check
    }
  }

  // Fallback: simple HTTP health check on the live URL
  try {
    const res = await fetch("https://mas-dashboard-phi.vercel.app", {
      method: "HEAD",
      next: { revalidate: 60 },
    });
    return res.ok ? "ok" : "error";
  } catch {
    return "unknown";
  }
}

// Check Railway by calling the public /health endpoint of the API service
async function getRailwayStatus(): Promise<DeploymentStatus["railway"]> {
  // If private token + service ID are available, use Railway GraphQL for accurate build status
  const token = process.env.RAILWAY_API_TOKEN;
  const serviceId =
    process.env.RAILWAY_SERVICE_ID ?? "df76a9e8-beeb-469e-8531-a8033292f6fd";
  const environmentId =
    process.env.RAILWAY_ENVIRONMENT_ID ?? "3e406c40-32bc-408d-a018-aa5509007e4b";

  if (token && serviceId) {
    try {
      const query = `
        query {
          deployments(
            input: {
              serviceId: "${serviceId}"
              environmentId: "${environmentId}"
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

      if (res.ok) {
        const data = await res.json();
        const status: string =
          data?.data?.deployments?.edges?.[0]?.node?.status ?? "";

        if (status === "SUCCESS") return "ok";
        if (["FAILED", "CRASHED", "REMOVED"].includes(status)) return "error";
        if (["BUILDING", "DEPLOYING", "INITIALIZING"].includes(status))
          return "building";
      }
    } catch {
      // fall through to health-check
    }
  }

  // Fallback: ping the public Railway API health endpoint (no token needed)
  try {
    const res = await fetch(
      "https://masapi-production-d492.up.railway.app/health",
      {
        method: "GET",
        next: { revalidate: 60 },
      }
    );
    return res.ok ? "ok" : "error";
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
