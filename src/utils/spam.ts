import { Context } from 'grammy'
import { db, botHasDeletePermission, checkIfAdmin, sendLogToChannel } from '@/utils'

export async function checkBannedWords(ctx: Context) {
  if (!ctx.message || !ctx.from || !ctx.chat || !ctx.msg || !ctx.msg.text) return

  const isAdmin = await checkIfAdmin(ctx.from.id, ctx.chat.id)
  if (isAdmin) return

  const chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } })
  if (!chat) return

  const bannedWords = await db.bannedContent.findMany({
    where: { chatId: chat.id },
    select: { content: true }
  })

  for (const bannedWord of bannedWords) {
    if (ctx.msg.text.includes(bannedWord.content)) {
      const hasPermission = await botHasDeletePermission(ctx.chat.id)

      if (hasPermission) {
        await ctx.deleteMessage()
        await sendLogToChannel(`Mensagem apagada em @${chat.name} devido ao conteúdo banido: ${bannedWord.content}`)
      }

      break
    }
  }
}