import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws'
import msgpack from 'msgpack-lite'
import dotenv from 'dotenv'
import {
    getWhispers,
    insertWhisper,
    getCircuitLeaderboard,
    getCircuitResetTime,
    insertCircuitScore,
    insertContact,
    getContacts,
    incrementCookieCount
} from './db.js'

dotenv.config()

const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// ============================================
// EXPRESS SERVER (REST API for Contact Form)
// ============================================

const app = express()
app.use(cors({ origin: CORS_ORIGIN }))
app.use(express.json())

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Kawaki Studios Server' })
})

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message, subject } = req.body

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' })
        }

        const contact = await insertContact(name, email, message, subject || '')

        if (contact) {
            res.json({ success: true, message: 'Contact form submitted successfully' })
        } else {
            res.status(500).json({ error: 'Failed to submit contact form' })
        }
    } catch (error) {
        console.error('Contact form error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get contacts (protected - require admin secret)
app.get('/api/contacts', async (req, res) => {
    const adminSecret = req.headers['x-admin-secret']

    if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const contacts = await getContacts()
    res.json(contacts)
})

// Start HTTP server
const server = app.listen(PORT, () => {
    console.log(`🚀 Kawaki Studios Server running on port ${PORT}`)
    console.log(`   HTTP: http://localhost:${PORT}`)
    console.log(`   WebSocket: ws://localhost:${PORT}`)
})

// ============================================
// WEBSOCKET SERVER (Game Features)
// ============================================

const wss = new WebSocketServer({ server })

// Connected clients
const clients = new Set()

// Broadcast to all clients
function broadcast(data, excludeClient = null) {
    const encoded = msgpack.encode(data)

    for (const client of clients) {
        if (client !== excludeClient && client.readyState === 1) {
            client.send(encoded)
        }
    }
}

// Handle new connections
wss.on('connection', async (ws) => {
    clients.add(ws)
    console.log(`👤 Client connected (${clients.size} total)`)

    // Send initial data
    try {
        const [whispers, circuitLeaderboard, circuitResetTime] = await Promise.all([
            getWhispers(),
            getCircuitLeaderboard(),
            getCircuitResetTime()
        ])

        const initData = {
            type: 'init',
            whispers,
            circuitLeaderboard,
            circuitResetTime
        }

        ws.send(msgpack.encode(initData))
    } catch (error) {
        console.error('Error sending init data:', error)
    }

    // Handle messages
    ws.on('message', async (data) => {
        try {
            const message = msgpack.decode(new Uint8Array(data))
            const { uuid, type } = message

            console.log(`📨 Message: ${type} from ${uuid?.slice(0, 8)}...`)

            switch (type) {
                // ============================
                // WHISPERS
                // ============================
                case 'whispersInsert': {
                    const whisper = await insertWhisper(
                        uuid,
                        message.message,
                        message.countryCode,
                        message.x,
                        message.y,
                        message.z
                    )

                    if (whisper) {
                        broadcast({
                            type: 'whispersInsert',
                            whispers: [whisper]
                        })
                    }
                    break
                }

                // ============================
                // CIRCUIT LEADERBOARD
                // ============================
                case 'circuitInsert': {
                    const leaderboard = await insertCircuitScore(
                        uuid,
                        message.tag,
                        message.countryCode,
                        message.duration
                    )

                    if (leaderboard) {
                        broadcast({
                            type: 'circuitUpdate',
                            circuitLeaderboard: leaderboard
                        })
                    }
                    break
                }

                // ============================
                // COOKIE COUNTER
                // ============================
                case 'cookieIncrement': {
                    const count = await incrementCookieCount(message.amount || 1)
                    broadcast({
                        type: 'cookieUpdate',
                        cookieCount: count
                    })
                    break
                }

                default:
                    console.log(`Unknown message type: ${type}`)
            }
        } catch (error) {
            console.error('Error handling message:', error)
        }
    })

    // Handle disconnect
    ws.on('close', () => {
        clients.delete(ws)
        console.log(`👤 Client disconnected (${clients.size} total)`)
    })

    ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        clients.delete(ws)
    })
})

// ============================================
// DAILY LEADERBOARD RESET
// ============================================

function scheduleDailyReset() {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(24, 0, 0, 0) // Next midnight UTC

    const msUntilMidnight = midnight.getTime() - now.getTime()

    console.log(`⏰ Leaderboard reset scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`)

    setTimeout(async () => {
        console.log('🔄 Resetting circuit leaderboard...')

        // Note: Uncomment this to enable daily reset
        // await resetCircuitLeaderboard()

        const leaderboard = await getCircuitLeaderboard()
        const resetTime = await getCircuitResetTime()

        broadcast({
            type: 'circuitUpdate',
            circuitLeaderboard: leaderboard,
            circuitResetTime: resetTime
        })

        // Schedule next reset
        scheduleDailyReset()
    }, msUntilMidnight)
}

scheduleDailyReset()

console.log('✅ Server ready!')
