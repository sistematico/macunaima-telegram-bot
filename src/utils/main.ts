import { Filter, Context } from 'grammy'
import { db, checkIfAdmin } from '@/utils'

export async function botCallBack(ctx: Filter<Context, 'callback_query:data'>) {
  const callbackData = ctx.callbackQuery.data
  
  if (!ctx.chat || !callbackData.startsWith('remove_warning')) return await ctx.answerCallbackQuery()

  const warningId = Number(callbackData.split('_').pop())
  const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
  
  if (isAdmin) {
    await db.warning.deleteMany({ where: { id: warningId } })
    await ctx.deleteMessage()
    await ctx.answerCallbackQuery('Warning removido.')
  } else {
    await ctx.answerCallbackQuery('Você não tem permissão para fazer isso.')
  }
}

