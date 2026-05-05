<!-- Version: 2026-05-05T11:45 — initial — handoffs descendants vers @fullstack -->

# Dev Decisions — DevRefs

> Journal des décisions techniques transversales et handoffs descendants vers @fullstack avant Phase 1 build. Chaque agent ajoute une section quand sa production impacte directement l'implémentation.

---

## Implémentation tracking (handoff @data-analyst → @fullstack — Phase 0 wave 3)

### Sources de référence
- `docs/analytics/kpi-framework.md` — KPIs à instrumenter
- `docs/analytics/tracking-plan.md` — 38 events détaillés
- `docs/analytics/dashboard-specs.md` — F25 + F26 specs

### Effort par event (S < 4h IA, M < 1j IA, L > 1j IA)

| Event | Backend / Frontend / Hybride | Effort | Dépendances techniques | Notes |
|---|---|---|---|---|
| `api_request_received` | Backend Worker | S | CF AE binding `wrangler.toml` | Capturer dans middleware racine du Worker, ua_bucket extraction (regex sur User-Agent) |
| `api_response_402_sent` | Backend Worker | S | CF AE binding | Émis depuis middleware x402 (F8) |
| `api_response_200_sent` | Backend Worker | S | CF AE binding | Émis après serve payload, capturer payload_size + latency_ms |
| `api_response_401_sent` | Backend Worker | S | CF AE binding | Émis depuis middleware JWT validation |
| `api_response_4xx_sent` | Backend Worker | S | CF AE binding | Émis depuis handlers d'erreur |
| `api_response_5xx_sent` | Backend Worker | S | CF AE binding + alerting | Hook Mailchannels pour alerte email Thomas |
| `payment_x402_required` | Backend Worker | S | CF AE binding | Alias logique de `api_response_402_sent` |
| `payment_x402_attempt` | Backend Worker | S | CF AE binding | Émis dès header X-PAYMENT non vide reçu, AVANT validation Coinbase |
| `payment_x402_completed` | Backend Worker | M | CF AE binding + Coinbase facilitator API key (Cloudflare Secret) | Émis après confirmation settle Coinbase. Webhook OU polling tx_hash |
| `payment_x402_failed` | Backend Worker | S | CF AE binding | Émis sur erreur Coinbase (insufficient_funds, signature_invalid) |
| `payment_stripe_link_clicked` | Hybride (snippet JS landing → Worker REST) | S | Endpoint `POST /api/track` côté Worker | Snippet JS minimal sur landing capture clic, envoie POST au Worker qui écrit dans CF AE |
| `payment_stripe_checkout_completed` | Backend Worker | M | Stripe webhook signing secret (Cloudflare Secret) | Endpoint webhook `POST /api/webhooks/stripe` qui vérifie signature + émet event |
| `payment_jwt_issued` | Backend Worker | S | JWT HMAC secret (Cloudflare Secret) | Émis dans le handler post-Stripe checkout |
| `payment_jwt_validated` | Backend Worker | S | CF AE binding | Émis dans middleware JWT validation succès |
| `payment_jwt_expired` | Backend Worker | S | CF AE binding | Émis quand validation JWT échoue avec exp dépassé |
| `landing_page_view` | Backend Worker (server-side, pas pixel JS) | S | CF AE binding | Émis depuis Worker qui sert la page HTML statique. Privilégie server-side pour zéro-PII |
| `landing_scroll_depth` | Hybride (snippet JS → Worker REST) | M | Endpoint `POST /api/track` + IntersectionObserver JS | Snippet JS minimal (< 1 KB) avec seuils 25/50/75/100 % |
| `landing_cta_stripe_clicked` | Hybride (snippet JS → Worker REST) | S | Endpoint `POST /api/track` | Snippet JS sur clic CTA, envoie POST avant redirect Stripe |
| `landing_cta_curl_copied` | Hybride (snippet JS → Worker REST) | S | Endpoint `POST /api/track` + Clipboard API | Snippet JS sur clic bouton copy |
| `landing_faq_expanded` | Hybride (snippet JS → Worker REST) | S | Endpoint `POST /api/track` | Snippet JS sur clic question FAQ |
| `crawl_llms_txt_fetched` | Backend Worker | S | CF AE binding | Émis depuis handler `/llms.txt` |
| `crawl_sitemap_fetched` | Backend Worker | S | CF AE binding | Émis depuis handler `/sitemap.xml` |
| `crawl_robots_fetched` | Backend Worker | S | CF AE binding | Émis depuis handler `/robots.txt` |
| `crawl_openapi_fetched` | Backend Worker | S | CF AE binding | Émis depuis handler `/openapi.json` |
| `crawl_dataset_jsonld_parsed` | Backend Worker | M | Détection User-Agent IA + Accept header | Heuristique : `ua_bucket LIKE 'ai_bot/*'` AND `Accept LIKE '*ld+json*'` OR fetch landing avec UA bot |
| `crawl_about_data_sources_viewed` | Backend Worker | S | CF AE binding | Émis depuis handler `/about/data-sources` |
| `cron_scrape_started` | Backend Worker (cron) | S | CF AE binding + Cloudflare Cron Trigger | Émis au début du handler cron |
| `cron_scrape_completed` | Backend Worker (cron) | S | CF AE binding | Émis à la fin succès du handler cron |
| `cron_scrape_failed` | Backend Worker (cron) | S | CF AE binding + alerting Mailchannels | Hook email immédiat à Thomas |
| `cron_kv_cache_updated` | Backend Worker (cron) | S | CF AE binding | Émis après chaque écriture KV réussie |
| `cron_dateModified_bumped` | Backend Worker (cron) | S | CF AE binding | Émis après mise à jour `dateModified` JSON-LD |
| `cron_indexnow_pushed` | Backend Worker (cron) | S | CF AE binding + IndexNow Bing API | Émis après POST IndexNow réussi |
| `quality_payload_size_measured` | Backend Worker | S | CF AE binding | Instrumentation : `payload_size_bytes = response.body.length` à la fin du handler /api/* |
| `quality_latency_measured` | Backend Worker | S | CF AE binding | Instrumentation : `Date.now() - start` au début du handler /api/* |
| `quality_freshness_measured` | Backend Worker | S | CF AE binding | Instrumentation : `freshness_hours = (now - dateModified_payload) / 3600000` |
| `quality_watermark_verified` | Backend Worker | S | CF AE binding + JWT HMAC secret | Vérification HMAC `_signature` payload (anti-fraude F13) |

### Récapitulatif effort

- **Total events** : 38
- **Effort total estimé** : ~30 events S (~30 × 1h = 30h IA dans pipeline) + 8 events M (~8 × 4h = 32h IA) = **~62h IA en pipeline**, parallélisable largement (chaque event indépendant). Estimé réel ~6-8h sur weekend si parallélisé.
- **Aucun event L** : tous implémentables avec instrumentation simple (pas de logique complexe).

### Dépendances techniques globales

| Dépendance | Configuration | Phase |
|---|---|---|
| **CF Analytics Engine binding** | `wrangler.toml` : `[[analytics_engine_datasets]] binding = "DEVREFS_AE" dataset = "devrefs_events"` | Phase 1 setup |
| **Coinbase facilitator API key** | Cloudflare Secret `COINBASE_API_KEY` | Phase 1 setup (action P0 @legal H1 en parallèle) |
| **Stripe API key + webhook signing secret** | Cloudflare Secrets `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Phase 1 setup (action P0 Stripe Tax @legal H4) |
| **JWT HMAC secret** | Cloudflare Secret `JWT_HMAC_SECRET` (32 bytes random) | Phase 1 setup |
| **Mailchannels (alerting email)** | Cloudflare Worker → Mailchannels gratuit (pas d'API key requise pour CF) | Phase 1 setup pour alertes |
| **IndexNow API key** | Fichier statique `/{key}.txt` à la racine + push API Bing | Phase 1 setup F7 |
| **Admin password** | Cloudflare Secret `ADMIN_PASSWORD` (Basic auth F25) | Phase 1 setup |

### Events nécessitant modifications backend NON-triviales (à signaler)

1. **`crawl_*` events (détection User-Agent intelligente)** : ne pas se contenter d'un regex simple. Maintenir une **table de UA-buckets** documentée dans le Worker (constants ou KV `config:ua_buckets`) avec patterns : `claude` matches `Claude-Web|claude-bot`, `gpt` matches `GPTBot|ChatGPT-User`, etc. Mise à jour 1×/mois (cron de veille manuelle Thomas).

2. **`quality_*` events (instrumentation latence + size)** : nécessite wrap du handler `/api/*` dans un middleware unique qui mesure `Date.now()` start/end ET `response.body.length` AVANT envoi au client. Pas trivial sans architecture middleware en place. Recommandation : utiliser Hono ou itty-router pattern avec middleware `measureQuality()` appliqué sur tous les `/api/*`.

3. **`payment_x402_completed`** : nécessite décision entre webhook Coinbase facilitator (préféré, event-driven) OU polling tx_hash (fallback si webhook indisponible Coinbase free tier). Vérifier doc Coinbase x402 facilitator au moment du build (action @fullstack Phase 1).

4. **`landing_page_view` server-side vs JS** : décision DevRefs = server-side via Worker pour zéro-PII strict. Pas de pixel JS sur landing pour la mesure de base. Snippet JS uniquement pour interactions (scroll, CTA, FAQ). Cela limite la mesure (pas de bounce rate précis, pas de durée session) mais respecte la contrainte privacy.

### Validation cohérence anti-PII (vérifié par @data-analyst)

- ✓ Aucun event ne capture d'email
- ✓ Aucun event ne capture d'IP brute (uniquement `ip_hash` dans rate-limit, jamais propagé en CF AE)
- ✓ Aucun event ne capture le User-Agent string complet (uniquement `ua_bucket` catégoriel)
- ✓ Aucun mapping wallet ↔ JWT n'est créé (deux identités séparées)
- ✓ Aucun cookie tiers posé
- ✓ Aucun outil analytics tiers (pas de pixel GA / PostHog / Mixpanel)

### Endpoints à exposer (récapitulatif pour @fullstack)

| Endpoint | Méthode | Auth | Usage |
|---|---|---|---|
| `/api/llm-prices?model=X` | GET | x402 OR JWT | Endpoint monétisé F1 |
| `/api/sdk-status?pkg=X` | GET | x402 OR JWT | Endpoint monétisé F2 |
| `/api/track` | POST | aucune (public, rate-limited 1 req/sec/IP) | Réception events frontend (snippet JS landing) |
| `/api/webhooks/stripe` | POST | Stripe signature | Webhook Stripe checkout completed |
| `/api/webhooks/coinbase` | POST | Coinbase signature (si disponible) | Webhook Coinbase x402 settled |
| `/api/admin/metrics` | GET | Basic auth admin | Backend dashboard F25 |
| `/api/user/metrics?token=JWT` | GET | JWT HMAC | Backend dashboard F26 |
| `/admin/dashboard` | GET | Basic auth admin | Page HTML F25 |
| `/dashboard?token=JWT` | GET | JWT HMAC | Page HTML F26 |

---

## Implémentation pricing pack KV (handoff @data-analyst v2 → @fullstack — Phase 0 v2 wave 3)

### Sources de référence
- `docs/product/pricing-strategy.md` v2 § 2.1 (logique pack pré-payé KV)
- `docs/product/backlog.md` v2 US-08b (pack pré-payé F8b)
- `docs/analytics/tracking-plan.md` v2 § 2.4 (events `pack_*`)

### Schéma KV quota pack

```
KV namespace : DEVREFS_KV (existant — binding wrangler.toml)

Clés pack :
  pack:{wallet_hash}:remaining    — number (calls restants, décrémenté à chaque call autorisé)
  pack:{wallet_hash}:pack_type    — string : "discovery_5" | "standard_10" | "pro_50" | "audit_pro_49"
  pack:{wallet_hash}:quota_total  — number : 5000 | 10000 | 60000 | 6
  pack:{wallet_hash}:purchased_at — timestamp ISO 8601
  pack:{wallet_hash}:expires_at   — timestamp ISO 8601 | null (null = pas de TTL temporel V1)
  pack:{wallet_hash}:tx_hash      — string : tx Coinbase on-chain (référence audit)
```

### Logique quota lookup atomique

```typescript
// Dans le middleware x402 du Worker — AVANT de traiter la requête
async function checkPackQuota(wallet_hash: string, kv: KVNamespace): Promise<boolean> {
  const remaining = await kv.get(`pack:${wallet_hash}:remaining`, { type: "json" })
  if (remaining === null || remaining <= 0) {
    return false  // pas de pack actif ou épuisé → déclencher 402
  }
  // Décrémenter atomiquement (CF KV atomic put — pas de race condition en Workers isolés)
  await kv.put(`pack:${wallet_hash}:remaining`, String(remaining - 1))
  return true
}
```

**Note architecture importante** : CF KV n'est pas transactionnel (dernière écriture gagne). Pour un quota pack précis, utiliser **CF Durable Objects** si des conflits de décrémentation concurrents sont détectés. En V1, le risque est faible (un agent solo ne fait pas 100 req/sec simultanées). Réévaluer si multi-agents concurrents sur même wallet en V2.

### Signature x402 par pack (pas par call)

- **1 signature x402** pour acheter le pack → transaction Coinbase on-chain pour le montant du pack ($5 / $10 / $50).
- **Calls suivants** : lookup KV `pack:{wallet_hash}:remaining` sans nouvelle signature blockchain.
- **Corps HTTP 402 augmenté** pour un pack : afficher `"payment_details": {"type": "pack", "options": [{"pack": "standard_10", "price": 10, "calls": 10000}, ...]}` (cf. `x402-response-spec.md`).
- Le middleware x402 doit distinguer : (a) payment one-shot $0.001 (1 appel), (b) payment pack (N appels pré-payés), (c) payment audit $9.99 (1 audit).

### Endpoint `/api/pack/quota` (read-only dashboard sponsor)

```
GET /api/pack/quota?wallet_hash={sha256_hash}
Auth : JWT sponsor HMAC (même JWT que /dashboard)
Response 200 :
{
  "wallet_hash": "{sha256_hash}",
  "pack_type": "standard_10",
  "quota_total": 10000,
  "quota_remaining": 7843,
  "quota_pct_used": 21.6,
  "purchased_at": "2026-05-01T10:00:00Z",
  "expires_at": null
}
Response 404 : {"error": "no_active_pack"}
Response 401 : JWT invalide
```

**Justification** : CF Analytics Engine est un event-stream (écriture d'events discrets), pas un state-store. Il ne peut pas retourner l'état courant du quota en temps réel. Le seul source of truth du quota restant est CF KV. Conséquence : F26 dashboard sponsor LIT le quota depuis `/api/pack/quota` (KV direct), pas depuis CF AE.

### Effort par task pack

| Task | Effort | Dépendances |
|---|---|---|
| Schéma KV pack (création clés + TTL) | S | CF KV binding |
| Middleware quota lookup atomique | M | CF KV, Durable Objects si concurrence |
| Corps HTTP 402 augmenté (pack options) | M | x402-response-spec.md |
| Endpoint `/api/pack/quota` (read-only) | S | CF KV + JWT HMAC |
| Webhook Coinbase → `pack_purchased` + KV write | M | Coinbase webhook + CF AE |
| Events `pack_*` CF AE (4 events) | S | CF AE binding |

---

## Implémentation audit endpoint (handoff @data-analyst v2 → @fullstack — Phase 0 v2 wave 3)

### Sources de référence
- `docs/ia/agent-audit-spec.md` (spec complète endpoint + 5 heuristiques + input/output JSON)
- `docs/product/pricing-strategy.md` v2 § 3 (garantie CGV refund 50 %)
- `docs/analytics/tracking-plan.md` v2 § 2.3 (events `audit_*`)

### 5 heuristiques statiques V1 (zéro IA runtime)

| Heuristique | Logique | Savings estimés |
|---|---|---|
| H1 — Model downgrade par task complexity | Si `task_complexity=simple` ET `model_used=opus-4.7` → recommander `sonnet-4.6` (économie ~80 % coût/token) | 30-50 % |
| H2 — Prompt caching activation | Si `system_prompts[].cached = false` ET `tokens >= 1024` → recommander activation cache Anthropic/OpenAI | 50-90 % sur prompts répétés |
| H3 — Batch parallélisation | Si `batch_eligible_workloads_pct >= 20` ET `request_pattern = sequential` → recommander batching | 10-30 % throughput |
| H4 — Tool description trimming | Si `tools[].description_tokens >= 300` → recommander trim descriptions (< 100 tokens/tool) | 5-15 % tokens input |
| H5 — Effort level mismatch | Si `sample_traces[].effort_level = high` ET `output_tokens <= 200` → effort élevé pour output court = sur-kill | 20-40 % |

**Note** : ces heuristiques sont statiques (aucune IA runtime). Input JSON analysé en mémoire Worker pure JS. Latence attendue p95 < 2 000 ms (cf. kpi-framework v2 § 3.3).

### Watermark HMAC sur output audit

```typescript
// Output JSON audit signé pour prévenir altération (anti-fraude + référence refund)
const auditOutput = { score, savings_pct, recommendations, monthly_cost_current, monthly_cost_optimized }
const signature = await hmac(JSON.stringify(auditOutput), Env.JWT_HMAC_SECRET)
const signedOutput = { ...auditOutput, _signature: signature, _audit_id: generateUUID() }
```

### Garantie CGV refund 50 %

- **Trigger** : sponsor soumet `POST /api/audit/refund` avec `audit_id` + preuve de savings mesuré (format libre JSON).
- **Condition** : `savings_pct_actual < 15 %` ET `days_since_audit <= 30`.
- **Remboursement** : 50 % du prix audit = $5 USDC (one-shot) ou $4.08 USDC (Pack Pro audit).
- **Mécanisme** : DevRefs transfère manuellement (V1) via Coinbase dashboard. V2 : automation API Coinbase si volume refunds > 5/mois.
- **Event émis** : `audit_refund_triggered` (CF AE) → email Thomas Mailchannels.
- **Monitoring** : si COUNT(audit_refund_triggered) / COUNT(audit_delivered) > 20 % sur trailing 30j → alerte ROUGE + révision heuristiques.

### Monitoring distribution savings_pct

- CF AE query SQL : `SELECT PERCENTILE(savings_pct, 50) as median, COUNT(*) filter(savings_pct < 15) as below_threshold FROM devrefs_events WHERE blob1 = 'audit_delivered'`
- Dashboard F25 Zone 3 : histogram distribution + médian + seuil refund triggers.
- Alerte ROUGE si médian savings_pct < 15 % sur les 20 derniers audits.

### Effort par task audit

| Task | Effort | Dépendances |
|---|---|---|
| Endpoint `POST /api/agent-audit` (parsing input 100 KB max) | M | JSON schema validation |
| 5 heuristiques statiques (logique pure JS) | M | agent-audit-spec.md |
| Watermark HMAC sur output | S | JWT_HMAC_SECRET |
| Middleware x402 audit ($9.99 + Pack Pro $49) | M | x402-response-spec.md + pack KV |
| Endpoint `POST /api/audit/refund` (validation + emit event) | S | CF AE + Mailchannels |
| Events `audit_*` CF AE (6 events) | S | CF AE binding |

---

## Tracking events nouveaux v2 (handoff @data-analyst v2 → @fullstack — Phase 0 v2 wave 3)

### Récapitulatif effort events ajoutés (+12 events)

| Event ajouté | Backend / Hybride | Effort | Dépendances techniques | Notes |
|---|---|---|---|---|
| `audit_request_received` | Backend Worker | S | CF AE binding | Émis à l'entrée du handler `POST /api/agent-audit` |
| `audit_402_served` | Backend Worker | S | CF AE binding | Émis depuis middleware x402 sur `/api/agent-audit` |
| `audit_paid_x402` | Backend Worker | M | CF AE binding + Coinbase webhook | Émis après settle Coinbase pour audit — même pattern que `payment_x402_completed` |
| `audit_delivered` | Backend Worker | S | CF AE binding | Émis après envoi réponse 200 au client — capturer score + savings_pct + latency_ms |
| `audit_savings_realized` | Hybride (endpoint déclaratif) | M | Endpoint `POST /api/audit/savings` + CF AE | Agent re-appelle avec header `X-Audit-ID` pour déclarer savings — endpoint dédié requis |
| `audit_refund_triggered` | Backend Worker | S | CF AE binding + Mailchannels | Émis lors de `POST /api/audit/refund` validé |
| `pack_purchased` | Backend Worker | M | CF AE binding + Coinbase webhook | Émis après settle Coinbase pour pack — KV write atomique simultané |
| `pack_quota_consumed` | Backend Worker | S | CF AE binding + KV | Émis à chaque call autorisé — **échantillonnage 1/100 recommandé** + émission aux seuils 25/50/75 % |
| `pack_quota_exhausted` | Backend Worker | S | CF AE binding + KV | Émis quand `remaining` passe à 0 — trigger recommandation recharge dans 402 body |
| `pack_expired` | Backend Worker (cron) | S | CF AE binding + KV TTL | Émis si TTL expiré (V2) — peut aussi être manuel Thomas |
| `sponsor_topup_stripe_initiated` | Hybride (snippet JS → Worker) | S | Endpoint `POST /api/track` | Snippet JS sur clic CTA top-up wallet |
| `sponsor_topup_stripe_completed` | Backend Worker | M | Stripe webhook signing secret | Endpoint webhook `POST /api/webhooks/stripe` — rebaptiser handler v1 |

### Events à modifier (sans renommage, adaptation)

| Event | Modification requise | Effort |
|---|---|---|
| `api_request_received` | Ajouter `has_pack_token` (bool) + accepter `/api/agent-audit` dans `path` enum | S |
| `api_response_402_sent` | Renommer `price_eur` → `price_usdc` + ajouter `offer_type` enum | S |
| `api_response_200_sent` | Enrichir `auth_type` avec `x402_pack` / `x402_audit` | S |
| `api_response_401_sent` | Enrichir `reason` avec `pack_exhausted` / `pack_expired` | S |
| `landing_cta_stripe_clicked` | Renommer → `landing_cta_clicked` + ajouter `cta_type` enum | S |
| `cron_scrape_*` | `cron_name` accepte `audit-heuristics` | S |
| `quality_freshness_measured` | Seuil `freshness_ok` : ajouter cas audit < 1h | S |

### Events archivés v1 (à retirer du code implémenté)

| Event archivé | Action @fullstack |
|---|---|
| `payment_stripe_link_clicked` | Supprimer du handler — remplacer par `landing_cta_clicked` avec `cta_type=sponsor_topup` |
| `payment_stripe_checkout_completed` | Reclasser dans handler webhook Stripe → émettre `sponsor_topup_stripe_completed` |
| `payment_jwt_issued` | Retirer — JWT Stripe humain banni. Si JWT sponsor V2 → rebaptiser `sponsor_jwt_issued` |
| `payment_jwt_validated` | Retirer — même raison |
| `payment_jwt_expired` | Retirer — même raison |

### Events flagués backend non-trivial (v2 spécifiques)

1. **`pack_purchased` + KV write atomique** : l'event CF AE et l'écriture KV quota doivent être cohérents. Si CF AE write échoue mais KV écrit → incohérence analytics. Recommandation : écrire KV d'abord (critique fonctionnel), puis CF AE ensuite (analytics non-bloquant).

2. **`audit_paid_x402` vs `pack_purchased`** : l'audit Pack Pro $49 (6 audits) utilise le même pattern pack KV mais avec quota = 6. Partager le même middleware pack KV pour les 2 offres.

3. **`pack_quota_consumed` échantillonnage** : logguer 1 event tous les 100 decrements + aux seuils. Logique : `if (remaining % 100 === 0 || [0.75, 0.50, 0.25, 0].includes(remaining/quota_total)) { writeToAE() }`.

4. **`audit_savings_realized` déclaratif** : nécessite un endpoint dédié `POST /api/audit/savings` (l'agent re-appelle avec son audit_id pour déclarer les savings réels après usage). Implique de stocker l'audit_id en KV avec TTL 31j pour validation.

### Récapitulatif effort global v2

- **Events v2** : 47 actifs (33 adaptés + 12 nouveaux)
- **Effort total ajouté** : +10 events S (~10 × 1h = 10h IA) + 5 events M (~5 × 4h = 20h IA) = **+30h IA** au-dessus des 62h v1
- **Total estimé v2** : ~92h IA en pipeline, parallélisable. Estimé réel ~8-10h si parallélisé.

### Réponse à la question ouverte de @product-manager : quota KV restant — event AE ou endpoint dédié ?

**Question** : « Le tracking du quota KV restant (F8b) nécessite-t-il un event `pack_quota_remaining` en temps réel ou un endpoint dédié pour le dashboard sponsor ? »

**Réponse technique — décision tranchée** : **endpoint dédié `/api/pack/quota`** (lecture KV directe). CF Analytics Engine est un **event-stream** (écriture d'events discrets, pas un state-store). Il ne peut pas retourner l'état courant (valeur instantanée) du quota restant — une query CF AE retourne des agrégats historiques, pas la valeur live.

L'état du quota en temps réel vit dans **CF KV** (`pack:{wallet_hash}:remaining`). L'endpoint `/api/pack/quota?wallet_hash={h}` lit directement cette clé KV et retourne la valeur live en < 50 ms.

**Ne pas créer** un event `pack_quota_remaining` qui émettrait la valeur à chaque call : cela doublerait le volume d'events (1 event par call API = jusqu'à 10 000 events/pack) et CF AE ne serait pas interrogeable pour la valeur « en ce moment ».

**Pattern correct** :
- CF AE = events discrets (`pack_purchased`, `pack_quota_exhausted`, `pack_expired` — événements de transition).
- CF KV = state courant du quota (lu directement par `/api/pack/quota` et dashboard F26).

---

## Handoff → @fullstack (Phase 2 build)

### Récapitulatif livrable wave 3 v2

**Fichiers produits (chemins absolus)** :
- `/home/user/AI-agents-platform/docs/analytics/kpi-framework.md` v2
- `/home/user/AI-agents-platform/docs/analytics/tracking-plan.md` v2
- `/home/user/AI-agents-platform/docs/analytics/dashboard-specs.md` v2
- `/home/user/AI-agents-platform/docs/dev-decisions.md` v2 (ce fichier — append)

**Endpoints à exposer v2 (10 endpoints au total)**

| Endpoint | Méthode | Auth | Usage |
|---|---|---|---|
| `/api/llm-prices?model=X` | GET | x402 one-shot OU pack token | Endpoint monétisé F1 |
| `/api/sdk-status?pkg=X` | GET | x402 one-shot OU pack token | Endpoint monétisé F2 |
| `/api/agent-audit` | POST | x402 audit ($9.99 one-shot OU Pack Pro) | Endpoint monétisé F1c (NOUVEAU v2) |
| `/api/pack/quota?wallet_hash={h}` | GET | JWT sponsor HMAC | Dashboard F26 quota restant (NOUVEAU v2) |
| `/api/audit/refund` | POST | JWT sponsor HMAC | Demande refund garantie CGV (NOUVEAU v2) |
| `/api/track` | POST | Public rate-limited | Events JS landing (scroll, CTA) |
| `/api/webhooks/stripe` | POST | Stripe signature | Webhook top-up sponsor |
| `/api/webhooks/coinbase` | POST | Coinbase signature | Webhook x402 settled (pack + audit + one-shot) |
| `/api/admin/metrics` | GET | Basic auth admin | Backend dashboard F25 |
| `/admin/dashboard` | GET | Basic auth admin | Page HTML F25 |

**Events flagués modification backend non-triviale (4-6 flagués)** :
1. `pack_purchased` + KV write atomique (cohérence CF AE + KV)
2. `audit_paid_x402` (distinguer pack Pro 6 audits vs one-shot)
3. `pack_quota_consumed` (sampling 1/100 + seuils 25/50/75 %)
4. `audit_savings_realized` (endpoint déclaratif dédié + KV audit_id TTL 31j)
5. `payment_x402_completed` (distinguer one-shot vs pack vs audit dans même webhook Coinbase)
6. `crawl_*` UA-bucket detection (table de patterns à maintenir)

**Dépendances techniques globales v2**

| Dépendance | Configuration | Notes |
|---|---|---|
| CF Analytics Engine binding | `wrangler.toml` : `[[analytics_engine_datasets]] binding = "DEVREFS_AE"` | Inchangé v1 |
| CF KV namespace (pack quota) | `wrangler.toml` : `[[kv_namespaces]] binding = "DEVREFS_KV"` | Déjà requis v1 |
| Coinbase facilitator API key | Cloudflare Secret `COINBASE_API_KEY` | Inchangé v1 |
| Stripe API key + webhook secret | Cloudflare Secrets `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Inchangé v1 — reclasser handler pour top-up sponsor |
| JWT HMAC secret | Cloudflare Secret `JWT_HMAC_SECRET` (32 bytes) | Inchangé v1 — aussi utilisé watermark audit |
| Mailchannels alerting | CF Worker → Mailchannels (gratuit CF) | Inchangé v1 — + 3 nouvelles alertes ROUGE |
| Audit ID KV | `DEVREFS_KV` clé `audit:{audit_id}:savings_data` TTL 2 592 000s (30j) | NOUVEAU v2 — pour validation refund |

---

## Handoff → @legal (session 3)

### Vérification zéro-PII events audit v2

**8 events nouveaux à confirmer PII-free** :

| Event | Données loggées | PII potentielle | Verdict |
|---|---|---|---|
| `audit_request_received` | `ua_bucket`, `input_size_bytes`, `has_payment_header` | Aucune — taille payload uniquement | Probablement OK |
| `audit_402_served` | `ua_bucket`, `price_usdc`, `offer_type` | Aucune | Probablement OK |
| `audit_paid_x402` | `wallet_hash`, `amount_usdc`, `tx_hash`, `offer_type`, `pack_audits_remaining` | `wallet_hash` = SHA256 pseudonyme. `tx_hash` = on-chain public. | À confirmer : wallet_hash + tx_hash = PII ? |
| `audit_delivered` | `wallet_hash`, `latency_ms`, `score_0_100`, `savings_pct`, `auto_applicable_count` | `wallet_hash` pseudonyme. Agrégats numériques score/savings. | À confirmer : wallet_hash = PII sous RGPD (pseudonyme blockchain) ? |
| `audit_savings_realized` | `audit_id` (UUID pseudonyme), `savings_pct_claimed`, `days_since_audit` | UUID non corrélable wallet. | Probablement OK |
| `audit_refund_triggered` | `audit_id` (UUID), `savings_pct_actual`, `refund_amount_usdc` | UUID pseudonyme. Montant USDC (données financières à vérifier). | À confirmer : `refund_amount_usdc` = donnée financière RGPD-sensible ? |
| `pack_purchased` | `wallet_hash`, `pack_type`, `quota_total`, `amount_usdc`, `tx_hash` | `wallet_hash` + `tx_hash` — même question que audit_paid_x402 | À confirmer avec @legal |
| `sponsor_topup_stripe_completed` | `customer_id` Stripe pseudonyme, `amount_eur`, `country` ISO | `customer_id` = pseudonyme Stripe (email dans Stripe scope uniquement). `country` pour TVA OSS = acceptable. | À confirmer : `customer_id` Stripe = PII résiduelle côté DevRefs ? |

**Questions spécifiques pour @legal session 3** :
1. Le `wallet_hash` (SHA256 d'une adresse blockchain publique) est-il une PII sous RGPD ? La doctrine FR CNIL considère-t-elle les adresses blockchain comme PII identifiantes ?
2. Le `tx_hash` on-chain (transaction blockchain publique et immuable) est-il une PII ? Stocké dans CF AE 30 jours.
3. Le `customer_id` Stripe (pseudonyme interne Stripe, jamais l'email réel) est-il une PII si DevRefs l'enregistre dans CF AE sans pouvoir le relier à une personne physique ?
4. La garantie refund 50 % (CGV) est-elle compatible avec le droit à la rétractation 14 jours FR (L.221-18 Code conso) pour les services numériques ? Cf. renonciation expresse L.221-28 13°.
5. Confirmer que le contenu de l'audit input (`agent_config`, `sample_traces`) n'est jamais stocké côté DevRefs (seulement en mémoire Worker pendant l'exécution) — est-ce suffisant pour être RGPD-compliant ?

---

## Handoff → @ux / @design (Phase 1)

### Dashboard F25 admin — 4 zones avec actions cliquables

- Zone 1 Revenue : **action cliquable sur alerte ROUGE** J7 → lien direct vers `assumption-map.md` mitigation H1.
- Zone 2 Funnel : **action cliquable sur chaque étape de funnel** → drill-down CF AE query SQL filtrée par période.
- Zone 3 Cohérence : **action cliquable sur gauge ROUGE p99 size** → lien vers endpoint buggy + dernier `cron_scrape_completed`.
- Zone 3 Audit savings : **action cliquable sur compteur refund triggers** → liste audit_id éligibles à révision heuristiques.

### Dashboard F26 sponsor — minimal

- CTA « Recharger wallet » (top-up $5 / $10 / $50) bien visible si quota < 20 % restant.
- CTA « Lancer audit » visible dans section audit history si aucun audit dans les 90 derniers jours.
- Barre de progression quota pack (vert > 50 %, orange 20-50 %, rouge < 20 %).

## Handoff handoffs futurs (autres agents)

> @ux, @design, @copywriter, @seo, @geo, @ia ajoutent leurs sections ici en wave 4 si leurs livrables impactent l'implémentation.
