import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PriceStat {
    year: bigint;
    price: number;
}
export interface HouseFeatures {
    lotSizeSqft: number;
    hasPool: boolean;
    propertyType: string;
    bedrooms: number;
    zipCode: string;
    hasGarage: boolean;
    hasFireplace: boolean;
    bathrooms: number;
    sizeSqft: number;
    yearBuilt: number;
    recentlyRenovated: boolean;
}
export interface ComparableProperty {
    bedrooms: number;
    size: number;
    address: string;
    bathrooms: number;
    price: number;
}
export interface PredictionResult {
    estimatedPrice: number;
    keyStatsCount: bigint;
    priceHistory: Array<PriceStat>;
    priceRangeHigh: number;
    marketDemand: number;
    confidence: number;
    priceRangeLow: number;
    compsAveragePrice: number;
}
export interface PredictionEntry {
    result: PredictionResult;
    features: HouseFeatures;
    timestamp: bigint;
}
export interface backendInterface {
    getAllPredictions(): Promise<Array<PredictionEntry>>;
    getComparableProperties(zipCode: string, size: number): Promise<Array<ComparableProperty>>;
    getPrediction(timestamp: string): Promise<PredictionResult>;
    predictPrice(features: HouseFeatures): Promise<PredictionResult>;
}
