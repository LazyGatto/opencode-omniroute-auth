import type { OmniRouteConfig, OmniRouteModel, OmniRouteModelVariant } from './types.js';
/**
 * Persistent last-good model cache.
 *
 * The in-memory Map dies with every OpenCode restart, so a cold start while the
 * gateway (or DNS) is unreachable used to fall back to the static
 * OMNIROUTE_DEFAULT_MODELS — a short list that does not contain this
 * deployment's models. Sessions pinned to them then failed to drain with
 * "Model unavailable: omniroute/<model>" (log evidence 2026-11-03..06: 732x
 * ENOTFOUND + 7 failed drains). Successful fetches are persisted so the
 * fallback serves the real catalog instead.
 *
 * Override the location with OMNIROUTE_MODEL_CACHE_FILE (used by tests).
 */
/** Resolved on every call so tests (and ops) can override the location at runtime. */
export declare function getDiskCachePath(): string;
declare function readDiskCache(cacheKey: string): OmniRouteModel[] | null;
declare function writeDiskCache(cacheKey: string, models: OmniRouteModel[]): void;
/** Network-level failures worth one more attempt; HTTP 4xx and timeouts are not. */
declare function isRetryableFetchError(error: unknown): boolean;
/**
 * Generate a cache key for a given configuration
 */
declare function getCacheKey(config: OmniRouteConfig, apiKey: string): string;
/**
 * Build the reasoning variants for a model.
 *
 * OmniRoute advertises the real tiers in `capabilities.effort_tiers` (e.g.
 * Qwen3.8 → `low/medium/xhigh`). When present they win over the generic
 * `low/medium/high` fallback, so the picker never shows a tier the model does
 * not support (vLLM/Qwen rejects `high` with 400).
 *
 * A `no-thinking` variant is added only for models that explicitly advertise
 * effort tiers — that is the gateway's signal that the model's thinking is
 * operator-controlled (typically a local OpenAI-compatible model such as
 * vLLM/llama.cpp). Those disable thinking via `chat_template_kwargs.enable_thinking`,
 * which the gateway forwards verbatim, rather than `reasoning_effort: "none"`
 * (which OmniRoute clamps for passthrough providers). Models without advertised
 * tiers keep the generic `low/medium/high` with no `no-thinking`, so the variant
 * is never invented for models that cannot honor it.
 */
export declare function buildReasoningVariants(model: OmniRouteModel): Record<string, OmniRouteModelVariant>;
/**
 * Reverse a provider alias to its canonical form for metadata lookups.
 * Returns the original id if no alias mapping exists.
 */
export declare function resolveProviderAliasForMetadata(modelId: string): string;
/**
 * Check if a provider prefix is a known alias.
 */
export declare function isProviderAlias(providerPrefix: string): boolean;
/**
 * Group variant-suffixed models (e.g. gpt-5.5-xhigh) under their base model.
 * Returns a new array where every base model with variants gets a `variants` Record.
 */
export declare function groupVariantModels(models: OmniRouteModel[]): OmniRouteModel[];
/**
 * Resolve the output-token limit for a model, falling back to
 * `DEFAULT_OUTPUT_LIMIT` when the upstream reports no usable value.
 *
 * Non-positive and non-finite values count as "not reported". The old
 * fallback (4096) starved reasoning models: with `reasoning_effort: high` the
 * thinking budget alone could consume the whole cap, so the reply came back
 * empty with the thinking truncated mid-word. The limit cannot be omitted
 * instead — OpenCode rejects models whose `limit` lacks `output`.
 */
export declare function resolveOutputLimit(model: OmniRouteModel): number;
/**
 * Fetch models from OmniRoute /v1/models endpoint
 * This is the CRITICAL FEATURE - dynamically fetches available models
 *
 * @param config - OmniRoute configuration
 * @param apiKey - API key for authentication
 * @returns Array of available models
 */
export declare function fetchModels(config: OmniRouteConfig, apiKey: string, forceRefresh?: boolean): Promise<OmniRouteModel[]>;
/**
 * Clear the model cache
 * @param config - Optional OmniRoute configuration to clear specific cache
 * @param apiKey - Optional API key to clear specific cache
 */
export declare function clearModelCache(config?: OmniRouteConfig, apiKey?: string): void;
/**
 * Get cached models without fetching
 * @param config - OmniRoute configuration
 * @param apiKey - API key for authentication
 * @returns Cached models or null
 */
export declare function getCachedModels(config: OmniRouteConfig, apiKey: string): OmniRouteModel[] | null;
/**
 * Check if cache is valid
 * @param config - OmniRoute configuration
 * @param apiKey - API key for authentication
 * @returns True if cache is valid
 */
export declare function isCacheValid(config: OmniRouteConfig, apiKey: string): boolean;
/**
 * Force refresh models from API
 * @param config - OmniRoute configuration
 * @param apiKey - API key for authentication
 * @returns Array of available models
 */
export declare function refreshModels(config: OmniRouteConfig, apiKey: string): Promise<OmniRouteModel[]>;
/**
 * Synchronous catalog for provider setup.
 *
 * OpenCode drains queued session messages ~30-80ms BEFORE the plugin's async
 * model refresh emits provider.updated/model.updated (observed in logs:
 * drain at T, catalog events at T+30..80ms). The provider therefore published
 * the static OMNIROUTE_DEFAULT_MODELS during that window and sessions pinned to
 * gateway models failed with ModelUnavailableError. Seed from memory, then from
 * the persisted catalog, so the FIRST publication already lists real models.
 */
export declare function getStartupModels(config: OmniRouteConfig, apiKey: string): OmniRouteModel[];
/** Test-only surface: key derivation and disk cache paths for the resilience tests. */
export declare const __testing: {
    getCacheKey: typeof getCacheKey;
    getDiskCachePath: typeof getDiskCachePath;
    readDiskCache: typeof readDiskCache;
    writeDiskCache: typeof writeDiskCache;
    isRetryableFetchError: typeof isRetryableFetchError;
    FETCH_RETRY_DELAYS_MS: number[];
};
export {};
//# sourceMappingURL=models.d.ts.map