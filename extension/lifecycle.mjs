export async function verifyBridgeHealth(endpoint, fetchFn = fetch) {
  try {
    const res = await fetchFn(`${endpoint}/health`, {
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const payload = await res.json();
    if (!payload || payload.ok !== true || payload.service !== 'academic-clipper-bridge') {
      return { ok: false, error: 'Identity mismatch' };
    }
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function ensureBridgeReady({
  currentEndpoint,
  wakeBridgeFn,
  onSessionUpdated,
  fetchFn = fetch,
}) {
  const health = await verifyBridgeHealth(currentEndpoint, fetchFn);
  if (health.ok) {
    return { endpoint: currentEndpoint };
  }

  const session = await wakeBridgeFn();
  const newEndpoint = `http://127.0.0.1:${session.port}`;
  if (onSessionUpdated) {
    await onSessionUpdated({ endpoint: newEndpoint, token: session.token });
  }
  return { endpoint: newEndpoint, token: session.token };
}

export async function executeBridgeRequest({
  endpoint,
  route,
  payload,
  token,
  wakeBridgeFn,
  onSessionUpdated,
  fetchFn = fetch,
  isRetry = false,
}) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetchFn(`${endpoint}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (response.status === 401 && !isRetry) {
    const session = await wakeBridgeFn();
    const newEndpoint = `http://127.0.0.1:${session.port}`;
    if (onSessionUpdated) {
      await onSessionUpdated({ endpoint: newEndpoint, token: session.token });
    }
    return executeBridgeRequest({
      endpoint: newEndpoint,
      route,
      payload,
      token: session.token,
      wakeBridgeFn,
      onSessionUpdated,
      fetchFn,
      isRetry: true,
    });
  }

  let resultPayload;
  try {
    resultPayload = await response.json();
  } catch {
    throw new Error(`Bridge returned HTTP ${response.status}`);
  }

  if (!response.ok || !resultPayload.ok) {
    throw new Error(resultPayload?.error || `Bridge returned HTTP ${response.status}`);
  }

  return resultPayload;
}
