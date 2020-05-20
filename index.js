require('dotenv/config')
require('./home')
const commands = require('./commands')
// const bot_telegram = require('./bot_telegram')

// bot_telegram.on('message', async(msg)=>{
//   if(msg.from.is_bot)
//     return

//   if (content.substring(0, 1) == '/') {
//       var args = content.substring(1).trim().split(' ');
//       var cmd = args[0];
      
//       args = args.splice(1);
//       commands.telegram.forEach(command => {
//         if(cmd.match(new RegExp(command.command, 'gi'))){
//           command.action(msg)
//         }
//       });
//    }
// })

const bot_discord = require('./bot_discord')

bot_discord.on('message', (msg)=> {
  if(msg.channel.type == 'dm'){
    return
  }
  
  const {content} = msg
  if (content.substring(0, 1) == '!') {
      var args = content.substring(1).trim().split(' ');
      var cmd = args[0];
      console.log(cmd)
      args = args.splice(1);
      commands.discord.forEach(command => {
        if(cmd.match(new RegExp(command.command, 'gi'))){
          if(cmd == cmd.toUpperCase() && isNaN(cmd))
            msg.channel.send("NÃO GRITA CARAMBA!")
          command.action(msg)
        }
      });
   }
});