import { useEffect } from "react"
import { ethers } from "ethers"
import { useState } from "react"
import axios from "axios"

const BN = n => ethers.BigNumber.from(n)

let signedCache = []
let decryptedCache = {}

function useCheckpoint(account, provider, promptConnect, encryptedUserId, completed) {	
	async function getSigned(account) {
		if (!signedCache.includes(account)) {
			console.log("query sign")
			const result = await axios.get(`/api/checkSignature?address=${account}`).then(result => result.data)
			if (result) signedCache.push(account)
			return result
		}

		return true
	}

	async function getDecryptedId(encryptedId) {
		if (!(encryptedId in decryptedCache)) {
			const decryptedId = await axios(`/api/decodeUserId?encryptedUserId=${encryptedId}`).catch(() => {}).data
			decryptedCache[encryptedId] = decryptedId
		} else {
			return decryptedCache[encryptedId]
		}
	}

	const [state, setState] = useState(0)

	useEffect(() => {
		update()
		const updateInterval = setInterval(update, 5000)

		return () => {
			clearInterval(updateInterval)
		}
	}, [account, completed])

	async function update() {
		const decryptedUserId = encryptedUserId ? await getDecryptedId(encryptedUserId) : ""
		const _signed = account ? await getSigned(account) : false
		
		if (account) {
			if (decryptedUserId) {
				if (_signed) {
					if (completed) {
						setState(5)
					} else {
						setState(4)
					}
				} else {
					setState(3)
				}
			} else {
				setState(2)
			}
		} else {
			if (localStorage.WEB3_CONNECT_CACHED_PROVIDER) {
				promptConnect()
			} else {
				setState(1)
			}
		}
		
	}

	return {
		state,
		update
	}
}

export default useCheckpoint