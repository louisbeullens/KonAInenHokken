export enum EDieSymbol {
  oneRabbit = 1,
  twoRabbitsTwoHutches = 2,
  threeHutches = 3,
  fourHutches = 4,
  fiveHutches = 5,
  carrot = 6,
}

export interface IGamestate {
  scores: { [name: string]: number }
  carrots: number
  diceLeft: number
  hutches: number
  rabbits: number
  notes: { [key: string]: any }
}

export interface IPlayer {
  name: string
  log?(...args: any[]): any // log things in your private namespace

  // invoked when a hutch is available returns true / false
  // dice: dice rolled this turn
  pickHutch(gamestate: IGamestate, dice: EDieSymbol[]): boolean

  // invoked every dice roll
  // dice: dice rolled this turn
  // returns filtered dice, true to end turn
  pickDice(gamestate: IGamestate, dice: EDieSymbol[]): [EDieSymbol[], boolean]

  // invoked at start when previous player ended turn
  // inspect gameState and decide whether or not to continue from previous player returns true / false
  doContinue(gameState: IGamestate): boolean
}

export class BasePlayer {
  log(...args: any[]) {}
}
