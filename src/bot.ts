import { Bot, Context } from 'grammy'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
  errorFormat: 'pretty'
})

if (!Bun.env.BOT_TOKEN) throw Error('Token não definido')
const bot = new Bot(Bun.env.BOT_TOKEN)

// async function main() { }
// main().then(async () => { await prisma.$disconnect()  })
//   .catch(async e => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })

async function sendLogToChannel(message: string) {
  try {
    await bot.api.sendMessage(-1002078227059, message)
  } catch (error) {
    console.error('Erro ao enviar log para o canal:', error)
  }
}

async function botHasDeletePermission(chatId: number): Promise<boolean> {
  try {
    const chatMember = await bot.api.getChatMember(chatId, bot.botInfo.id)
    return chatMember.status === 'administrator' && chatMember.can_delete_messages
  } catch (error) {
    console.error('Erro ao verificar permissões do bot:', error)
    return false
  }
}

async function checkIfAdmin(chatId: number, userId: number): Promise<boolean> {
  try {
    const member = await bot.api.getChatMember(chatId, userId)
    return ['administrator', 'creator'].includes(member.status)
  } catch (error) {
    return false
  }
}

// Função para verificar se a mensagem contém conteúdo banido
async function checkBannedWords(ctx: Context) {
  if (!ctx.message || !ctx.from || !ctx.chat || !ctx.msg || !ctx.msg.text) return

  const isAdmin = await checkIfAdmin(ctx.from.id, ctx.chat.id)
  if (isAdmin) return

  const chat = await prisma.chat.findUnique({ where: { cid: ctx.chat.id } })
  if (!chat) return

  const bannedWords = await prisma.bannedContent.findMany({
    where: { chatId: chat.id },
    select: { content: true }
  })

  for (const bannedWord of bannedWords) {
    if (ctx.msg.text.includes(bannedWord.content)) {
      const hasPermission = await botHasDeletePermission(ctx.chat.id)

      if (hasPermission) {
        await ctx.deleteMessage()
        await sendLogToChannel(`Mensagem apagada em @${chat.name} devido ao conteúdo banido: ${bannedWord.content}`)
      }

      break
    }
  }
}

bot.command('add', async ctx => {
  if (ctx.from) {
    const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
    if (!isAdmin) return
  } else {
    return
  }

  const content = ctx.msg.text.split(' ').slice(1).join(' ')
  if (!content) return

  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return

  try {
    let chat = await prisma.chat.findUnique({ where: { cid: ctx.chat.id } })
    if (!chat) chat = await prisma.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } })
    const banned = await prisma.bannedContent.create({ data: { content, chatId: chat.id } })
    await sendLogToChannel(`Mensagem apagada em ${chat.name} devido ao conteúdo banido: ${banned.content}`)
    // await ctx.reply(`Palavra/frase '${content}' banida com sucesso.`)
  } catch (error) {
    console.error(error)
  }

  await ctx.deleteMessage()
})

bot.on('message', async ctx => {
  // const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
  // if (!isAdmin) checkBannedWords(ctx)
  checkBannedWords(ctx)
})

bot.start()
