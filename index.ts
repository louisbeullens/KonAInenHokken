import Louis from "./player1"
import Papa from "./player2"
import Ward from "./player3"
import { IGamestate, IPlayer, EDieSymbol } from "./shared"
import Debug from "debug"

interface ISortDiceObject {
  carrotDice: EDieSymbol[]
  otherDice: EDieSymbol[]
  rabbitDice: EDieSymbol[]
}

Debug.enable(`${process.env.DEBUG},konijnenhokken:game:*`)
export namespace debug {
  export const round = Debug("konijnenhokken:game:round")
  round.color = "2"
  export const gameEnd = Debug("konijnenhokken:game:end")
  gameEnd.color = "3"
  export const turn = Debug("konijnenhokken:game:turn")
  turn.color = "4"
  export const debug = Debug("konijnenhokken:debug")
  debug.color = "5"
}

const rollDie = (): EDieSymbol => {
  switch (Math.floor(Math.random() * 6)) {
    case 0:
      return EDieSymbol.oneRabbit
    case 1:
      return EDieSymbol.twoRabbitsTwoHutches
    case 2:
      return EDieSymbol.threeHutches
    case 3:
      return EDieSymbol.fourHutches
    case 4:
      return EDieSymbol.fiveHutches
    default:
      return EDieSymbol.carrot
  }
}
const rollDice = (dieCount: number) =>
  " "
    .repeat(dieCount)
    .split("")
    .map(() => rollDie())

const resetGameState = (currentGameState?: IGamestate): IGamestate => {
  return {
    scores: currentGameState?.scores || {},
    carrots: 0,
    diceLeft: 7,
    hutches: 1,
    rabbits: 0,
    notes: {},
  }
}

const copyGameState = (currentGameState: IGamestate): IGamestate => {
  return {
    ...currentGameState,
    scores: { ...currentGameState.scores },
    notes: {},
  }
}

const sortDice = (dice: EDieSymbol[]): ISortDiceObject => {
  const result: ISortDiceObject = {
    rabbitDice: [],
    otherDice: [],
    carrotDice: [],
  }
  dice.forEach((die) => {
    switch (die) {
      case EDieSymbol.oneRabbit:
      case EDieSymbol.twoRabbitsTwoHutches:
        result.rabbitDice.push(die)
        break
      case EDieSymbol.carrot:
        result.carrotDice.push(die)
        break
      default:
        result.otherDice.push(die)
        break
    }
  })
  return result
}

class GameHost {
  constructor(
    private players: IPlayer[] = [],
    private gamestate: IGamestate = resetGameState()
  ) {
    players.forEach((player, i) => {
      const logger = Debug(`konijnenhokken:player:${player.name}`)
      logger.color = `${i + 6}`
      player.log = logger
    })
  }

