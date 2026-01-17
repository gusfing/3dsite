import * as THREE from 'three/webgpu'

const text = `
██╗  ██╗ █████╗ ██╗    ██╗ █████╗ ██╗  ██╗██╗                           
██║ ██╔╝██╔══██╗██║    ██║██╔══██╗██║ ██╔╝██║                           
█████╔╝ ███████║██║ █╗ ██║███████║█████╔╝ ██║                           
██╔═██╗ ██╔══██║██║███╗██║██╔══██║██╔═██╗ ██║                           
██║  ██╗██║  ██║╚███╔███╔╝██║  ██║██║  ██╗██║                           
╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝                           
                                                                        
███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ ███████╗
██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗██╔════╝
███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║███████╗
╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║╚════██║
███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝███████║
╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ ╚══════╝

╔═ Welcome ═════════════╗
║ Thanks for exploring our digital playground!
║ Here's a peek behind the curtain of what powers this experience.
╚═══════════════════════╝

╔═ Contact ═════════════╗
║ Mail           ⇒ hello@kawakistudios.com
║ X              ⇒ https://x.com/kawakistudios
║ Instagram      ⇒ https://instagram.com/kawakistudios
║ YouTube        ⇒ https://www.youtube.com/@kawakistudios
║ LinkedIn       ⇒ https://www.linkedin.com/company/kawakistudios/
║ GitHub         ⇒ https://github.com/kawakistudios
╚═══════════════════════╝

╔═ What We Do ══════════╗
║ • 3D Web Experiences - WebGL, Three.js, WebGPU
║ • Interactive Design - Motion, Animation, UX
║ • Full-Stack Development - React, Node.js, Cloud
║ • Creative Technology - AR/VR, Generative Art
╚═══════════════════════╝

╔═ Tech Stack ══════════╗
║ Three.js (release: ${THREE.REVISION})
║ https://threejs.org/
║ Rapier Physics ⇒ https://rapier.rs/
║ Vite Build Tool ⇒ https://vitejs.dev/
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ Access debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

— Kawaki Studios Team
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #7C3AED; font: 400 1em monospace;',
}
let currentStyle = null
for (let i = 0; i < text.length; i++) {
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if (style !== currentStyle) {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]