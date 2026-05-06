# Cron Live Status — DevRefs V1

**Date du run** : 2026-05-06T18:02:22Z
**Mode** : `[LIVE]` — query CF API KV `CRON_STATE_KV` (namespace `66ce89294a5a4d5f8b6ad6b55bbaec55`)
**Méthode** : lecture des clés `cron:{job_name}:last_run` (pas de trigger manuel)

## Résultats par cron (5 jobs configurés dans `wrangler.toml`)

| Cron                     | Schedule                                  | Dernière exec              | Delta vs now | Verdict                                                                                                                                |
| ------------------------ | ----------------------------------------- | -------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `cron-prices-update`     | `0 */6 * * *` (toutes les 6h)             | `2026-05-06T18:00:39.884Z` | 103 s        | **PASS**                                                                                                                               |
| `cron-cron-health-check` | `*/15 * * * *` (toutes les 15 min)        | `2026-05-06T18:00:32.000Z` | 110 s        | **PASS**                                                                                                                               |
| `cron-sdk-update`        | `0 3 * * *` (1×/jour 03:00 UTC)           | `null` (clé absente)       | n/a          | **SKIP** — n'a pas encore atteint sa fenêtre de run depuis le 1er deploy                                                               |
| `cron-indexnow-push`     | `5 */6 * * *` (5 min après prices-update) | `null` (clé absente)       | n/a          | **FAIL** — devrait avoir tourné à 18:05 UTC mais le run précédent (12:05) n'a laissé aucune trace KV. Voir signaux d'alerte ci-dessous |
| `cron-pack-expiry-check` | `0 0 * * *` (1×/jour 00:00 UTC)           | `null` (clé absente)       | n/a          | **SKIP** — fenêtre 00:00 UTC pas atteinte depuis le 1er deploy (déployé après 00:00)                                                   |

## Synthèse

- **2/5 PASS** (prices-update, cron-health-check) — les crons fréquents tournent bien
- **2/5 SKIP** légitimes (sdk-update, pack-expiry-check) — fenêtres journalières pas encore atteintes depuis le 1er deploy. À revérifier dans 24h
- **1/5 FAIL potentiel** (indexnow-push) — clé KV absente alors qu'au moins une fenêtre 12:05/18:05 aurait dû passer. Trois hypothèses :
  1. Le handler `cron-indexnow-push` ne persiste pas son `last_run` dans KV (bug d'écriture)
  2. Le cron était bien déclaré mais a échoué silencieusement (à confirmer via `wrangler tail`)
  3. Le 1er deploy est postérieur à 18:00 UTC — mais alors `prices-update` aurait dû ne pas avoir tourné non plus, donc improbable

## Signaux d'alerte → @fullstack

- **PRIORITÉ HAUTE** : investiguer pourquoi `cron-indexnow-push` n'écrit pas dans `CRON_STATE_KV`. Vérifier dans `src/cron/indexnow-push.ts` (ou équivalent) que le handler appelle `env.CRON_STATE_KV.put("cron:indexnow-push:last_run", new Date().toISOString())` à la fin du run. Si absent → ajouter. Si présent → check `wrangler tail --env production` pour les exceptions
- **À revérifier dans 24h** : sdk-update (03:00 UTC) et pack-expiry-check (00:00 UTC) doivent avoir une clé KV non-null après leur prochaine fenêtre

## Méthodologie de revérification

```bash
# Pour chaque cron, query la clé last_run :
curl -s "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT/storage/kv/namespaces/$CRON_KV/values/cron:{job_name}:last_run" \
  -H "Authorization: Bearer $CF_TOKEN"
```

Re-run ce script 24h après le 1er deploy prod pour confirmer que les 5 crons ont une trace.
