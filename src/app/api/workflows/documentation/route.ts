import { NextResponse } from 'next/server';
import { generateDocumentation } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, nodes, edges, connections } = body;

    const documentation = await generateDocumentation({
      name,
      description,
      nodes,
      edges,
      connections,
    });

    return NextResponse.json({ documentation });
  } catch (error) {
    console.error('Error in documentation generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
} 