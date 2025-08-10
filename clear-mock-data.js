// Script para limpar dados mock do localStorage
// Execute este script no console do navegador para limpar os dados

console.log('🧹 Limpando dados mock do localStorage...');

// Limpar dados de usuários
localStorage.removeItem('futuristic_users');
console.log('✅ Dados de usuários removidos');

// Limpar dados de posts
localStorage.removeItem('futuristic_posts');
console.log('✅ Dados de posts removidos');

// Limpar usuário logado
localStorage.removeItem('futuristic_user');
console.log('✅ Usuário logado removido');

console.log('🎉 Todos os dados mock foram removidos!');
console.log('🔄 Recarregue a página para começar do zero.');
console.log('👑 O primeiro usuário que se registrar será automaticamente ADMIN!');
