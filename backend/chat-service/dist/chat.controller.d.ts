import { ChatService } from './chat.service';
import { CreateChatCompletionDto, ChatCompletionResponseDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createCompletion(createChatDto: CreateChatCompletionDto): Promise<ChatCompletionResponseDto>;
}
