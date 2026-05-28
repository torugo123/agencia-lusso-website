import { initChrome } from './chrome.js';

function start() { initChrome(); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
