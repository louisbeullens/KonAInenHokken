export enum EDieSymbol {
    oneRabbit = 1,
    twoRabbitsTwoHutches = 2,
    threeHutches = 3,
    fourHutches = 4,
    fiveHutches = 5,
    carrot = 6,
}

export interface IScore {
    [key: string]: number
}

export interface IGamestate {
    readonly scores: IScore
    readonly carrots: number
    readonly diceLeft: number
    readonly hutches: number
    readonly rabbits: number
    notes: { [key: string]: any }
    clone(): IGamestate
    reset(): void
    canPickHutch(dice: EDieSymbol[]): boolean
    areAllCarrots(dice: EDieSymbol[]): boolean
    pickHutch(): void
    pickDice(dice: EDieSymbol[]): void
    endTurn(player: IPlayer): void
}

export interface IPlayer {
    name: string
    log?(...args: any[]): any // log things in your private namespace

    // invoked when a hutch is available returns true / false
    // dice: dice rolled this turn
    pickHutch(gamestate: IGamestate, dice: EDieSymbol[]): Promise<boolean>

    // invoked every dice roll
    // dice: dice rolled this turn
    // returns filtered dice, true to end turn
    pickDice(gamestate: IGamestate, dice: EDieSymbol[]): Promise<[EDieSymbol[], boolean]>

    // invoked at start when previous player ended turn
    // inspect gameState and decide whether or not to continue from previous player returns true / false
    doContinue(gameState: IGamestate): Promise<boolean>
}

export class BasePlayer {
    log(...args: any[]) {}
}
