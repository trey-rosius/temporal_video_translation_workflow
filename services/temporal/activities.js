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
exports.upload = exports.dub = exports.translate = exports.transcribe = exports.ingest = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_transcribe_1 = require("@aws-sdk/client-transcribe");
const client_translate_1 = require("@aws-sdk/client-translate");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execPromise = (0, util_1.promisify)(child_process_1.exec);
const s3Client = new client_s3_1.S3Client({});
const transcribeClient = new client_transcribe_1.TranscribeClient({});
const translateClient = new client_translate_1.TranslateClient({});
async function ingest(bucket, key) {
    console.log(`Ingesting s3://${bucket}/${key}`);
    const localPath = path.join("/tmp", key);
    const response = await s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }));
    const writeStream = fs.createWriteStream(localPath);
    // Implementation note: You'd need a helper to pipe the readable stream to the write stream
    // @ts-ignore
    await response.Body.transformToWebStream().pipeTo(writeStream);
    return localPath;
}
exports.ingest = ingest;
async function transcribe(mediaPath, bucketName, key) {
    const jobName = `transcription-${Date.now()}`;
    const mediaUri = `s3://${bucketName}/${key}`;
    await transcribeClient.send(new client_transcribe_1.StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: "en-US",
        Media: { MediaFileUri: mediaUri },
        OutputBucketName: bucketName,
        OutputKey: `transcripts/${jobName}.json`,
    }));
    // Poll for completion
    while (true) {
        const { TranscriptionJob } = await transcribeClient.send(new client_transcribe_1.GetTranscriptionJobCommand({
            TranscriptionJobName: jobName
        }));
        if (TranscriptionJob?.TranscriptionJobStatus === "COMPLETED") {
            const transcriptKey = `transcripts/${jobName}.json`;
            const transcriptData = await s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: transcriptKey }));
            const content = await transcriptData.Body?.transformToString();
            const json = JSON.parse(content || "{}");
            return json.results.transcripts[0].transcript;
        }
        if (TranscriptionJob?.TranscriptionJobStatus === "FAILED") {
            throw new Error(`Transcription failed: ${TranscriptionJob.FailureReason}`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
exports.transcribe = transcribe;
async function translate(text) {
    const response = await translateClient.send(new client_translate_1.TranslateTextCommand({
        Text: text,
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
    }));
    return response.TranslatedText || "";
}
exports.translate = translate;
async function dub(videoPath, text) {
    const audioOutputPath = videoPath.replace(path.extname(videoPath), ".mp3");
    const videoOutputPath = videoPath.replace(path.extname(videoPath), "-dubbed.mp4");
    // Step 1: TTS logic (e.g., AWS Polly) would go here to create translated_audio.mp3
    console.log(`Generating dubbed audio for text: ${text.substring(0, 50)}...`);
    // Step 2: Merge with FFmpeg
    // Using -shortest to match duration
    const command = `ffmpeg -i ${videoPath} -i ${audioOutputPath} -map 0:v -map 1:a -c:v copy -shortest ${videoOutputPath}`;
    await execPromise(command);
    return videoOutputPath;
}
exports.dub = dub;
async function upload(filePath, bucket) {
    const key = `outputs/${path.basename(filePath)}`;
    const fileContent = fs.readFileSync(filePath);
    await s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
    }));
    return `s3://${bucket}/${key}`;
}
exports.upload = upload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFjdGl2aXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBa0Y7QUFDbEYsa0VBQXdIO0FBQ3hILGdFQUFrRjtBQUNsRixpREFBcUM7QUFDckMsK0JBQWlDO0FBQ2pDLHVDQUF5QjtBQUN6QiwyQ0FBNkI7QUFHN0IsTUFBTSxXQUFXLEdBQUcsSUFBQSxnQkFBUyxFQUFDLG9CQUFJLENBQUMsQ0FBQztBQUNwQyxNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbEMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG9DQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV6QyxLQUFLLFVBQVUsTUFBTSxDQUFDLE1BQWMsRUFBRSxHQUFXO0lBQ3RELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwRCwyRkFBMkY7SUFDM0YsYUFBYTtJQUNiLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUUvRCxPQUFPLFNBQVMsQ0FBQztB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QUFvQztJQUNwQyxNQUFNLE9BQU8sR0FBRyxhQUFhLFNBQVMsT0FBTyxlQUFlLDBDQUEwQyxlQUFlLEVBQUUsQ0FBQztJQUN4SCxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixPQUFPLGVBQWUsQ0FBQztBQUN6QixDQUFDO0FBYkQsa0JBYUM7QUFFTSxLQUFLLFVBQVUsTUFBTSxDQUFDLFFBQWdCLEVBQUUsTUFBYztJQUMzRCxNQUFNLEdBQUcsR0FBRyxXQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztJQUNqRCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRTlDLE1BQU0sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLDRCQUFnQixDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxNQUFNO1FBQ2QsR0FBRyxFQUFFLEdBQUc7UUFDUixJQUFJLEVBQUUsV0FBVztLQUNsQixDQUFDLENBQUMsQ0FBQztJQUVKLE9BQU8sUUFBUSxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakMsQ0FBQztBQVhELHdCQVdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUzNDbGllbnQsIEdldE9iamVjdENvbW1hbmQsIFB1dE9iamVjdENvbW1hbmQgfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXMzXCI7XG5pbXBvcnQgeyBUcmFuc2NyaWJlQ2xpZW50LCBTdGFydFRyYW5zY3JpcHRpb25Kb2JDb21tYW5kLCBHZXRUcmFuc2NyaXB0aW9uSm9iQ29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtdHJhbnNjcmliZVwiO1xuaW1wb3J0IHsgVHJhbnNsYXRlQ2xpZW50LCBUcmFuc2xhdGVUZXh0Q29tbWFuZCB9IGZyb20gXCJAYXdzLXNkay9jbGllbnQtdHJhbnNsYXRlXCI7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGdldFN0cmVhbSB9IGZyb20gXCIuL3V0aWxzXCI7IC8vIEhlbHBlciB0byBwaXBlIFMzIHN0cmVhbSB0byBmaWxlXG5cbmNvbnN0IGV4ZWNQcm9taXNlID0gcHJvbWlzaWZ5KGV4ZWMpO1xuY29uc3QgczNDbGllbnQgPSBuZXcgUzNDbGllbnQoe30pO1xuY29uc3QgdHJhbnNjcmliZUNsaWVudCA9IG5ldyBUcmFuc2NyaWJlQ2xpZW50KHt9KTtcbmNvbnN0IHRyYW5zbGF0ZUNsaWVudCA9IG5ldyBUcmFuc2xhdGVDbGllbnQoe30pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5nZXN0KGJ1Y2tldDogc3RyaW5nLCBrZXk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnNvbGUubG9nKGBJbmdlc3RpbmcgczM6Ly8ke2J1Y2tldH0vJHtrZXl9YCk7XG4gIGNvbnN0IGxvY2FsUGF0aCA9IHBhdGguam9pbihcIi90bXBcIiwga2V5KTtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBHZXRPYmplY3RDb21tYW5kKHsgQnVja2V0OiBidWNrZXQsIEtleToga2V5IH0pKTtcbiAgXG4gIGNvbnN0IHdyaXRlU3RyZWFtID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0obG9jYWxQYXRoKTtcbiAgLy8gSW1wbGVtZW50YXRpb24gbm90ZTogWW91J2QgbmVlZCBhIGhlbHBlciB0byBwaXBlIHRoZSByZWFkYWJsZSBzdHJlYW0gdG8gdGhlIHdyaXRlIHN0cmVhbVxuICAvLyBAdHMtaWdub3JlXG4gIGF3YWl0IHJlc3BvbnNlLkJvZHkudHJhbnNmb3JtVG9XZWJTdHJlYW0oKS5waXBlVG8od3JpdGVTdHJlYW0pO1xuICBcbiAgcmV0dXJuIGxvY2FsUGF0aDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRyYW5zY3JpYmUobWVkaWFQYXRoOiBzdHJpbmcsIGJ1Y2tldE5hbWU6IHN0cmluZywga2V5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBqb2JOYW1lID0gYHRyYW5zY3JpcHRpb24tJHtEYXRlLm5vdygpfWA7XG4gIGNvbnN0IG1lZGlhVXJpID0gYHMzOi8vJHtidWNrZXROYW1lfS8ke2tleX1gO1xuICBcbiAgYXdhaXQgdHJhbnNjcmliZUNsaWVudC5zZW5kKG5ldyBTdGFydFRyYW5zY3JpcHRpb25Kb2JDb21tYW5kKHtcbiAgICBUcmFuc2NyaXB0aW9uSm9iTmFtZTogam9iTmFtZSxcbiAgICBMYW5ndWFnZUNvZGU6IFwiZW4tVVNcIixcbiAgICBNZWRpYTogeyBNZWRpYUZpbGVVcmk6IG1lZGlhVXJpIH0sXG4gICAgT3V0cHV0QnVja2V0TmFtZTogYnVja2V0TmFtZSxcbiAgICBPdXRwdXRLZXk6IGB0cmFuc2NyaXB0cy8ke2pvYk5hbWV9Lmpzb25gLFxuICB9KSk7XG5cbiAgLy8gUG9sbCBmb3IgY29tcGxldGlvblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IHsgVHJhbnNjcmlwdGlvbkpvYiB9ID0gYXdhaXQgdHJhbnNjcmliZUNsaWVudC5zZW5kKG5ldyBHZXRUcmFuc2NyaXB0aW9uSm9iQ29tbWFuZCh7XG4gICAgICAgIFRyYW5zY3JpcHRpb25Kb2JOYW1lOiBqb2JOYW1lXG4gICAgfSkpO1xuICAgIFxuICAgIGlmIChUcmFuc2NyaXB0aW9uSm9iPy5UcmFuc2NyaXB0aW9uSm9iU3RhdHVzID09PSBcIkNPTVBMRVRFRFwiKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zY3JpcHRLZXkgPSBgdHJhbnNjcmlwdHMvJHtqb2JOYW1lfS5qc29uYDtcbiAgICAgICAgY29uc3QgdHJhbnNjcmlwdERhdGEgPSBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBHZXRPYmplY3RDb21tYW5kKHsgQnVja2V0OiBidWNrZXROYW1lLCBLZXk6IHRyYW5zY3JpcHRLZXkgfSkpO1xuICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdHJhbnNjcmlwdERhdGEuQm9keT8udHJhbnNmb3JtVG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoY29udGVudCB8fCBcInt9XCIpO1xuICAgICAgICByZXR1cm4ganNvbi5yZXN1bHRzLnRyYW5zY3JpcHRzWzBdLnRyYW5zY3JpcHQ7XG4gICAgfVxuICAgIFxuICAgIGlmIChUcmFuc2NyaXB0aW9uSm9iPy5UcmFuc2NyaXB0aW9uSm9iU3RhdHVzID09PSBcIkZBSUxFRFwiKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVHJhbnNjcmlwdGlvbiBmYWlsZWQ6ICR7VHJhbnNjcmlwdGlvbkpvYi5GYWlsdXJlUmVhc29ufWApO1xuICAgIH1cbiAgICBcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgNTAwMCkpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0cmFuc2xhdGUodGV4dDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0cmFuc2xhdGVDbGllbnQuc2VuZChuZXcgVHJhbnNsYXRlVGV4dENvbW1hbmQoe1xuICAgIFRleHQ6IHRleHQsXG4gICAgU291cmNlTGFuZ3VhZ2VDb2RlOiBcImVuXCIsXG4gICAgVGFyZ2V0TGFuZ3VhZ2VDb2RlOiBcImVzXCIsXG4gIH0pKTtcbiAgcmV0dXJuIHJlc3BvbnNlLlRyYW5zbGF0ZWRUZXh0IHx8IFwiXCI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkdWIodmlkZW9QYXRoOiBzdHJpbmcsIHRleHQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGF1ZGlvT3V0cHV0UGF0aCA9IHZpZGVvUGF0aC5yZXBsYWNlKHBhdGguZXh0bmFtZSh2aWRlb1BhdGgpLCBcIi5tcDNcIik7XG4gIGNvbnN0IHZpZGVvT3V0cHV0UGF0aCA9IHZpZGVvUGF0aC5yZXBsYWNlKHBhdGguZXh0bmFtZSh2aWRlb1BhdGgpLCBcIi1kdWJiZWQubXA0XCIpO1xuXG4gIC8vIFN0ZXAgMTogVFRTIGxvZ2ljIChlLmcuLCBBV1MgUG9sbHkpIHdvdWxkIGdvIGhlcmUgdG8gY3JlYXRlIHRyYW5zbGF0ZWRfYXVkaW8ubXAzXG4gIGNvbnNvbGUubG9nKGBHZW5lcmF0aW5nIGR1YmJlZCBhdWRpbyBmb3IgdGV4dDogJHt0ZXh0LnN1YnN0cmluZygwLCA1MCl9Li4uYCk7XG4gIFxuICAvLyBTdGVwIDI6IE1lcmdlIHdpdGggRkZtcGVnXG4gIC8vIFVzaW5nIC1zaG9ydGVzdCB0byBtYXRjaCBkdXJhdGlvblxuICBjb25zdCBjb21tYW5kID0gYGZmbXBlZyAtaSAke3ZpZGVvUGF0aH0gLWkgJHthdWRpb091dHB1dFBhdGh9IC1tYXAgMDp2IC1tYXAgMTphIC1jOnYgY29weSAtc2hvcnRlc3QgJHt2aWRlb091dHB1dFBhdGh9YDtcbiAgYXdhaXQgZXhlY1Byb21pc2UoY29tbWFuZCk7XG4gIFxuICByZXR1cm4gdmlkZW9PdXRwdXRQYXRoO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBsb2FkKGZpbGVQYXRoOiBzdHJpbmcsIGJ1Y2tldDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3Qga2V5ID0gYG91dHB1dHMvJHtwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKX1gO1xuICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCk7XG4gIFxuICBhd2FpdCBzM0NsaWVudC5zZW5kKG5ldyBQdXRPYmplY3RDb21tYW5kKHtcbiAgICBCdWNrZXQ6IGJ1Y2tldCxcbiAgICBLZXk6IGtleSxcbiAgICBCb2R5OiBmaWxlQ29udGVudCxcbiAgfSkpO1xuICBcbiAgcmV0dXJuIGBzMzovLyR7YnVja2V0fS8ke2tleX1gO1xufVxuIl19