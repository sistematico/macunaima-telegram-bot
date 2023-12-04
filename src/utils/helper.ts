import { bot } from '@/utils'

const logChannel = Bun.env.BOT_LOG_CHANNEL || '-1002078227059'

export function escapeMd(text: string) {
  const specialCharacters = /[_*\[\]()~`>#+-=|{}.!]/g
  return text.replace(specialCharacters, (match) => '\\' + match)
}

export async function sendLogToChannel(message: string) {
  try {
    await bot.api.sendMessage(logChannel, message)
  } catch (error) {
    console.error('Erro ao enviar log para o canal:', error)
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

export async function botHasDeletePermission(chatId: number): Promise<boolean> {
  try {
    const chatMember = await bot.api.getChatMember(chatId, bot.botInfo.id)
    return chatMember.status === 'administrator' && chatMember.can_delete_messages
  } catch (error) {
    console.error('Erro ao verificar permissões do bot:', error)
    return false
  }
}