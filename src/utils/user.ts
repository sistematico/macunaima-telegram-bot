import { bot } from '@/utils'

export async function checkIfAdmin(chatId: number, userId: number): Promise<boolean> {
  try {
    const member = await bot.api.getChatMember(chatId, userId)
    return ['administrator', 'creator'].includes(member.status)
  } catch (error) {
    return false
  }
}