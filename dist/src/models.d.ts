import type { OmniRouteConfig, OmniRouteModel } from './types.js';
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
//# sourceMappingURL=models.d.ts.map