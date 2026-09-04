const DEFAULT_ENDPOINT = 'http://127.0.0.1:34123';
const saveButton = document.querySelector('#save');
const previewButton = document.querySelector('#preview');
const bridgeTokenInput = document.querySelector('#bridge-token');
const status = document.querySelector('#status');
const debug = document.querySelector('#debug');

function setBusy(busy) {
  saveButton.disabled = busy;
  previewButton.disabled = busy;
}

function showDebug(value) {
  debug.hidden = false;
  debug.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

async function endpoint() {
  const stored = await chrome.storage.local.get({ bridgeEndpoint: DEFAULT_ENDPOINT });
  return String(stored.bridgeEndpoint).replace(/\/$/, '');
}

async function bridgeToken() {
  const stored = await chrome.storage.local.get({ bridgeToken: '' });
  return String(stored.bridgeToken || '');
}

async function pageSnapshot() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab.');
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({ url: location.href, html: document.documentElement.outerHTML }),
  });
  if (!result?.result?.html) throw new Error('Could not read the current page.');
  return result.result;
}

async function callBridge(route) {
  const snapshot = await pageSnapshot();
  const token = await bridgeToken();
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`${await endpoint()}${route}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(snapshot),
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || `Bridge returned HTTP ${response.status}`);
  return payload;
}

void (async () => {
  bridgeTokenInput.value = await bridgeToken();
})();
bridgeTokenInput.addEventListener('change', () => chrome.storage.local.set({ bridgeToken: bridgeTokenInput.value.trim() }));

saveButton.addEventListener('click', async () => {
  setBusy(true);
  status.textContent = 'Saving…';
  debug.hidden = true;
  try {
    const result = await callBridge('/paper');
    status.textContent = `Saved:\n${result.relativePath}`;
    showDebug(result.debug);
  } catch (error) {
    status.textContent = `Failed:\n${error.message}`;
  } finally {
    setBusy(false);
  }
});

previewButton.addEventListener('click', async () => {
  setBusy(true);
  status.textContent = 'Preparing preview…';
  try {
    const result = await callBridge('/preview');
    status.textContent = `Preview: ${result.articleId}`;
    showDebug(result.markdown);
  } catch (error) {
    status.textContent = `Failed:\n${error.message}`;
  } finally {
    setBusy(false);
  }
});
