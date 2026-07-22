import { Suspense } from "react";
import ConnectClient from "./ConnectClient";

export default function ConnectPage() {
  return (
    <Suspense fallback={null}>
      <ConnectClient />
    </Suspense>
  );
}
