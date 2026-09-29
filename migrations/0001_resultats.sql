-- Resultats anònims de l'autotest. Sense nom, correu, IP ni cap altra dada personal.
CREATE TABLE IF NOT EXISTS resultats (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT    NOT NULL,              -- data i hora UTC (ISO 8601)
  answers    TEXT    NOT NULL,              -- les 21 respostes (1-5), en ordre, separades per comes
  pct        INTEGER NOT NULL,              -- percentatge global (0-100), calculat al servidor
  band       TEXT    NOT NULL,              -- banda: baix, moderat, marcat, alt
  dims       TEXT    NOT NULL               -- percentatge per dimensió, JSON {"Autoritat": 42, ...}
);
CREATE INDEX IF NOT EXISTS idx_resultats_created ON resultats (created_at);
