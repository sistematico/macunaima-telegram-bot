const token = Bun.env.BOT_TOKEN
if (!token) throw Error('Token não definido')

const botUrl = Bun.env.BOT_URL ? encodeURIComponent(Bun.env.BOT_URL) : null
if (!botUrl) throw Error('WebHook URL não definida')

const webhookUrl = `https://api.telegram.org/bot${token}/setWebhook?url=${botUrl}`

async function setWebhook() {
  try {
    const response = await fetch(webhookUrl)
    const data = await response.json()
    console.log('WebHook configurado:', data)
  } catch (error) {
    console.error('Erro ao configurar o webhook:', error)
  }
}

setWebhook()