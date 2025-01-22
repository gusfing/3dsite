import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import MeshGridMaterial, { MeshGridMaterialLine } from '../Materials/MeshGridMaterial.js'
import { color, float, Fn, max, mix, output, positionGeometry, positionLocal, positionWorld, remap, remapClamp, sin, smoothstep, step, texture, uniform, uv, vec2, vec3, vec4 } from 'three/tsl'

export class WaterSurface
{
    constructor()
    {
        this.game = Game.getInstance()

        this.localTime = uniform(0)
        this.timeFrequency = 0.01

        // Geometry
        const halfExtent = this.game.view.optimalArea.radius
        this.geometry = new THREE.PlaneGeometry(halfExtent * 2, halfExtent * 2, 1, 1)
        this.geometry.rotateX(- Math.PI * 0.5)

        // Material
        this.material = new THREE.MeshLambertNodeMaterial({ color: '#ffffff', wireframe: false })

        const totalShadow = this.game.lighting.addTotalShadowToMaterial(this.material)

        const ripplesThreshold = uniform(1)
        const ripplesSlopeFrequency = uniform(10)
        const ripplesNoiseFrequency = uniform(0.1)
        const ripplesNoiseOffset = uniform(0.345)

        const iceThreshold = uniform(0)
        const iceNoiseFrequency = uniform(0.3)

        const ripplesAndIceNode = Fn(() =>
        {
            const terrainUv = this.game.terrainData.worldPositionToUvNode(positionWorld.xz)
            const terrainData = this.game.terrainData.terrainDataNode(terrainUv)

            // Ripples            
            const baseRipple = terrainData.b.add(this.localTime).mul(ripplesSlopeFrequency).toVar()
            const rippleIndex = baseRipple.floor()

            const ripplesNoise = texture(
                this.game.noises.texture,
                positionWorld.xz.add(rippleIndex.div(ripplesNoiseOffset)).mul(ripplesNoiseFrequency)
            ).r
            
            const ripples = terrainData.b
                .add(this.localTime)
                .mul(ripplesSlopeFrequency)
                .mod(1)
                .sub(terrainData.b.remap(0, 1, -0.3, 1).oneMinus())
                .add(ripplesNoise)
                .step(ripplesThreshold.remap(-0.5, 1, -1, -0.2))

            // Ice
            const iceVoronoi = texture(
                this.game.noises.texture,
                positionWorld.xz.mul(iceNoiseFrequency)
            ).g

            const ice = terrainData.b.remapClamp(0, iceThreshold, 0, 1).step(iceVoronoi)

            // Combination
            return max(ripples, ice)
        })

        this.material.outputNode = Fn(() =>
        {
            ripplesAndIceNode().lessThan(0.5).discard()

            return this.game.lighting.lightOutputNodeBuilder(vec3(1), totalShadow, false, false)
        })()

        this.material.castShadowNode = Fn(() =>
        {
            ripplesAndIceNode().lessThan(0.5).discard()

            return float(0)
        })()

        // Mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y = - 0.3
        this.mesh.castShadow = true
        this.mesh.receiveShadow = true
        this.game.scene.add(this.mesh)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌊 Water',
                expanded: false,
            })

            debugPanel.addBinding(this, 'timeFrequency', { min: 0, max: 0.1, step: 0.001 })
            debugPanel.addBinding(ripplesThreshold, 'value', { label: 'ripplesThreshold', min: 0, max: 1, step: 0.01 })
            debugPanel.addBinding(ripplesSlopeFrequency, 'value', { label: 'ripplesSlopeFrequency', min: 0, max: 50, step: 0.01 })
            debugPanel.addBinding(ripplesNoiseFrequency, 'value', { label: 'ripplesNoiseFrequency', min: 0, max: 1, step: 0.01 })
            debugPanel.addBinding(ripplesNoiseOffset, 'value', { label: 'ripplesNoiseOffset', min: 0, max: 1, step: 0.001 })
            debugPanel.addBlade({ view: 'separator' })
            debugPanel.addBinding(iceThreshold, 'value', { label: 'iceThreshold', min: 0, max: 1, step: 0.01 })
            debugPanel.addBinding(iceNoiseFrequency, 'value', { label: 'iceNoiseFrequency', min: 0, max: 1, step: 0.01 })
        }

        this.game.ticker.events.on('tick', () =>
        {
            this.update()
        }, 9)
    }

    update()
    {
        this.localTime.value += this.game.ticker.deltaScaled * this.timeFrequency

        this.mesh.position.x = this.game.view.optimalArea.position.x
        this.mesh.position.z = this.game.view.optimalArea.position.z
    }
}