  public playRound(): void {
    // load gamestate
    let gamestate = this.gamestate

    // iterate players
    for (const player of this.players) {
      debug.turn(`${player.name}'s turn.`)
      let doContinue = true

      let copiedGameState = copyGameState(gamestate)

      // give current player the choice to continue from previous player
      if (gamestate.rabbits && player.doContinue(copiedGameState)) {
        debug.turn(`${player.name} chooses to continue.`)
      } else if (gamestate.rabbits) {
        debug.turn(`${player.name} chooses not to continue.`)
        gamestate = resetGameState(gamestate)
        copiedGameState = copyGameState(gamestate)
      }

      // emulate player turn
      while (doContinue) {
        debug.debug(gamestate)

        const nextGameState: IGamestate = copyGameState(gamestate)
        // roll dice
        const dice = rollDice(gamestate.diceLeft)
        debug.turn(`${player.name} rolled [ ${dice.join(", ")} ].`)
        const { carrotDice, otherDice, rabbitDice } = sortDice(dice)
        debug.debug({ dice, rabbitDice, otherDice, carrotDice })

        // player is unlucky, zero score, end of turn
        if (!rabbitDice.length && carrotDice.length !== gamestate.diceLeft) {
          debug.turn("turn over!!!")
          gamestate = resetGameState(gamestate)
          break
        }

        // give player choice to pick hutch when possible
        const nextHutchSymbol = gamestate.hutches + 1
        if (
          nextHutchSymbol === EDieSymbol.twoRabbitsTwoHutches &&
          rabbitDice.length > 1
        ) {
          const hutchIndex = rabbitDice.indexOf(nextHutchSymbol)
          if (hutchIndex > -1 && player.pickHutch(copiedGameState, [...dice])) {
            rabbitDice.splice(hutchIndex, 1)
            nextGameState.hutches = nextHutchSymbol
            nextGameState.diceLeft--
          }
        } else if (
          otherDice.includes(nextHutchSymbol) &&
          player.pickHutch(copiedGameState, [...dice])
        ) {
          nextGameState.hutches = nextHutchSymbol
          nextGameState.diceLeft--
        }

        // ask player which dices to pick
        const [pickedDice, endTurn] = player.pickDice(copiedGameState, [
          ...dice,
        ])
        doContinue = !endTurn

        // check if dice are all carrots
        if (carrotDice.length === gamestate.diceLeft) {
          nextGameState.carrots = gamestate.diceLeft
          nextGameState.diceLeft =
            8 - gamestate.hutches - gamestate.carrots - carrotDice.length
          gamestate = nextGameState
          debug.turn(`${player.name} threw all carrots.`)
          continue
        }

        // check if picked rabbits are truely available
        const validatedRabits: EDieSymbol[] = []
        pickedDice.forEach((die) => {
          const rabbitIndex = rabbitDice.indexOf(die)
          if (rabbitIndex > -1) {
            rabbitDice.splice(rabbitIndex, 1)
            validatedRabits.push(die)
          }
        })
        if (!validatedRabits.length) {
          // a valid move is possible
          // pick dice oneRabbit, or twoRabbitsTwoHutches
          // in player's worst interest
          const rabbitOrTwoRabbitsTwoHutches = [...rabbitDice].sort(
            (dieA, dieB) => dieA - dieB
          )[0]
          debug.turn(
            `${player.name} failed to make a valid move, host picked ${EDieSymbol[rabbitOrTwoRabbitsTwoHutches]}.`
          )
          validatedRabits.push(rabbitOrTwoRabbitsTwoHutches)
        }

        // add score for single and paired rabbits
        validatedRabits
          .filter((die) => die === EDieSymbol.oneRabbit)
          .forEach((die, i) => {
            nextGameState.rabbits += i % 2 ? 9 : 1
          })

        // add score for hutched rabbits
        validatedRabits
          .filter((die) => die === EDieSymbol.twoRabbitsTwoHutches)
          .forEach((die) => (nextGameState.rabbits += 2))

        // substract used dice from diceLeft
        nextGameState.diceLeft -= validatedRabits.length

        if (!nextGameState.diceLeft) {
          // all rabbits have been picked
          // recalculate diceLeft
          nextGameState.diceLeft = 8 - gamestate.hutches - gamestate.carrots
        }

        if (!doContinue) {
          debug.turn(`${player.name} ended his turn.`)
        }

        gamestate = nextGameState
      }

      // save player's score
      let score = gamestate.scores[player.name] || 0
      score += gamestate.rabbits * gamestate.hutches
      gamestate.scores[player.name] = score

      // log player's turn score
      debug.turn(
        `${player.name} scored ${gamestate.rabbits} rabits & ${gamestate.hutches} hutches, score: ${score}/`
      )
    }

    // log everyones score
    debug.round(gamestate.scores)

    // save gamestate
    this.gamestate = gamestate
  }

  private isLastRound(gamestate: IGamestate): boolean {
    const scores = Object.values(this.gamestate.scores)
    if (!scores.length) {
      return false
    }
    return scores.sort((scoreA, scoreB) => scoreB - scoreA)[0] >= 333
  }

  playNewGame() {
    // reset gamestate
    this.gamestate = resetGameState()
    let gamestate = this.gamestate
    while (!this.isLastRound(gamestate)) {
      this.playRound()
    }

    // load gamestate because playRound chaned it
    gamestate = this.gamestate

    const scores = Object.entries(gamestate.scores).sort(
      ([, scoreA], [, scoreB]) => scoreB - scoreA
    )
    const winner = scores[0]

    debug.gameEnd(`${winner[0]} wins the game.\r\n`)
  }
}

const game = new GameHost([Louis, Papa, Ward])
game.playNewGame()
