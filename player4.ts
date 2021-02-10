import { IPlayer, IGamestate, EDieSymbol, BasePlayer } from "./shared"

const generateTrueOrFalse = () => Math.random() < 0.5? true : false

class Player extends BasePlayer implements IPlayer {
  name: string = "Monkey"
  async doContinue(gameState: IGamestate) {
    return generateTrueOrFalse()
  }
  async pickHutch(gamestate: IGamestate, dice: EDieSymbol[]) {
    return generateTrueOrFalse()
  }
  async pickDice(
    gamestate: IGamestate,
    dice: EDieSymbol[]
  ): Promise<[EDieSymbol[], boolean]> {
    return [dice.filter(() => generateTrueOrFalse()), generateTrueOrFalse()]
  }
}

export default new Player()
