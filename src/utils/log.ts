import { bot } from '@/utils'

export async function sendLogToChannel(message: string) {
  try {
    await bot.api.sendMessage(-1002078227059, message)
  } catch (error) {
    console.error('Erro ao enviar log para o canal:', error)
  }
}