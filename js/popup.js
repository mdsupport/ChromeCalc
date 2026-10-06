const iframe = document.getElementById('calc-iframe');

// listen for messages from the iframe
window.addEventListener('message', (event) => {
    if (event.data?.command == 'clear-storage') {
        // Clear localStorage, but keep user settings
        const numberFormat = localStorage.getItem('numberFormat');
        localStorage.clear();
        if (numberFormat !== null) localStorage.setItem('numberFormat', numberFormat);
    } else if (event.data?.command == 'set-storage') {
        // Set values in localStorage
        for (const key in event.data.storage) {
            if (event.data.storage.hasOwnProperty(key)) {
                localStorage.setItem(key, JSON.stringify(event.data.storage[key]));
            }
        }
    } else if (event.data?.command == 'open-options') {
        chrome.runtime.openOptionsPage();
    }
});


// Pass keyboard events to the iframe
['keydown', 'keyup', 'keypress'].forEach(eventType => {
    document.addEventListener(eventType, function (e) {
        const { key, keyCode, altKey, ctrlKey, shiftKey, metaKey } = e;
        iframe.contentWindow.postMessage({
            type: eventType,
            key,
            keyCode,
            altKey,
            ctrlKey,
            shiftKey,
            metaKey
        }, '*');
    });
});


// pass paste event to the iframe
document.addEventListener('paste', function (e) {
    // Get clipboard data
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    const numberFormat = JSON.parse(localStorage.getItem('numberFormat') || '"us"');
    iframe.contentWindow.postMessage({ type: 'paste', text: pastedText, numberFormat }, '*');
});

// pass storage data to the iframe
iframe.addEventListener('load', () => {
    // Get values from localStorage
    const keys = ['resBuffer', 'bigger', 'ln', 'secondActive', 'deg', 'memory', 'buffStr', 'numberFormat'];
    const storageData = {};

    keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item !== null) {
            storageData[key] = JSON.parse(item);
        }
    });

    // Pass data to iframe
    iframe.contentWindow.postMessage({ type: 'storage', text: JSON.stringify(storageData) }, '*');
});
