async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: T | FormData
): Promise<Response> {
  const isForm = data instanceof FormData;

  const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}${url}`, {
    method,
    headers:
      isForm || !data ? undefined : { "Content-Type": "application/json" },
    body: isForm ? (data as FormData) : data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}
