const API_BASE_URL = "http://localhost:8000";

export interface ImageUploadResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro no upload da imagem:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
};

export const createPostWithImage = async (
  postData: {
    title: string;
    subtitle: string;
    content: string;
    author_id: string;
    author_username: string;
    author_email: string;
    author_role: string;
  },
  image?: File
): Promise<any> => {
  try {
    const formData = new FormData();

    // Adicionar dados do post
    Object.entries(postData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Adicionar imagem se fornecida
    if (image) {
      formData.append("image", image);
    }

    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao criar post:", error);
    throw error;
  }
};
