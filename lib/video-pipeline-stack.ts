import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as path from 'path';
import { Construct } from 'constructs';

export class VideoPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

   // 1. Storage
    const mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 2. The "Magic Three" Roles for Express Mode
    const executionRole = new iam.Role(this, 'ExecRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')],
    });

    const infraRole = new iam.Role(this, 'InfraRole', {
      assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSInfrastructureRoleforExpressGatewayServices')],
    });
// Task Role (Permissions for our application code)
    const taskRole = new iam.Role(this, 'WorkerTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonTranscribeFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('TranslateFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonPollyFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess'),
      ],
    });
    
    mediaBucket.grantReadWrite(taskRole);

    // 2.5 Docker Image Asset (Build and Push automatically)
    const workerImage = new ecr_assets.DockerImageAsset(this, 'WorkerImage', {
      directory: path.join(__dirname, '../'),
      platform: ecr_assets.Platform.LINUX_AMD64,
    });

    // 3. ECS Express Mode Service (Minimal Config)
    const expressService = new ecs.CfnExpressGatewayService(this, 'WorkerService', {
      serviceName: 'video-worker-express',
      // If cluster is omitted, it uses the default account cluster
      primaryContainer: {
        image: workerImage.imageUri,
        containerPort: 8080,
         environment: [
          { name: 'TEMPORAL_ADDRESS', value: process.env.TEMPORAL_ADDRESS || '' },
          { name: 'TEMPORAL_NAMESPACE', value: process.env.TEMPORAL_NAMESPACE || '' },
          { name: 'TEMPORAL_API_KEY', value: process.env.TEMPORAL_API_KEY || '' },
          { name: 'MEDIA_BUCKET', value: mediaBucket.bucketName },
          { name: 'PORT', value: '8080' },
        ],
      },
      
      cpu: '1024',
      memory: '2048',
      healthCheckPath: '/',
      infrastructureRoleArn: infraRole.roleArn,
      executionRoleArn: executionRole.roleArn,
      taskRoleArn: taskRole.roleArn,
    });


    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: mediaBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'WorkerServiceArn', {
      value: expressService.attrServiceArn,
    });

    new cdk.CfnOutput(this, "expressServiceUrl", {
      key: 'expressServiceUrl',
      value: 'https://' + expressService.getAtt("Endpoint").toString()
    });

    // 4. Lambda Trigger (S3 -> Temporal)
    const triggerLambda = new nodejs.NodejsFunction(this, 'S3TriggerLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../services/lambda/trigger/index.ts'),
      handler: 'handler',
      environment: {
        TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || '',
        TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE || '',
        TEMPORAL_API_KEY: process.env.TEMPORAL_API_KEY || '',
      },
      bundling: {
        minify: false,
        sourceMap: true,
      },
    });

    mediaBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(triggerLambda), { prefix: 'uploads/' });

    // 5. API Gateway for Control Plane
    const api = new apigateway.RestApi(this, 'VideoPipelineApi');
    const workflow = api.root.addResource('workflow');
    const singleWorkflow = workflow.addResource('{id}');

    // Control Lambda (Query/Signal)
    const controlLambda = new nodejs.NodejsFunction(this, 'ControlLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../services/lambda/control/index.ts'),
      handler: 'handler',
      environment: {
        TEMPORAL_ADDRESS: process.env.TEMPORAL_ADDRESS || '',
        TEMPORAL_NAMESPACE: process.env.TEMPORAL_NAMESPACE || '',
        TEMPORAL_API_KEY: process.env.TEMPORAL_API_KEY || '',
      },
      bundling: {
        minify: false,
        sourceMap: true,
      },
    });

    singleWorkflow.addMethod('GET', new apigateway.LambdaIntegration(controlLambda));
    singleWorkflow.addMethod('POST', new apigateway.LambdaIntegration(controlLambda));
  }
}
