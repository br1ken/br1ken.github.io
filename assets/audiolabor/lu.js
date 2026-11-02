/* Audiolabor: LU-Zerlegung mit Spaltenpivotisierung auf dichten Matrizen, ohne Speicher anzufordern.
   Der Plan nutzt sie einmal für die lineare Schaltung, der Löser laufend für die Jacobi-Matrix. */

/* Zerlegt a an Ort und Stelle und schreibt die Zeilentausche nach perm. Gibt false zurück, wenn die Matrix singulär ist. */
export function luZerlege(a, n, perm) {
  for (let k = 0; k < n; k++) {
    let p = k, max = Math.abs(a[k * n + k]);
    for (let r = k + 1; r < n; r++) {
      const w = Math.abs(a[r * n + k]);
      if (w > max) { max = w; p = r; }
    }
    if (max < 1e-300) return false;
    perm[k] = p;
    if (p !== k) {
      for (let c = 0; c < n; c++) { const h = a[k * n + c]; a[k * n + c] = a[p * n + c]; a[p * n + c] = h; }
    }
    const d = a[k * n + k];
    for (let r = k + 1; r < n; r++) {
      const f = a[r * n + k] / d;
      a[r * n + k] = f;
      if (f !== 0) for (let c = k + 1; c < n; c++) a[r * n + c] -= f * a[k * n + c];
    }
  }
  return true;
}

/* Vorzeichen der Determinante aus einer fertigen Zerlegung */
export function luVorzeichen(a, n, perm) {
  let v = 1;
  for (let k = 0; k < n; k++) {
    if (perm[k] !== k) v = -v;
    if (a[k * n + k] < 0) v = -v;
  }
  return v;
}

/* Löst a·x = b an Ort und Stelle: Danach steht x in b. */
export function luLoese(a, perm, n, b) {
  /* Die Zeilentausche haben auch L mitgetauscht: Erst alle Tausche auf b anwenden, dann vorwärts einsetzen. */
  for (let k = 0; k < n; k++) {
    const p = perm[k];
    if (p !== k) { const h = b[k]; b[k] = b[p]; b[p] = h; }
  }
  for (let k = 0; k < n; k++) {
    const bk = b[k];
    for (let r = k + 1; r < n; r++) b[r] -= a[r * n + k] * bk;
  }
  for (let k = n - 1; k >= 0; k--) {
    let s = b[k];
    for (let c = k + 1; c < n; c++) s -= a[k * n + c] * b[c];
    b[k] = s / a[k * n + k];
  }
}
