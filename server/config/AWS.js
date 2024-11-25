import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
  StartLabelDetectionCommand,
  GetLabelDetectionCommand,
} from '@aws-sdk/client-rekognition';
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import { AWS_ACCESS_ID, AWS_ACCESS_SECRET_KEY, AWS_REGION } from '../KEYS.js';

dotenv.config({
  path: '.env',
});

// AWS Configuration Class
class AWSConfig {
  static getS3Client() {
    return new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_ID,
        secretAccessKey: AWS_ACCESS_SECRET_KEY,
      },
    });
  }

  static getRekognitionClient() {
    return new RekognitionClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_ID,
        secretAccessKey: AWS_ACCESS_SECRET_KEY,
      },
    });
  }

  static getTranscribeClient() {
    return new TranscribeClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_ID,
        secretAccessKey: AWS_ACCESS_SECRET_KEY,
      },
    });
  }
}

// S3 Service Class
class S3Service {
  constructor() {
    this.s3Client = AWSConfig.getS3Client();
  }

  async uploadFile(fileBuffer, fileName, mimeType, bucketName) {
    try {
      const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
      };
      const result = await this.s3Client.send(new PutObjectCommand(params));
      return { success: true, message: 'File uploaded successfully', result };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return { success: false, message: 'Failed to upload file to S3', error };
    }
  }
}

// Rekognition Service Class
class RekognitionService {
  constructor() {
    this.rekognitionClient = AWSConfig.getRekognitionClient();
  }

  isImage(mimeType) {
    return mimeType.startsWith('image/');
  }

  isVideo(mimeType) {
    return mimeType.startsWith('video/');
  }

  async analyzeMedia(bucketName, objectKey, mimeType) {
    try {
      if (this.isImage(mimeType)) {
        const labelParams = {
          Image: {
            S3Object: {
              Bucket: bucketName,
              Name: objectKey,
            },
          },
          MaxLabels: 5,
          MinConfidence: 75,
        };

        const labelData = await this.rekognitionClient.send(new DetectLabelsCommand(labelParams));
        console.log("Labels detected:", labelData.Labels);

        const textParams = {
          Image: {
            S3Object: {
              Bucket: bucketName,
              Name: objectKey,
            },
          },
        };

        const textData = await this.rekognitionClient.send(new DetectTextCommand(textParams));
        console.log("Text detected:", textData.TextDetections);

        return { success: true, labels: labelData.Labels, detectedText: textData.TextDetections };
      } else if (this.isVideo(mimeType)) {
        const videoParams = {
          Video: {
            S3Object: {
              Bucket: bucketName,
              Name: objectKey,
            },
          },
          MaxLabels: 5,
          MinConfidence: 75,
        };

        const videoData = await this.rekognitionClient.send(new StartLabelDetectionCommand(videoParams));
        console.log("Video label detection started:", videoData);

        let jobStatus = 'IN_PROGRESS';
        let videoResult = null;

        while (jobStatus === 'IN_PROGRESS') {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const resultData = await this.rekognitionClient.send(new GetLabelDetectionCommand({ JobId: videoData.JobId }));
          jobStatus = resultData.JobStatus;

          if (jobStatus === 'SUCCEEDED') {
            videoResult = resultData.Labels;
            console.log("Video labels detected:", videoResult);
          } else if (jobStatus === 'FAILED') {
            return { success: false, message: 'Video label detection failed' };
          }
        }

        return { success: true, labels: videoResult };
      } else {
        return { success: false, message: 'Unsupported media type' };
      }
    } catch (error) {
      console.error("Error analyzing media with Rekognition:", error);
      return { success: false, message: 'Failed to analyze media with Rekognition', error };
    }
  }
}

// Transcription Service Class
class TranscriptionService {
  constructor() {
    this.transcribeClient = AWSConfig.getTranscribeClient();
  }

  async transcribeMedia(bucketName, objectKey, mimeType) {
    try {
      if (!mimeType.startsWith('audio/') && !mimeType.startsWith('video/')) {
        return { success: false, message: 'File must be an audio or video format' };
      }

      const jobName = `TranscriptionJob-${Date.now()}`;
      const transcriptionParams = {
        TranscriptionJobName: jobName,
        LanguageCode: 'en-US',
        Media: {
          MediaFileUri: `s3://${bucketName}/${objectKey}`,
        },
        MediaFormat: mimeType.includes('mp4') ? 'mp4' : mimeType.split('/')[1],
      };

      const startCommand = new StartTranscriptionJobCommand(transcriptionParams);
      const startResult = await this.transcribeClient.send(startCommand);
      console.log("Transcription started:", startResult);

      let jobStatus = 'IN_PROGRESS';
      let transcriptionUri = '';

      while (jobStatus === 'IN_PROGRESS') {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusResult = await this.transcribeClient.send(
          new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
        );
        jobStatus = statusResult.TranscriptionJob.TranscriptionJobStatus;

        if (jobStatus === 'COMPLETED') {
          transcriptionUri = statusResult.TranscriptionJob.Transcript.TranscriptFileUri;
        }
      }

      if (jobStatus === 'COMPLETED') {
        return { success: true, transcriptionUri };
      } else {
        return { success: false, message: 'Transcription job failed or was not completed in time.' };
      }
    } catch (error) {
      console.error("Error transcribing media with Amazon Transcribe:", error);
      return { success: false, message: error.message };
    }
  }
}

// Export Classes for Use
export { S3Service, RekognitionService, TranscriptionService };
