import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { lerp, segmentCircleIntersection } from '../utilities/maths.js'
import { InteractivePoints } from '../InteractivePoints.js'
import gsap from 'gsap'
import { Player } from '../Player.js'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { color, Fn, max, PI, positionWorld, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'

export default class Circuit
{
    constructor(references)
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🛞 Circuit',
                expanded: true,
            })
        }

        this.references = references

        this.setStartPosition()
        this.setRoad()
        this.setStartingLights()
        this.setTimer()
        this.setCheckpoints()
        this.setObjects()
        this.setInteractivePoint()
        this.setStartAnimation()

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        })
    }

    setStartPosition()
    {
        const baseStart = this.references.get('start')[0]

        this.startPosition = {}
        this.startPosition.position = baseStart.position.clone()
        this.startPosition.rotation = baseStart.rotation.y
    }

    setRoad()
    {
        this.road = {}
        const mesh = this.references.get('road')[0]
        
        this.road.color = uniform(color('#383039'))
        this.road.glitterPositionMultiplier = 0.3
        this.road.glitterPositionDelta = uniform(0)
        this.road.glitterScarcity = uniform(0.02)
        this.road.glitterLighten = uniform(0.2)
        this.road.middleLighten = uniform(0.075)

        const colorNode = Fn(() =>
        {
            const glitterUv = positionWorld.xz.mul(0.2)
            const glitter = texture(this.game.noises.hash, glitterUv).r
            
            const glitterLighten = this.road.glitterPositionDelta.mul(this.road.glitterScarcity).sub(glitter.mul(12.34)).fract().sub(0.5).abs().remapClamp(0, this.road.glitterScarcity, 1, 0).mul(this.road.glitterLighten)
            
            const middleLighten = uv().y.mul(PI).sin().mul(this.road.middleLighten)

            const baseColor = this.road.color.toVar()
            baseColor.addAssign(max(glitterLighten, middleLighten).mul(0.2))

            return vec3(baseColor)
        })()

        const material = new MeshDefaultMaterial({
            colorNode: colorNode,

            hasLightBounce: false,
            hasWater: false,
        })
        mesh.material = material

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'road' })
            this.game.debug.addThreeColorBinding(debugPanel, this.road.color.value, 'color')
            debugPanel.addBinding(this.road.glitterScarcity, 'value', { label: 'glitterScarcity', min: 0, max: 0.1, step: 0.001 })
            debugPanel.addBinding(this.road.glitterLighten, 'value', { label: 'glitterLighten', min: 0, max: 0.2, step: 0.001 })
            debugPanel.addBinding(this.road.middleLighten, 'value', { label: 'middleLighten', min: 0, max: 0.2, step: 0.001 })
        }
    }

    setStartingLights()
    {
        this.startingLights = {}
        this.startingLights.mesh = this.references.get('startingLights')[0]
        this.startingLights.mesh.visible = false
        this.startingLights.redMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
        this.startingLights.greenMaterial = this.game.materials.getFromName('emissiveGreenRadialGradient')
        this.startingLights.baseZ = this.startingLights.mesh.position.z
        
        this.startingLights.reset = () =>
        {
            this.startingLights.mesh.visible = false
            this.startingLights.mesh.material = this.startingLights.redMaterial
        }
    }

    setTimer()
    {
        this.timer = {}

        this.timer.element = this.game.domElement.querySelector('.js-circuit-timer')
        this.timer.digits = [...this.timer.element.querySelectorAll('.js-digit')]

        this.timer.startTime = 0
        this.timer.endTime = 0
        this.timer.running = false

        this.timer.start = () =>
        {
            this.timer.startTime = this.game.ticker.elapsed

            this.timer.running = true

            this.timer.element.classList.add('is-visible')
        }

        this.timer.end = () =>
        {
            this.timer.endTime = this.game.ticker.elapsed

            this.timer.running = false

            gsap.delayedCall(6, () =>
            {
                this.timer.element.classList.remove('is-visible')
            })
        }

        this.timer.update = () =>
        {
            if(!this.timer.running)
                return

            const currentTime = this.game.ticker.elapsed
            const elapsedTime = currentTime - this.timer.startTime

            const minutes = Math.floor(elapsedTime / 60)
            const seconds = Math.floor((elapsedTime % 60))
            const milliseconds = Math.floor((elapsedTime * 1000) % 1000)

            const digitsString = `${String(minutes).padStart(2, '0')}${String(seconds).padStart(2, '0')}${String(milliseconds).padStart(2, '0')}`

            let i = 0
            for(const digit of digitsString)
            {
                this.timer.digits[i].textContent = digit
                i++
            }
        }
    }

    setCheckpoints()
    {
        this.checkpoints = {}
        this.checkpoints.items = []
        this.checkpoints.count = 0
        this.checkpoints.checkRadius = 2
        this.checkpoints.target = null
        this.checkpoints.reachedCount = 0

        // Create checkpoints
        const baseCheckpoints = this.references.get('checkpoints').sort((a, b) => a.name.localeCompare(b.name))

        let i = 0
        for(const baseCheckpoint of baseCheckpoints)
        {
            const checkpoint = {}

            baseCheckpoint.rotation.reorder('YXZ')
            baseCheckpoint.visible = false

            checkpoint.index = i
            checkpoint.position = baseCheckpoint.position.clone()
            checkpoint.rotation = baseCheckpoint.rotation.y
            checkpoint.scale = baseCheckpoint.scale.x * 0.5


            // Center
            checkpoint.center = new THREE.Vector2(checkpoint.position.x, checkpoint.position.z)

            // Segment
            checkpoint.a = new THREE.Vector2(checkpoint.position.x - checkpoint.scale, checkpoint.position.z)
            checkpoint.b = new THREE.Vector2(checkpoint.position.x + checkpoint.scale, baseCheckpoint.position.z)

            checkpoint.a.rotateAround(checkpoint.center, - checkpoint.rotation)
            checkpoint.b.rotateAround(checkpoint.center, - checkpoint.rotation)

            // // Helpers
            // const helperA = new THREE.Mesh(
            //     new THREE.CylinderGeometry(0.1, 0.1, 2, 8, 1),
            //     new THREE.MeshBasicNodeMaterial({ color: 'yellow', wireframe: true })
            // )
            // helperA.position.x = checkpoint.a.x
            // helperA.position.z = checkpoint.a.y
            // this.game.scene.add(helperA)

            // const helperB = new THREE.Mesh(
            //     new THREE.CylinderGeometry(0.1, 0.1, 2, 8, 1),
            //     new THREE.MeshBasicNodeMaterial({ color: 'yellow', wireframe: true })
            // )
            // helperB.position.x = checkpoint.b.x
            // helperB.position.z = checkpoint.b.y
            // this.game.scene.add(helperB)

            // Set target
            checkpoint.setTarget = () =>
            {
                this.checkpoints.target = checkpoint

                // Mesh
                this.checkpoints.doorTarget.scaleUniform.value = checkpoint.scale
                this.checkpoints.doorTarget.mesh.visible = true
                this.checkpoints.doorTarget.mesh.position.copy(checkpoint.position)
                this.checkpoints.doorTarget.mesh.rotation.y = checkpoint.rotation
                this.checkpoints.doorTarget.mesh.scale.x = checkpoint.scale
            }

            // Reach
            checkpoint.reach = () =>
            {
                // Not target
                if(checkpoint !== this.checkpoints.target)
                    return

                // Confetti
                if(this.game.world.confetti)
                {
                    this.game.world.confetti.pop(new THREE.Vector3(checkpoint.a.x, 0, checkpoint.a.y))
                    this.game.world.confetti.pop(new THREE.Vector3(checkpoint.b.x, 0, checkpoint.b.y))
                }

                // Mesh
                this.checkpoints.doorReached.scaleUniform.value = checkpoint.scale
                this.checkpoints.doorReached.mesh.visible = true
                this.checkpoints.doorReached.mesh.position.copy(checkpoint.position)
                this.checkpoints.doorReached.mesh.rotation.y = checkpoint.rotation
                this.checkpoints.doorReached.mesh.scale.x = checkpoint.scale
                
                // Update reach and targets
                this.checkpoints.reachedCount++

                // Final checkpoint (start line)
                if(this.checkpoints.reachedCount === this.checkpoints.count + 2)
                {
                    this.end()
                }

                // Next checkpoint
                else
                {
                    const newTarget = this.checkpoints.items[this.checkpoints.reachedCount % (this.checkpoints.count + 1)]
                    newTarget.setTarget()
                }
                
                
                // No more target
                this.checkpoints.target
            }

            this.checkpoints.count = this.checkpoints.items.length

            // Reset
            checkpoint.reset = () =>
            {
                // // Mesh
                // checkpoint.mesh.visible = false
            }

            // Save
            this.checkpoints.items.push(checkpoint)

            i++
        }

        // Checkpoint doors
        const doorIntensity = uniform(2)
        const doorOutputColor = Fn(([doorColor, doorScale]) =>
        {
            const baseUv = uv()

            const squaredUV = baseUv.toVar()
            squaredUV.y.subAssign(this.game.ticker.elapsedScaledUniform.mul(0.2))
            squaredUV.mulAssign(vec2(
                doorScale,
                1
            ).mul(2))

            const stripes = squaredUV.x.add(squaredUV.y).fract().step(0.5)

            const alpha = baseUv.y.oneMinus().mul(stripes)

            return vec4(doorColor.mul(doorIntensity), alpha)
        })

        const doorGeometry = new THREE.PlaneGeometry(2, 2)

        {
            this.checkpoints.doorTarget = {}
            this.checkpoints.doorTarget.scaleUniform = uniform(2)
            this.checkpoints.doorTarget.color = uniform(color('#32ffc1'))

            const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide })
            material.outputNode = doorOutputColor(this.checkpoints.doorTarget.color, this.checkpoints.doorTarget.scaleUniform)
            
            const mesh = new THREE.Mesh(doorGeometry, material)
            mesh.scale.x = 1
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
            mesh.visible = false
            this.game.scene.add(mesh)

            this.checkpoints.doorTarget.mesh = mesh
        }

        {
            this.checkpoints.doorReached = {}
            this.checkpoints.doorReached.scaleUniform = uniform(2)
            this.checkpoints.doorReached.color = uniform(color('#cbff62'))
            
            const material = new THREE.MeshBasicNodeMaterial({ transparent: true, side: THREE.DoubleSide })
            material.outputNode = doorOutputColor(this.checkpoints.doorReached.color, this.checkpoints.doorReached.scaleUniform)
            
            const mesh = new THREE.Mesh(doorGeometry, material)
            mesh.scale.x = 1
            mesh.castShadow = false
            mesh.receiveShadow = false
            mesh.material = material
            mesh.visible = false
            this.game.scene.add(mesh)

            this.checkpoints.doorReached.mesh = mesh
        }

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.debugPanel.addFolder({ title: 'checkpoints' })
            this.game.debug.addThreeColorBinding(debugPanel, this.checkpoints.doorTarget.color.value, 'targetColor')
            this.game.debug.addThreeColorBinding(debugPanel, this.checkpoints.doorReached.color.value, 'reachedColor')
            
            debugPanel.addBinding(doorIntensity, 'value', { label: 'intensity', min: 0, max: 5, step: 0.01 })
        }
    }

    setObjects()
    {
        this.objects = {}
        this.objects.items = []

        const baseObjects = this.references.get('objects')

        for(const baseObject of baseObjects)
        {

            this.objects.items.push(baseObject.userData.object)
        }

        this.objects.reset = () =>
        {
            for(const object of this.objects.items)
                this.game.objects.resetObject(object)
        }
    }

    setInteractivePoint()
    {
        this.interactivePoint = this.game.interactivePoints.create(
            this.references.get('interactivePoint')[0].position,
            'Start race!',
            InteractivePoints.ALIGN_RIGHT,
            () =>
            {
                this.restart()
            },
            () =>
            {
                this.game.inputs.interactiveButtons.addItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            },
            () =>
            {
                this.game.inputs.interactiveButtons.removeItems(['interact'])
            }
        )
    }

    setStartAnimation()
    {
        this.startAnimation = {}
        this.startAnimation.timeline = gsap.timeline({ paused: true })
        this.startAnimation.interDuration = 2
        this.startAnimation.endCallback = null

        this.startAnimation.timeline.add(() =>
        {
            this.startingLights.mesh.visible = true
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.01
        })
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.02
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.position.z = this.startingLights.baseZ + 0.03
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
            this.startingLights.mesh.material = this.startingLights.greenMaterial

            if(typeof this.startAnimation.endCallback === 'function')
                this.startAnimation.endCallback()
        }))
        this.startAnimation.timeline.add(gsap.delayedCall(this.startAnimation.interDuration, () =>
        {
        }))

        this.startAnimation.start = (endCallback) =>
        {
            this.startAnimation.endCallback = endCallback
            this.startAnimation.timeline.seek(0)
            this.startAnimation.timeline.play()
        }
    }

    restart()
    {
        // Player > Lock
        this.game.player.state = Player.STATE_LOCKED

        // Overlay > Show
        this.game.overlay.show(() =>
        {
            // Update physical vehicle
            this.game.physicalVehicle.moveTo(
                this.startPosition.position,
                this.startPosition.rotation
            )

            // Starting lights
            this.startingLights.reset()

            // Checkpoints
            for(const checkpoint of this.checkpoints.items)
                checkpoint.reset()

            this.checkpoints.items[0].setTarget()

            this.checkpoints.reachedCount = 0

            // Objects
            this.objects.reset()

            // Weather
            this.game.weather.override.start(
                {
                    humidity: 0,
                    electricField: 0,
                    clouds: 0,
                    wind: 0
                },
                3
            )
    
            // Day cycles
            const dayPresetMix = 0.25
            this.game.dayCycles.override.start(
                {
                    lightColor: this.game.dayCycles.presets.day.lightColor.clone().lerp(this.game.dayCycles.presets.dawn.lightColor, dayPresetMix),
                    lightIntensity: lerp(this.game.dayCycles.presets.day.lightIntensity, this.game.dayCycles.presets.dawn.lightIntensity, dayPresetMix),
                    shadowColor: this.game.dayCycles.presets.day.shadowColor.clone().lerp(this.game.dayCycles.presets.dawn.shadowColor, dayPresetMix),
                    fogColorA: this.game.dayCycles.presets.day.fogColorA.clone().lerp(this.game.dayCycles.presets.dawn.fogColorA, dayPresetMix),
                    fogColorB: this.game.dayCycles.presets.day.fogColorB.clone().lerp(this.game.dayCycles.presets.dawn.fogColorB, dayPresetMix),
                    fogNearRatio: lerp(this.game.dayCycles.presets.day.fogNearRatio, this.game.dayCycles.presets.dawn.fogNearRatio, dayPresetMix),
                    fogFarRatio: lerp(this.game.dayCycles.presets.day.fogFarRatio, this.game.dayCycles.presets.dawn.fogFarRatio, dayPresetMix)
                },
                1
            )

            // Overlay > Hide
            this.game.overlay.hide(() =>
            {

                // Start animation
                this.startAnimation.start(() =>
                {
                    // Player > Unlock
                    this.game.player.state = Player.STATE_DEFAULT

                    this.timer.start()
                })

            })
        })
    }

    end()
    {
        this.timer.end()

        this.checkpoints.target = null
        this.checkpoints.doorTarget.mesh.visible = false

        this.game.weather.override.end()
        this.game.dayCycles.override.end()
    }

    update()
    {
        const playerPosition = new THREE.Vector2(
            this.game.player.position.x,
            this.game.player.position.z
        )

        // Road glitters
        this.road.glitterPositionDelta.value = (this.game.view.camera.position.x + this.game.view.camera.position.z) * this.road.glitterPositionMultiplier

        // Checkpoints
        for(const checkpoint of this.checkpoints.items)
        {
            const intersections = segmentCircleIntersection(
                checkpoint.a.x,
                checkpoint.a.y,
                checkpoint.b.x,
                checkpoint.b.y,
                playerPosition.x,
                playerPosition.y,
                this.checkpoints.checkRadius
            )

            if(intersections.length)
            {
                checkpoint.reach()
            }
        }

        // Timer
        this.timer.update()
    }
}