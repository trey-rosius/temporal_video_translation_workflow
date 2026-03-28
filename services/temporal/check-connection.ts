import { Connection, Client } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const address = process.env.TEMPORAL_ADDRESS;
  const namespace = process.env.TEMPORAL_NAMESPACE;
  const apiKey = process.env.TEMPORAL_API_KEY;

  console.log('--- Temporal Connection Test (Local) ---');
  console.log(`Address:   ${address}`);
  console.log(`Namespace: ${namespace}`);
  console.log(`API Key:   ${apiKey ? 'Present (JWT)' : 'MISSING'}`);

  if (!address || !namespace || !apiKey) {
    console.error('❌ Error: Missing required environment variables in .env');
    process.exit(1);
  }

  try {
    console.log('\n1. Testing NativeConnection (Worker-style)...');
    const nativeConnOptions: any = {
      address,
      tls: !!apiKey,
    };
    if (apiKey) {
      nativeConnOptions.metadata = {
        Authorization: `Bearer ${apiKey}`,
        'temporal-namespace': namespace,
      };
      nativeConnOptions.tls = {
        serverNameOverride: address.split(':')[0],
      };
    }
    const nativeConn = await NativeConnection.connect(nativeConnOptions);
    console.log('✅ NativeConnection successful!');

    console.log('\n2. Testing Client Connection (API-style)...');
    const clientConnOptions: any = {
      address,
      tls: !!apiKey,
    };
    if (apiKey) {
      clientConnOptions.metadata = {
        Authorization: `Bearer ${apiKey}`,
        'temporal-namespace': namespace,
      };
      clientConnOptions.tls = {
        serverNameOverride: address.split(':')[0],
      };
    }
    const connection = await Connection.connect(clientConnOptions);
    
    const client = new Client({
      connection,
      namespace,
    });

    console.log('✅ Client connection established!');
    
    console.log('\n3. Querying Namespace Info...');
    // A simple call to verify the client can actually communicate
    const workflowService = client.workflowService;
    const response = await workflowService.getSystemInfo({});
    console.log('✅ System Info retrieved:', response.serverVersion);

    await nativeConn.close();
    await connection.close();
    console.log('\n✨ All tests passed successfully!');
  } catch (err) {
    console.error('\n❌ Connection test failed!');
    console.error(err);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
