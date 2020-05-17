const game = require('./game')
module.exports={
  commands:[
    {
      command: '^(start|iniciar|s)$',
      action: game.start_game,
      help: 'Para iniciar um novo jogo digite !start ou !iniciar'
    },
    {
      command: '^(ready|iwant|gogo|pronto|quero|bora|r)$',
      action: game.ready,
      help: 'Para entrar numa partida em andamento digite !ready ou !bora'
    },
    {
      command: '^(play|jogar|p)$',
      action: game.play,
      help: 'Para iniciar uma partida aguardando jogadores digite !play ou !jogar'
    },
    {
      command: '^(finish|stop|parar|fechar|f)$',
      action: game.finish,
      help: 'Para parar uma partida em andamento digite !finish ou !fechar'
    },
    {
      command: '^(dices|dados)$',
      action: game.dices,
      help: 'Para checar quantos dados tem no jogo digite !dices ou !dados'
    },
    {
      command: '^(guess|chute|g)$',
      action: game.guess,
      help: 'Para fazer um chute digite !guess [quantidade_de_dados] [dado_pra_apostar] ou somente ![quantidade_de_dados] [dado_pra_apostar]'
    },
    {
      command: '(\\d+)',
      action: game.guess,
      help: 'Exemplo: !1 2 (um duque) ou !19 6 (dezenove senas)'
    },
    {
      command: '^(doubt|duvido|d)$',
      action: game.doubt,
      help: 'Para duvidar do jogador anterior digite !doubt ou !duvido'
    }
  ]
}
