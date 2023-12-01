import { Hono } from 'hono'
import { GrammyAdapter } from 'hono/grammy'
import { Bot, Context } from 'grammy'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
  errorFormat: 'pretty'
})

// Configurar o servidor Hono
const app = new Hono()

if (!Bun.env.BOT_TOKEN) throw Error('Token não definido')
const token = Bun.env.BOT_TOKEN

// const bot = new Bot(Bun.env.BOT_TOKEN)
const bot = new Bot<Context>(token)


// Configurar o comportamento do bot
bot.command('start', ctx => ctx.reply('Olá! Eu sou o seu bot!'))
bot.on('message', ctx => ctx.reply('Você disse: ' + ctx.message.text))







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

bot.command(['add_banned_word'], async ctx => {
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
  } catch (error) {
    console.error(error)
  }
  await ctx.deleteMessage()
})

bot.command(['reportar', 'report', 'warn'], async ctx => {
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return

  if (ctx.message?.reply_to_message) {
    ctx.reply(JSON.stringify(ctx.message, null, 2))

    const targetMessage = ctx.message.reply_to_message
    const reason = ctx.message.text.split(' ').slice(1).join(' ')

    let user = await prisma.user.findUnique({ where: { uid: ctx.from.id } })
    if (!user) user = await prisma.user.create({ data: { uid: ctx.from.id, nome: ctx.from.first_name, apelido: ctx.from.username } })

    let chat = await prisma.chat.findUnique({ where: { cid: ctx.chat.id } })
    if (!chat) chat = await prisma.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } })

    const warningCount = await prisma.warning.count({ where: { userId: user.id, chatId: chat.id } })

    if (warningCount > 3) {
      await ctx.banChatMember(ctx.from.id)
      ctx.reply(`Usuário banido por acumular mais de 3 warnings.`)
    }

    const warning = await prisma.warning.create({ data: { reason, userId: user.id, chatId: chat.id } })

    // Obter o nome de usuário ou o nome completo
    const usernameOrFullName = ctx.from.username 
      ? '@' + ctx.from.username 
      : ctx.from.first_name + ' ' + (ctx.from.last_name ?? '')

    // Formatar a mensagem em Markdown
    const responseText = `*Usuário*: ${usernameOrFullName}\n` + `*Quantidade de Warnings*: ${warningCount}\n` + `*Motivo*: ${reason}`

    // await ctx.reply(responseText, {
    //   parse_mode: 'MarkdownV2',
    //   reply_to_message_id: targetMessage.message_id
    // })

    // await ctx.reply('Warning adicionado com sucesso.', {
    await ctx.reply(responseText, {
      parse_mode: 'MarkdownV2',
      reply_to_message_id: targetMessage.message_id,
      reply_markup: {
        inline_keyboard: [[{ text: 'Remover Warning', callback_data: 'remove_warning_' + warning.id }]]
      }
    })

    // await ctx.reply('Warning adicionado com sucesso.', {
    //   reply_to_message_id: targetMessage.message_id,
    //   reply_markup: {
    //     inline_keyboard: [[{ text: 'Remover Warning', callback_data: 'remove_warning_' + warning.id }]]
    //   }
    // })

    // Apagar a mensagem original e o comando
    await ctx.api.deleteMessage(ctx.chat.id, targetMessage.message_id)

    // await ctx.deleteMessage();
  } else {
    ctx.reply('Por favor, responda à mensagem do usuário que você deseja reportar.')
  }
})

bot.on('callback_query:data', async ctx => {
  const callbackData = ctx.callbackQuery.data

  if (typeof callbackData === 'string' && ctx.chat) {
    if (callbackData.startsWith('remove_warning_')) {
      const warningId = parseInt(callbackData.split('_').pop() ?? '0', 10)
      const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
      if (isAdmin) {
        await prisma.warning.deleteMany({ where: { id: warningId } })
        ctx.answerCallbackQuery('Warning removido.')
        await ctx.deleteMessage()
      } else {
        ctx.answerCallbackQuery('Você não tem permissão para fazer isso.')
      }
    }
  }
})

bot.on('message', async ctx => {
  // const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
  // if (!isAdmin) checkBannedWords(ctx)
  checkBannedWords(ctx)
})

// Configurar o GrammyAdapter com o token do seu bot
const adapter = new GrammyAdapter(token)
app.use('/webhook', adapter.webhook())

// Iniciar o bot com Grammy
adapter.run(bot)

// Iniciar o servidor Hono
app.listen({ port: 3000 })

// bot.start()
