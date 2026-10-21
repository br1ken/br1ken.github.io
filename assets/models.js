/* Ideal buffered building blocks. SI units inside all model calculations. */
'use strict';
const LabModels = Object.freeze({
  rcCutoff: (rOhms, cFarads) => 1 / (2 * Math.PI * rOhms * cFarads),
  rlCutoff: (rOhms, lHenries) => rOhms / (2 * Math.PI * lHenries),
  divider: (seriesOhms, loadOhms) => loadOhms / (seriesOhms + loadOhms),
  lowpass: (cutoff, sampleRate) => {
    const frequency = Math.min(Math.max(cutoff, 1), sampleRate * .45);
    const k = Math.tan(Math.PI * frequency / sampleRate);
    return {feedforward: [k / (1 + k), k / (1 + k)], feedback: [1, (k - 1) / (k + 1)]};
  },
  canConnect: (edges, from, to) => {
    if (from === to || edges.some(e => e.from === from && e.to === to)) return false;
    const seen = new Set();
    function reaches(id) {
      if (id === from) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return edges.filter(e => e.from === id).some(e => reaches(e.to));
    }
    return !reaches(to);
  },
  /* Patch ↔ kurzer Link-Text (base64url). Nodes: [typ, x, y, parameter]; Kabel: [von-index, nach-index]. */
  encodePatch: (nodes, edges) => {
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    const compact = {v: 1, n: nodes.map(n => [n.type, Math.round(n.x), Math.round(n.y), n.p]), e: edges.map(e => [index.get(e.from), index.get(e.to)])};
    const bytes = new TextEncoder().encode(JSON.stringify(compact));
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  decodePatch: (text) => {
    const binary = atob(String(text).replace(/-/g, '+').replace(/_/g, '/'));
    const compact = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
    if (compact?.v !== 1 || !Array.isArray(compact.n) || !Array.isArray(compact.e)) throw Error('invalid patch');
    const nodes = compact.n.map((n, i) => ({id: 'n' + (i + 1), type: n[0], x: n[1], y: n[2], p: n[3]}));
    const edges = compact.e.map(([a, b]) => ({from: 'n' + (a + 1), to: 'n' + (b + 1)}));
    return {nodes, edges};
  }
});
