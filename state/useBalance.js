import { useEffect } from "react"
import ERC20ABI from "../abis/ERC20.json"
import { ethers } from "ethers"
import { useState } from "react"
import { parse } from "../util/number"
const BN = n => ethers.BigNumber.from(n)

function useBalance(account, provider, tokenAddress) {
    const Token = new ethers.Contract(tokenAddress, ERC20ABI, provider)
    const [ balance, setBalance] = useState(BN(0))

    function update() {
        if (account) {
            Token.balanceOf(account).then(setBalance)
        }
    }

    useEffect(() => {
        update()
        const updateInterval = setInterval(update, 5000)

        return () => {
            clearInterval(updateInterval)
        }
    }, [account])

    return balance
}

export default useBalance