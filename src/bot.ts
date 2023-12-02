import { Hono } from 'hono'
import { Bot, Context, webhookCallback } from 'grammy'

const token = Bun.env.BOT_TOKEN || null
if (!token) throw Error('Token não definido')

const app = new Hono()
const bot = new Bot<Context>(token)

bot.command('start', ctx => ctx.reply('Olá! Eu sou o seu bot!'))
bot.on('message', ctx => ctx.reply('Você disse: ' + ctx.message.text))

app.post('/', webhookCallback(bot, 'hono'))
// app.use(webhookCallback(bot, 'hono'))

export default { // export default app
  port: 3002,
  fetch: app.fetch,
}