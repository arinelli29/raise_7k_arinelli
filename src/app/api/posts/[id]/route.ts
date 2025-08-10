import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteImage, uploadImage } from "@/lib/cloudinary";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("admin_id");

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const { id: postId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, role: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Regras: autor pode excluir seu próprio post; admin só pode excluir posts de usuários (não de outros admins)
    const isAuthor = user.id === post.authorId;
    const isAdminModeratingUser =
      user.role === "ADMIN" && post.author.role === "USER";

    if (!isAuthor && !isAdminModeratingUser) {
      return NextResponse.json(
        {
          error:
            "Apenas o autor ou administradores podem deletar posts de usuários",
        },
        { status: 403 }
      );
    }

    if (post.imagePublicId) {
      await deleteImage(post.imagePublicId);
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({
      success: true,
      message: "Post deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const { id: postId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, role: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    // Regras: autor pode editar seu próprio post; admin só pode editar posts de usuários
    const isAuthor = user.id === post.authorId;
    const isAdminModeratingUser =
      user.role === "ADMIN" && post.author.role === "USER";

    if (!isAuthor && !isAdminModeratingUser) {
      return NextResponse.json(
        {
          error:
            "Apenas o autor ou administradores podem editar posts de usuários",
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string | null;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios" },
        { status: 400 }
      );
    }

    let imageUrl = post.imageUrl;
    let imagePublicId = post.imagePublicId;

    // Se uma nova imagem foi enviada
    if (imageFile && imageFile.size > 0) {
      try {
        // Deletar imagem antiga se existir
        if (post.imagePublicId) {
          await deleteImage(post.imagePublicId);
        }

        // Upload da nova imagem
        const uploadResult = await uploadImage(imageFile);
        if (
          !uploadResult.success ||
          !uploadResult.url ||
          !uploadResult.publicId
        ) {
          return NextResponse.json(
            { error: "Erro ao fazer upload da imagem" },
            { status: 500 }
          );
        }
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.publicId;
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        return NextResponse.json(
          { error: "Erro ao fazer upload da imagem" },
          { status: 500 }
        );
      }
    }

    // Atualizar o post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        subtitle: subtitle || null,
        content,
        imageUrl,
        imagePublicId,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Post atualizado com sucesso",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
