"use client";

import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Homepage() {
  const router = useRouter();
  return (
    <div className="min-h-screen w-full bg-light d-flex justify-content-center py-5">
      <main className="w-100" style={{ maxWidth: "600px" }}>
        <div className="d-flex flex-column gap-3">
          <button
            onClick={() => router.push("/list")}
            className="btn btn-primary btn-lg w-100"
          >
            Go to HAnime List
          </button>

          <button
            onClick={() => router.push("/game")}
            className="btn btn-success btn-lg w-100"
          >
            Go to Game List
          </button>
        </div>
      </main>
    </div>
  );
}
