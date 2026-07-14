import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { projects, admins } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

// Secret admin password (fallback/default) - for production, admins table would be populated
const DEFAULT_ADMIN_PASSWORD = "admin";
const DEFAULT_ADMIN_USER = "admin";

// Initial seed data if database is empty
const SEED_PROJECTS = [
  {
    title: "Modern Apartment",
    location: "Gurugram",
    category: "Residential",
    size: "1800 sq ft",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDltJZkGBk2FD0kb2dkbX6kdQAh4gtLaTc60MfbciJdl2Qh4f2CqSQOxLl7dcYK8REmgCRgH2E6_mhwZwEQ8nk_JLm2dlfTcq7kGPSWlMd5A8clEHrMkMVLUqKLyfbgm0s_WuudWKUJxD4PCBkP4EP7XO7Ob2CHzaI1R1KS6HL9-ID5-8gYyuTRnseTrxVdNj_1gB1bETgDi0rL9YGfVBR2c3-09UTUcrgMrZpTIqsAIEXpXNWNLqSjQkzV_4lRTp9oaHVpbnZlc0s",
  },
  {
    title: "The Urban Nest",
    location: "Delhi",
    category: "Residential",
    size: "2200 sq ft",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgfKcuCNZlloheVXw_hC8i8MSzTknRBRRv8LigfBeSSd-YiaVzZhIEGFGqjEk_xXnDXyN2w067it7fnUbZGBrhb-eqJVEnl37vtgynTfcSDgE_criuSRtWQly4TXbq4wFKnnWzhv213imDV47jEXcqcyW4QxEc_Ze8w3Gq04U7CqKrjBzcPFCeGr-IATZ1hHaDGRm2lAX3Ii0r1TNrywl1E4uAn_yVGEMZG2KQx2dpLoEM5U3Uk3wi7aZJbcD7PKBT7U5UreeUqeU",
  },
  {
    title: "Corporate Office",
    location: "Noida",
    category: "Commercial",
    size: "4500 sq ft",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDT5jtjLDeJ1uLIAG6-z3f0R7WmO45ATObfe70gG-rQFGOEhl-vJAR36idng2fTTAiNvHnPU3Vtizb9WRD-QDY1FmzJ8XrwFrVPKUnxXpgyEGiKWevuHCwQfzSCyF2VH0VE1ZZNP4A9K1WPeTv3F9UvMcyRA8csb3tEYf0YKqTPz6KElN15uBgz2DsXmdVvKFbTy4M6veNsk9Whi4EZ5AKDa9JE35A1404SlQwuw7K_Jno4UN_zoUJ3DcyIJE-b5RZmXxYYBc7MuzI",
  },
  {
    title: "Café Arbour",
    location: "Delhi",
    category: "Commercial",
    size: "1200 sq ft",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTryY_m2bCwLuIDUOG1fCJT5TSu-P-RKeVcDxC6zKpwdcqL-I3gS2FOU_Kq2XI5CNFDBADTPPGJop0lzp-FDM3rRQ7_1-2JiCkXEz0VwYClikKitvamWUTjv4-VzMwH6wSZ8RQ1XYVPG4ouEUz07odBcxU4_7o0fFNxHbwJc_879m2f2o_9vi8Wj8G1nB8gmcFi73OtXl9B_RaD28jArhnEPM8EAl_MU8hpUjzshq9QwogEi2yQ1DLlB6pYKsE-aYBiJ22zC9A9Mo",
  }
];

// Helper to authenticate admin
function verifyAdmin(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;
  const token = authHeader.replace("Bearer ", "").trim();
  // Simple token matching DEFAULT_ADMIN_PASSWORD for simplicity and security within scope
  return token === "admin-session-token-secret-12345";
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Simple CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    // ----------------------------------------------------
    // ROUTE: POST /api/admin/login
    // ----------------------------------------------------
    if (path === "/api/admin/login" && req.method === "POST") {
      const { username, password } = await req.json();

      if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASSWORD) {
        return new Response(JSON.stringify({ 
          token: "admin-session-token-secret-12345",
          user: { username }
        }), { status: 200, headers });
      }

      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401, headers });
    }

    // ----------------------------------------------------
    // ROUTE: GET /api/projects (fetch and optionally seed)
    // ----------------------------------------------------
    if (path === "/api/projects" && req.method === "GET") {
      let list = await db.select().from(projects).orderBy(desc(projects.createdAt));

      if (list.length === 0) {
        // Seed database
        await db.insert(projects).values(SEED_PROJECTS);
        list = await db.select().from(projects).orderBy(desc(projects.createdAt));
      }

      return new Response(JSON.stringify(list), { status: 200, headers });
    }

    // ----------------------------------------------------
    // ROUTE: POST /api/projects (insert)
    // ----------------------------------------------------
    if (path === "/api/projects" && req.method === "POST") {
      if (!verifyAdmin(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const body = await req.json();
      const { title, location, category, size, imageUrl } = body;

      if (!title || !location || !category || !size || !imageUrl) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
      }

      const [newProj] = await db.insert(projects).values({
        title,
        location,
        category,
        size,
        imageUrl,
      }).returning();

      return new Response(JSON.stringify(newProj), { status: 201, headers });
    }

    // ----------------------------------------------------
    // ROUTE: PUT /api/projects (update)
    // ----------------------------------------------------
    if (path === "/api/projects" && req.method === "PUT") {
      if (!verifyAdmin(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const body = await req.json();
      const { id, title, location, category, size, imageUrl } = body;

      if (!id || !title || !location || !category || !size || !imageUrl) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
      }

      const [updatedProj] = await db.update(projects).set({
        title,
        location,
        category,
        size,
        imageUrl
      }).where(eq(projects.id, parseInt(id))).returning();

      if (!updatedProj) {
        return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers });
      }

      return new Response(JSON.stringify(updatedProj), { status: 200, headers });
    }

    // ----------------------------------------------------
    // ROUTE: DELETE /api/projects (delete)
    // ----------------------------------------------------
    if (path === "/api/projects" && req.method === "DELETE") {
      if (!verifyAdmin(req)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
      }

      const urlParams = new URLSearchParams(url.search);
      const id = urlParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "Missing project ID" }), { status: 400, headers });
      }

      const [deletedProj] = await db.delete(projects).where(eq(projects.id, parseInt(id))).returning();

      if (!deletedProj) {
        return new Response(JSON.stringify({ error: "Project not found" }), { status: 404, headers });
      }

      return new Response(JSON.stringify({ success: true, deleted: deletedProj }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500, headers });
  }
};

export const config: Config = {
  path: ["/api/projects", "/api/admin/login"],
};
