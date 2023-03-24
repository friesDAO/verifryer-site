import { query as q } from 'faunadb';
import { faunaClient } from '../../util/fauna';

export default async (req, res) => {
    if (req.method == 'GET') {		
        let query = await faunaClient.query(
			q.Exists(q.Match(q.Index("address"), req.query.address.toLowerCase()))
        );
        res.status(200).json(query);
    }
};