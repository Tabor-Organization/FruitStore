export type MessageType = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export type ContentType = 'text' | 'image' | 'link' | 'product';

export interface ContentItem {
  type: ContentType;
  content: string | { [key: string]: any };
}

export interface BotResponse {
  text: string;
  contentItems?: ContentItem[];
}

