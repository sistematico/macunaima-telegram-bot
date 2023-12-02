import { Bot, Context } from 'grammy'

const token = Bun.env.BOT_TOKEN
if (!token) throw Error('Token não definido')

const bot = new Bot<Context>(token)

export async function botHasDeletePermission(chatId: number): Promise<boolean> {
  try {
    const chatMember = await bot.api.getChatMember(chatId, bot.botInfo.id)
    return chatMember.status === 'administrator' && chatMember.can_delete_messages
  } catch (error) {
    console.error('Erro ao verificar permissões do bot:', error)
    return false
  }
}

export async function checkIfAdmin(chatId: number, userId: number): Promise<boolean> {
  try {
    const member = await bot.api.getChatMember(chatId, userId)
    return ['administrator', 'creator'].includes(member.status)
  } catch (error) {
    return false
  }
}