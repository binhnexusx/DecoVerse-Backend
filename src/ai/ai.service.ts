import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private HF_API =
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';

  async generateImage(prompt: string) {
    try {
      const response = await axios.post(
        this.HF_API,
        {
          inputs: prompt,
          options: {
            wait_for_model: true,
          },
        },
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

      return {
        image: `data:image/png;base64,${base64}`,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Image generation failed');
    }
  }
}
