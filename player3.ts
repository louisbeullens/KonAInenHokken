import { IPlayer, IGamestate, EDieSymbol, BasePlayer } from "./shared"

class Player extends BasePlayer implements IPlayer {
  name: string = "Ward"
  async doContinue(gameState: IGamestate) {
    return true
  }
  async pickHutch(gamestate: IGamestate, dice: EDieSymbol[]) {
    return true
  }
  async pickDice(
    gamestate: IGamestate,
    dice: EDieSymbol[]
  ): Promise<[EDieSymbol[], boolean]> {
    return [[], true]
  }
}

export default new Player()
