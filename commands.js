const gameDiscord = require('./game')
const gameTelegram = require('./game_telegram')
const bot_telegram = require('./bot_telegram')
const commands = {
  discord:[
    {
      command: '^(help|ajuda|h)$',
      action: (msg)=>{
        helpMessage = ""
        commands.discord.forEach(cmd => {
          helpMessage += `${cmd.help}\n`
        });
        helpMessage += "```"
        msg.member.send(helpMessage)
      },
      help: 'Abaixo a lista de comandos do jogo:```'
    },
    {
      command: '^(start|iniciar|s)$',
      action: gameDiscord.start_game,
      help: '!start ou !iniciar - para iniciar um novo jogo'
    },
    {
      command: '^(ready|iwant|gogo|pronto|quero|bora|r)$',
      action: gameDiscord.ready,
      help: '!ready ou !bora - para entrar numa partida em andamento digite'
    },
    {
      command: '^(play|jogar|p)$',
      action: gameDiscord.play,
      help: '!play ou !jogar - para iniciar uma partida aguardando jogadores digite'
    },
    {
      command: '^(finish|stop|parar|fechar|f)$',
      action: gameDiscord.finish,
      help: '!finish ou !fechar - para parar uma partida em andamento digite'
    },
    {
      command: '^(dices|dados)$',
      action: gameDiscord.dices,
      help: '!dices ou !dados - para checar quantos dados tem no jogo digite'
    },
    {
      command: '^(guess|chute|g)$',
      action: gameDiscord.guess,
      help: '!guess [quantidade_de_dados] [dado_pra_apostar] ou somente ![quantidade_de_dados] [dado_pra_apostar] - para fazer um chute digite'
    },
    {
      command: '(\\d+)',
      action: gameDiscord.guess,
      help: 'Exemplo: !1 2 (um duque) ou !19 6 (dezenove senas)'
    },
    {
      command: '^(doubt|duvido|nemfudendo|saidaquicomastuaspotoca|saidaquicomastuaspotocas|porranenhuma|levanta|levantaquenaotem|d)$',
      action: gameDiscord.doubt,
      help: '!doubt ou !duvido - para duvidar do jogador anterior digite'
    },
    // {
    //   command: '^(players|jogadores)$',
    //   action: gameDiscord.players,
    //   help: '!players ou !jogadores'
    // }
  ],
  telegram:[
    {
      command: '^(help|ajuda|h)$',
      action: (msg)=>{
        helpMessage = ""
        commands.telegram.forEach(cmd => {
          helpMessage += `${cmd.help}\n`
        });
        bot_telegram.sendMessage(msg.chat.id, helpMessage)
      },
      help: 'Abaixo a lista de comandos do jogo:'
    },
    {
      command: '^(start|iniciar|s)$',
      action: gameTelegram.start_game,
      help: '/start ou /iniciar - para iniciar um novo jogo'
    },
    {
      command: '^(ready|iwant|gogo|pronto|quero|bora|r)$',
      action: gameTelegram.ready,
      help: '/ready ou /bora - para entrar numa partida em andamento digite'
    },
    {
      command: '^(play|jogar|p)$',
      action: gameTelegram.play,
      help: '/play ou /jogar - para iniciar uma partida aguardando jogadores digite'
    },
    {
      command: '^(finish|stop|parar|fechar|f)$',
      action: gameTelegram.finish,
      help: '/finish ou /fechar - para parar uma partida em andamento digite'
    },
    {
      command: '^(dices|dados)$',
      action: gameTelegram.dices,
      help: '/dices ou /dados - para checar quantos dados tem no jogo digite'
    },
    {
      command: '^(guess|chute|g)$',
      action: gameTelegram.guess,
      help: '/guess [quantidade_de_dados] [dado_pra_apostar] ou somente /[quantidade_de_dados] [dado_pra_apostar] - para fazer um chute digite'
    },
    {
      command: '(\\d+)',
      action: gameTelegram.guess,
      help: 'Exemplo: /1 2 (um duque) ou /19 6 (dezenove senas)'
    },
    {
      command: '^(doubt|duvido|d)$',
      action: gameTelegram.doubt,
      help: '/doubt ou /duvido - para duvidar do jogador anterior digite'
    }
  ]
}

module.exports=commands