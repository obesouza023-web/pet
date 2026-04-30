require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@causaanimal.com';
  const adminSenha = process.env.ADMIN_SENHA;

  if (!adminSenha) {
    console.error('❌ Defina ADMIN_SENHA no .env antes de rodar o seed!');
    process.exit(1);
  }

  const existe = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existe) {
    console.log('✅ Admin já existe:', adminEmail);
    return;
  }

  const senhaHash = await bcrypt.hash(adminSenha, 12);

  await prisma.user.create({
    data: {
      nomeCompleto: 'Administrador',
      email: adminEmail,
      senhaHash,
      telefone: '(00) 00000-0000',
      tipoUsuario: 'admin',
      status: 'ativo',
    },
  });

  console.log('✅ Admin criado com sucesso:', adminEmail);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
