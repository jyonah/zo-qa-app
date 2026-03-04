#!/usr/bin/env bun
/**
 * Zo Q&A App Installer
 * 
 * Installs all routes into the user's Zo Space via the Zo API.
 * 
 * Usage:
 *   bun run install.ts
 */

const REPO_RAW_BASE = "https://raw.githubusercontent.com/jyonah/zo-qa-app/main/routes";

const ROUTES = {
  api: [
    { path: "/api/qa/questions", file: "api/qa-questions.ts" },
    { path: "/api/qa/questions/:id", file: "api/qa-questions-id.ts" },
    { path: "/api/qa/questions/:id/vote", file: "api/qa-questions-id-vote.ts" },
    { path: "/api/qa/admin/settings", file: "api/qa-admin-settings.ts" },
    { path: "/api/qa/admin/config", file: "api/qa-admin-config.ts" },
    { path: "/api/qa/admin/export", file: "api/qa-admin-export.ts" },
    { path: "/api/qa/admin/reset", file: "api/qa-admin-reset.ts" },
    { path: "/api/qa/admin/merge", file: "api/qa-admin-merge.ts" },
  ],
  pages: [
    { path: "/qa", file: "pages/qa-landing.tsx" },
    { path: "/qa/setup", file: "pages/qa-setup.tsx" },
    { path: "/qa/submit", file: "pages/qa-submit.tsx" },
    { path: "/qa/vote", file: "pages/qa-vote.tsx" },
    { path: "/qa/tv", file: "pages/qa-tv.tsx" },
    { path: "/qa/admin", file: "pages/qa-admin.tsx" },
  ],
};

async function fetchRouteCode(file: string): Promise<string> {
  const url = `${REPO_RAW_BASE}/${file}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return await response.text();
}

async function createRoute(path: string, routeType: "api" | "page", code: string): Promise<void> {
  const ZO_API = process.env.ZO_API_URL || "https://api.zo.computer/zo/space";
  const ZO_TOKEN = process.env.ZO_CLIENT_IDENTITY_TOKEN;

  if (!ZO_TOKEN) {
    throw new Error("ZO_CLIENT_IDENTITY_TOKEN environment variable is required");
  }

  const response = await fetch(ZO_API, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${ZO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      route_type: routeType,
      code,
      public: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create route ${path}: ${error}`);
  }

  console.log(`  ✓ Created ${routeType} route: ${path}`);
}

async function main() {
  console.log("Zo Q&A App Installer");
  console.log("=====================\n");
  
  console.log("Fetching route templates from GitHub...\n");

  // Install API routes
  console.log("Installing API routes...");
  for (const route of ROUTES.api) {
    try {
      const code = await fetchRouteCode(route.file);
      await createRoute(route.path, "api", code);
    } catch (err) {
      console.error(`  ✗ Failed to create ${route.path}:`, err);
    }
  }

  // Install page routes
  console.log("\nInstalling page routes...");
  for (const route of ROUTES.pages) {
    try {
      const code = await fetchRouteCode(route.file);
      await createRoute(route.path, "page", code);
    } catch (err) {
      console.error(`  ✗ Failed to create ${route.path}:`, err);
    }
  }

  console.log("\n✓ Installation complete!");
  console.log("\nNext steps:");
  console.log("  1. Visit /qa/setup to configure your Q&A");
  console.log("  2. Set your event name and branding");
  console.log("  3. Share /qa/submit with attendees");
  console.log("  4. Display /qa/tv on projectors");
}

main().catch(err => {
  console.error("Installation failed:", err);
  process.exit(1);
});
