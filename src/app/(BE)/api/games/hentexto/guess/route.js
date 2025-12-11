import { NextResponse } from "next/server";
// Import file vector vào RAM (Next.js sẽ cache file này)
// Đảm bảo bạn đã chạy script generate-json-vector.js ở bước trước để có file này
import embeddings from "@/../public/data/embeddings.json";

// Hàm toán học: Tính độ tương đồng Cosine (Cosine Similarity)
// Input: 2 mảng vector. Output: Số từ -1 đến 1 (1 là giống hệt)
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  // Vì vector từ Xenova/MiniLM thường đã được normalized (độ dài = 1)
  // nên mẫu số (normA * normB) sẽ xấp xỉ 1.
  // Tuy nhiên tính đầy đủ để an toàn:
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { guestId, secretId } = body;

    if (!guestId || !secretId) {
      return NextResponse.json(
        { success: false, message: "Missing IDs" },
        { status: 400 }
      );
    }

    // 1. Tìm vector của 2 bộ phim trong file JSON
    const guestItem = embeddings.find((e) => e.id === guestId);
    const secretItem = embeddings.find((e) => e.id === secretId);

    if (!guestItem || !secretItem) {
      // Trường hợp hiếm: ID có trong DB nhưng chưa được generate vector
      return NextResponse.json(
        { success: false, message: "Embedding not found for this anime" },
        { status: 404 }
      );
    }

    // 2. Tính độ giống nhau của bộ khách vừa đoán
    const targetSimilarity = cosineSimilarity(
      guestItem.vector,
      secretItem.vector
    );

    // 3. Tính Rank (Thứ hạng)
    // Rank = Số lượng anime có độ giống nhau CAO HƠN bộ khách đoán
    let rank = 1;

    for (const item of embeddings) {
      // Bỏ qua chính bộ bí mật
      if (item.id === secretId) continue;

      const sim = cosineSimilarity(item.vector, secretItem.vector);

      // Nếu có bộ nào giống secret hơn bộ guest -> Rank bị đẩy xuống
      if (sim > targetSimilarity) {
        rank++;
      }
    }

    return NextResponse.json({
      success: true,
      rank: rank,
      similarity: targetSimilarity, // Trả về để debug nếu cần
    });
  } catch (error) {
    console.error("Game Algorithm Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
