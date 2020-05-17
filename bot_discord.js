const Discord = require('discord.js')
const logger = require('./logger')

const bot = new Discord.Client()
bot.login(process.env.BOT_TOKEN)

bot.on('ready', function (evt) {
  logger.info('Connected')
  logger.info('Logged in as: ')
  logger.info(bot.username + ' - (' + bot.id + ')')
});

module.exports = bot