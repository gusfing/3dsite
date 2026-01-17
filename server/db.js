import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

// ============================================
// WHISPERS
// ============================================

export async function getWhispers(limit = 50) {
    const { data, error } = await supabase
        .from('whispers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching whispers:', error)
        return []
    }

    return data.map(w => ({
        id: w.id,
        message: w.message,
        countrycode: w.country_code,
        x: w.x,
        y: w.y,
        z: w.z
    }))
}

export async function insertWhisper(uuid, message, countryCode, x, y, z) {
    // Check if user already has a whisper
    const { data: existing } = await supabase
        .from('whispers')
        .select('id')
        .eq('uuid', uuid)
        .single()

    let result

    if (existing) {
        // Update existing whisper
        result = await supabase
            .from('whispers')
            .update({
                message,
                country_code: countryCode,
                x, y, z,
                updated_at: new Date().toISOString()
            })
            .eq('uuid', uuid)
            .select()
            .single()
    } else {
        // Insert new whisper
        result = await supabase
            .from('whispers')
            .insert({
                uuid,
                message,
                country_code: countryCode,
                x, y, z
            })
            .select()
            .single()
    }

    if (result.error) {
        console.error('Error inserting whisper:', result.error)
        return null
    }

    return {
        id: result.data.id,
        message: result.data.message,
        countrycode: result.data.country_code,
        x: result.data.x,
        y: result.data.y,
        z: result.data.z
    }
}

// ============================================
// CIRCUIT LEADERBOARD
// ============================================

export async function getCircuitLeaderboard() {
    const { data, error } = await supabase
        .from('circuit_leaderboard')
        .select('*')
        .order('duration', { ascending: true })
        .limit(10)

    if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
    }

    return data.map(s => [s.tag, s.country_code, s.duration])
}

export async function getCircuitResetTime() {
    // Reset happens at midnight UTC each day
    const now = new Date()
    const midnight = new Date(now)
    midnight.setUTCHours(0, 0, 0, 0)
    return midnight.getTime()
}

export async function insertCircuitScore(uuid, tag, countryCode, duration) {
    // Check if this would make top 10
    const leaderboard = await getCircuitLeaderboard()

    if (leaderboard.length >= 10 && duration >= leaderboard[9][2]) {
        return null // Score not good enough
    }

    const { data, error } = await supabase
        .from('circuit_leaderboard')
        .insert({
            uuid,
            tag,
            country_code: countryCode,
            duration
        })
        .select()
        .single()

    if (error) {
        console.error('Error inserting score:', error)
        return null
    }

    return await getCircuitLeaderboard()
}

export async function resetCircuitLeaderboard() {
    const { error } = await supabase
        .from('circuit_leaderboard')
        .delete()
        .neq('id', 0) // Delete all

    if (error) {
        console.error('Error resetting leaderboard:', error)
    }
}

// ============================================
// CONTACT FORM
// ============================================

export async function insertContact(name, email, message, subject = '') {
    const { data, error } = await supabase
        .from('contacts')
        .insert({
            name,
            email,
            subject,
            message
        })
        .select()
        .single()

    if (error) {
        console.error('Error inserting contact:', error)
        return null
    }

    return data
}

export async function getContacts() {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching contacts:', error)
        return []
    }

    return data
}

// ============================================
// COOKIE COUNTER (Optional)
// ============================================

export async function getCookieCount() {
    const { data, error } = await supabase
        .from('stats')
        .select('value')
        .eq('key', 'cookie_count')
        .single()

    if (error || !data) {
        return 0
    }

    return parseInt(data.value) || 0
}

export async function incrementCookieCount(amount = 1) {
    const current = await getCookieCount()
    const newCount = current + amount

    await supabase
        .from('stats')
        .upsert({
            key: 'cookie_count',
            value: newCount.toString()
        })

    return newCount
}

export default supabase
