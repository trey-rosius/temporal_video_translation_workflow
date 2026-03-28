"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@temporalio/client");
const worker_1 = require("@temporalio/worker");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
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
        const nativeConnOptions = {
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
        const nativeConn = await worker_1.NativeConnection.connect(nativeConnOptions);
        console.log('✅ NativeConnection successful!');
        console.log('\n2. Testing Client Connection (API-style)...');
        const clientConnOptions = {
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
        const connection = await client_1.Connection.connect(clientConnOptions);
        const client = new client_1.Client({
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
    }
    catch (err) {
        console.error('\n❌ Connection test failed!');
        console.error(err);
        process.exit(1);
    }
}
run().catch((err) => {
    console.error('Unhandled error:', err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stY29ubmVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoZWNrLWNvbm5lY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtDQUF3RDtBQUN4RCwrQ0FBc0Q7QUFDdEQsK0NBQWlDO0FBQ2pDLDJDQUE2QjtBQUU3QixzQkFBc0I7QUFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFNUQsS0FBSyxVQUFVLEdBQUc7SUFDaEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztJQUM3QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDO0lBQ2pELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7SUFFNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxNQUFNLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUVsRSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaURBQWlELENBQUMsQ0FBQztRQUMvRCxNQUFNLGlCQUFpQixHQUFRO1lBQzdCLE9BQU87WUFDUCxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU07U0FDZCxDQUFDO1FBQ0YsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLGlCQUFpQixDQUFDLFFBQVEsR0FBRztnQkFDM0IsYUFBYSxFQUFFLFVBQVUsTUFBTSxFQUFFO2dCQUNqQyxvQkFBb0IsRUFBRSxTQUFTO2FBQ2hDLENBQUM7WUFDRixpQkFBaUIsQ0FBQyxHQUFHLEdBQUc7Z0JBQ3RCLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFDLENBQUM7UUFDSixDQUFDO1FBQ0QsTUFBTSxVQUFVLEdBQUcsTUFBTSx5QkFBZ0IsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNyRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFFOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQzdELE1BQU0saUJBQWlCLEdBQVE7WUFDN0IsT0FBTztZQUNQLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtTQUNkLENBQUM7UUFDRixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsaUJBQWlCLENBQUMsUUFBUSxHQUFHO2dCQUMzQixhQUFhLEVBQUUsVUFBVSxNQUFNLEVBQUU7Z0JBQ2pDLG9CQUFvQixFQUFFLFNBQVM7YUFDaEMsQ0FBQztZQUNGLGlCQUFpQixDQUFDLEdBQUcsR0FBRztnQkFDdEIsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUMsQ0FBQztRQUNKLENBQUM7UUFDRCxNQUFNLFVBQVUsR0FBRyxNQUFNLG1CQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFL0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUM7WUFDeEIsVUFBVTtZQUNWLFNBQVM7U0FDVixDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFFaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQy9DLDhEQUE4RDtRQUM5RCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQy9DLE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVoRSxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7QUFDSCxDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN2QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29ubmVjdGlvbiwgQ2xpZW50IH0gZnJvbSAnQHRlbXBvcmFsaW8vY2xpZW50JztcbmltcG9ydCB7IE5hdGl2ZUNvbm5lY3Rpb24gfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZXInO1xuaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBMb2FkIC5lbnYgZnJvbSByb290XG5kb3RlbnYuY29uZmlnKHsgcGF0aDogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy5lbnYnKSB9KTtcblxuYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICBjb25zdCBhZGRyZXNzID0gcHJvY2Vzcy5lbnYuVEVNUE9SQUxfQUREUkVTUztcbiAgY29uc3QgbmFtZXNwYWNlID0gcHJvY2Vzcy5lbnYuVEVNUE9SQUxfTkFNRVNQQUNFO1xuICBjb25zdCBhcGlLZXkgPSBwcm9jZXNzLmVudi5URU1QT1JBTF9BUElfS0VZO1xuXG4gIGNvbnNvbGUubG9nKCctLS0gVGVtcG9yYWwgQ29ubmVjdGlvbiBUZXN0IChMb2NhbCkgLS0tJyk7XG4gIGNvbnNvbGUubG9nKGBBZGRyZXNzOiAgICR7YWRkcmVzc31gKTtcbiAgY29uc29sZS5sb2coYE5hbWVzcGFjZTogJHtuYW1lc3BhY2V9YCk7XG4gIGNvbnNvbGUubG9nKGBBUEkgS2V5OiAgICR7YXBpS2V5ID8gJ1ByZXNlbnQgKEpXVCknIDogJ01JU1NJTkcnfWApO1xuXG4gIGlmICghYWRkcmVzcyB8fCAhbmFtZXNwYWNlIHx8ICFhcGlLZXkpIHtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3I6IE1pc3NpbmcgcmVxdWlyZWQgZW52aXJvbm1lbnQgdmFyaWFibGVzIGluIC5lbnYnKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKCdcXG4xLiBUZXN0aW5nIE5hdGl2ZUNvbm5lY3Rpb24gKFdvcmtlci1zdHlsZSkuLi4nKTtcbiAgICBjb25zdCBuYXRpdmVDb25uT3B0aW9uczogYW55ID0ge1xuICAgICAgYWRkcmVzcyxcbiAgICAgIHRsczogISFhcGlLZXksXG4gICAgfTtcbiAgICBpZiAoYXBpS2V5KSB7XG4gICAgICBuYXRpdmVDb25uT3B0aW9ucy5tZXRhZGF0YSA9IHtcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxuICAgICAgICAndGVtcG9yYWwtbmFtZXNwYWNlJzogbmFtZXNwYWNlLFxuICAgICAgfTtcbiAgICAgIG5hdGl2ZUNvbm5PcHRpb25zLnRscyA9IHtcbiAgICAgICAgc2VydmVyTmFtZU92ZXJyaWRlOiBhZGRyZXNzLnNwbGl0KCc6JylbMF0sXG4gICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBuYXRpdmVDb25uID0gYXdhaXQgTmF0aXZlQ29ubmVjdGlvbi5jb25uZWN0KG5hdGl2ZUNvbm5PcHRpb25zKTtcbiAgICBjb25zb2xlLmxvZygn4pyFIE5hdGl2ZUNvbm5lY3Rpb24gc3VjY2Vzc2Z1bCEnKTtcblxuICAgIGNvbnNvbGUubG9nKCdcXG4yLiBUZXN0aW5nIENsaWVudCBDb25uZWN0aW9uIChBUEktc3R5bGUpLi4uJyk7XG4gICAgY29uc3QgY2xpZW50Q29ubk9wdGlvbnM6IGFueSA9IHtcbiAgICAgIGFkZHJlc3MsXG4gICAgICB0bHM6ICEhYXBpS2V5LFxuICAgIH07XG4gICAgaWYgKGFwaUtleSkge1xuICAgICAgY2xpZW50Q29ubk9wdGlvbnMubWV0YWRhdGEgPSB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcbiAgICAgICAgJ3RlbXBvcmFsLW5hbWVzcGFjZSc6IG5hbWVzcGFjZSxcbiAgICAgIH07XG4gICAgICBjbGllbnRDb25uT3B0aW9ucy50bHMgPSB7XG4gICAgICAgIHNlcnZlck5hbWVPdmVycmlkZTogYWRkcmVzcy5zcGxpdCgnOicpWzBdLFxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IENvbm5lY3Rpb24uY29ubmVjdChjbGllbnRDb25uT3B0aW9ucyk7XG4gICAgXG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh7XG4gICAgICBjb25uZWN0aW9uLFxuICAgICAgbmFtZXNwYWNlLFxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ+KchSBDbGllbnQgY29ubmVjdGlvbiBlc3RhYmxpc2hlZCEnKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZygnXFxuMy4gUXVlcnlpbmcgTmFtZXNwYWNlIEluZm8uLi4nKTtcbiAgICAvLyBBIHNpbXBsZSBjYWxsIHRvIHZlcmlmeSB0aGUgY2xpZW50IGNhbiBhY3R1YWxseSBjb21tdW5pY2F0ZVxuICAgIGNvbnN0IHdvcmtmbG93U2VydmljZSA9IGNsaWVudC53b3JrZmxvd1NlcnZpY2U7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB3b3JrZmxvd1NlcnZpY2UuZ2V0U3lzdGVtSW5mbyh7fSk7XG4gICAgY29uc29sZS5sb2coJ+KchSBTeXN0ZW0gSW5mbyByZXRyaWV2ZWQ6JywgcmVzcG9uc2Uuc2VydmVyVmVyc2lvbik7XG5cbiAgICBhd2FpdCBuYXRpdmVDb25uLmNsb3NlKCk7XG4gICAgYXdhaXQgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgIGNvbnNvbGUubG9nKCdcXG7inKggQWxsIHRlc3RzIHBhc3NlZCBzdWNjZXNzZnVsbHkhJyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1xcbuKdjCBDb25uZWN0aW9uIHRlc3QgZmFpbGVkIScpO1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxucnVuKCkuY2F0Y2goKGVycikgPT4ge1xuICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgZXJyb3I6JywgZXJyKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufSk7XG4iXX0=