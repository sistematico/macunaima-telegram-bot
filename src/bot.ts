import { Hono } from 'hono'
import { Bot, Context, webhookCallback } from 'grammy'
import { db, checkIfAdmin, checkBannedWords, sendLogToChannel } from '@/utils'

const token = Bun.env.BOT_TOKEN
if (!token) throw Error('Token não definido')

const app = new Hono()
const bot = new Bot<Context>(token)

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
    let chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } })
    if (!chat) chat = await db.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } })
    const banned = await db.bannedContent.create({ data: { content, chatId: chat.id } })
    await sendLogToChannel(`Mensagem apagada em ${chat.name} devido ao conteúdo banido: ${banned.content}`)
  } catch (error) {
    console.error(error)
  }
  await ctx.deleteMessage()
})

bot.command(['reportar', 'report', 'warn'], async ctx => {
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return

  if (ctx.message?.reply_to_message) {
    // ctx.reply(JSON.stringify(ctx.message, null, 2))

    const targetMessage = ctx.message.reply_to_message
    const reason = ctx.message.text.split(' ').slice(1).join(' ')

    let user = await db.user.findUnique({ where: { uid: ctx.from.id } })
    if (!user) user = await db.user.create({ data: { uid: ctx.from.id, nome: ctx.from.first_name, apelido: ctx.from.username } })

    let chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } })
    if (!chat) chat = await db.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } })

    const warningCount = await db.warning.count({ where: { userId: user.id, chatId: chat.id } })

    // if (warningCount > 3) {
    //   await ctx.banChatMember(ctx.from.id)
    //   ctx.reply(`Usuário banido por acumular mais de 3 warnings.`)
    // }

    const warning = await db.warning.create({ data: { reason, userId: user.id, chatId: chat.id } })

    const usernameOrFullName = ctx.from.username 
      ? '@' + ctx.from.username 
      : ctx.from.first_name + ' ' + (ctx.from.last_name ?? '')

    const responseText = `*Usuário*: ${usernameOrFullName}\n` + `*Quantidade de Warnings*: ${warningCount}\n` + `*Motivo*: ${reason}`

    await ctx.reply(responseText, {
      parse_mode: 'MarkdownV2',
      reply_to_message_id: targetMessage.message_id,
      reply_markup: {
        inline_keyboard: [[{ text: 'Remover Warning', callback_data: 'remove_warning_' + warning.id }]]
      }
    })

    await ctx.api.deleteMessage(ctx.chat.id, targetMessage.message_id)
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
        await db.warning.deleteMany({ where: { id: warningId } })
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

if (Bun.env.NODE_ENV === 'production') {
  app.get('/', c => c.text('Macunaíma Telegram Bot'))
  app.post('/', webhookCallback(bot, 'hono'))
} else {
  bot.start()
}

export default { // export default app
  port: 3002,
  fetch: app.fetch,
}