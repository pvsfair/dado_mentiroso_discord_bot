const game = require('./game')
module.exports={
  commands:[
    {
      command: '^(start|iniciar|jogar|s)$',
      action: game.start_game
    },
    {
      command: '^(dices|dados)$',
      action: game.dices
    },
    {
      command: '^(guess|chute|g)$',
      action: game.guess
    },
    {
      command: '(\\d+)',
      action: game.guess
    },
    {
      command: '^(doubt|duvido|d)$',
      action: game.doubt
    }
  ]
}
