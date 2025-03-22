import * as THREE from 'three/webgpu'
import { Events } from './Events.js'
import { Game } from './Game.js'

export class Areas
{
    constructor()
    {
        this.game = Game.getInstance()

        this.items = []

        this.events = new Events()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    add(name, position, radius)
    {
        this.items.push({ name, position, radius, isIn: false })
    }

    update()
    {
        const playerPosition = new THREE.Vector2(this.game.player.position.x, this.game.player.position.z)
        for(const area of this.items)
        {
            const distance = playerPosition.distanceTo(area.position)

            if(distance < area.radius)
            {
                if(!area.isIn)
                {
                    area.isIn = true
                    this.events.trigger(area.name, [ area ])
                }
            }
            else
            {
                if(area.isIn)
                {
                    area.isIn = false
                    this.events.trigger(area.name, [ area ])
                }
            }
        }
    }
}