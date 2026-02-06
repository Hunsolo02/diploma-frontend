import { NextResponse } from "next/server";

/**
 * Submits user answers and returns analysis result.
 * Replace this with your actual backend call.
 */
export async function POST(request: Request) {
  try {
    const { sessionId, answers } = (await request.json()) as {
      sessionId?: string;
      answers?: Record<string, string | number>;
    };

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: "sessionId and answers required" },
        { status: 400 }
      );
    }

    // TODO: Send to your backend, get final result
    // Example: const res = await fetch(`${BACKEND_URL}/analyze/answers`, { ... });

    const result = {
      phenotype: "Медитерранид",
      origin: "Результат стабилизации медитерраноидных и нордоидных типов.",
      concentration: "Северная Испания, северная Франция, западная Германия, Бельгия, Нидерланды, Великобритания.",
      raw: answers,
    };

    return NextResponse.json({ result });
  } catch (e) {
    console.error("Submit answers error:", e);
    return NextResponse.json(
      { error: "Submit failed" },
      { status: 500 }
    );
  }
}
