// lib/cloudinary.ts
export function cloudinaryUrl(
  publicId: string,
  opts?: { folder?: string; withExt?: boolean; transformations?: string[] }
) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const folderEnv = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "";
  const transformEnv = process.env.NEXT_PUBLIC_CLOUDINARY_TRANSFORM ?? "";
  const versionEnv = process.env.NEXT_PUBLIC_CLOUDINARY_VERSION ?? "";

  const folder = (opts?.folder ?? folderEnv).replace(/^\/+|\/+$/g, "");

  // Transformações: usa opts se fornecidas; caso contrário, aplica do .env; se vazio, sem transformações
  const transformations = Array.isArray(opts?.transformations) && opts.transformations.length > 0
    ? opts.transformations.join(",")
    : String(transformEnv).trim();

  // Versão opcional: aceita "1744932541" ou "v1744932541"
  const rawVersion = String(versionEnv).trim();
  const version = rawVersion ? (rawVersion.startsWith("v") ? rawVersion : `v${rawVersion}`) : "";

  // Se withExt=true, força ".jpg" no final
  const id = opts?.withExt ? `${publicId}.jpg` : publicId;

  // Monta segmentos evitando barras extras quando não há transformação/pasta/versão
  const segments = [
    "https://res.cloudinary.com",
    cloud,
    "image",
    "upload",
  ];
  if (transformations) segments.push(transformations);
  if (version) segments.push(version);
  if (folder) segments.push(folder);
  segments.push(id);

  return segments.join("/");
}