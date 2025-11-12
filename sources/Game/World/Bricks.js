import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'

export class Bricks
{
    constructor()
    {
        this.game = Game.getInstance()

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.bricksModel.scene.children)

        base.castShadow = true
        base.receiveShadow = true
        base.frustumCulled = false

        // Update materials 
        this.game.materials.updateObject(base)
        
        // Physics
        for(const reference of references)
        {
            this.game.objects.add(
                {
                    model: reference,
                    updateMaterials: false,
                    castShadow: false,
                    receiveShadow: false,
                    parent: null,
                },
                {
                    type: 'dynamic',
                    position: reference.position,
                    rotation: reference.quaternion,
                    friction: 0.7,
                    mass: 0.1,
                    sleeping: true,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.75 * 0.75, 0.5 * 0.75, 1 * 0.75 ], category: 'object' } ],
                    waterGravityMultiplier: - 1,
                    contactThreshold: 15,
                    onCollision: (force, position) =>
                    {
                        this.game.audio.groups.get('hitBrick').playRandomNext(force, position)
                    }
                },
            )
        }

        // Instanced group
        this.testInstancedGroup = new InstancedGroup(references, base, true)
    }
}