import { ChatState, ChatMessage } from './types';
import { createMessage, getBotResponse } from './utils';
import './ChatBot.css';

export class ChatBot {
  private container: HTMLElement;
  private state: ChatState;
  private messageList: HTMLElement;
  private inputField: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private toggleButton: HTMLButtonElement;
  private chatWindow: HTMLElement;
  private isOpen: boolean = false;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }
    
    this.container = container;
    this.state = {
      messages: [],
      isLoading: false,
      error: null
    };

    // Create chat UI
    this.createChatUI();
    
    // Initialize elements
    this.messageList = document.getElementById('chat-messages') as HTMLElement;
    this.inputField = document.getElementById('chat-input') as HTMLInputElement;
    this.sendButton = document.getElementById('chat-send') as HTMLButtonElement;
    this.toggleButton = document.getElementById('chat-toggle') as HTMLButtonElement;
    this.chatWindow = document.getElementById('chat-window') as HTMLElement;
    
    // Add event listeners
    this.addEventListeners();
    
    // Add welcome message
    this.addBotMessage('Hello! How can I help you with your fruit shopping today?');
  }

  private createChatUI(): void {
    this.container.innerHTML = `
      <div class="chat-container">
        <button id="chat-toggle" class="chat-toggle">
          <span class="chat-toggle-icon">💬</span>
        </button>
        <div id="chat-window" class="chat-window chat-hidden">
          <div class="chat-header">
            <h3>Fruit Store Support</h3>
            <button id="chat-close" class="chat-close">×</button>
          </div>
          <div id="chat-messages" class="chat-messages"></div>
          <div class="chat-input-container">
            <input 
              type="text" 
              id="chat-input" 
              class="chat-input" 
              placeholder="Type your message here..."
              aria-label="Chat message"
            />
            <button id="chat-send" class="chat-send" aria-label="Send message">
              <span class="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private addEventListeners(): void {
    // Send message on button click
    this.sendButton.addEventListener('click', () => this.sendMessage());
    
    // Send message on Enter key
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Toggle chat window
    this.toggleButton.addEventListener('click', () => this.toggleChat());
    
    // Close chat window
    const closeButton = document.getElementById('chat-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.toggleChat(false));
    }
  }

  private toggleChat(open?: boolean): void {
    this.isOpen = open !== undefined ? open : !this.isOpen;
    
    if (this.isOpen) {
      this.chatWindow.classList.remove('chat-hidden');
      this.toggleButton.classList.add('chat-toggle-active');
      // Focus the input field when opening
      setTimeout(() => this.inputField.focus(), 100);
    } else {
      this.chatWindow.classList.add('chat-hidden');
      this.toggleButton.classList.remove('chat-toggle-active');
    }
  }

  private async sendMessage(): void {
    const text = this.inputField.value.trim();
    if (!text) return;
    
    // Clear input field
    this.inputField.value = '';
    
    // Add user message to chat
    this.addUserMessage(text);
    
    // Show loading indicator
    this.setLoading(true);
    
    try {
      // Get bot response
      const response = await getBotResponse(text);
      
      // Add bot response to chat
      this.addBotMessage(response.text);
      
      // Add any additional content items
      if (response.contentItems) {
        response.contentItems.forEach(item => {
          if (item.type === 'text') {
            this.addBotMessage(item.content as string);
          }
          // Handle other content types as needed
        });
      }
    } catch (error) {
      this.setError('Sorry, I couldn\'t process your request. Please try again.');
      console.error('Error getting bot response:', error);
    } finally {
      this.setLoading(false);
    }
  }

  private addUserMessage(text: string): void {
    const message = createMessage('user', text);
    this.state.messages.push(message);
    this.renderMessage(message);
  }

  private addBotMessage(text: string): void {
    const message = createMessage('bot', text);
    this.state.messages.push(message);
    this.renderMessage(message);
  }

  private renderMessage(message: ChatMessage): void {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${message.type}-message`;
    
    const timestamp = message.timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
      <div class="message-content">
        <span class="message-text">${message.text}</span>
      </div>
      <div class="message-timestamp">${timestamp}</div>
    `;
    
    this.messageList.appendChild(messageElement);
    
    // Scroll to bottom
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  private setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    
    if (isLoading) {
      const loadingElement = document.createElement('div');
      loadingElement.className = 'chat-message bot-message loading-message';
      loadingElement.id = 'loading-indicator';
      loadingElement.innerHTML = `
        <div class="message-content">
          <span class="loading-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
      `;
      this.messageList.appendChild(loadingElement);
      this.messageList.scrollTop = this.messageList.scrollHeight;
    } else {
      const loadingElement = document.getElementById('loading-indicator');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  private setError(errorMessage: string): void {
    this.state.error = errorMessage;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'chat-message error-message';
    errorElement.innerHTML = `
      <div class="message-content">
        <span class="message-text">${errorMessage}</span>
      </div>
    `;
    
    this.messageList.appendChild(errorElement);
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }
}

