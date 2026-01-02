import React from "react";
import { ModeProvider } from "@/context/ModeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ModeProvider>
      <Component {...pageProps} />
    </ModeProvider>
  );
}
