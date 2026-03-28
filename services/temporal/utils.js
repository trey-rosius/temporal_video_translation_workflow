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
exports.getStream = exports.cleanup = exports.streamToFile = void 0;
const fs = __importStar(require("fs"));
/**
 * Helper to pipe a readable stream to a file path.
 */
async function streamToFile(readable, filePath) {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        readable.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
}
exports.streamToFile = streamToFile;
/**
 * Clean up temporary files.
 */
function cleanup(files) {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
}
exports.cleanup = cleanup;
/**
 * Get a readable stream from a file path.
 */
function getStream(filePath) {
    return fs.createReadStream(filePath);
}
exports.getStream = getStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHVDQUF5QjtBQUV6Qjs7R0FFRztBQUNJLEtBQUssVUFBVSxZQUFZLENBQUMsUUFBa0IsRUFBRSxRQUFnQjtJQUNyRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNCLFdBQVcsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVBELG9DQU9DO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixPQUFPLENBQUMsS0FBZTtJQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ25CLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQU5ELDBCQU1DO0FBQ0Q7O0dBRUc7QUFDSCxTQUFnQixTQUFTLENBQUMsUUFBZ0I7SUFDeEMsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQUZELDhCQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVhZGFibGUgfSBmcm9tICdzdHJlYW0nO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuXG4vKipcbiAqIEhlbHBlciB0byBwaXBlIGEgcmVhZGFibGUgc3RyZWFtIHRvIGEgZmlsZSBwYXRoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RyZWFtVG9GaWxlKHJlYWRhYmxlOiBSZWFkYWJsZSwgZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oZmlsZVBhdGgpO1xuICAgIHJlYWRhYmxlLnBpcGUod3JpdGVTdHJlYW0pO1xuICAgIHdyaXRlU3RyZWFtLm9uKCdmaW5pc2gnLCByZXNvbHZlKTtcbiAgICB3cml0ZVN0cmVhbS5vbignZXJyb3InLCByZWplY3QpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBDbGVhbiB1cCB0ZW1wb3JhcnkgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhbnVwKGZpbGVzOiBzdHJpbmdbXSk6IHZvaWQge1xuICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgIGlmIChmcy5leGlzdHNTeW5jKGZpbGUpKSB7XG4gICAgICBmcy51bmxpbmtTeW5jKGZpbGUpO1xuICAgIH1cbiAgfSk7XG59XG4vKipcbiAqIEdldCBhIHJlYWRhYmxlIHN0cmVhbSBmcm9tIGEgZmlsZSBwYXRoLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RyZWFtKGZpbGVQYXRoOiBzdHJpbmcpOiBSZWFkYWJsZSB7XG4gIHJldHVybiBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGVQYXRoKTtcbn1cbiJdfQ==