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

## Handoff handoffs futurs (autres agents)

> @ux, @design, @copywriter, @seo, @geo, @ia ajoutent leurs sections ici en wave 4 si leurs livrables impactent l'implémentation.
