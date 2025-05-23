import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;
  private readonly logger = new Logger(ChatService.name);
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName = this.configService.get<string>('OPENAI_MODEL_NAME', 'gpt-4o'); // За замовчуванням gpt-4o

    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not configured.');
      throw new InternalServerErrorException('OpenAI API key is not configured.');
    }
    this.openai = new OpenAI({ apiKey });
    this.logger.log(`OpenAI client initialized with model: ${this.modelName}`);
  }

  async getChatResponse(messages: ChatMessage[]): Promise<string> {
    if (!messages || messages.length === 0) {
      return 'Будь ласка, надайте повідомлення для чату.';
    }

    // Обмеження історії, як у Flask
    const limitedMessages = messages.length > 30 ? messages.slice(-30) : messages;

    try {
      this.logger.log(`Sending ${limitedMessages.length} messages to OpenAI model ${this.modelName}.`);
      const completion = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: limitedMessages as any, // OpenAI SDK очікує конкретні типи, але структура та сама
        max_tokens: 400, // Як у Flask
      });

      const assistantResponse = completion.choices[0]?.message?.content;
      if (!assistantResponse) {
        this.logger.error('OpenAI response did not contain content.', completion);
        throw new InternalServerErrorException('Не вдалося отримати відповідь від AI.');
      }
      this.logger.log('Successfully received response from OpenAI.');
      return assistantResponse.trim();
    } catch (error) {
      this.logger.error('Error communicating with OpenAI API', error.stack);
      if (error.response) {
        this.logger.error('OpenAI API Error Response:', error.response.data);
      }
      throw new InternalServerErrorException('Помилка при спілкуванні з AI сервісом.');
    }
  }
}
