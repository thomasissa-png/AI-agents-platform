# Cron Live Status — DevRefs V1

**Date du run** : 2026-05-06T18:02:22Z
**Mode** : `[LIVE]` — query CF API KV `CRON_STATE_KV` (namespace `66ce89294a5a4d5f8b6ad6b55bbaec55`)
**Méthode** : lecture des clés `cron:{job_name}:last_run` (pas de trigger manuel)

## Résultats par cron (5 jobs configurés dans `wrangler.toml`)

| Cron                     | Schedule                                  | Dernière exec              | Delta vs now | Verdict                                                                                                                                                                                                                                                                                                                 |
| ------------------------ | ----------------------------------------- | -------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cron-prices-update`     | `0 */6 * * *` (toutes les 6h)             | `2026-05-06T18:00:39.884Z` | 103 s        | **PASS**                                                                                                                                                                                                                                                                                                                |
| `cron-cron-health-check` | `*/15 * * * *` (toutes les 15 min)        | `2026-05-06T18:00:32.000Z` | 110 s        | **PASS**                                                                                                                                                                                                                                                                                                                |
| `cron-sdk-update`        | `0 3 * * *` (1×/jour 03:00 UTC)           | `null` (clé absente)       | n/a          | **SKIP** — n'a pas encore atteint sa fenêtre de run depuis le 1er deploy                                                                                                                                                                                                                                                |
| `cron-indexnow-push`     | `5 */6 * * *` (5 min après prices-update) | `null` (clé absente)       | n/a          | **FIXED 2026-05-07** (@fullstack) — handler ne persistait pas `last_run` dans `CRON_STATE_KV`. Patch : ajout `env.CRON_STATE_KV.put(KV_KEYS.cronLastRun("indexnow-push"), ...)` en fin de run (succès + erreurs partielles + early return missing_api_key). À revérifier après prochaine fenêtre cron post-déploiement. |
| `cron-pack-expiry-check` | `0 0 * * *` (1×/jour 00:00 UTC)           | `null` (clé absente)       | n/a          | **SKIP** — fenêtre 00:00 UTC pas atteinte depuis le 1er deploy (déployé après 00:00)                                                                                                                                                                                                                                    |

## Synthèse

- **2/5 PASS** (prices-update, cron-health-check) — les crons fréquents tournent bien
- **2/5 SKIP** légitimes (sdk-update, pack-expiry-check) — fenêtres journalières pas encore atteintes depuis le 1er deploy. Code vérifié 2026-05-07 (@fullstack) : les deux persistent bien `cron:{job}:last_run` en KV (sdk-update.ts L76-80, pack-expiry-check.ts L94-98). À revérifier en KV après leur prochaine fenêtre 24h.
- **1/5 FIXED** (indexnow-push, 2026-05-07 @fullstack) — hypothèse 1 confirmée : le handler n'appelait jamais `CRON_STATE_KV.put`. Patch livré : ajout interface `CRON_STATE_KV?: KVNamespace`, helper `persistLastRun()` invoqué en fin de run (succès, catch, et early return `missing_api_key`). À revérifier après redéploiement prod + prochaine fenêtre 6h.

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
