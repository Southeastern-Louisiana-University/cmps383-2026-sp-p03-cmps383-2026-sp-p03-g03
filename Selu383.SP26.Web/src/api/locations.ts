import useApiReadOrDelete from "../hooks/useApiReadOrDelete";
import type { LocationDto } from "./dto-interfaces";

export function useLocations() {
  const {
    data: locations,
    loading,
    error,
  } = useApiReadOrDelete<LocationDto[]>("GET", "locations");

  return {
    locations: locations ?? [],
    loading,
    error,
  };
}
