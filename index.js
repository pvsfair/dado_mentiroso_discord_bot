const logger = require('./logger')
const commands = require('./commands').commands
const bot = require('./bot')
require('./home')

bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', (msg)=> {
  const {content, channelID} = msg
  if (content.substring(0, 1) == '!') {
      var args = content.substring(1).trim().split(' ');
      var cmd = args[0];
     
      args = args.splice(1);
      commands.forEach(command => {
        if(cmd.match(new RegExp(command.command, 'gi'))){
          command.action(msg)
        }
      });
   }
});