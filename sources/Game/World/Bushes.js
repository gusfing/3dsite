import * as THREE from 'three'
import { Game } from '../Game.js'
import getWind from '../tsl/getWind.js'
import { Fn, positionLocal, vec3, transformNormalToView, normalWorld, positionWorld, frontFacing, If } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { remap } from '../utilities/maths.js'

export class Bushes
{
    constructor(_items)
    {
        this.game = new Game()

        this.items = _items

        this.game.resources.load(
            [
                { path: 'bush/bush-leaves.png', type: 'texture', name: 'bushLeaves' },
                { path: 'matcaps/bushOnGreen.png', type: 'texture', name: 'matcapBushOnGreen' },
                { path: 'noises-128x128.png', type: 'texture', name: 'noisesTexture' },
            ],
            (resources) =>
            {
                this.resources = resources
                this.resources.matcapBushOnGreen.colorSpace = THREE.SRGBColorSpace
                this.resources.noisesTexture.wrapS = THREE.RepeatWrapping
                this.resources.noisesTexture.wrapT = THREE.RepeatWrapping
                this.init()
            }
        )
    }

    init()
    {
        this.setGeometry()
        this.setMaterial()
        this.setInstancedMesh()
    }

    setGeometry()
    {
        const count = 80
        const planes = []

        for(let i = 0; i < count; i++)
        {
            const plane = new THREE.PlaneGeometry(1, 1)

            // Position
            const spherical = new THREE.Spherical(
                1 - Math.pow(Math.random(), 3),
                Math.PI * 2 * Math.random(),
                Math.PI * Math.random()
            )
            const position = new THREE.Vector3().setFromSpherical(spherical)
            plane.rotateX(Math.random() * 9999)
            plane.rotateY(Math.random() * 9999)
            plane.rotateZ(Math.random() * 9999)
            plane.translate(
                position.x,
                position.y,
                position.z
            )

            // Normal
            const normal = position.clone().normalize()
            const normalArray = new Float32Array(12)
            for(let i = 0; i < 4; i++)
            {
                const i3 = i * 3

                const position = new THREE.Vector3(
                    plane.attributes.position.array[i3    ],
                    plane.attributes.position.array[i3 + 1],
                    plane.attributes.position.array[i3 + 2],
                )

                const mixedNormal = position.lerp(normal, 0.4)
                
                normalArray[i3    ] = mixedNormal.x
                normalArray[i3 + 1] = mixedNormal.y
                normalArray[i3 + 2] = mixedNormal.z
            }
            
            plane.setAttribute('normal', new THREE.BufferAttribute(normalArray, 3))

            // Save
            planes.push(plane)
        }

        // Merge all planes
        this.geometry = mergeGeometries(planes)
    }

    setMaterial()
    {
        // this.material = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide })
        // this.material = new THREE.MeshNormalNodeMaterial({ side: THREE.DoubleSide })
        this.material = new THREE.MeshMatcapNodeMaterial({
            side: THREE.DoubleSide,
            matcap: this.resources.matcapBushOnGreen,
            alphaMap: this.resources.bushLeaves,
            alphaTest: 0.01
        })
    
        this.material.normalNode = Fn(() =>
        {
            const normal = normalWorld.toVar()

            If(frontFacing.not(), () =>
            {
                normal.assign(normal.negate())
            })
            
            return transformNormalToView(normal)
        })()
    
        this.material.positionNode = Fn(() =>
        {
            const wind = getWind([this.resources.noisesTexture, positionWorld.xz.mul(0.2)])
            const multiplier = positionWorld.y.mul(1.5)
            const windPosition = positionLocal.add(vec3(wind.x, 0, wind.y).mul(multiplier))
            return windPosition
        })()
    }

    setInstancedMesh()
    {
        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.items.length)
        this.mesh.frustumCulled = false
        this.mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)
        this.game.scene.add(this.mesh)
        
        let i = 0
        for(const _item of this.items)
        {
            this.mesh.setMatrixAt(i, _item)
            i++
        }
        this.mesh.instanceMatrix.needsUpdate = true;

        // this.game.time.events.on('tick', () =>
        // {
        //     this.mesh.rotation.y = this.game.time.elapsed
        // })
    }
}