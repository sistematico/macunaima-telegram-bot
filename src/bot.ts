import { Hono } from 'hono'
import { GrammyError, HttpError, webhookCallback } from 'grammy'
import { bot, db, warn, checkIfAdmin, checkBannedWords, addBannedWord, sendLogToChannel } from '@/utils'

const app = new Hono()

sendLogToChannel('🚀 Bot reiniciado: ' + new Date())

bot.command('ping', (ctx) => ctx.reply('🤚 Pong!'))
bot.command(['add_banned_word', 'addword'], async ctx => addBannedWord(ctx))
bot.command(['reportar', 'report', 'warn'], async ctx => warn(ctx))

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

bot.on('message', async ctx => checkBannedWords(ctx))

if (Bun.env.NODE_ENV === 'production') {
  app.get('/', c => c.text('Macunaíma Telegram Bot'))
  app.post('/', webhookCallback(bot, 'hono'))
} else {
  bot.catch(err => {
    const ctx = err.ctx
    console.error(`Error while handling update ${ctx.update.update_id}:`)
    const e = err.error
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description)
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e)
    } else {
      console.error('Unknown error:', e)
    }
  })

  bot.start()
}

export default {
  port: 3002,
  fetch: app.fetch
}