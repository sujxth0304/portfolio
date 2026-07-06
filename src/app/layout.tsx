import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Orbitron, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sujith Santhosh — AI Engineer & Software Architect",
  description:
    "Building AI systems, intelligent agents, RAG pipelines, and high-performance backends. Software engineer specializing in ML, AI, and scalable systems.",
  keywords: [
    "AI Engineer",
    "Software Architect",
    "Machine Learning",
    "RAG",
    "LangChain",
    "Next.js",
    "Python",
    "Backend Developer",
    "LLM",
    "Generative AI",
  ],
  authors: [{ name: "Sujith Santhosh" }],
  openGraph: {
    title: "Sujith Santhosh // NEXUS://SUJITH.AI",
    description: "You have entered the architect's domain.",
    type: "website",
    siteName: "NEXUS://SUJITH.AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sujith Santhosh — AI Engineer",
    description: "You have entered the architect's domain.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={[
        spaceGrotesk.variable,
        jetbrains.variable,
        orbitron.variable,
        inter.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="h-full bg-void overflow-hidden">{children}</body>
    </html>
  );
}
