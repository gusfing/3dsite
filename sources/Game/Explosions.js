import { Events } from './Events.js'
import { Game } from './Game.js'
import { remapClamp } from './utilities/maths.js'

export class Explosions
{
    constructor()
    {
        this.game = new Game()

        this.events = new Events()
    }

    explode(coordinates)
    {
        const distance = this.game.view.focusPoint.position.distanceTo(coordinates)
        const rollKickStrength = remapClamp(distance, 2, 15, 1, 0)
        this.game.view.roll.kick(rollKickStrength)
        this.events.trigger('explosion', [ coordinates ])
    }
}