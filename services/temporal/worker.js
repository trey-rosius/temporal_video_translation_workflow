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
const worker_1 = require("@temporalio/worker");
const activities = __importStar(require("./activities"));
const http = __importStar(require("http"));
async function run() {
    const address = process.env.TEMPORAL_ADDRESS;
    const namespace = process.env.TEMPORAL_NAMESPACE;
    const apiKey = process.env.TEMPORAL_API_KEY;
    if (!address || !namespace) {
        throw new Error('TEMPORAL_ADDRESS and TEMPORAL_NAMESPACE must be set');
    }
    // Start a simple health check server
    const healthServer = http.createServer((_req, res) => {
        res.writeHead(200);
        res.end('OK');
    });
    const port = process.env.PORT || 80;
    healthServer.listen(port, () => {
        console.log(`Health check server listening on port ${port}`);
    });
    console.log(`Connecting to Temporal at ${address} in namespace ${namespace}`);
    // Quick network check
    try {
        const { execSync } = require('child_process');
        console.log("Network check (ping):");
        try {
            execSync(`ping -c 1 ${address.split(':')[0]}`, { stdio: 'inherit' });
        }
        catch (e) {
            console.log("Ping failed (expected in some VPCs), trying nc...");
        }
    }
    catch (err) {
        console.warn("Network diagnostic tools failed:", err);
    }
    console.log(`Connecting to Temporal at ${address} in namespace ${namespace}`);
    const connectionOptions = {
        address: address,
        tls: !!apiKey,
    };
    if (apiKey) {
        connectionOptions.metadata = {
            Authorization: `Bearer ${apiKey}`,
            'temporal-namespace': namespace,
        };
        // Ensure TLS is configured for cloud
        connectionOptions.tls = {
            serverNameOverride: address.split(':')[0],
        };
    }
    const connection = await worker_1.NativeConnection.connect(connectionOptions);
    const worker = await worker_1.Worker.create({
        connection,
        namespace: namespace,
        workflowsPath: require.resolve('./workflow'),
        activities,
        taskQueue: 'video-translation-queue',
    });
    console.log(`Worker started on namespace ${namespace}, listening on task queue: video-translation-queue`);
    await worker.run();
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQ0FBOEQ7QUFDOUQseURBQTJDO0FBQzNDLDJDQUE2QjtBQUU3QixLQUFLLFVBQVUsR0FBRztJQUNoQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDO0lBQzdDLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQztJQUU1QyxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCxxQ0FBcUM7SUFDckMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNuRCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDcEMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQXlDLElBQUksRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixPQUFPLGlCQUFpQixTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRTlFLHNCQUFzQjtJQUN0QixJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUM7WUFDSCxRQUFRLENBQUMsYUFBYSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQztRQUNuRSxDQUFDO0lBQ0gsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixPQUFPLGlCQUFpQixTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBRTlFLE1BQU0saUJBQWlCLEdBQVE7UUFDN0IsT0FBTyxFQUFFLE9BQU87UUFDaEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNO0tBQ2QsQ0FBQztJQUVGLElBQUksTUFBTSxFQUFFLENBQUM7UUFDWCxpQkFBaUIsQ0FBQyxRQUFRLEdBQUc7WUFDM0IsYUFBYSxFQUFFLFVBQVUsTUFBTSxFQUFFO1lBQ2pDLG9CQUFvQixFQUFFLFNBQVM7U0FDaEMsQ0FBQztRQUNGLHFDQUFxQztRQUNyQyxpQkFBaUIsQ0FBQyxHQUFHLEdBQUc7WUFDdEIsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUMsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLHlCQUFnQixDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXJFLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxVQUFVO1FBQ1YsU0FBUyxFQUFFLFNBQVM7UUFDcEIsYUFBYSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQzVDLFVBQVU7UUFDVixTQUFTLEVBQUUseUJBQXlCO0tBQ3JDLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLFNBQVMsb0RBQW9ELENBQUMsQ0FBQztJQUMxRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyQixDQUFDO0FBRUQsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDbEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV29ya2VyLCBOYXRpdmVDb25uZWN0aW9uIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2VyJztcbmltcG9ydCAqIGFzIGFjdGl2aXRpZXMgZnJvbSAnLi9hY3Rpdml0aWVzJztcbmltcG9ydCAqIGFzIGh0dHAgZnJvbSAnaHR0cCc7XG5cbmFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgY29uc3QgYWRkcmVzcyA9IHByb2Nlc3MuZW52LlRFTVBPUkFMX0FERFJFU1M7XG4gIGNvbnN0IG5hbWVzcGFjZSA9IHByb2Nlc3MuZW52LlRFTVBPUkFMX05BTUVTUEFDRTtcbiAgY29uc3QgYXBpS2V5ID0gcHJvY2Vzcy5lbnYuVEVNUE9SQUxfQVBJX0tFWTtcblxuICBpZiAoIWFkZHJlc3MgfHwgIW5hbWVzcGFjZSkge1xuICAgIHRocm93IG5ldyBFcnJvcignVEVNUE9SQUxfQUREUkVTUyBhbmQgVEVNUE9SQUxfTkFNRVNQQUNFIG11c3QgYmUgc2V0Jyk7XG4gIH1cblxuICAvLyBTdGFydCBhIHNpbXBsZSBoZWFsdGggY2hlY2sgc2VydmVyXG4gIGNvbnN0IGhlYWx0aFNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKChfcmVxLCByZXMpID0+IHtcbiAgICByZXMud3JpdGVIZWFkKDIwMCk7XG4gICAgcmVzLmVuZCgnT0snKTtcbiAgfSk7XG4gIFxuICBjb25zdCBwb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCA4MDtcbiAgaGVhbHRoU2VydmVyLmxpc3Rlbihwb3J0LCAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coYEhlYWx0aCBjaGVjayBzZXJ2ZXIgbGlzdGVuaW5nIG9uIHBvcnQgJHtwb3J0fWApO1xuICB9KTtcblxuICBjb25zb2xlLmxvZyhgQ29ubmVjdGluZyB0byBUZW1wb3JhbCBhdCAke2FkZHJlc3N9IGluIG5hbWVzcGFjZSAke25hbWVzcGFjZX1gKTtcbiAgXG4gIC8vIFF1aWNrIG5ldHdvcmsgY2hlY2tcbiAgdHJ5IHtcbiAgICBjb25zdCB7IGV4ZWNTeW5jIH0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG4gICAgY29uc29sZS5sb2coXCJOZXR3b3JrIGNoZWNrIChwaW5nKTpcIik7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWNTeW5jKGBwaW5nIC1jIDEgJHthZGRyZXNzLnNwbGl0KCc6JylbMF19YCwgeyBzdGRpbzogJ2luaGVyaXQnIH0pO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiUGluZyBmYWlsZWQgKGV4cGVjdGVkIGluIHNvbWUgVlBDcyksIHRyeWluZyBuYy4uLlwiKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUud2FybihcIk5ldHdvcmsgZGlhZ25vc3RpYyB0b29scyBmYWlsZWQ6XCIsIGVycik7XG4gIH1cblxuICBjb25zb2xlLmxvZyhgQ29ubmVjdGluZyB0byBUZW1wb3JhbCBhdCAke2FkZHJlc3N9IGluIG5hbWVzcGFjZSAke25hbWVzcGFjZX1gKTtcbiAgXG4gIGNvbnN0IGNvbm5lY3Rpb25PcHRpb25zOiBhbnkgPSB7XG4gICAgYWRkcmVzczogYWRkcmVzcyxcbiAgICB0bHM6ICEhYXBpS2V5LFxuICB9O1xuXG4gIGlmIChhcGlLZXkpIHtcbiAgICBjb25uZWN0aW9uT3B0aW9ucy5tZXRhZGF0YSA9IHtcbiAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcbiAgICAgICd0ZW1wb3JhbC1uYW1lc3BhY2UnOiBuYW1lc3BhY2UsXG4gICAgfTtcbiAgICAvLyBFbnN1cmUgVExTIGlzIGNvbmZpZ3VyZWQgZm9yIGNsb3VkXG4gICAgY29ubmVjdGlvbk9wdGlvbnMudGxzID0ge1xuICAgICAgc2VydmVyTmFtZU92ZXJyaWRlOiBhZGRyZXNzLnNwbGl0KCc6JylbMF0sXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBOYXRpdmVDb25uZWN0aW9uLmNvbm5lY3QoY29ubmVjdGlvbk9wdGlvbnMpO1xuXG4gIGNvbnN0IHdvcmtlciA9IGF3YWl0IFdvcmtlci5jcmVhdGUoe1xuICAgIGNvbm5lY3Rpb24sXG4gICAgbmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgd29ya2Zsb3dzUGF0aDogcmVxdWlyZS5yZXNvbHZlKCcuL3dvcmtmbG93JyksXG4gICAgYWN0aXZpdGllcyxcbiAgICB0YXNrUXVldWU6ICd2aWRlby10cmFuc2xhdGlvbi1xdWV1ZScsXG4gIH0pO1xuXG4gIGNvbnNvbGUubG9nKGBXb3JrZXIgc3RhcnRlZCBvbiBuYW1lc3BhY2UgJHtuYW1lc3BhY2V9LCBsaXN0ZW5pbmcgb24gdGFzayBxdWV1ZTogdmlkZW8tdHJhbnNsYXRpb24tcXVldWVgKTtcbiAgYXdhaXQgd29ya2VyLnJ1bigpO1xufVxuXG5ydW4oKS5jYXRjaCgoZXJyKSA9PiB7XG4gIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufSk7XG4iXX0=