import { Suspense } from "react";
import Random from "@/pages/List/Random/Random";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading random...</div>}
    >
      <Random />
    </Suspense>
  );
}
