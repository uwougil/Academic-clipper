import { normalizeBridgeEndpoint } from './endpoint.mjs';
import { ensureBridgeReady, executeBridgeRequest } from './lifecycle.mjs';

const DEFAULT_ENDPOINT = 'http://127.0.0.1:34123';
const saveButton = document.querySelector('#save');
const previewButton = document.querySelector('#preview');
const settingsButton = document.querySelector('#save-settings');
const bridgeEndpointInput = document.querySelector('#bridge-endpoint');
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
  return normalizeBridgeEndpoint(stored.bridgeEndpoint);
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

async function wakeBridge() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendNativeMessage('com.academic_clipper.bridge', { action: 'wake' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || !response.ok) {
        reject(new Error(response?.error || 'Native host failed.'));
        return;
      }
      resolve(response);
    });
  });
}

async function syncSessionState({ endpoint: newEp, token: newTok }) {
  await chrome.storage.local.set({ bridgeEndpoint: newEp, bridgeToken: newTok });
  bridgeEndpointInput.value = newEp;
  bridgeTokenInput.value = newTok;
}

async function callBridge(route) {
  const currentEndpoint = await endpoint();
  status.textContent = 'Checking bridge...';
  const ready = await ensureBridgeReady({
    currentEndpoint,
    wakeBridgeFn: wakeBridge,
    onSessionUpdated: syncSessionState,
  });

  const snapshot = await pageSnapshot();
  const token = await bridgeToken();

  return executeBridgeRequest({
    endpoint: ready.endpoint,
    route,
    payload: snapshot,
    token,
    wakeBridgeFn: wakeBridge,
    onSessionUpdated: syncSessionState,
  });
}

void (async () => {
  const stored = await chrome.storage.local.get({ bridgeEndpoint: DEFAULT_ENDPOINT, bridgeToken: '' });
  bridgeEndpointInput.value = String(stored.bridgeEndpoint || DEFAULT_ENDPOINT);
  bridgeTokenInput.value = String(stored.bridgeToken || '');
})();

settingsButton.addEventListener('click', async () => {
  try {
    const bridgeEndpoint = normalizeBridgeEndpoint(bridgeEndpointInput.value);
    await chrome.storage.local.set({ bridgeEndpoint, bridgeToken: bridgeTokenInput.value.trim() });
    bridgeEndpointInput.value = bridgeEndpoint;
    status.textContent = 'Settings saved.';
  } catch (error) {
    status.textContent = `Failed:\n${error.message}`;
  }
});

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
