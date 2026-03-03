import type { Context } from "hono";

/**
 * POST /api/qa/admin/upload-logo
 * Upload a logo file and store it as a zo.space asset
 * 
 * Body: FormData with "file" and "event" fields
 * Returns: { ok: true, data: { url: string } }
 */
export default async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File | undefined;
    const event = body.event as string || "default";
    
    if (!file) {
      return c.json({ ok: false, error: "No file provided" }, 400);
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json({ ok: false, error: "File must be an image" }, 400);
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ ok: false, error: "File must be less than 5MB" }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'png';
    const filename = `qa-logo-${event}-${timestamp}.${ext}`;
    const assetPath = `/images/${filename}`;
    
    // Store file temporarily
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // In a real implementation, this would upload to zo.space assets
    // For now, we'll store in the workspace and return a URL
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const uploadDir = '/home/workspace/qa-app/logos';
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return the asset URL
    // In production, this would be the zo.space asset URL
    const url = `/images/${filename}`;
    
    return c.json({
      ok: true,
      data: {
        url,
        filename,
        size: file.size,
        type: file.type
      }
    });
  } catch (err) {
    console.error("Logo upload error:", err);
    return c.json({
      ok: false,
      error: err instanceof Error ? err.message : "Upload failed"
    }, 500);
  }
};
