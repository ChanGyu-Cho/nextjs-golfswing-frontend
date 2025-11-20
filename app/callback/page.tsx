// app/callback/page.tsx
"use client";

import { Suspense } from "react";
import CallbackComponent from "./CallbackComponent";

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackComponent />
    </Suspense>
  );
}
