const MAX_REQUEST_BYTES = 2_500_000;

/** Prepara imagens grandes no navegador para não serem recusadas pelo proxy antes da API. */
export async function prepareImageUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  let longestSide = Math.min(Math.max(bitmap.width, bitmap.height), 1920);
  let quality = 0.84;
  try {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const ratio = Math.min(1, longestSide / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
      if (!blob) throw new Error("Não foi possível preparar a imagem.");
      if (blob.size <= MAX_REQUEST_BYTES || attempt === 5) {
        if (blob.size > MAX_REQUEST_BYTES) throw new Error("A imagem continua demasiado grande. Escolha uma imagem menor.");
        return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, { type: "image/webp" });
      }
      longestSide = Math.max(640, Math.round(longestSide * 0.72));
      quality = Math.max(0.55, quality - 0.08);
    }
  } finally { bitmap.close(); }
  return file;
}
