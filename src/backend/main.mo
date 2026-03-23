// House Price Prediction Backend Canister
import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";

actor {
  // Record type definitions
  type HouseFeatures = {
    zipCode : Text;
    sizeSqft : Float;
    bedrooms : Float;
    bathrooms : Float;
    propertyType : Text;
    yearBuilt : Float;
    lotSizeSqft : Float;
    hasPool : Bool;
    hasGarage : Bool;
    hasFireplace : Bool;
    recentlyRenovated : Bool;
  };

  type PriceStat = {
    year : Nat;
    price : Float;
  };

  type PredictionResult = {
    estimatedPrice : Float;
    confidence : Float;
    priceRangeLow : Float;
    priceRangeHigh : Float;
    marketDemand : Float;
    compsAveragePrice : Float;
    keyStatsCount : Nat;
    priceHistory : [PriceStat];
  };

  type ComparableProperty = {
    address : Text;
    price : Float;
    bedrooms : Float;
    bathrooms : Float;
    size : Float;
  };

  type PredictionEntry = {
    features : HouseFeatures;
    result : PredictionResult;
    timestamp : Int;
  };

  // Stable storage for predictions
  let predictionStore = Map.empty<Text, PredictionEntry>();

  module PredictionEntry {
    public func compareByTimestamp(a : PredictionEntry, b : PredictionEntry) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  // Function to calculate estimated price - mock implementation
  public shared ({ caller }) func predictPrice(features : HouseFeatures) : async PredictionResult {
    // Hardcode base multipliers/factors
    let basePrice = 200_000.0;
    let sqftFactor = 150.0;
    let bedroomsFactor = 10_000.0;
    let bathroomsFactor = 15_000.0;

    let propertyTypeMultiplier = switch (features.propertyType) {
      case ("Single Family") { 1.0 };
      case ("Condo") { 0.8 };
      case ("Townhouse") { 0.9 };
      case ("Multi-Family") { 1.2 };
      case (_) { 1.0 };
    };

    let age = (2024 - features.yearBuilt);
    let ageDepreciation = if (age > 50) { 0.75 } else if (age > 30) { 0.85 } else { 1.0 };

    let lotSizeAdjustment = if (features.lotSizeSqft > 0) {
      0.25 * (features.lotSizeSqft / features.sizeSqft) : Float;
    } else { 0.0 };

    let amenitiesValue = (if (features.hasPool) { 35000.0 } else { 0.0 }) +
      (if (features.hasGarage) { 20000.0 } else { 0.0 }) +
      (if (features.hasFireplace) { 7500.0 } else { 0.0 }) +
      (if (features.recentlyRenovated) { 40000.0 } else { 0.0 });

    let estimatedPrice = basePrice * propertyTypeMultiplier * ageDepreciation +
      (features.sizeSqft * sqftFactor) +
      (features.bedrooms * bedroomsFactor) +
      (features.bathrooms * bathroomsFactor) +
      lotSizeAdjustment +
      amenitiesValue;

    // Build result record
    let result : PredictionResult = {
      estimatedPrice;
      confidence = 85.0;
      priceRangeLow = estimatedPrice * 0.9;
      priceRangeHigh = estimatedPrice * 1.1;
      marketDemand = 75.0;
      compsAveragePrice = 550_000.0;
      keyStatsCount = 5;
      priceHistory = [{ year = 2023; price = 550_000.0 }];
    };

    // Store prediction in Map
    let timestamp = Time.now();
    let entry : PredictionEntry = {
      features;
      result;
      timestamp;
    };

    predictionStore.add(timestamp.toText(), entry);

    result;
  };

  // Query method to fetch sample comparables
  public query ({ caller }) func getComparableProperties(zipCode : Text, size : Float) : async [ComparableProperty] {
    let sampleComps = [
      {
        address = "234 Oak St, " # zipCode;
        price = 550_000.0;
        bedrooms = 3.0;
        bathrooms = 2.0;
        size = 1800.0;
      },
      {
        address = "789 Maple Ave, " # zipCode;
        price = 625_000.0;
        bedrooms = 4.0;
        bathrooms = 3.0;
        size = 2100.0;
      },
    ];

    sampleComps;
  };

  // Query method to get all predictions
  public query ({ caller }) func getAllPredictions() : async [PredictionEntry] {
    let entries = predictionStore.values().toArray();
    entries.sort(PredictionEntry.compareByTimestamp);
  };

  public query ({ caller }) func getPrediction(timestamp : Text) : async PredictionResult {
    switch (predictionStore.get(timestamp)) {
      case (null) { Runtime.trap("Prediction not found") };
      case (?entry) { entry.result };
    };
  };
};
