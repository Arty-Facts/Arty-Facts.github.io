

/**
 * Compute Elo result.
 * @param {number} winner - Pre‑game winner rating.
 * @param {number} loser - Pre‑game loser rating.
 * @param {number} K - K factor.
 * @returns {[number, number, number]} [newWinner, newLoser, expectedWinner]
 */
function compute(winner, loser, K) {
    const Ea = 1 / (1 + Math.pow(10, (loser - winner) / 400));
    const Eb = 1 - Ea;
    const newWinner = winner + K * (1 - Ea); // winner scored 1
    const newLoser = loser + K * (0 - Eb);   // loser scored 0
    return [Math.round(newWinner), Math.round(newLoser), Ea];
}

// DOM element references
const winEl  = document.getElementById('winner');
const loseEl = document.getElementById('loser');
const kEl    = document.getElementById('kval');
const out    = document.getElementById('out');
const form   = document.getElementById('form');

const DEFAULT_K = 32;

/** Format a signed change with leading + for positives */
function fmtDelta(v) { return v >= 0 ? `+${v}` : `${v}`; }

/** Update the output area with the computed result */
function renderResult(oldWinner, oldLoser, newWinner, newLoser, expected) {
    const winnerDelta = newWinner - oldWinner;
    const loserDelta  = newLoser - oldLoser;
    out.textContent = [
        `Winner: ${newWinner} (${fmtDelta(winnerDelta)})`,
        `Loser:  ${newLoser} (${fmtDelta(loserDelta)})`,
        `Expected win probability: ${(expected * 100).toFixed(1)}%`
    ].join('\n');
}

/** Show a simple message in the output area */
function renderMessage(msg) { out.textContent = msg; }

/** Core execution: read inputs, parse, validate, compute, render */
function run() {
    let w = winEl.value.trim();
    let l = loseEl.value.trim();
    let k = kEl.value.trim();



    if (!w || !l) {
        return renderMessage('Enter winner and loser ratings.');
    }

    const winner = parseFloat(w);
    const loser  = parseFloat(l);
    if (Number.isNaN(winner) || Number.isNaN(loser)) {
        return renderMessage('Ratings must be numbers.');
    }

    const K = k ? parseFloat(k) : DEFAULT_K;
    if (Number.isNaN(K)) {
        return renderMessage('K must be a number.');
    }

    const [newWinner, newLoser, Ea] = compute(winner, loser, K);
    renderResult(winner, loser, newWinner, newLoser, Ea);
}

// Form submit
form.addEventListener('submit', (e) => { e.preventDefault(); run(); });

// Enter key inside inputs triggers compute without adding new lines
[winEl, loseEl, kEl].forEach(el => el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); run(); }
}));



// Register service worker for PWA/offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .catch(err => console.warn('SW registration failed', err));
    });
}