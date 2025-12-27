import { Suspense } from "react";
import HAnimeList from "@/pages/List/List";

export default function List() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading list...</div>}
    >
      <HAnimeList />
    </Suspense>
  );
}
