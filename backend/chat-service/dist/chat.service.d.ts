import { ConfigService } from '@nestjs/config';
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export declare class ChatService {
    private configService;
    private openai;
    private readonly logger;
    private modelName;
    constructor(configService: ConfigService);
    getChatResponse(messages: ChatMessage[]): Promise<string>;
}
export {};
