/// <reference types="node" />
import { Readable } from 'stream';
/**
 * Helper to pipe a readable stream to a file path.
 */
export declare function streamToFile(readable: Readable, filePath: string): Promise<void>;
/**
 * Clean up temporary files.
 */
export declare function cleanup(files: string[]): void;
/**
 * Get a readable stream from a file path.
 */
export declare function getStream(filePath: string): Readable;
