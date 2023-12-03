import { Context } from 'grammy'
import { db, botHasDeletePermission, checkIfAdmin, sendLogToChannel } from '@/utils'

export async function userOrGroup(ctx: Context) {
  if (!ctx.from || !ctx.chat) return
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return
    
  const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
  if (!isAdmin) return

  const content = ctx.msg && ctx.msg.text ? ctx.msg.text.split(' ').slice(1).join(' ') : null
  if (!content) return

  try {
    let chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } });
    if (!chat) chat = await db.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } });
    await db.bannedContent.create({ data: { content, chatId: chat.id } });

    // ctx.reply("Palavra/Frase banida adicionada: " + content + " ao grupo: " + ctx.chat.title)
    await sendLogToChannel("Palavra/Frase banida adicionada: " + content + " ao grupo: " + ctx.chat.title)
    // await sendLogToChannel(`Mensagem apagada em ${chat.name} devido ao conteúdo banido: ${banned.content}`);
  } catch (error) {
    console.error(error)
  }
  await ctx.deleteMessage()
}

export async function addBannedWord(ctx: Context) {
  if (!ctx.from || !ctx.chat) return
  if (ctx.chat.type !== 'group' && ctx.chat.type !== 'supergroup') return
    
  const isAdmin = await checkIfAdmin(ctx.chat.id, ctx.from.id)
  if (!isAdmin) return

  const content = ctx.msg && ctx.msg.text ? ctx.msg.text.split(' ').slice(1).join(' ') : null
  if (!content) return

  try {
    let chat = await db.chat.findUnique({ where: { cid: ctx.chat.id } });
    if (!chat) chat = await db.chat.create({ data: { cid: ctx.chat.id, name: ctx.chat.title } });
    await db.bannedContent.create({ data: { content, chatId: chat.id } });
    const message = "Palavra/Frase banida adicionada: " + content + " ao grupo: " + ctx.chat.title
    await sendLogToChannel(message)
  } catch (error) {
    console.error(error)
  }
}

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
        let groupName: string | number | undefined = ctx.chat.id

        if (ctx.chat && 'username' in ctx.chat) {
          groupName = ctx.chat.username
        } else if (ctx.chat && 'title' in ctx.chat) {
          groupName = ctx.chat.title
        }        

        const groupInfo = JSON.stringify(ctx.chat, null, 2)
        await sendLogToChannel(groupInfo)
        await sendLogToChannel(`Mensagem apagada em @${groupName} devido ao conteúdo banido: ${bannedWord.content}`)
        await ctx.deleteMessage()
      }

      break
    }
  }
}