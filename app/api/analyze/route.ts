import { NextResponse } from "next/server";

/**
 * Analyzes the uploaded image and returns session ID + additional questions.
 * Replace this with your actual backend call.
 */
export async function POST(request: Request) {
  try {
    const { image } = (await request.json()) as { image?: string };
    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    // TODO: Send image to your backend, get sessionId and questions
    // Example: const res = await fetch(`${BACKEND_URL}/analyze`, { ... });

    const sessionId = `session-${Date.now()}`;
    const questions = [
      { id: "eye_color", label: "Цвет глаз", type: "select" as const, options: ["Карий", "Голубой", "Серый", "Зелёный", "Чёрный", "Другой"] },
      { id: "region", label: "Регион происхождения", type: "select" as const, options: ["Восточная Европа", "Западная Европа", "Северная Европа", "Южная Европа", "Центральная Азия", "Восточная Азия", "Другой"] },
      { id: "body_type", label: "Тип телосложения", type: "select" as const, options: ["Астенический", "Нормостенический", "Гиперстенический"] },
    ];

    return NextResponse.json({ sessionId, questions });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
