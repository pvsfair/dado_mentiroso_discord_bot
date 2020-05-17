const game = require('./game')
const commands = {
  commands:[
    {
      command: '^(help|ajuda|h)$',
      action: (msg)=>{
        helpMessage = ""
        commands.commands.forEach(cmd => {
          helpMessage += `${cmd.help}\n`
        });
        msg.member.send(helpMessage)
      },
      help: 'Abaixo a lista de comandos do jogo:'
    },
    {
      command: '^(start|iniciar|s)$',
      action: game.start_game,
      help: '!start ou !iniciar - para iniciar um novo jogo'
    },
    {
      command: '^(ready|iwant|gogo|pronto|quero|bora|r)$',
      action: game.ready,
      help: '!ready ou !bora - para entrar numa partida em andamento digite'
    },
    {
      command: '^(play|jogar|p)$',
      action: game.play,
      help: '!play ou !jogar - para iniciar uma partida aguardando jogadores digite'
    },
    {
      command: '^(finish|stop|parar|fechar|f)$',
      action: game.finish,
      help: '!finish ou !fechar - para parar uma partida em andamento digite'
    },
    {
      command: '^(dices|dados)$',
      action: game.dices,
      help: '!dices ou !dados - para checar quantos dados tem no jogo digite'
    },
    {
      command: '^(guess|chute|g)$',
      action: game.guess,
      help: '!guess [quantidade_de_dados] [dado_pra_apostar] ou somente ![quantidade_de_dados] [dado_pra_apostar] - para fazer um chute digite'
    },
    {
      command: '(\\d+)',
      action: game.guess,
      help: 'Exemplo: !1 2 (um duque) ou !19 6 (dezenove senas)'
    },
    {
      command: '^(doubt|duvido|d)$',
      action: game.doubt,
      help: '!doubt ou !duvido - para duvidar do jogador anterior digite'
    }
  ]
}

module.exports=commands