import { Context } from 'grammy'
import { db, botHasDeletePermission, checkIfAdmin } from '@/utils'

export async function del(ctx: Context) {
  if (!ctx.chat || !ctx.message || !ctx.message?.reply_to_message?.from) return
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return

  const requesterIsAdmin = await checkIfAdmin(ctx.chat.id, ctx.message.from.id)
  if (!requesterIsAdmin) {
    await ctx.reply('Você precisa ser admin para executar este comando.')    
    return
  }

  const deletePermission = await botHasDeletePermission(ctx.chat.id)
  if (!deletePermission) return

  const target = ctx.message.reply_to_message
  if (!target.from) return

  const senderIsAdmin = await checkIfAdmin(ctx.chat.id, target.from.id)
  if (senderIsAdmin) return

  ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id)
  ctx.api.deleteMessage(ctx.chat.id, target.message_id)
}

export async function warn(ctx: Context) {
  if (!ctx.chat || !ctx.message || !ctx.message?.reply_to_message?.from) return
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return

  // ctx.reply(JSON.stringify(ctx.message.from.id, null, 2))
  const requesterIsAdmin = await checkIfAdmin(ctx.chat.id, ctx.message.from.id)
  if (!requesterIsAdmin) {
    await ctx.reply('Você precisa ser admin para executar este comando.')    
    return
  }

  const deletePermission = await botHasDeletePermission(ctx.chat.id)
  if (!deletePermission) return

  const target = ctx.message.reply_to_message
  if (!target.from) return

  const senderIsAdmin = await checkIfAdmin(ctx.chat.id, target.from.id)
  if (senderIsAdmin) return

  ctx.reply(JSON.stringify(target.from.id, null, 2))
  // ctx.reply(JSON.stringify(ctx.message.message_id, null, 2))
  // await bot.api.sendMessage(-1002078227059, JSON.stringify(ctx.message.message_id, null, 2))

  const reason = ctx.message.text?.split(' ').slice(1).join(' ') ?? 'Sem motivo especificado'

  let chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } })
  if (!chat) chat = await db.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } })

  let user = await db.user.findUnique({ where: { uid: target.from.id } })
  if (!user) user = await db.user.create({ data: { uid: target.from.id, nome: target.from.first_name, apelido: target.from.username } })

  const warning = await db.warning.create({ data: { reason, userId: user.id, chatId: chat.id } })
  const warningCount = await db.warning.count({ where: { userId: user.id, chatId: chat.id } })

  // if (warningCount > 3) {
  //   await ctx.banChatMember(ctx.from.id)
  //   ctx.reply(`Usuário banido por acumular mais de 3 warnings.`)
  // }

  const usernameOrFullName = target.from.username ? '@' + target.from.username : target.from.first_name + ' ' + (target.from.last_name ?? '')
  const responseText = `*Usuário* ${usernameOrFullName}\n *Quantidade de Warnings* ${warningCount}\n *Motivo* ${reason}`

  await ctx.reply(responseText, {
    parse_mode: 'MarkdownV2',
    reply_to_message_id: target.message_id,
    reply_markup: {
      inline_keyboard: [[{ text: 'Remover Warning', callback_data: 'remove_warning_' + warning.id }]]
    }
  })

  // await bot.api.sendMessage(ctx.chat.id, msg)
  // ctx.reply(JSON.stringify(ctx.message.message_id, null, 2))
  ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id)
  ctx.api.deleteMessage(ctx.chat.id, target.message_id)
}
