// import { NextResponse } from 'next/server';

// const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// interface ChatMessage {
//   role: 'user' | 'assistant';
//   content: string;
// }

// interface ChatRequestBody {
//   message: string;
//   history?: ChatMessage[];
// }

// export async function POST(request: Request) {
//   try {
//     const body: ChatRequestBody = await request.json();
//     const { message, history = [] } = body;

//     if (!message || !message.trim()) {
//       return NextResponse.json(
//         { error: 'Le message ne peut pas être vide' },
//         { status: 400 }
//       );
//     }

//     // Timeout pour éviter que la requête reste bloquée indéfiniment
//     // si le service Python ne répond pas
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30s

//     let response: Response;
//     try {
//       response = await fetch(`${PYTHON_SERVICE_URL}/rag/query`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           message,
//           history,
//         }),
//         signal: controller.signal,
//       });
//     } finally {
//       clearTimeout(timeoutId);
//     }

//     if (!response.ok) {
//       const errorText = await response.text().catch(() => '');
//       console.error(`Service Python error: ${response.status} — ${errorText}`);
//       throw new Error(`Service Python error: ${response.status}`);
//     }

//     const data = await response.json();

//     return NextResponse.json({
//       response: data.response,
//       sources: data.sources ?? [],
//     });

//   } catch (error) {
//     if (error instanceof Error && error.name === 'AbortError') {
//       console.error('Chat API Error: timeout — le service Python n\'a pas répondu à temps');
//       return NextResponse.json(
//         { error: 'Le service met trop de temps à répondre, réessayez.' },
//         { status: 504 }
//       );
//     }

//     console.error('Chat API Error:', error);
//     return NextResponse.json(
//       { error: 'Erreur lors du traitement de votre demande' },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import {
  buildSystemPrompt,
  cleanAnswer,
  detectLanguage,
  smallTalkAnswer,
  type ChatMessage,
} from "@/lib/portfolio-chat";

export const runtime = "nodejs";
export const maxDuration = 30;

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_GENERATOR_MODEL || "openai/gpt-oss-120b";
const MAX_MESSAGE_CHARS = 500;

// Limiteur simple (par IP, en mémoire) pour éviter qu'un robot vide ton quota Groq.
const hits = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 12; // 12 messages par minute et par visiteur
}

interface ChatRequestBody {
  message?: string;
  history?: ChatMessage[];
}

export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const message = (body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: "Le message ne peut pas être vide" }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `Message trop long (${MAX_MESSAGE_CHARS} caractères maximum).` },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de messages, réessayez dans une minute." },
        { status: 429 }
      );
    }

    // Salutations / remerciements : réponse directe, sans appel au modèle
    const quick = smallTalkAnswer(message);
    if (quick) return NextResponse.json({ response: quick, sources: [] });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("Chat API: GROQ_API_KEY manquante");
      return NextResponse.json({ error: "Assistant indisponible pour le moment." }, { status: 500 });
    }

    const language = detectLanguage(message);
    const system = buildSystemPrompt(history, message, language);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25_000);

    let res: Response;
    try {
      res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.3,
          max_completion_tokens: 1200,
          ...(MODEL.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
          messages: [
            { role: "system", content: system },
            { role: "user", content: message },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`Groq error: ${res.status} — ${errorText}`);
      throw new Error(`Groq error: ${res.status}`);
    }

    const data = await res.json();
    const answer = cleanAnswer(data?.choices?.[0]?.message?.content ?? "");

    return NextResponse.json({
      response: answer || "Désolé, je n'ai pas pu générer de réponse.",
      sources: [],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Chat API: timeout Groq");
      return NextResponse.json(
        { error: "Le service met trop de temps à répondre, réessayez." },
        { status: 504 }
      );
    }
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de votre demande" },
      { status: 500 }
    );
  }
}