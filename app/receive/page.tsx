import React, { Suspense } from "react";
import ClientReceive from "./ClientReceive";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientReceive />
    </Suspense>
  );
}
