const Telegram = require('node-telegram-bot-api')
const bot = new Telegram(process.env.BOT_TELEGRAM_TOKEN, {polling: true})

module.exports = bot