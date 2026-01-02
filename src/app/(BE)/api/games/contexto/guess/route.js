import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Cache toàn bộ dữ liệu vector vào RAM
const VECTOR_CACHE = {
  anime: null,
  hanime: null,
};

// Hàm tính toán Cosine Similarity
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  // Dùng vòng lặp for cơ bản cho nhanh
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Hàm đọc file JSON
async function getVectors(mode) {
  if (VECTOR_CACHE[mode]) return VECTOR_CACHE[mode];

  const fileName = mode === "hanime" ? "hembeddings.json" : "aembeddings.json";
  const filePath = path.join(process.cwd(), "public", "data", fileName);

  if (!fs.existsSync(filePath)) return [];

  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(fileContent);

    // Dữ liệu từ script của bạn: { id: 123, vector: [...] }
    // Ta chuẩn hóa ID về string để so sánh an toàn
    const data = jsonData.map((item) => ({
      id: String(item.id),
      vector: item.vector, // QUAN TRỌNG: Script của bạn dùng key 'vector'
    }));

    VECTOR_CACHE[mode] = data;
    console.log(`✅ [Guess] Cached ${data.length} vectors for ${mode}`);
    return data;
  } catch (err) {
    console.error("❌ Error parsing vector file:", err);
    return [];
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { guestId, secretId } = body;
    const mode = request.headers.get("app_mode") || "anime";

    if (!guestId || !secretId) {
      return NextResponse.json(
        { success: false, message: "Missing IDs" },
        { status: 400 }
      );
    }

    // Check nhanh đoán trúng
    if (String(guestId) === String(secretId)) {
      return NextResponse.json({ success: true, rank: 1, similarity: 1 });
    }

    // 1. Lấy dữ liệu vector
    const sourceData = await getVectors(mode);

    if (sourceData.length === 0) {
      return NextResponse.json(
        { success: false, message: "No vector data loaded" },
        { status: 500 }
      );
    }

    // 2. Tìm vector của Guest và Secret
    // Lưu ý: Cần convert ID từ request về String để so sánh với ID trong cache
    const guestItem = sourceData.find((e) => e.id === String(guestId));
    const secretItem = sourceData.find((e) => e.id === String(secretId));

    if (!guestItem) {
      return NextResponse.json(
        { success: false, message: "Guest ID not found in embeddings" },
        { status: 404 }
      );
    }
    if (!secretItem) {
      return NextResponse.json(
        { success: false, message: "Secret ID not found in embeddings" },
        { status: 404 }
      );
    }

    // 3. Tính độ giống nhau
    const targetSimilarity = cosineSimilarity(
      guestItem.vector,
      secretItem.vector
    );

    // 4. Tính Rank
    // Rank = 1 + số lượng anime có độ giống cao hơn
    let rank = 1;
    const secretVec = secretItem.vector;

    // Check độ dài vector chuẩn
    const vecLen = secretVec.length;

    for (let i = 0; i < sourceData.length; i++) {
      const item = sourceData[i];

      // Bỏ qua chính nó và secret
      if (item.id === String(secretId) || item.id === String(guestId)) continue;

      // Bỏ qua nếu vector lỗi
      if (!item.vector || item.vector.length !== vecLen) continue;

      const sim = cosineSimilarity(item.vector, secretVec);

      if (sim > targetSimilarity) {
        rank++;
      }
    }

    return NextResponse.json({
      success: true,
      rank: rank,
      similarity: targetSimilarity,
    });
  } catch (error) {
    console.error("Game Algorithm Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
