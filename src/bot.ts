import { Bot } from 'grammy'

const token: string | null = Bun.env.BOT_TOKEN || null
if (!token) throw Error('Token não definido')
const bot = new Bot(token)


bot.command('start', ctx => ctx.reply('Welcome! Up and running.'))
// bot.on('message', ctx => ctx.reply('Got another message!'))

bot.start()
