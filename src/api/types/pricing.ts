// src/api/types/pricing.ts
// Types pour /api/llm-prices et /api/sdk-status — payloads + KV value structures.
// Source : functional-specs §2.2, §3 ; x402-response-spec §4.

// 12 modèles LLM supportés V1 (functional-specs §2.2)
export const SUPPORTED_MODELS = [
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
  "gpt-5",
  "gpt-4o",
  "gpt-4o-mini",
  "gemini-2-5-pro",
  "gemini-2-0-flash",
  "mistral-large-3",
  "mistral-small-3",
  "deepseek-r2",
  "deepseek-v3",
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

export function isSupportedModel(value: string): value is SupportedModel {
  return (SUPPORTED_MODELS as readonly string[]).includes(value);
}

// ~50 packages npm SDK supportés V1 — sera enrichi par le cron sdk-update.
// Liste seed initiale, source : marché AI agents 2026 (Anthropic, OpenAI, Vercel AI SDK, etc.)
export const SUPPORTED_SDK_PACKAGES = [
  "claude-code",
  "ai",
  "openai",
  "@anthropic-ai/sdk",
  "@anthropic-ai/claude-code",
  "@google/generative-ai",
  "@mistralai/mistralai",
  "langchain",
  "@langchain/core",
  "@langchain/anthropic",
  "@langchain/openai",
  "llamaindex",
  "vercel-ai-sdk",
  "instructor",
  "outlines",
  "litellm",
  "haystack-ai",
  "crewai",
  "autogen",
  "guidance",
  "dspy-ai",
  "semantic-kernel",
  "n8n",
  "flowise",
  "rivet",
  "promptfoo",
  "langsmith",
  "weave",
  "helicone",
  "braintrust",
  "@vercel/ai",
  "@assistant-ui/react",
  "copilotkit",
  "agentic",
  "axios",
  "zod",
  "tiktoken",
  "@dqbd/tiktoken",
  "tokenizer",
  "lance",
  "chromadb",
  "pinecone",
  "qdrant-client",
  "weaviate-ts-client",
  "redis-vector-search",
  "supabase-vector",
  "mem0",
  "letta",
  "smolagents",
  "browser-use",
] as const;

export type SupportedSdkPackage = (typeof SUPPORTED_SDK_PACKAGES)[number];

export function isSupportedSdkPackage(value: string): value is SupportedSdkPackage {
  return (SUPPORTED_SDK_PACKAGES as readonly string[]).includes(value);
}

// KV value : PRICES_KV[`price:{model}`]
export interface PriceKvValue {
  model: SupportedModel;
  input_per_mtok: number;
  output_per_mtok: number;
  effective_cost_factor: number;
  currency: "USD";
  date_modified: string; // ISO 8601
  fetched_at: string; // ISO 8601
  same_as: string; // URL source officielle
  schema_version: "1.0";
}

// KV value : SDK_KV[`sdk:{pkg}`]
export interface SdkKvValue {
  pkg: SupportedSdkPackage | string;
  latest: string;
  breaking_since: string | null;
  deprecated_versions: string[];
  date_modified: string; // ISO 8601
  fetched_at: string;
  same_as: string;
  schema_version: "1.0";
}

// Réponse 200 signée — pricing
export interface PriceResponse200 {
  data: PriceKvValue;
  _signature: string; // HMAC-SHA256 hex
  _jsonld_dataset: {
    "@context": "https://schema.org";
    "@type": "Dataset";
    dateModified: string;
    sameAs: string;
  };
}

// Réponse 200 signée — SDK
export interface SdkResponse200 {
  data: SdkKvValue;
  _signature: string;
  _jsonld_dataset: {
    "@context": "https://schema.org";
    "@type": "Dataset";
    dateModified: string;
    sameAs: string;
  };
}
