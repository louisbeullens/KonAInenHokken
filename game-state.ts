import util from 'util'
import { IGamestate, EDieSymbol, IPlayer, IScore } from './shared'

const addReadonlyProperty = (object: any, property: string, $private: any) => {
    Object.defineProperty(object, property, {
        get: () => $private[property],
        enumerable: true,
        configurable: false,
    })
}

export namespace Gamestate {
    export const create = (input?: IGamestate): IGamestate => {
        const $private = {
            scores: {},
            carrots: 0,
            diceLeft: 7,
            hutches: 1,
            rabbits: 0,
        } as {
            scores: IScore
            carrots: number
            diceLeft: number
            hutches: number
            rabbits: number
        }

        if (input) {
            $private.scores = input.scores
            $private.carrots = input.carrots
            $private.diceLeft = input.diceLeft
            $private.hutches = input.hutches
            $private.rabbits = input.rabbits
        }

        const gamestate = {
            notes: {},
        } as IGamestate
        Object.defineProperty(gamestate, 'scores', {
            get: () => ({ ...$private.scores }),
            enumerable: true,
            configurable: false,
        })
        addReadonlyProperty(gamestate, 'carrots', $private)
        addReadonlyProperty(gamestate, 'diceLeft', $private)
        addReadonlyProperty(gamestate, 'hutches', $private)
        addReadonlyProperty(gamestate, 'rabbits', $private)

        gamestate.clone = () => Gamestate.create(gamestate)

        gamestate.reset = () => {
            $private.carrots = emptyGamestate.carrots
            $private.diceLeft = emptyGamestate.diceLeft
            $private.hutches = emptyGamestate.hutches
            $private.rabbits = emptyGamestate.rabbits
        }

        gamestate.canPickHutch = (dice: EDieSymbol[]) => {
            if ($private.hutches === 5 || !$private.diceLeft) {
                return false
            }
            return dice.includes($private.hutches + 1)
        }

        gamestate.pickHutch = () => {
            if ($private.hutches === 5 || !$private.diceLeft) {
                return
            }
            $private.hutches++
            $private.diceLeft--
        }

        gamestate.areAllCarrots = (dice: EDieSymbol[]) => {
            const carrotDice = dice.filter((die) => die === EDieSymbol.carrot)
            return carrotDice.length === dice.length && dice.length >= $private.diceLeft
        }

        gamestate.pickDice = (dice: EDieSymbol[]) => {
            // 1. check if all die are carrots
            if (gamestate.areAllCarrots(dice)) {
                $private.carrots += $private.diceLeft
                $private.diceLeft = 0
            }
            // 2. evaluate dice until diceLeft is 0
            // use local score so score starts at even
            // only single rabbits changes from even to odd
            let rabbits = 0
            dice.some((die) => {
                if (!$private.diceLeft) {
                    return true
                }
                switch (die) {
                    case EDieSymbol.oneRabbit:
                        // score is even add 1
                        // score is odd add remaining 9
                        rabbits += rabbits % 2 ? 9 : 1
                        $private.diceLeft--
                        break
                    case EDieSymbol.twoRabbitsTwoHutches:
                        // always add 2
                        rabbits += 2
                        $private.diceLeft--
                        break
                }
            })
            // add rabbits to gamestate
            $private.rabbits += rabbits
            if (!$private.diceLeft) {
                // calculate new amount of dice
                $private.diceLeft = 8 - $private.hutches - $private.carrots
            }
        }

        gamestate.endTurn = (player: IPlayer) => {
            let score = $private.scores[player.name] || 0
            score += $private.rabbits * $private.hutches
            $private.scores[player.name] = score
        }

        // allow console.log to see fields of interest.
        // @ts-ignore
        gamestate[util.inspect.custom] = () => ({
            ...$private,
        })

        return gamestate
    }
}
const emptyGamestate = Gamestate.create()
