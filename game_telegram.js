const logger = require('./logger')
const Dice = require('./dice_sides.json')
const config = require('./config.json')
const commands = require('./commands')
const bot = require('./bot_telegram')

//{
//  status: GAME_STATUSES
//  chatID: chatID,
//  players: [],
//  playerPlaying: userId,
//  playerPlaying: 0,
//  guessAmount: 0,
//  guessDice: 0,
//  guessAmountBeforeBago:0,
//  guessDiceBeforeBago:0,
//  guesses: [],
//}
var games = []

var GAME_STATUSES={
  WAITING_FOR_PLAYERS: 0,
  IN_GAME: 1
}

function sendMessage(chatId, msg){
  bot.sendMessage(chatId, msg, {parse_mode:"Markdown"})
}

function get_game(chatID){
  return games.find(game => game.chatID === chatID)
}

function getUserMention(user){
  return `[inline mention of a user](tg://user?id=${user.id})`
}

function gameFactory(chatID){
  return {
    status: GAME_STATUSES.WAITING_FOR_PLAYERS,
    chatID: chatID,
    players: [],
    playerPlaying: 0,
    guessAmount: 0,
    guessDice: 0,
    guessAmountBeforeBago:0,
    guessDiceBeforeBago:0,
    guesses: [],
  }
}

function shufflePlayers(players) {
  for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
  }
  return players
}

function printPlayerOrder(game){
  const {chatID, players} = game
  var string = "A ordem dos jogadores:\n"
  var i = 0
  players.forEach(member=>{
    if(member.n_dices <= 0)
      return
    string += `${++i} - ${getUserMention(member)}\n`
  })
  sendMessage(chatID, string)
}

function getAllDices(game){
  allDicesFromPlayers = "Os dados dos jogadores nesta rodada:\n"
  game.players.forEach(user=>{
    if(member.n_dices <= 0)
      return
    allDicesFromPlayers += `${user.dices.map(d=>Dice[d]).join(' ')}`
  })
  return allDicesFromPlayers
}

function rollDices(game){
  const {players} = game
  players.forEach(member=>{
    const member_dices = []
    if(member.n_dices == 0){
      player.send(getAllDices(game))
    }
    for (let i = 0; i < member.n_dices; i++) {
      member_dices.push(Math.floor(Math.random()*6)+1)
    }
    member.dices = member_dices
    if(member.n_dices <= 0)
      return 
    sendMessage(member.id, member_dices.map(dice=>Dice[dice]).join(' '))
  })
  players.filter(m=>m.n_dices <= 0).forEach(member=>{
    sendMessage(member.id, getAllDices(game))
  })
}

function countDicesInGame(game){
  const {players} = game
  var total = 0
  players.forEach(member=>{
    total += member.dices.length
  })
  return total
}

function dicesInGame(game){
  const {chatID} = game
  sendMessage(chatID, `${countDicesInGame(game)} dados em jogo`)
}

function getPlayerPlaying(game){
  return game.players[game.playerPlaying]
}

function getLastPlayerIndex(game){
  var i = game.playerPlaying - 1
  if(i < 0)
    i = game.players.length - 1
  var player = game.players[i]
  while (player.n_dices <= 0){
    i--
    if(i < 0)
      i = game.players.length - 1
    player = game.players[i]
  } 
  return i
}

function getLastPlayer(game){
  return game.players[getLastPlayerIndex(game)]
}

function setNextPlayer(game){
  var nextPlayer = game.playerPlaying + 1
  if(nextPlayer >= game.players.length)
    nextPlayer = 0
  while(game.players[nextPlayer].n_dices <= 0){
    nextPlayer++
    if(nextPlayer >= game.players.length)
      nextPlayer = 0
  }
  game.playerPlaying = nextPlayer
}

function whoShouldPlay(game){
  sendMessage(game.chatID, `Vez de: ${getUserMention(getPlayerPlaying(game))}`)
}

function getAmountPlayersInGame(game){
  var amount = 0
  game.players.forEach(member=>{
    if(member.n_dices > 0)
      amount++
  })
  return amount
}

function sendMessageToJoin(game){
  sendMessage(game.chatID, 'Quem quiser jogar esta partida é só mandar /bora  \nE para iniciar o jogo basta digitar /jogar')
}

function markPlayerReady(game, user){
  const {chatID} = game
  user.n_dices = config.n_dices
  if(game.players.includes(user)){
    game.players.splice(game.players.indexOf(user), 1)
  }else{
    game.players.push(user)
  }
}

function finishGame(game){
  games.splice(games.indexOf(game), 1)
}

