export declare class ChatMessageDto {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export declare class CreateChatCompletionDto {
    messages: ChatMessageDto[];
}
export declare class ChatCompletionResponseDto {
    assistant: string;
}
