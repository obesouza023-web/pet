require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetSenha() {
  const email = 'admin@causaanimal.com';
  const novaSenha = 'CausaAnimal@2024!';

  const senhaHash = await bcrypt.hash(novaSenha, 12);

  await prisma.user.update({
    where: { email },
    data: { senhaHash }
  });

  console.log('✅ Senha resetada com sucesso!');
  console.log('Email:', email);
  console.log('Senha:', novaSenha);
}

resetSenha()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
