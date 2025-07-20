function clamp(input, min, max)
{
    return Math.max(min, Math.min(input, max))
}

function remap(input, inLow, inHigh, outLow, outHigh)
{
    return ((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow
}

function remapClamp(input, inLow, inHigh, outLow, outHigh)
{
    return clamp(((input - inLow) * (outHigh - outLow)) / (inHigh - inLow) + outLow, outLow < outHigh ? outLow : outHigh, outLow > outHigh ? outLow : outHigh)
}

function lerp(start, end, ratio)
{
    return (1 - ratio) * start + ratio * end
}

function smoothstep(value, min, max)
{
    const x = clamp((value - min) / (max - min), 0, 1)
    return x * x * (3 - 2 * x)
}

function safeMod(n, m)
{
    return ((n % m) + m) % m
}

function signedModDelta(a, b, mod)
{
    let delta = (b - a + mod) % mod
    if(delta > mod / 2)
        delta -= mod
    return delta
}

const TAU = 2 * Math.PI
var mod = function (a, n) { return ( a % n + n ) % n; } // modulo

var equivalent = function (a) { return mod(a + Math.PI, TAU) - Math.PI } // [-π, +π]

function smallestAngle(current, target)
{
return equivalent(target - current);
}

export { clamp, remap, remapClamp, lerp, smoothstep, safeMod, signedModDelta, smallestAngle }
