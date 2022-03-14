import { ethers } from "ethers"
import { query as q } from 'faunadb';
import { faunaClient } from '../../util/fauna';
import aes256 from "aes256";

export default async (req, res) => {
    if (req.method == 'POST') {
        const body = JSON.parse(req.body);
		const decryptedUserId = aes256.decrypt(process.env.key, body.encryptedUserId).catch(() => {
			res.status(400).json({ error: "invalid encrypted discord user id" })
		})
		const signer = ethers.utils.verifyMessage(decryptedUserId, body.signature)
		if (ethers.utils.getAddress(body.signer) === signer) {
			let query = await faunaClient.query(
				q.Create(q.Collection('discord-wallet-signatures'), {
					data: {
						id: decryptedUserId,
						address: signer,
						signature: body.signature
					},
				})
			).catch(e => console.log(e))
			res.status(200).json({ data: query });
		} else {
			res.status(400).json({ error: "invalid signature" })
		}
    }
};