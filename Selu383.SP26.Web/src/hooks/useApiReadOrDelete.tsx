import { useState, useEffect } from "react";

const useApiReadOrDelete = <inputDto = unknown,>(
  method: string,
  controller: string,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<inputDto | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const makeRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        const normalizedMethod = method.toUpperCase();

        const response = await fetch(`/api/${controller}`, {
          method: normalizedMethod,
          signal: abortController.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";
        const payload = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          throw new Error(
            typeof payload === "string" && payload.length > 0
              ? payload
              : `Request failed with status ${response.status}: ${response.statusText}`,
          );
        }

        setData(payload as inputDto);
      } catch (requestError) {
        if (
          requestError instanceof Error &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unknown request error",
        );
      } finally {
        setLoading(false);
      }
    };

    makeRequest();

    return () => {
      abortController.abort();
    };
  }, [controller, method]);

  return { data, loading, error };
};

export default useApiReadOrDelete;
