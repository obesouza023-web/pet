-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('cidadao', 'protetor', 'veterinario', 'empresa', 'admin');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ativo', 'inativo', 'bloqueado');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('cachorro', 'gato', 'outro');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('macho', 'femea');

-- CreateEnum
CREATE TYPE "Porte" AS ENUM ('pequeno', 'medio', 'grande');

-- CreateEnum
CREATE TYPE "StatusAnimal" AS ENUM ('disponivel', 'em_tratamento', 'lar_temporario', 'em_adocao', 'adotado', 'obito');

-- CreateEnum
CREATE TYPE "TipoMoradia" AS ENUM ('casa', 'apartamento');

-- CreateEnum
CREATE TYPE "StatusAdocao" AS ENUM ('enviado', 'em_analise', 'aprovado', 'reprovado', 'finalizado');

-- CreateEnum
CREATE TYPE "TipoChamado" AS ENUM ('abandonado', 'machucado', 'atropelado', 'preso', 'maus_tratos', 'agressivo', 'ninhada', 'risco', 'resgate', 'veterinario');

-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('baixa', 'media', 'alta', 'emergencia');

-- CreateEnum
CREATE TYPE "StatusChamado" AS ENUM ('recebido', 'em_analise', 'equipe_acionada', 'em_deslocamento', 'resgatado', 'veterinario', 'finalizado', 'nao_localizado', 'cancelado');

-- CreateEnum
CREATE TYPE "StatusCastracao" AS ENUM ('recebido', 'em_fila', 'agendado', 'confirmado', 'realizado', 'nao_compareceu', 'cancelado');

-- CreateEnum
CREATE TYPE "TipoDoacao" AS ENUM ('dinheiro', 'racao', 'medicamento', 'cobertor', 'casinha', 'transporte', 'lar_temporario', 'voluntario');

-- CreateEnum
CREATE TYPE "StatusDoacao" AS ENUM ('pendente', 'confirmado', 'recebido', 'retirado');

-- CreateEnum
CREATE TYPE "TipoCampanha" AS ENUM ('vacinacao', 'castracao', 'adocao', 'arrecadacao');

-- CreateEnum
CREATE TYPE "StatusCampanha" AS ENUM ('ativa', 'encerrada', 'cancelada');

