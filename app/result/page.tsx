"use client";

import { Suspense } from "react";
import ResultComponent from "./ResultComponent";

export default function ResultPage() {
  return (
    <Suspense>
      <ResultComponent />
    </Suspense>
  );
}
