const logger = require('./logger')
const Dice = require('./dice_sides.json')
const config = require('./config.json')

//{
//  voiceChannelID: voiceChannelID,
//  txtChannel:{},
//  players: [],
//  playerPlaying: userId
//}
var games = []

function get_game(voiceChannelID){
  return games.find(game => game.voiceChannelID === voiceChannelID)
}

function getMemberMention(member){
  return `<@${member.user.id}>`
}

function gameFactory(voiceChannelID, txtChannel){
  return {
    voiceChannelID: voiceChannelID,
    txtChannel: txtChannel,
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
  const {txtChannel, players} = game
  var string = "A ordem dos jogadores:\n"
  var i = 0
  players.forEach(member=>{
    if(member.n_dices <= 0)
      return
    string += `${++i} - ${getMemberMention(member)}\n`
  })
  txtChannel.send(string)
}

function getAllDices(game){
  allDicesFromPlayers = "Os dados dos jogadores nesta rodada:\n"
  game.players.forEach(member=>{
    allDicesFromPlayers += `${getMemberMention(member)} ${member.dices.map(d=>Dice[d]).join(' ')}\n`
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
    member.send(member_dices.map(dice=>Dice[dice]).join(' '))
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
  const {txtChannel} = game
  txtChannel.send(`${countDicesInGame(game)} dados em jogo`)
}

function getPlayerPlaying(game){
  return game.players[game.playerPlaying]
}

function getLastPlayerIndex(game){
  var player = {}
  var i = -1
  do{
    i = game.playerPlaying - 1
    if(i < 0)
      i = game.players.length - 1
    player = game.players[i]
  } while (player.n_dices <= 0)
  return i
}

function getLastPlayer(game){
  return game.players[getLastPlayerIndex(game)]
}

function setNextPlayer(game){
  var nextPlayer = -1
  do{
    nextPlayer = game.playerPlaying + 1
    if(nextPlayer >= game.players.length)
      nextPlayer = 0
  }while(game.players[nextPlayer].n_dices <= 0)
  game.playerPlaying = nextPlayer
}

function whoShouldPlay(game){
  game.txtChannel.send(`Vez de: ${getMemberMention(getPlayerPlaying(game))}`)
}

function getAmountPlayersInGame(game){
  var amount = 0
  game.players.forEach(member=>{
    if(members.n_dices > 0)
      amount++
  })
  return amount
}

module.exports = {
  start_game(msg){
    voiceChannelID = msg.member.voice.channelID
    const found = get_game(voiceChannelID)
    if(found !== undefined){
      msg.channel.send("Um jogo já foi iniciado neste canal de voz")
      return
    }
    game = gameFactory(voiceChannelID, msg.channel)

    msg.member.voice.channel.members.forEach(member => {
      if(member.user.bot)
        return
      member.n_dices = config.dices_per_game
      game.players.push(member)
    });
    shufflePlayers(game.players)
    games.push(game)
    printPlayerOrder(game)
    rollDices(game)
    whoShouldPlay(game)
  },
  dices(msg){
    const game = get_game(msg.member.voice)
    if(game === undefined){
      msg.channel.send("Este canal de voz não tem um jogo em adamento, use o comando !start para iniciar um jogo")
      return
    }
    dicesInGame(game)
  },
  guess(msg){
    const game = get_game(msg.member.voice)
    if(game === undefined){
      msg.channel.send("Este canal de voz não tem um jogo em adamento, use o comando !start para iniciar um jogo")
      return
    }
    if(msg.member.user.id != getPlayerPlaying(game).user.id){
      msg.channel.send("Não é sua vez de jogar ainda.")
      return
    }
    content = msg.content.substring(1)
    if(content.startsWith('guess ')){
      content = content.substring(6).trim()
    }

    const [amount, dice] = content.match(/(\d+)/g).map(num=>parseInt(num))
    
    if(amount == undefined || dice == undefined){
      msg.channel.send("Aposta inválida!")
    }

    const dadosEmJogo = countDicesInGame(game)
    if(amount > dadosEmJogo){
      msg.channel.send(`Aposta inválida! A quantidade de dados não pode ser maior do que a quantidade de dados em jogo. [${dadosEmJogo}]`)
      return 
    }
    if(dice < 1 || dice > 6){
      msg.channel.send('Aposta inválida! A face do dado não pode ser menor que 1 ou maior que 6.')
    }
    if(game.guesses.includes({amount, dice})){
      msg.channel.send('Aposta inválida! Esta aposta já foi realizada nesta rodada.'
      )
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
      msg.channel.send(`Sua aposta: ${amount} ${Dice[dice]}`)
      whoShouldPlay(game)
    }else{
      msg.channel.send('Aposta Inválida!')
    }

    console.log(msg.content)
    
    console.log(amount, dice);
  },
  doubt(msg){
    const game = get_game(msg.member.voice)
    if(game === undefined){
      msg.channel.send("Este canal de voz não tem um jogo em adamento, use o comando !start para iniciar um jogo")
      return
    }
    if(msg.member.user.id != getPlayerPlaying(game).user.id){
      msg.channel.send("Não é sua vez de jogar ainda.")
      return
    }
    const lastGuess = {amount: game.guessAmount, dice: game.guessDice}
    if(lastGuess.dice == 0){
      msg.channel.send("Você não pode duvidar na primeira jogada!")
    }
    totalDices = 0
    allDicesFromPlayers = "Os dados dos jogadores nesta rodada:\n"
    game.players.forEach(member=>{
      allDicesFromPlayers += `${getMemberMention(member)} ${member.dices.map(d=>Dice[d]).join(' ')}\n`
      member.dices.forEach(dice=>{
        if(dice == lastGuess.dice || dice == 1)
          totalDices++
      })
    })
    game.txtChannel.send(allDicesFromPlayers)
    var member = {}
    var whoShouldStartNextRound = -1
    if(lastGuess.amount >= totalDices){
      whoShouldStartNextRound = game.playerPlaying
      member = getPlayerPlaying(game)
    }else{
      whoShouldStartNextRound = getLastPlayerIndex(game)
      member = getLastPlayer(game)
    }
    msg.channel.send(`${getMemberMention(members)} perdeu um dado!`)
    member.n_dices--
    if(member.n_dices <= 0){
      member.n_dices = 0
      game.txtChannel.send(`O jogador ${getMemberMention(member)} ficou sem dados! E agora irá ver todos os dados no inicio de cada rodada!`)
    }
    
    var n_players = getAmountPlayersInGame(game)

    if(n_players == 1){
      const winner = game.players.map(member=>member.n_dices > 0)[0]
      game.txtChannel.send(`${getMemberMention(winner)} ganhou a partida! E merece toda a glória e pompa de um exímio jogador de Dadinho`)
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