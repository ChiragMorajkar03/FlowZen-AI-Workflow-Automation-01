'use client';

import { useEffect, useState } from 'react';

/**
 * Botpress Chatbot Integration
 * 
 * This component creates and injects a Botpress chatbot iframe into the application.
 * It positions the chatbot in the bottom-right corner of the screen with minimize/maximize functionality.
 */

// Note: Main type definitions are in src/types/botpress.d.ts
// This is just for local component use
declare global {
  interface Window {
    botpressWebChat?: {
      init: (config: any) => void;
      sendEvent: (event: any) => void;
    };
  }
}

/**
 * ChatbotWrapper Component
 * 
 * This component renders a Botpress chatbot in the bottom-right corner of the screen.
 * No props are required as the configuration is handled internally.
 */
export default function ChatbotWrapper() {
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize the chatbot when the component mounts
  useEffect(() => {
    // Create a container for the chatbot
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    container.style.width = isMinimized ? '60px' : '360px';
    container.style.height = isMinimized ? '60px' : '500px';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
    container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    container.style.overflow = 'hidden';
    container.style.backgroundColor = '#ffffff';
    container.style.border = '1px solid #e5e7eb';
    
    // Create the iframe
    const iframe = document.createElement('iframe');
    // Use environment variable for the Botpress configuration URL
    const botpressConfigUrl = process.env.NEXT_PUBLIC_BOTPRESS_CONFIG_URL;
    
    if (!botpressConfigUrl) {
      console.error('Botpress configuration URL is not set. Please set NEXT_PUBLIC_BOTPRESS_CONFIG_URL in your .env file');
      return;
    }

    iframe.src = botpressConfigUrl;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.zIndex = '1';
    
    // Create minimize button for the chat interface
    const minimizeButton = document.createElement('button');
    minimizeButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z" fill="currentColor"/>
        <path d="M7 7H17V17H7V7Z" fill="currentColor"/>
      </svg>
    `;
    
    minimizeButton.style.position = 'absolute';
    minimizeButton.style.top = '10px';
    minimizeButton.style.right = '10px';
    minimizeButton.style.width = '30px';
    minimizeButton.style.height = '30px';
    minimizeButton.style.borderRadius = '50%';
    minimizeButton.style.border = 'none';
    minimizeButton.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
    minimizeButton.style.color = 'white';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.zIndex = '3';
    minimizeButton.style.display = isMinimized ? 'none' : 'flex';
    minimizeButton.style.alignItems = 'center';
    minimizeButton.style.justifyContent = 'center';
    minimizeButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    minimizeButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
      </svg>
    `;
    
    chatButton.style.position = 'absolute';
    chatButton.style.top = '0';
    chatButton.style.left = '0';
    chatButton.style.width = '100%';
    chatButton.style.height = '100%';
    chatButton.style.borderRadius = '12px';
    chatButton.style.border = 'none';
    chatButton.style.background = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';
    chatButton.style.color = 'white';
    chatButton.style.cursor = 'pointer';
    chatButton.style.zIndex = '2';
    chatButton.style.display = isMinimized ? 'flex' : 'none';
    chatButton.style.alignItems = 'center';
    chatButton.style.justifyContent = 'center';
    chatButton.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    chatButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    
    // Add hover effects
    const addHoverEffect = (button: HTMLButtonElement) => {
      button.onmouseover = () => {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
      };
      
      button.onmouseout = () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      };
    };

    addHoverEffect(minimizeButton);
    addHoverEffect(chatButton);

    const toggleMinimize = () => {
      setIsMinimized(!isMinimized);
      container.style.width = !isMinimized ? '60px' : '360px';
      container.style.height = !isMinimized ? '60px' : '500px';
      chatButton.style.display = !isMinimized ? 'flex' : 'none';
      minimizeButton.style.display = !isMinimized ? 'none' : 'flex';
    };

    minimizeButton.onclick = toggleMinimize;
    chatButton.onclick = toggleMinimize;
    
    // Add iframe and buttons to container
    container.appendChild(iframe);
    container.appendChild(chatButton);
    container.appendChild(minimizeButton);
    
    // Add container to body
    document.body.appendChild(container);

    // Cleanup function to remove the chatbot when component unmounts
    return () => {
      // Cleanup on unmount
      if (container) {
        document.body.removeChild(container);
      }
    };
  }, [isMinimized]);

  return null;
} 