-- CreateEnum
CREATE TYPE "StatusLarTemporario" AS ENUM ('disponivel', 'ocupado', 'inativo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT,
    "cpf" TEXT,
    "telefone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "endereco" JSONB,
    "foto_perfil_url" TEXT,
    "tipo_usuario" "TipoUsuario" NOT NULL DEFAULT 'cidadao',
    "status" "StatusUsuario" NOT NULL DEFAULT 'ativo',
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" "Especie" NOT NULL,
    "raca" TEXT,
    "sexo" "Sexo" NOT NULL,
    "idade_aproximada" TEXT NOT NULL,
    "porte" "Porte" NOT NULL,
    "peso" DOUBLE PRECISION,
    "cor" TEXT,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "videos" JSONB NOT NULL DEFAULT '[]',
    "descricao" TEXT,
    "historia" TEXT,
    "temperamento" JSONB,
    "saude" JSONB,
    "vacinas" JSONB NOT NULL DEFAULT '[]',
    "castrado" BOOLEAN NOT NULL DEFAULT false,
    "vermifugado" BOOLEAN NOT NULL DEFAULT false,
    "compativel_criancas" BOOLEAN NOT NULL DEFAULT true,
    "compativel_animais" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusAnimal" NOT NULL DEFAULT 'disponivel',
    "localizacao" JSONB,
    "responsavel_id" TEXT NOT NULL,
    "clinica_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoptions" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_moradia" "TipoMoradia" NOT NULL,
    "tem_quintal" BOOLEAN NOT NULL,
    "tem_tela_protecao" BOOLEAN NOT NULL,
    "tem_outros_animais" BOOLEAN NOT NULL,
    "ja_adotou_antes" BOOLEAN NOT NULL,
    "motivo_adocao" TEXT NOT NULL,
    "aceita_visita" BOOLEAN NOT NULL,
    "aceita_termo" BOOLEAN NOT NULL,
    "status" "StatusAdocao" NOT NULL DEFAULT 'enviado',
    "observacoes_internas" TEXT,
    "data_aprovacao" TIMESTAMP(3),
    "data_finalizacao" TIMESTAMP(3),
    "termo_pdf_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adoptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "tipo" "TipoChamado" NOT NULL,
    "descricao" TEXT NOT NULL,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "videos" JSONB NOT NULL DEFAULT '[]',
    "localizacao" JSONB NOT NULL,
    "urgencia" "Urgencia" NOT NULL,
    "denunciante_id" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "contato_denunciante" JSONB,
    "status" "StatusChamado" NOT NULL DEFAULT 'recebido',
    "responsavel_id" TEXT,
    "animal_gerado_id" TEXT,
    "historico" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "castrations" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "animal_proprio" BOOLEAN NOT NULL DEFAULT true,
    "quantidade_animais" INTEGER NOT NULL,
    "dados_animais" JSONB NOT NULL,
    "endereco" JSONB NOT NULL,
    "preferencia_data" TIMESTAMP(3),
    "status" "StatusCastracao" NOT NULL DEFAULT 'recebido',
    "data_agendada" TIMESTAMP(3),
    "data_realizada" TIMESTAMP(3),
    "clinica_id" TEXT,
    "mutirao_id" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "castrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veterinarians" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome_clinica" TEXT NOT NULL,
    "crmv" TEXT NOT NULL,
    "especialidade" JSONB NOT NULL DEFAULT '[]',
    "endereco" JSONB NOT NULL,
    "telefone" TEXT NOT NULL,
    "horario_atendimento" JSONB NOT NULL,
    "atende_emergencia" BOOLEAN NOT NULL DEFAULT false,
    "atende_castracao" BOOLEAN NOT NULL DEFAULT false,
    "parceria_social" BOOLEAN NOT NULL DEFAULT false,
    "valor_social" DOUBLE PRECISION,
    "status" "StatusUsuario" NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veterinarians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoDoacao" NOT NULL,
    "descricao" TEXT,
    "quantidade" TEXT,
    "valor" DOUBLE PRECISION,
    "status" "StatusDoacao" NOT NULL DEFAULT 'pendente',
    "data_doacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovante_url" TEXT,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "TipoCampanha" NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "local" JSONB NOT NULL,
    "vagas_total" INTEGER,
    "vagas_ocupadas" INTEGER NOT NULL DEFAULT 0,
    "requisitos" JSONB,
    "documentos_necessarios" JSONB,
    "bairros_atendidos" JSONB,
    "foto_url" TEXT,
    "status" "StatusCampanha" NOT NULL DEFAULT 'ativa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temporary_homes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "endereco" JSONB NOT NULL,
    "tipo_moradia" "TipoMoradia" NOT NULL,
    "espaco_disponivel" TEXT NOT NULL,
    "aceita_especies" JSONB NOT NULL,
    "aceita_portes" JSONB NOT NULL,
    "tempo_disponivel" TEXT NOT NULL,
    "experiencia" TEXT,
    "tem_outros_animais" BOOLEAN NOT NULL,
    "status" "StatusLarTemporario" NOT NULL DEFAULT 'disponivel',
    "animais_atuais" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temporary_homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "dados_anteriores" JSONB,
    "dados_novos" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_cpf_key" ON "users"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "calls_protocolo_key" ON "calls"("protocolo");

-- CreateIndex
CREATE UNIQUE INDEX "calls_animal_gerado_id_key" ON "calls"("animal_gerado_id");

-- CreateIndex
CREATE UNIQUE INDEX "veterinarians_usuario_id_key" ON "veterinarians"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "temporary_homes_usuario_id_key" ON "temporary_homes"("usuario_id");

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoptions" ADD CONSTRAINT "adoptions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_denunciante_id_fkey" FOREIGN KEY ("denunciante_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_animal_gerado_id_fkey" FOREIGN KEY ("animal_gerado_id") REFERENCES "animals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castrations" ADD CONSTRAINT "castrations_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castrations" ADD CONSTRAINT "castrations_clinica_id_fkey" FOREIGN KEY ("clinica_id") REFERENCES "veterinarians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "castrations" ADD CONSTRAINT "castrations_mutirao_id_fkey" FOREIGN KEY ("mutirao_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "veterinarians" ADD CONSTRAINT "veterinarians_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temporary_homes" ADD CONSTRAINT "temporary_homes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
