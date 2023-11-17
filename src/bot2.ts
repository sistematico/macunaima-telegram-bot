import { Bot } from 'grammy'

if (!Bun.env.BOT_TOKEN) throw Error('Token não definido')
const bot = new Bot(Bun.env.BOT_TOKEN)

bot.on('message', ctx => {
  ctx.reply(`ID do Chat: ${ctx.chat.id}`)
})

bot.start()
