const statusEl = document.getElementById('status');
const titleEl = document.getElementById('program-title');
const infoEl = document.getElementById('program-info');
const previewEl = document.getElementById('preview');
const btnJson = document.getElementById('btn-json');
const btnTxt = document.getElementById('btn-txt');
const btnMd = document.getElementById('btn-md');

function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = type;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) {
      showStatus('No active tab found.', 'error');
      return;
    }
    chrome.tabs.sendMessage(tab.id, { action }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus('Not on a YWH program page, or page not loaded yet.', 'error');
        return;
      }
      if (!response) {
        showStatus('No data received.', 'error');
        return;
      }

      if (action === 'extract') {
        titleEl.textContent = response.title || 'Unknown program';
        const scopeCount = response.scopes ? response.scopes.length : 0;
        infoEl.innerHTML = `<span class="scope-count">${scopeCount} scopes</span>`;
        btnJson.disabled = false;
        btnTxt.disabled = false;
        btnMd.disabled = false;
      } else {
        const ext = action.replace('export', '').toLowerCase();
        const mimeTypes = { json: 'application/json', txt: 'text/plain', md: 'text/markdown' };
        downloadFile(response.content, response.filename, mimeTypes[ext]);
        showStatus(`Exported as ${ext.toUpperCase()}`, 'success');
        previewEl.style.display = 'block';
        previewEl.textContent = response.content.substring(0, 500) + (response.content.length > 500 ? '\n...' : '');
      }
    });
  });
}

// Auto-extract on popup open
sendMessage('extract');

btnJson.addEventListener('click', () => sendMessage('exportJSON'));
btnTxt.addEventListener('click', () => sendMessage('exportTXT'));
btnMd.addEventListener('click', () => sendMessage('exportMD'));
