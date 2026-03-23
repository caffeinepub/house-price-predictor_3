import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  ComparableProperty,
  HouseFeatures,
  PredictionResult,
} from "../backend";
import { useActor } from "./useActor";

export function usePredictPrice() {
  const { actor } = useActor();
  return useMutation<PredictionResult, Error, HouseFeatures>({
    mutationFn: async (features: HouseFeatures) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.predictPrice(features);
    },
  });
}

export function useComparableProperties(
  zipCode: string,
  size: number,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ComparableProperty[]>({
    queryKey: ["comparableProperties", zipCode, size],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComparableProperties(zipCode, size);
    },
    enabled: !!actor && !isFetching && enabled && !!zipCode,
  });
}
