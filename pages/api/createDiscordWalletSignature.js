import { ethers } from "ethers"
import { query as q } from 'faunadb';
import { faunaClient } from '../../util/fauna';
import aes256 from "aes256";

export default async (req, res) => {
    if (req.method == 'POST') {
        const body = JSON.parse(req.body);
		try {
			const decryptedUserId = aes256.decrypt(process.env.KEY, body.encryptedUserId)
			const signer = ethers.utils.verifyMessage(decryptedUserId, body.signature)

			if (ethers.utils.getAddress(body.address) === signer) {
				let query = await faunaClient.query(
					q.If(
						q.Exists(q.Match(q.Index("id"), decryptedUserId)),
						q.Do(
							q.Delete(q.Select('ref', q.Get(q.Match(q.Index("id"), decryptedUserId)))),
							q.Create(q.Collection('discord-wallet-signatures'), {
								data: {
									id: decryptedUserId,
									address: signer,
									signature: body.signature
								},
							})
						),
						q.Create(q.Collection('discord-wallet-signatures'), {
							data: {
								id: decryptedUserId,
								address: signer,
								signature: body.signature
							},
						})
					)
				).catch(e => console.log(e))
				res.status(200).json({ data: query });
			} else {
				res.status(400).json({ error: "invalid signature" })
			}
		} catch {
			res.status(400).json({ error: "invalid encrypted discord user id" })
		}
		
    }
};