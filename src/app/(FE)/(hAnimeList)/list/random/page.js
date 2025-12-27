import { Suspense } from "react";
import RandomHAnime from "@/pages/List/randomHAnime/Random";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading random...</div>}
    >
      <RandomHAnime />
    </Suspense>
  );
}
