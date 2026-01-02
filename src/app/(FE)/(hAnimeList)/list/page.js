import { Suspense } from "react";
import List from "@/pages/List/List";

export default function ListPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading list...</div>}
    >
      <List />
    </Suspense>
  );
}
