import { ethers } from "ethers"
const BN = n => ethers.BigNumber.from(n)

function unparse(num, decimals = 18) {
	const stripped = num.toString()
	if (stripped.includes(".")) {
		const parts = stripped.split(".")
		return BN(parts[0] + parts[1].slice(0, decimals) + new Array(decimals - parts[1].length < 0 ? 0 : decimals - parts[1].length + 1).join("0"))
	} else {
		return BN(stripped + new Array(decimals + 1).join("0"))
	}
}

function parse(num, decimals = 18) {
    const padded = num.toString().padStart(decimals + 1, "0")
    const parsed = `${padded.slice(0, -decimals)}.${padded.slice(-decimals)}`.replace(/0+$/g, "")
    return parsed.endsWith(".") ? Number(parsed.slice(0, -1)) : Number(parsed)
}

function format(num, decimals = 2) {
    let parts = num.toString().split(".")
    
    if (parts[1] !== undefined) {
        parts[1] = (parts[1].length < decimals ? parts[1].padEnd(decimals, "0") : parts[1].slice(0, decimals))
    } else {
        parts[1] = new Array(decimals + 1).join("0")
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join(".")
}

function toWei(num, dec) {
    return num.mul(BN(10).pow(BN(dec)))
}

function fromWei(num, dec) {
    return num.div(BN(10).pow(BN(dec)))
}

export { parse, unparse, format, toWei, fromWei }