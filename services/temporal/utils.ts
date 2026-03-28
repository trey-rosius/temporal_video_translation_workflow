import { Readable } from 'stream';
import * as fs from 'fs';

/**
 * Helper to pipe a readable stream to a file path.
 */
export async function streamToFile(readable: Readable, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    readable.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

/**
 * Clean up temporary files.
 */
export function cleanup(files: string[]): void {
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}
/**
 * Get a readable stream from a file path.
 */
export function getStream(filePath: string): Readable {
  return fs.createReadStream(filePath);
}
