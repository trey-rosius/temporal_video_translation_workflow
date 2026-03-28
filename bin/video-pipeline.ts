import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VideoPipelineStack } from '../lib/video-pipeline-stack';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const app = new cdk.App();
new VideoPipelineStack(app, 'VideoPipelineStack', {
  env: { 
    account: '730335533756', 
    region: 'us-east-1' 
  },
});
