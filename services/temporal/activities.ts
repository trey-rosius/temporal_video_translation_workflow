import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { getStream, streamToFile } from "./utils"; // Helpers for streams

const execPromise = promisify(exec);
const s3Client = new S3Client({});
const transcribeClient = new TranscribeClient({});
const translateClient = new TranslateClient({});
const pollyClient = new PollyClient({});

export async function ingest(bucket: string, key: string): Promise<string> {
  console.log(`Ingesting s3://${bucket}/${key}`);
  const localPath = path.join("/tmp", key);
  const response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  
  // Ensure the directory exists
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  
  // Use the helper utility to pipe S3 stream to file
  await streamToFile(response.Body as any, localPath);
  
  return localPath;
}

export async function transcribe(mediaPath: string, bucketName: string, key: string): Promise<string> {
  const jobName = `transcription-${Date.now()}`;
  const mediaUri = `s3://${bucketName}/${key}`;
  
  await transcribeClient.send(new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: "en-US",
    Media: { MediaFileUri: mediaUri },
    OutputBucketName: bucketName,
    OutputKey: `transcripts/${jobName}.json`,
  }));

  // Poll for completion
  while (true) {
    const { TranscriptionJob } = await transcribeClient.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobName
    }));
    
    if (TranscriptionJob?.TranscriptionJobStatus === "COMPLETED") {
        const transcriptKey = `transcripts/${jobName}.json`;
        const transcriptData = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: transcriptKey }));
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

export async function translate(text: string): Promise<string> {
  console.log("V2: Translating text:", text);
  if (!text || text.trim().length === 0) {
    console.log("V2: Empty text received for translation, skipping...");
    return "";
  }
  const response = await translateClient.send(new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: "en",
    TargetLanguageCode: "es",
  }));
  return response.TranslatedText || "";
}

export async function dub(videoPath: string, text: string): Promise<string> {
  const audioOutputPath = videoPath.replace(path.extname(videoPath), ".mp3");
  const videoOutputPath = videoPath.replace(path.extname(videoPath), "-dubbed.mp4");

  if (!text || text.trim().length === 0) {
    console.log("No text to dub, returning original video...");
    fs.copyFileSync(videoPath, videoOutputPath);
    return videoOutputPath;
  }

  // Step 1: TTS logic using AWS Polly
  console.log(`Generating dubbed audio for text: ${text.substring(0, 50)}...`);
  const pollyResponse = await pollyClient.send(new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: "Lucia", // Spanish female voice
    LanguageCode: "es-ES",
  }));

  if (pollyResponse.AudioStream) {
    await streamToFile(pollyResponse.AudioStream as any, audioOutputPath);
  } else {
    throw new Error("Failed to generate audio from Polly");
  }
  
  // Step 2: Merge with FFmpeg
  console.log(`Merging video ${videoPath} with audio ${audioOutputPath}...`);
  // Use -c:a aac to ensure compatibility if needed, but here we just map video and audio
  const command = `ffmpeg -y -i ${videoPath} -i ${audioOutputPath} -map 0:v -map 1:a -c:v copy -shortest ${videoOutputPath}`;
  await execPromise(command);
  
  return videoOutputPath;
}

export async function upload(filePath: string, bucket: string): Promise<string> {
  const key = `dubbed/${path.basename(filePath)}`;
  const fileContent = fs.readFileSync(filePath);
  
  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
  }));
  
  return `s3://${bucket}/${key}`;
}
