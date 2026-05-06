# Audit non-persistance input — Static scan (RGPD CRITIQUE)

**Date scan** : 2026-05-06T18:02:22Z
**Mode** : `[STATIQUE]` — grep récursif sur `src/`
**Source** : qa-strategy.md §4.3 — RGPD : aucune persistance ni log de l'input audit (agent_config, sample_traces, system_prompt) sauf calcul du hash watermark

## Patterns testés

### Pattern 1 — Persistance KV de l'input audit

```bash
grep -rn "kv\.put.*audit:input\|kv\.put.*agent_config\|kv\.put.*sample_traces" src/
```

**Résultat** : 0 hit
**Verdict** : **PASS**

### Pattern 2 — Logs console des données sensibles

```bash
grep -rn "console\.log.*sample_traces\|console\.log.*agent_config\|console\.log.*system_prompt" src/
```

**Résultat** : 0 hit
**Verdict** : **PASS**

## Verdict global

**PASS** — aucune ligne de code source dans `src/` ne persiste l'input audit dans KV ni ne le log via `console.log`. Conforme à l'exigence RGPD §4.3 de `qa-strategy.md`.

## Limitations de ce scan

- Scan **statique uniquement** : ne capture pas les fuites runtime (ex. JSON.stringify d'un objet contenant `agent_config` envoyé vers un service tiers). Un test runtime (intercepter `fetch` outbound dans un test E2E pour vérifier qu'aucun champ `agent_config`/`sample_traces`/`system_prompt` n'est exfiltré) est recommandé en complément
- Patterns regex limités aux noms de champs documentés. Si le code utilise des alias (ex. `userInput`, `payload`), le scan les rate. Recommandation : ajouter une revue ciblée sur les modules `src/api/audit*.ts` à chaque PR touchant l'audit
- Scan ne couvre pas les **dépendances tierces** (`node_modules/`) — improbable mais pas impossible qu'une lib persiste les inputs (ex. middleware de logging excessif)

## Patterns supplémentaires testés (validation croisée)

```bash
# Hash watermark seul autorisé (HMAC) — vérifier qu'il n'inclut PAS l'input brut
grep -rn "hmac.*sample_traces\|hmac.*agent_config" src/
```

(non lancé dans ce scan — à ajouter en V1.1 pour vérifier que le HMAC ne capture que les champs autorisés `audit_id`, `_signature`, etc.)

## Recommandation pour CI

Ajouter ce grep comme step bloquant dans `.github/workflows/ci.yml` (job `lint-test`) :

```yaml
- name: Grep RGPD non-persistance audit input
  run: |
    if grep -rn "kv\.put.*audit:input\|kv\.put.*agent_config\|kv\.put.*sample_traces" src/ 2>/dev/null; then
      echo "::error::RGPD VIOLATION — persistance input audit détectée"; exit 1
    fi
    if grep -rn "console\.log.*sample_traces\|console\.log.*agent_config\|console\.log.*system_prompt" src/ 2>/dev/null; then
      echo "::error::RGPD VIOLATION — log console données audit détecté"; exit 1
    fi
```
