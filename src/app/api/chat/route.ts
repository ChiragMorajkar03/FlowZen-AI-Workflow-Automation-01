import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getApplicationSpecificResponse } from '@/lib/knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // First check if it's an application-specific query
    const appResponse = getApplicationSpecificResponse(lastMessage);
    
    if (appResponse) {
      // If it's an app-specific query, use the knowledge base response
      return NextResponse.json({
        role: 'assistant',
        content: appResponse.answer,
        isAppSpecific: true,
        followUpQuestions: appResponse.followUpQuestions
      });
    }

    try {
      // For general queries, use OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for Fuzzie, an automation platform. 
            You can help with both application-specific questions and general queries.
            Be friendly, professional, and concise in your responses.
            If you're not sure about something, say so rather than making things up.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({
        role: 'assistant',
        content: completion.choices[0].message.content,
        isAppSpecific: false
      });
    } catch (openaiError: any) {
      // Handle OpenAI API errors
      if (openaiError.code === 'insufficient_quota') {
        return NextResponse.json({
          role: 'assistant',
          content: "I apologize, but I'm currently unable to process general queries due to API limitations. However, I can still help you with specific questions about Fuzzie! Try asking about features, feedback, or support.",
          isAppSpecific: false,
          error: 'API quota exceeded'
        });
      }

      // For other OpenAI errors
      return NextResponse.json({
        role: 'assistant',
        content: "I'm having trouble processing your request right now. Please try asking about specific Fuzzie features or try again later.",
        isAppSpecific: false,
        error: 'API error'
      });
    }
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json({
      role: 'assistant',
      content: "I'm sorry, I encountered an error. Please try asking about specific Fuzzie features or try again later.",
      isAppSpecific: false,
      error: 'Internal server error'
    });
  }
} 