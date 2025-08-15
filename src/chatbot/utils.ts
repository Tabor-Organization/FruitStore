import { BotResponse, ChatMessage, MessageType } from './types';

// Generate a unique ID for messages
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Create a new chat message
export function createMessage(type: MessageType, text: string): ChatMessage {
  return {
    id: generateId(),
    type,
    text,
    timestamp: new Date(),
  };
}

// Format timestamp for display
export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Mock API call to get bot response
export async function getBotResponse(userMessage: string): Promise<BotResponse> {
  // In a real implementation, this would call your backend API
  // For now, we'll simulate a delay and return mock responses
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple keyword-based responses
      if (userMessage.toLowerCase().includes('fruit')) {
        resolve({
          text: 'We have a variety of fruits available in our store. Would you like to see our current selection?',
          contentItems: [
            {
              type: 'text',
              content: 'You can browse our fruit selection in the main shop.'
            }
          ]
        });
      } else if (userMessage.toLowerCase().includes('price')) {
        resolve({
          text: 'Our fruit prices vary based on the season and availability. Is there a specific fruit you\'re interested in?',
        });
      } else if (userMessage.toLowerCase().includes('delivery')) {
        resolve({
          text: 'We offer delivery services for orders over $20. Delivery is usually within 24 hours.',
        });
      } else if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
        resolve({
          text: 'Hello! Welcome to Fruit Store. How can I help you today?',
        });
      } else {
        resolve({
          text: 'Thank you for your message. Is there anything specific about our fruits or services you\'d like to know?',
        });
      }
    }, 1000); // Simulate network delay
  });
}

