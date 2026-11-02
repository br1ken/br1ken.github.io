/* Audiolabor: kleine Helfer für die Oberfläche */

export const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const $ = (sel, wurzel = document) => wurzel.querySelector(sel);
export const $$ = (sel, wurzel = document) => [...wurzel.querySelectorAll(sel)];

/* Blob als Datei anbieten */
export function speichereDatei(name, inhalt, typ = 'application/octet-stream') {
  const url = URL.createObjectURL(new Blob([inhalt], {type: typ}));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const dateiName = text => String(text || 'schaltung').toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'schaltung';

export function verzoegert(fn, ms) {
  let t = null;
  const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  f.abbrechen = () => clearTimeout(t);
  return f;
}

/* Projekt als kurze Zeichenkette für den Link */
export async function packe(text) {
  const strom = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  const bytes = new Uint8Array(await new Response(strom).arrayBuffer());
  let b = '';
  for (let i = 0; i < bytes.length; i++) b += String.fromCharCode(bytes[i]);
  return btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function entpacke(code) {
  const b = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) bytes[i] = b.charCodeAt(i);
  const strom = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(strom).text();
}
