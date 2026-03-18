import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelsService } from '../models/models.service';

interface GeminiRoomObject {
  id: string;
  name: string;
  type: string;
  category: string;
  color: string;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; depth: number };
  rotation: { y: number };
}

interface GeminiParsedRoom {
  roomSize: { width: number; height: number; depth: number };
  objects: GeminiRoomObject[];
}

@Injectable()
export class AiService {
  private HF_API =
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  constructor(private readonly modelsService: ModelsService) {
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
You are an expert 3D interior designer. Analyze this room image carefully and return a precise JSON layout.

Return ONLY valid JSON, no markdown, no explanation:
{
  "roomSize": { "width": number, "height": number, "depth": number },
  "objects": [
    {
      "id": "unique_snake_case_id",
      "name": "object name in English",
      "type": "furniture|decoration|lighting|appliance",
      "category": "sofa|bed|chair|dining_table|coffee_table|desk|wardrobe|shelf|lamp|plant|television|rug|decoration|appliance",
      "color": "#hexcolor",
      "position": { "x": number, "y": number, "z": number },
      "size": { "width": number, "height": number, "depth": number },
      "rotation": { "y": number }
    }
  ]
}

COORDINATE RULES (very important):
- Room center = (0, 0, 0)
- x: negative = left wall, positive = right wall (max ±width/2)
- z: negative = back wall, positive = front/camera side (max ±depth/2)
- y: always = 0 for floor objects (bed, sofa, table, chair, plant, rug)
- y: use actual height for wall-mounted or elevated objects (tv on stand = stand height)
- size: realistic meters (sofa: 2x0.8x0.9, bed: 1.8x0.5x2, chair: 0.6x0.9x0.6)

CATEGORY RULES (use exact string values):
- sofa, sectional sofa, couch → "sofa"
- bed, mattress → "bed"
- chair, armchair, office chair, gaming chair, stool → "chair"
- coffee table, side table, nightstand, end table → "coffee_table"
- dining table → "dining_table"
- desk, gaming desk, writing desk → "desk"
- wardrobe, dresser, cabinet, chest of drawers → "wardrobe"
- bookshelf, tv stand, media console, shelf, rack → "shelf"
- lamp, floor lamp, table lamp, ceiling light, chandelier → "lamp"
- plant, potted plant, tree → "plant"
- tv, monitor, screen, television → "television"
- rug, carpet, area rug, mat → "rug"
- curtain, wall art, picture, mirror, vase, pillow, decoration → "decoration"

POSITIONING RULES:
- Place objects realistically: sofa faces TV, bed against back wall, desk near side wall
- No objects should overlap
- Keep all objects within room bounds (x: ±width/2, z: ±depth/2)
- Bed headboard at back wall: z = -(depth/2 - 1.2)
- TV/media console at front or side wall opposite sofa
- Return 6-12 objects maximum
- SKIP: ceiling lights, spotlights, wall art, windows, doors, baseboards, curtains
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
      if (!jsonMatch) throw new Error('Gemini did not return valid JSON');

      const jsonStr = jsonMatch[0]
        .replace(/'/g, '"')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      const parsed = JSON.parse(jsonStr) as GeminiParsedRoom;

      const matched = await this.modelsService.matchFromGemini(parsed);
      return matched;
    } catch (err) {
      console.error('analyzeImage error:', err);
      throw new InternalServerErrorException('Image analysis failed');
    }
  }
}
