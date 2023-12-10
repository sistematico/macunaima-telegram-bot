import { Hono } from 'hono'
import { webhookCallback } from 'grammy'
import { bot, warn, botCallBack, checkBannedWords, addBannedWord, sendLogToChannel } from '@/utils'

const app = new Hono()

sendLogToChannel('🚀 Bot reiniciado: ' + new Date())

bot.command('ping', ctx => ctx.reply('🤚 Pong!'))
bot.command(['add_banned_word', 'addword'], async ctx => addBannedWord(ctx))
bot.command(['reportar', 'report', 'warn'], async ctx => warn(ctx))

bot.on('callback_query:data', async ctx => botCallBack(ctx))
bot.on('message', async ctx => checkBannedWords(ctx))

// app.post('/', webhookCallback(bot, 'hono'))
app.get('/', c => c.text('Macunaíma'))

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const webhookUrl = Bun.env.BOT_URL
  if (!webhookUrl) throw new Error('BOT_URL is required for production mode')

  bot.api.setWebhook(webhookUrl)
  app.post('/', webhookCallback(bot, 'hono'))

  sendLogToChannel('🚀 Bot reiniciado em modo de produção: ' + new Date())
} else {
  bot.start()
  sendLogToChannel('🚀 Bot reiniciado em modo de desenvolvimento: ' + new Date())
}

export default { port: 3002, fetch: app.fetch }
