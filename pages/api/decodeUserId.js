import aes256 from "aes256";

export default async (req, res) => {
    if (req.method == 'POST') {
		try {
			const decrypted = aes256.decrypt(process.env.KEY, req.body.encryptedUserId)
			res.status(200).send(decrypted)
		} catch {
			res.status(400).send();
		}
    }
};