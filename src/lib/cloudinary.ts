// lib/cloudinary.ts
export function cloudinaryUrl(
  publicId: string,
  opts?: { folder?: string; withExt?: boolean; transformations?: string[] }
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const folderEnv = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "";
  const folder = (opts?.folder ?? folderEnv).replace(/^\/+|\/+$/g, "");
  const prefix = folder ? `${folder}/` : "";

  const t = (
    opts?.transformations?.length ? opts.transformations : ["f_auto", "q_auto"]
  ).join(",");

  // Se withExt=true, força ".jpg" no final
  const id = opts?.withExt ? `${publicId}.jpg` : publicId;

  return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${prefix}${id}`;
}