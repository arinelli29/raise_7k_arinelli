// Funções de imagem que podem ser usadas no cliente
export const getOptimizedUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | string;
    format?: string;
  } = {}
): string => {
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  const { width, height, quality = "auto", format = "auto" } = options;
  const baseUrl = url.replace("/upload/", "/upload/");

  let transformations = "";
  if (width || height) {
    transformations += `w_${width || "auto"},h_${height || "auto"},c_scale/`;
  }
  transformations += `q_${quality},f_${format}/`;

  return baseUrl.replace("/upload/", `/upload/${transformations}`);
};

export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  // Verificar tipo
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Arquivo deve ser uma imagem" };
  }

  // Verificar tamanho (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "Imagem deve ter menos de 5MB" };
  }

  return { valid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
