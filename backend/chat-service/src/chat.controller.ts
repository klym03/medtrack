import { Controller, Post, Body, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatCompletionDto, ChatCompletionResponseDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK) // Зазвичай POST для створення ресурсу, але тут отримуємо відповідь, тому ОК
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createCompletion(
    @Body() createChatDto: CreateChatCompletionDto,
  ): Promise<ChatCompletionResponseDto> {
    const assistantResponse = await this.chatService.getChatResponse(createChatDto.messages);
    return { assistant: assistantResponse };
  }
}
