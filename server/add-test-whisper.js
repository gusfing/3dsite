import { insertWhisper } from './db.js'
import dotenv from 'dotenv'

dotenv.config()

// Test whisper data
const testWhispers = [
    {
        uuid: 'test-whisper-circuit-1',
        message: 'Welcome to the circuit! 🏎️',
        countryCode: 'US',
        x: 10,
        y: 0,
        z: 10
    },
    {
        uuid: 'test-whisper-circuit-2',
        message: 'Race you to the finish line!',
        countryCode: 'GB',
        x: -15,
        y: 0,
        z: 20
    },
    {
        uuid: 'test-whisper-circuit-3',
        message: 'This portfolio is amazing!',
        countryCode: 'JP',
        x: 25,
        y: 0,
        z: -10
    }
]

async function addTestWhispers() {
    console.log('🔥 Adding test whispers...\n')

    for (const whisper of testWhispers) {
        const result = await insertWhisper(
            whisper.uuid,
            whisper.message,
            whisper.countryCode,
            whisper.x,
            whisper.y,
            whisper.z
        )

        if (result) {
            console.log(`✅ Added: "${whisper.message}" at (${whisper.x}, ${whisper.y}, ${whisper.z})`)
        } else {
            console.log(`❌ Failed to add: "${whisper.message}"`)
        }
    }

    console.log('\n✨ Done! Check your 3D world for the whispers.')
    process.exit(0)
}

addTestWhispers().catch(error => {
    console.error('Error:', error)
    process.exit(1)
})
