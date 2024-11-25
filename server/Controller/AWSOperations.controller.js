import axios from 'axios';
import { S3Service, RekognitionService, TranscriptionService } from '../config/AWS.js';
import fs from 'fs';
import path from 'path';
import { ApifyClient } from 'apify-client';
import { APIFY_KEY, S3_BUCKET } from '../KEYS.js';
import Gemini from '../GenAI/Gemini.js';
import { ModelHistory, UserHistory } from '../config/GeminiData.js';


class AwsOperationsController extends Gemini {
  constructor() {
    super();
    this.s3Service = new S3Service();
    this.rekognitionService = new RekognitionService();
    this.transcriptionService = new TranscriptionService();
    this.client = new ApifyClient({ token: APIFY_KEY });

  }

  /**
   * Upload a file and process it
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async uploadAndProcessFile(req, res) {
    const { type, link } = req.body;
    let fileBuffer, originalname, mimetype, mediaUrl;
    const bucketName = S3_BUCKET;
    console.log({ type, link, fiel:req.file });
    try {
      // Handle file or URL upload
      if (type === 'file') {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        fileBuffer = req.file.buffer;
        originalname = req.file.originalname;
        mimetype = req.file.mimetype;
      } else if (type === 'link') {
        if (!link) return res.status(400).json({ message: "No URL provided" });
        mediaUrl = await this.webScapper(link);
        const response = await axios.get(mediaUrl.videoUrl, { responseType: 'arraybuffer' });
        if (!response.data) return res.status(400).json({ message: "Failed to fetch media" });
        fileBuffer = Buffer.from(response.data);
        originalname = link.split('/').pop();
        mimetype = response.headers['content-type'];
      } else {
        return res.status(400).json({ message: "Invalid type value" });
      }

      // Upload file to S3
      const objectKey = `${Date.now()}_${originalname}`;
      const uploadResult = await this.s3Service.uploadFile(fileBuffer, objectKey, mimetype, bucketName);
      if (!uploadResult.success) return res.status(500).json({ message: 'Failed to upload to S3' });

      // Process the file
      const processedData = await this.processFile(bucketName, objectKey, mimetype, mediaUrl);
      // Generate AI insights
      const geminiInsights = await this.generateAIInsights(processedData);

      return res.status(200).json({
        message: 'File uploaded and processed successfully',
        success:true,
        geminiInsights,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Process the file with Rekognition and Transcription
   * @param {string} bucketName - The S3 bucket name
   * @param {string} objectKey - The S3 object key
   * @param {string} mimeType - The file's MIME type
   * @param {object} mediaUrl - Media URL data for social media
   * @returns {Promise<object>}
   */

  async processFile(bucketName, objectKey, mimeType, mediaUrl) {
    const processedData = {
      imageToTextData: null,
      videoRecognition: null,
      videoToTextTranscribe: null,
      socialmediaCaption: null,
      socialmediaHashtags: null,
    };

    if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
      const transcriptionResult = await this.transcriptionService.transcribeMedia(bucketName, objectKey, mimeType);
      if (transcriptionResult.success) {
        // write the transriptoin result in file.txt
        const resultFromTranscription = await axios.get(transcriptionResult.transcriptionUri);
        const transcriptions = JSON.stringify(resultFromTranscription.data.results.transcripts || null);
        processedData.videoToTextTranscribe = transcriptions || "null";
      }
    }

    if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
      const rekognitionResult = await this.rekognitionService.analyzeMedia(bucketName, objectKey, mimeType);
      if (rekognitionResult.success) {
        // write the transriptoin result in file.txt
        processedData.videoRecognition = JSON.stringify(rekognitionResult.labels, null, 2) || "null";
        processedData.imageToTextData = JSON.stringify(rekognitionResult.detectedText, null, 2) || "null";
      }
    }

    if (mediaUrl) {
      processedData.socialmediaCaption = mediaUrl.caption || "null";
      processedData.socialmediaHashtags = mediaUrl.hashtags || "null";
    }

    return processedData;
  }

  async generateAIInsights(processedData) {
    const filterData = `
    Video Recognition Data: ${processedData.videoRecognition},
    Image to Text Data: ${processedData.imageToTextData},
    Video to Text Transcription: ${processedData.videoToTextTranscribe},
    Social Media Caption: ${processedData.socialmediaCaption},
    Hashtags: ${processedData.socialmediaHashtags},
    `;

    const finalPrompt = `Generate insights from the following data: ${filterData} it should follow the JSON output like: ${ModelHistory}`;
  try {
    console.log(finalPrompt);
      const geminiResponse = await this.model.sendMessage(finalPrompt);
      console.log(geminiResponse);
       return geminiResponse?.response?.text() || "No insights generated.";
    } catch (error) {
      console.error("Error generating AI insights:", error);
      return "Failed to generate AI insights.";
    }
  }


  /**
   * Fetch media using Apify (integrated for mediaUrl)
   * @param {string} link - The social media URL 
   * @returns {Promise<object>} - Returns the fetched media URL data
   */
  async webScapper(link) {
    const log = {
      "directUrls": [link],
      "resultsType": "posts",
      "resultsLimit": 100,
    };

    try {
      const data = await this.client.actor('shu8hvrXbJbY3Eb9W').call(log);
      const { items } = await this.client.dataset(data.defaultDatasetId).listItems();
      console.log({ items: items });
      if (items && items.length > 0) {
        return {
          videoUrl: items[0].videoUrl || items[0].imageUrl || items[0].displayUrl,
          caption: items[0].caption || "No caption available",
          hashtags: items[0].hashtags || [],
        };
      } else {
        throw new Error('Not a valid URL');
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

export default AwsOperationsController;
