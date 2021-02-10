import { IPlayer, IGamestate, EDieSymbol, BasePlayer } from "./shared";
declare class Player extends BasePlayer implements IPlayer {
    name: string;
    doContinue(gameState: IGamestate): Promise<boolean>;
    pickHutch(gamestate: IGamestate, dice: EDieSymbol[]): Promise<boolean>;
    pickDice(gamestate: IGamestate, dice: EDieSymbol[]): Promise<[EDieSymbol[], boolean]>;
}
declare const _default: Player;
export default _default;
