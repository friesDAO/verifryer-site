import { query as q } from 'faunadb';
import { faunaClient } from '../../util/fauna';

export default async (req, res) => {
    if (req.method == 'POST') {
        const body = JSON.parse(req.body);
        let query = await faunaClient.query(
            q.Create(q.Collection('operating-agreement-signatures'), {
                data: body,
            })
        ).catch(e => console.log(e))
        res.status(200).json({ data: query });
    }
};