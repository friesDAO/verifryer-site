import { query as q } from 'faunadb';
import { faunaClient } from '../../util/fauna';

export default async (req, res) => {
    if (req.method == 'GET') {		
        let query = await faunaClient.query(
			
			q.Map(
				q.Paginate(q.Documents(q.Collection("operating-agreement-signatures")), {size: 100000}),
    			q.Lambda("X", q.Select(["data", "address"], q.Get(q.Var("X")), ""))
			)
        );
        res.status(200).json(query.data.map(a => a.toLowerCase()).includes(req.query.address.toLowerCase()));
    }
};