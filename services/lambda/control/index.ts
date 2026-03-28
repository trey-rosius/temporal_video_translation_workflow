import { Connection, Client } from '@temporalio/client';

export const handler = async (event: any) => {
  const { id } = event.pathParameters;
  const method = event.httpMethod;

  const address = process.env.TEMPORAL_ADDRESS;
  const namespace = process.env.TEMPORAL_NAMESPACE;
  const apiKey = process.env.TEMPORAL_API_KEY;

  if (!address || !namespace) {
    throw new Error('TEMPORAL_ADDRESS and TEMPORAL_NAMESPACE must be set');
  }

  const connectionOptions: any = {
    address: address,
    tls: !!apiKey,
  };

  if (apiKey) {
    connectionOptions.metadata = {
      Authorization: `Bearer ${apiKey}`,
      'temporal-namespace': namespace,
    };
    connectionOptions.tls = {
      serverNameOverride: address.split(':')[0],
    };
  }

  const connection = await Connection.connect(connectionOptions);

  const client = new Client({ 
    connection,
    namespace: namespace,
  });
  
  const handle = client.workflow.getHandle(id);

  try {
    if (method === 'GET') {
      const status = await handle.query('status');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: id, status }),
      };
    } else if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      await handle.signal('updateConfig', body);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Signal sent successfully' }),
      };
    }
  } catch (error: any) {
    console.error('Error interacting with workflow:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
