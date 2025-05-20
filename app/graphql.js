export default async function handler(req, res) {
  const HASURA_GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT;
  const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, variables } = req.body;

  try {
    const response = await fetch(HASURA_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Hasura proxy error:', error);
    res.status(500).json({ error: 'Error connecting to Hasura' });
  }
}
