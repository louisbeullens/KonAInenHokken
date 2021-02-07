import { IPlayer, IGamestate, EDieSymbol, BasePlayer } from "./shared"

const survivalProbabilityMap: number[] = [
  3 / 6,
  21 / 36,
  153 / 216,
  1041 / 1296,
  6753 / 7776,
  42561 / 46656,
  263553 / 279936,
]

class Player extends BasePlayer implements IPlayer {
  name: string = "Louis"
  private _doContinue(diceLeft: number) {
    const survivalProbability = survivalProbabilityMap[diceLeft - 1] || 1
    this.log({ diceLeft, survivalProbability })
    return Math.random() < survivalProbability ? true : false
  }

  async doContinue(gameState: IGamestate) {
    return this._doContinue(gameState.diceLeft)
  }

  private _pickHutch(gamestate: IGamestate, dice: EDieSymbol[]) {
    return true
  }

  async pickHutch(gamestate: IGamestate, dice: EDieSymbol[]) {
    gamestate.notes.hutchPicked = true
    return this._pickHutch(gamestate, dice)
  }

  async pickDice(
    gamestate: IGamestate,
    dice: EDieSymbol[]
  ): Promise<[EDieSymbol[], boolean]> {
    this.log("picking dice.", gamestate)
    let diceLeft = gamestate.diceLeft
    if (dice.filter((die) => die === 6).length === gamestate.diceLeft) {
      this.log("all carrots", gamestate)
      diceLeft = 8 - gamestate.hutches - gamestate.carrots - gamestate.diceLeft
    } else {
      if (gamestate.notes.hutchPicked && gamestate.hutches !== 1) {
        diceLeft--
      }
      diceLeft -= dice.filter((die) => die <= 2).length
      if (diceLeft === 0) {
        diceLeft = 8 - gamestate.hutches - gamestate.carrots
      }
    }
    return [[...dice], !this._doContinue(diceLeft)]
  }
}

export default new Player()
