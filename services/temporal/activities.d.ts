export declare function ingest(bucket: string, key: string): Promise<string>;
export declare function transcribe(mediaPath: string, bucketName: string, key: string): Promise<string>;
export declare function translate(text: string): Promise<string>;
export declare function dub(videoPath: string, text: string): Promise<string>;
export declare function upload(filePath: string, bucket: string): Promise<string>;
