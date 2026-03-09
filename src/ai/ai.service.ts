import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private HF_API =
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async generateImage(prompt: string) {
    try {
      const response = await axios.post(
        this.HF_API,
        { inputs: prompt, options: { wait_for_model: true } },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'image/png',
          },
          responseType: 'arraybuffer',
        },
      );

      const base64 = Buffer.from(response.data).toString('base64');
      const dataUri = `data:image/png;base64,${base64}`;

      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: 'decoverse/previews',
        resource_type: 'image',
      });

      return {
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
      };
    } catch (err) {
      console.error('generateImage error:', err);
      throw new InternalServerErrorException('Image generation failed');
    }
  }

  async analyzeImage(imageUrl: string) {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

      const prompt = `
You are an interior design analyzer. Analyze this room image and identify all furniture and objects.

Return ONLY a valid JSON object (no markdown, no explanation) in this exact format:
{
  "roomSize": { "width": number, "height": number, "depth": number },
  "objects": [
    {
      "id": "unique_id",
      "name": "object name in English",
      "type": "furniture|decoration|lighting|appliance",
      "color": "#hexcolor",
      "position": { "x": number, "y": number, "z": number },
      "size": { "width": number, "height": number, "depth": number },
      "rotation": { "y": number }
    }
  ]
}

Rules:
- position (x, y, z) and size (width, height, depth) are in METERS
- position.y = 0 means object is on the floor
- position.y = half of object height for objects standing on floor
- x = left/right from room center, z = front/back from room center
- roomSize should be estimated from what you see (typical room: 5x3x4)
- Return at least 3 objects, maximum 15 objects
- Only return the JSON, nothing else
`;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/png',
            data: imageBase64,
          },
        },
      ]);

      const rawText = result.response.text().trim();

      const cleanText = rawText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        .trim();

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gemini did not return valid JSON');
      }

      const jsonStr = jsonMatch[0]
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      const parsed = JSON.parse(jsonStr) as unknown;
      return parsed;
    } catch (err) {
      console.error('analyzeImage error:', err);
      throw new InternalServerErrorException('Image analysis failed');
    }
  }
}
