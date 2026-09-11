/**
 * Client-side image upload.
 *
 * Phase 1 of the Cloudflare migration (docs/cloudflare-migration-plan.md §4):
 * images now live in Cloudflare R2. The browser PUTs the resized bytes to the
 * same-origin Worker route `/api/images`, which stores the object and returns
 * its public URL. Staff authorization reuses the Supabase access token the
 * admin portal already holds — the Worker verifies it with the project's JWT
 * secret (see worker/auth.ts).
 *
 * The client-side resize (max 1600px JPEG) is unchanged: it is still the
 * right first line of defense for storage and bandwidth.
 */

import { getSupabase } from "./supabase";

/** Downscale an image file client-side (max 1600px wide, JPEG) to keep uploads light. */
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))),
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => reject(new Error("Could not read the image"));
    img.src = URL.createObjectURL(file);
  });
}

/** Upload an image via the Worker to R2 and return its public URL. */
export async function uploadImage(
  file: File,
  folder: "news" | "gallery" | "events",
): Promise<string> {
  const resized = await resizeImage(file);

  const supabase = getSupabase();
  const { data } = (await supabase?.auth.getSession()) ?? { data: null };
  const token = data?.session?.access_token;
  if (!token) {
    throw new Error("Sign in again to upload images");
  }

  const response = await fetch(`/api/images?folder=${encodeURIComponent(folder)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "image/jpeg",
    },
    body: resized,
  });

  if (!response.ok) {
    const message = await response
      .json()
      .then((body) => (body as { message?: string }).message)
      .catch(() => undefined);
    throw new Error(message ?? `Upload failed (${response.status})`);
  }

  const { url } = (await response.json()) as { url: string };
  if (!url) throw new Error("Upload succeeded but no URL was returned");
  return url;
}
