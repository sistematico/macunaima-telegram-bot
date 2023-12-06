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

app.post('/', webhookCallback(bot, 'hono'))

export default { port: 3002, fetch: app.fetch }
