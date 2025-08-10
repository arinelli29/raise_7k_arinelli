#!/usr/bin/env python3
"""
Script para testar a API do Futuristic Dashboard
"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testando API do Futuristic Dashboard...")
    print("=" * 50)

    # Teste 1: Verificar se a API está rodando
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"✅ API está rodando: {response.json()}")
    except Exception as e:
        print(f"❌ Erro ao conectar com a API: {e}")
        return

    # Teste 2: Verificar posts existentes
    try:
        response = requests.get(f"{API_BASE_URL}/api/posts")
        posts = response.json()
        print(f"📝 Posts encontrados: {len(posts)}")
        for post in posts:
            print(f"  - {post.get('title', 'Sem título')} (ID: {post.get('id')})")
    except Exception as e:
        print(f"❌ Erro ao buscar posts: {e}")

    # Teste 3: Criar um post de teste
    print("\n📤 Criando post de teste...")
    test_post_data = {
        "title": "Teste da API",
        "subtitle": "Post criado via script de teste",
        "content": "Este é um post de teste para verificar se a API está funcionando corretamente.",
        "author_id": "test_user_1",
        "author_username": "testuser",
        "author_email": "test@example.com",
        "author_role": "admin"
    }

    try:
        response = requests.post(f"{API_BASE_URL}/api/posts", data=test_post_data)
        if response.status_code == 200:
            post = response.json()
            print(f"✅ Post criado com sucesso!")
            print(f"  - ID: {post.get('id')}")
            print(f"  - Título: {post.get('title')}")
            print(f"  - Status: {post.get('status')}")
        else:
            print(f"❌ Erro ao criar post: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Erro ao criar post: {e}")

    # Teste 4: Verificar posts novamente
    print("\n📝 Verificando posts após criação...")
    try:
        response = requests.get(f"{API_BASE_URL}/api/posts")
        posts = response.json()
        print(f"📝 Total de posts: {len(posts)}")
        for post in posts:
            print(f"  - {post.get('title', 'Sem título')} (ID: {post.get('id')})")
    except Exception as e:
        print(f"❌ Erro ao buscar posts: {e}")

    print("\n🎯 Teste concluído!")

if __name__ == "__main__":
    # Aguardar um pouco para o servidor inicializar
    print("⏳ Aguardando servidor inicializar...")
    time.sleep(3)
    test_api()
