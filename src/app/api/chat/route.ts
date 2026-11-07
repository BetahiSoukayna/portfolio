import { NextResponse } from 'next/server';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Le message ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Timeout pour éviter que la requête reste bloquée indéfiniment
    // si le service Python ne répond pas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s

    let response: Response;
    try {
      response = await fetch(`${PYTHON_SERVICE_URL}/rag/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`Service Python error: ${response.status} — ${errorText}`);
      throw new Error(`Service Python error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      response: data.response,
      sources: data.sources ?? [],
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Chat API Error: timeout — le service Python n\'a pas répondu à temps');
      return NextResponse.json(
        { error: 'Le service met trop de temps à répondre, réessayez.' },
        { status: 504 }
      );
    }

    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement de votre demande' },
      { status: 500 }
    );
  }
}