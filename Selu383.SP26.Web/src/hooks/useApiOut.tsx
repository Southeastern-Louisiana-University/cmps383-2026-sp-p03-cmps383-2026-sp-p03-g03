import { useState, useEffect } from "react";

const useApiOut = <outputDto = unknown,>(
  method: string,
  controller: string,
  input?: unknown,
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<outputDto | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const makeRequest = async () => {
      setLoading(true);
      setError(null);

      try {
        const normalizedMethod = method.toUpperCase();

        if (!["POST", "PUT", "PATCH"].includes(normalizedMethod)) {
          throw new Error(
            "useApiOut only supports POST, PUT, and PATCH methods",
          );
        }

        const response = await fetch(`/api/${controller}`, {
          method: normalizedMethod,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
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

        setData(payload as outputDto);
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
  }, [controller, input, method]);

  return { data, loading, error };
};

export default useApiOut;
