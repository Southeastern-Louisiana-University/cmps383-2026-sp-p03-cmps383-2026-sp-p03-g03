import { useState, useEffect } from "react";

const useApi = async (method: string, controller: string, input?: any) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/${controller}`, {
      method: method,
      headers: {
        "Content-Type":
          method == "POST" || method == "PUT" ? "application/json" : "",
      },
      body: method == "POST" || method == "PUT" ? JSON.stringify(input) : undefined,
    })
    .then((res) => res.json())
    .then((data) => setData(data));
  }, [controller, method]);

  return [data];
};

export default useApi;
