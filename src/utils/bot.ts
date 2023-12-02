import { Bot, Context } from 'grammy'

const token = Bun.env.BOT_TOKEN
if (!token) throw Error('Token não definido')

export const bot = new Bot<Context>(token)