module.exports = {
  start_game(msg){
    const chatId = msg.chat.id
    const found = get_game(chatId)
    if(found !== undefined){
      sendMessage(chatID, "Um jogo já foi iniciado neste canal de voz")
      if(game.status==GAME_STATUSES.WAITING_FOR_PLAYERS)
        sendMessage(chatID, "Pra entrar na partida basta mandar /bora neste canal, e pra iniciar a partida mande /jogar")
      return
    }
    game = gameFactory(chatId)
    games.push(game)

    sendMessageToJoin(game)
    markPlayerReady(game, msg.from)
  },
  ready(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId, "Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    if(game.status == GAME_STATUSES.IN_GAME){
      sendMessage(chatId, "Esta partida já começou, aguarde pra participar da próxima partida!")
      return
    }
    if(game.status == GAME_STATUSES.WAITING_FOR_PLAYERS){
      markPlayerReady(game, msg.member)
    }
  },
  play(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId, "Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    if(game.status == GAME_STATUSES.IN_GAME){
      sendMessage(chatId, "Você não pode começar uma partida que já começou!")
      return
    }
    if(game.players.length < 2){
      sendMessage(chatId, "Não é possível iniciar um jogo com menos de duas pessoas")
      return
    }
    game.status = GAME_STATUSES.IN_GAME

    shufflePlayers(game.players)
    printPlayerOrder(game)
    rollDices(game)
    whoShouldPlay(game)
  },
  finish(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId, "Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    sendMessage(chatId, `O jogo vai ser finalizado. Para iniciar um novo jogo digite /start`)
    finishGame(game)
  },
  dices(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId, "Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    dicesInGame(game)
  },
  guess(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId, "Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    if(msg.from.id != getPlayerPlaying(game).id){
      sendMessage(chatId, "Não é sua vez de jogar ainda.")
      return
    }
    content = msg.text.substring(1)
    if(content.startsWith('guess ')){
      content = content.substring(6).trim()
    }

    const [amount, dice] = content.match(/(\d+)/g).map(num=>parseInt(num))
    
    if(amount == undefined || dice == undefined){
      sendMessage(chatId, "Aposta inválida!")
      return
    }

    const dadosEmJogo = countDicesInGame(game)
    if(amount > dadosEmJogo || amount < 1){
      sendMessage(chatId, `Aposta inválida! A quantidade de dados não pode ser maior do que a quantidade de dados em jogo. [${dadosEmJogo}]`)
      return 
    }
    if(dice < 1 || dice > 6){
      sendMessage(chatId, 'Aposta inválida! A face do dado não pode ser menor que 1 ou maior que 6.')
      return
    }
    if(game.guesses.includes({amount, dice})){
      sendMessage(chatId, 'Aposta inválida! Esta aposta já foi realizada nesta rodada.')
      return
    }
    const lastGuess = {amount: game.guessAmount, dice: game.guessDice}

    if((amount == lastGuess.amount && lastGuess.dice != 1 && dice > lastGuess.dice)
    || (amount > lastGuess.amount && ((dice == 1 && lastGuess.dice == 1) || (dice != 1 && lastGuess.dice != 1)))
    || (dice == 1 && lastGuess.dice != 1 && amount >= Math.ceil(lastGuess.amount/2))
    || (dice != 1 && lastGuess.dice == 1 && amount >= lastGuess.amount*2 
      && (amount > game.guessAmountBeforeBago || amount == game.guessAmountBeforeBago && dice > game.guessDiceBeforeBago))
    ){
      game.guesses.push({amount, dice})
      game.guessAmount = amount
      game.guessDice = dice
      if(dice != 1){
        game.guessAmountBeforeBago = amount
        game.guessDiceBeforeBago = dice
      }
      setNextPlayer(game)
      sendMessage(chatId, `Sua aposta: ${amount} ${Dice[dice]}`)
      whoShouldPlay(game)
    }else{
      msg.channel.send('Aposta Inválida!')
    }
  },
  doubt(msg){
    const chatId = msg.chat.id
    const game = get_game(chatId)
    if(game === undefined){
      sendMessage(chatId,"Este canal de voz não tem um jogo em adamento, use o comando /start para iniciar um jogo")
      return
    }
    if(msg.member.user.id != getPlayerPlaying(game).user.id){
      sendMessage(chatId, "Não é sua vez de jogar ainda.")
      return
    }
    const lastGuess = {amount: game.guessAmount, dice: game.guessDice}
    if(lastGuess.dice == 0 || lastGuess.amount == 0){
      sendMessage(chatId, "Você não pode duvidar na primeira jogada!")
      return
    }
    totalDices = 0
    allDicesFromPlayers = "Os dados dos jogadores nesta rodada:\n"
    game.players.forEach(member=>{
      allDicesFromPlayers += `${getUserMention(member)} ${member.dices.map(d=>Dice[d]).join(' ')}\n`
      member.dices.forEach(dice=>{
        if(dice == lastGuess.dice || dice == 1)
          totalDices++
      })
    })

    sendMessage(chatId, allDicesFromPlayers)
    var member = {}
    var whoShouldStartNextRound = -1
    if(lastGuess.amount <= totalDices){
      whoShouldStartNextRound = game.playerPlaying
      member = getPlayerPlaying(game)
    }else{
      whoShouldStartNextRound = getLastPlayerIndex(game)
      member = getLastPlayer(game)
    }
    sendMessage(chatId, `${getUserMention(member)} perdeu um dado!`)
    member.n_dices--
    
    var n_players = getAmountPlayersInGame(game)

    if(n_players == 1){
      const winner = game.players.filter(member => member.n_dices > 0)[0]
      sendMessage(chatId, `${getUserMention(winner)} ganhou a partida! E merece toda a glória e pompa de um exímio jogador de Dadinho`)
      finishGame(game)
      return 
    }

    if(member.n_dices <= 0){
      member.n_dices = 0
      sendMessage(chatId, `O jogador ${getUserMention(member)} ficou sem dados! E agora irá ver todos os dados no inicio de cada rodada!`)
    }

    while(game.players[whoShouldStartNextRound].n_dices <= 0){
      whoShouldStartNextRound++
    }

    game.guessAmount = 0,
    game.guessDice = 0,
    game.guessAmountBeforeBago = 0,
    game.guessDiceBeforeBago = 0,
    game.guesses = []
    game.playerPlaying = whoShouldStartNextRound
    
    rollDices(game)
    whoShouldPlay(game)
  }
}