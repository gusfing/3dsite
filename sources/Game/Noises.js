import * as THREE from 'three/webgpu'
import { Game } from './Game.js'

// https://godotshaders.com/snippet/seamless-perlin-noise/
// Three.js Transpiler r171

import { vec2, vec3, vec4, mod, Fn, dot, sin, fract, mul, float, uv, floor, ceil, smoothstep, int, mix } from 'three/tsl';

export const modulo = /*#__PURE__*/ Fn( ( [ divident_immutable, divisor_immutable ] ) => {

	const divisor = vec2( divisor_immutable ).toVar();
	const divident = vec2( divident_immutable ).toVar();
	const positiveDivident = vec2( mod( divident, divisor ).add( divisor ) ).toVar();

	return mod( positiveDivident, divisor );

} ).setLayout( {
	name: 'modulo',
	type: 'vec2',
	inputs: [
		{ name: 'divident', type: 'vec2' },
		{ name: 'divisor', type: 'vec2' }
	]
} );

export const random = /*#__PURE__*/ Fn( ( [ value_immutable ] ) => {

	const value = vec2( value_immutable ).toVar();
	value.assign( vec2( dot( value, vec2( 127.1, 311.7 ) ), dot( value, vec2( 269.5, 183.3 ) ) ) );

	return float( - 1.0 ).add( mul( 2.0, fract( sin( value ).mul( 43758.5453123 ) ) ) );

} ).setLayout( {
	name: 'random',
	type: 'vec2',
	inputs: [
		{ name: 'value', type: 'vec2' }
	]
} );

export const seamless_noise = /*#__PURE__*/ Fn( ( [ uv_immutable, cell_amount_immutable, period_immutable ] ) => {

	const period = vec2( period_immutable ).toVar();
	const cell_amount = float( cell_amount_immutable ).toVar();
	const uv = vec2( uv_immutable ).toVar();
	uv.assign( uv.mul( float( cell_amount ) ) );
	const cellsMinimum = vec2( floor( uv ) ).toVar();
	const cellsMaximum = vec2( ceil( uv ) ).toVar();
	const uv_fract = vec2( fract( uv ) ).toVar();
	cellsMinimum.assign( modulo( cellsMinimum, period ) );
	cellsMaximum.assign( modulo( cellsMaximum, period ) );
	const blur = vec2( smoothstep( 0.0, 1.0, uv_fract ) ).toVar();
	const lowerLeftDirection = vec2( random( vec2( cellsMinimum.x, cellsMinimum.y ) ) ).toVar();
	const lowerRightDirection = vec2( random( vec2( cellsMaximum.x, cellsMinimum.y ) ) ).toVar();
	const upperLeftDirection = vec2( random( vec2( cellsMinimum.x, cellsMaximum.y ) ) ).toVar();
	const upperRightDirection = vec2( random( vec2( cellsMaximum.x, cellsMaximum.y ) ) ).toVar();
	const fraction = vec2( fract( uv ) ).toVar();

	return mix( mix( dot( lowerLeftDirection, fraction.sub( vec2( int( 0 ), int( 0 ) ) ) ), dot( lowerRightDirection, fraction.sub( vec2( int( 1 ), int( 0 ) ) ) ), blur.x ), mix( dot( upperLeftDirection, fraction.sub( vec2( int( 0 ), int( 1 ) ) ) ), dot( upperRightDirection, fraction.sub( vec2( int( 1 ), int( 1 ) ) ) ), blur.x ), blur.y ).mul( 0.8 ).add( 0.5 );

} ).setLayout( {
	name: 'seamless_noise',
	type: 'float',
	inputs: [
		{ name: 'uv', type: 'vec2' },
		{ name: 'cell_amount', type: 'float' },
		{ name: 'period', type: 'vec2' }
	]
} );

export class Noises
{
    constructor()
    {
        this.game = Game.getInstance()

        // Render target
        this.resolution = 128
        this.renderTarget = new THREE.RenderTarget(
            this.resolution,
            this.resolution,
            {
                depthBuffer: false,
                type: THREE.HalfFloatType
            }
        )
        this.texture = this.renderTarget.texture
        this.texture.wrapS = THREE.RepeatWrapping
        this.texture.wrapT = THREE.RepeatWrapping

        // Material
        this.material = new THREE.MeshBasicNodeMaterial({ color: 'red', wireframe: false })
        this.material.outputNode = vec4(
            seamless_noise(uv(), 6.0, 6.0).remap(0.1, 0.9, 0.0, 1.0),
            0,
            0,
            1
        )

        // Quad mesh
        const quadMesh = new THREE.QuadMesh(this.material)
        this.game.rendering.renderer.setRenderTarget(this.renderTarget)
        quadMesh.renderAsync(this.game.rendering.renderer)

        // // Tests
        // const testMesh1 = new THREE.Mesh(
        //     new THREE.BoxGeometry(5, 5, 5),
        //     new THREE.MeshBasicMaterial({ map: this.texture })
        // )
        // testMesh1.position.y = 5

        // const testMesh2 = new THREE.Mesh(
        //     new THREE.BoxGeometry(5, 5, 5),
        //     new THREE.MeshBasicMaterial({ map: this.texture })
        // )
        // testMesh2.position.x = 5
        // testMesh2.position.y = 5

        // this.game.scene.add(testMesh1, testMesh2)
    }
}