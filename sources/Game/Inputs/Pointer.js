import * as THREE from 'three/webgpu'
import { Events } from '../Events.js'

export class Pointer
{
    constructor(element)
    {
        this.element = element

        this.events = new Events()
        this.current = { x: 0, y: 0 }
        this.delta = { x: 0, y: 0 }
        this.upcoming = { x: 0, y: 0 }
        this.isDown = false
        this.type = 'mouse'
        this.upcomingDown = false
        this.hasMoved = false
        this.hasClicked = false
        this.hasReleased = false
        this.touchesLength = 0

        this.element.addEventListener('mousemove', (_event) =>
        {
            _event.preventDefault()

            this.type = 'mouse'
            
            this.upcoming.x = _event.clientX
            this.upcoming.y = _event.clientY
        })

        this.element.addEventListener('mousedown', (_event) =>
        {
            _event.preventDefault()

            this.type = 'mouse'

            this.upcomingDown = true

            this.current.x = _event.clientX
            this.current.y = _event.clientY
            this.upcoming.x = _event.clientX
            this.upcoming.y = _event.clientY
        })

        addEventListener('mouseup', (_event) =>
        {
            _event.preventDefault()

            this.upcomingDown = false
        })

        this.element.addEventListener('touchmove', (_event) =>
        {
            this.type = 'touch'
            
            let x = 0
            let y = 0

            for(const touch of _event.touches)
            {
                x += touch.clientX
                y += touch.clientY
            }
            x /= this.touchesLength
            y /= this.touchesLength

            this.upcoming.x = x
            this.upcoming.y = y
        }, { passive: true })

        this.element.addEventListener('touchstart', (_event) =>
        {
            this.type = 'touch'

            this.upcomingDown = true

            this.touchesLength = _event.touches.length

            let x = 0
            let y = 0

            for(const touch of _event.touches)
            {
                x += touch.clientX
                y += touch.clientY
            }
            x /= this.touchesLength
            y /= this.touchesLength

            this.current.x = x
            this.current.y = y
            this.upcoming.x = x
            this.upcoming.y = y
        }, { passive: true })

        addEventListener('touchend', (_event) =>
        {
            this.touchesLength = _event.touches.length

            if(this.touchesLength === 0)
                this.upcomingDown = false
        }, { passive: true })

        this.element.addEventListener('contextmenu', (_event) =>
        {
            _event.preventDefault()
        })
    }

    update()
    {
        this.delta.x = this.upcoming.x - this.current.x
        this.delta.y = this.upcoming.y - this.current.y

        this.current.x = this.upcoming.x
        this.current.y = this.upcoming.y

        this.hasMoved = this.delta.x !== 0 || this.delta.y !== 0

        this.hasClicked = false
        this.hasReleased = false
        
        if(this.upcomingDown !== this.isDown)
        {
            this.isDown = this.upcomingDown

            if(this.isDown)
                this.hasClicked = true
            else
                this.hasReleased = true
        }
    }
}