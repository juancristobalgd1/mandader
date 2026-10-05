// Prefijo para ficheros de /public cuando la web vive en un subdirectorio (GitHub Pages)
export const asset = (p: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}`;
