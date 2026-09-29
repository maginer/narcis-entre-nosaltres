/** Envia les respostes a l'estudi. El servidor refà el càlcul i no desa cap dada personal. */
export async function submitResult(answers: ReadonlyArray<number>): Promise<boolean> {
  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
