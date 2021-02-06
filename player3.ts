import { IPlayer, IGamestate, EDieSymbol, BasePlayer } from "./shared"

class Player extends BasePlayer implements IPlayer {
  name: string = "Ward"
  doContinue(gameState: IGamestate): boolean {
    return true
  }
  pickHutch(gamestate: IGamestate, dice: EDieSymbol[]): boolean {
    return true
  }
  pickDice(gamestate: IGamestate, dice: EDieSymbol[]): [EDieSymbol[], boolean] {
    return [[], true]
  }
}

export default new Player()
