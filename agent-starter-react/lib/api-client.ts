export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.success === false || json.success === undefined) {
    if (json.data !== undefined) {
      return json.data as T;
    }

    if (json.success === false && json.error) {
      throw new Error(json.error);
    }
  }

  return (json.data ?? json) as T;
}
