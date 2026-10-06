// Settings stored in the extension's localStorage (shared with popup.html).
// Values are JSON-encoded to match popup.js.
(function () {
    const saved = document.getElementById('saved');
    const current = JSON.parse(localStorage.getItem('numberFormat') || '"us"');

    document.querySelectorAll('input[name="numberFormat"]').forEach(radio => {
        radio.checked = radio.value === current;
        radio.addEventListener('change', () => {
            localStorage.setItem('numberFormat', JSON.stringify(radio.value));
            saved.textContent = 'Saved';
            setTimeout(() => { saved.innerHTML = '&nbsp;'; }, 1500);
        });
    });
})();
