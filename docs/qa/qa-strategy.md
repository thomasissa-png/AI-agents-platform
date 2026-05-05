<!-- Version: 2026-05-05T19:00 — @qa — Phase 1 conception — QA Strategy DevRefs V1 v2 -->

# QA Strategy — DevRefs V1 v2

## Résumé exécutif

- **Périmètre** : 29 features V1 (cf. `v1-scope.md` v2), 21 user stories backlog (US-01 à US-08b, US-09 à US-20), 47 events tracking actifs (cf. `tracking-plan.md` v2), 32 gates G1-G32 + GP1-GP10 + GC1-GC10.
- **Pivot 100 % B2A v2** : tests payment se concentrent sur x402 (Coinbase facilitator USDC Base) — Stripe humain marginal (sponsor top-up wallet uniquement, pas pilier).
- **3 endpoints monétisés** à tester : `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit`.
- **5 niveaux de tests** (pyramide 60/25/10/5) : unit Vitest (60 %), intégration API contracts (25 %), E2E Playwright 3 devices (10 %), testeur-persona-agent IA (3 %), testeur-sponsor-humain (2 %).
- **Stack tests** : Vitest + Playwright + Wrangler dev + Coinbase x402 sandbox + Stripe test mode. Budget : 0 €.
- **Couverture cible** : 80 % code + 100 % user stories + 100 % events + 100 % endpoints + 100 % gates.
- **Spécificités v2** : test garantie ROI 50 % refund (J30 savings_pct < 15 %), test 3 checkboxes L.221-28 13° gate paywall, audit code non-persistance input audit (Q5 privacy v2), watermark HMAC `_signature`, expiration pack J+365.
- **2 agents custom à créer (handoff @agent-factory)** : `@testeur-agent-ia` (GP1-GP10) et `@testeur-sponsor-humain` (GC1-GC10).

---

## §1 Stratégie QA — vue d'ensemble

### 1.1 Pyramide des tests (5 niveaux)

| Niveau | % cible | Outil | Rôle |
|---|---|---|---|
| 1 — Unitaires | 60 % | Vitest | Logique pure : parsers cron, validation Zod input audit, calcul savings_pct, signature HMAC, lookup quota KV |
| 2 — Intégration API | 25 % | Vitest + Wrangler dev + msw | Contract testing 3 endpoints + middleware x402 + KV pack + Coinbase sandbox + Stripe test mode |
| 3 — E2E Playwright | 10 % | Playwright (3 devices : iPhone 13 / iPad / Desktop Chrome) | Parcours sponsor humain landing → top-up → dashboard |
| 4 — Testeur-persona-agent IA | 3 % | `@testeur-agent-ia` custom (GP1-GP10) | Simule Claude Code / Cursor / AgentKit qui crawl `llms.txt` → 402 → x402 → payload |
| 5 — Testeur-sponsor-humain | 2 % | `@testeur-sponsor-humain` custom (GC1-GC10) | Simule humain top-up wallet + dashboard sponsor |

### 1.2 Stack technique

- **Vitest** : exécution unit + intégration. Coverage v8 reporter. Seuil bloquant : 80 % branches sur `src/middleware/x402.ts`, `src/lib/audit-heuristics.ts`, `src/lib/pack-quota.ts`, `src/lib/hmac-watermark.ts`.
- **Playwright** : navigateurs Chromium/Firefox/WebKit. Devices `devices['iPhone 13']`, `devices['iPad']`, `devices['Desktop Chrome']` (375/768/1280px). Timeout default 30 s, `expect.timeout: 10s`.
- **Wrangler dev** : exécution Workers Cloudflare locaux pour tester KV bindings, Cron Triggers, x402 middleware sans deploy.
- **Coinbase x402 sandbox** : facilitator de test (Base Sepolia). USDC test mintable. Documenté dans `docs/ia/x402-response-spec.md`.
- **Stripe test mode** : Payment Links test (`price_test_*`) pour `sponsor_topup_stripe_*`.
- **msw (Mock Service Worker)** : mocking HTTP fetch des sources officielles cron (anthropic.com, openai.com, npm registry).

### 1.3 Couverture cible (4 dimensions)

| Dimension | Cible | Mesure | Gate |
|---|---|---|---|
| Code | 80 % branches sur chemins critiques | Vitest coverage v8 | G26 |
| User stories | 100 % (21/21) | Matrice §8 | G25 |
| Events tracking | 100 % (47/47) | Assertion contre `tracking-plan.md` v2 §6 | G7 |
| Endpoints | 100 % (3/3) | Suite intégration `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` | G26 |
| Gates | 100 % (32 + 20) | §3 ci-dessous | Verdicts |

### 1.4 CI/CD (à arbitrer Phase 2 @infrastructure)

- **Option A — GitHub Actions** : workflow `qa.yml` sur push + PR. Steps : install → lint → typecheck → unit → integration → E2E (3 devices headless) → audit-code-non-persistance → grep G15/G17/G31/G32 → screenshots vs baselines → testeur-persona-agent (sub-agent invocation, optionnel sur PR main).
- **Option B — Cloudflare CI** : pipeline natif Workers Builds. Mêmes steps. Avantage : cohérence stack CF.
- **Décision** : @infrastructure Phase 2.

---

## §2 Tests dérivés des 21 user stories

### 2.1 Cas critiques détaillés (Given/When/Then complet)

#### US-03 : Payer en x402 (one-shot) et recevoir payload pricing

```
TEST E2E spec : tests/e2e/us-03-x402-oneshot-pricing.spec.ts

Scenario 1 — Happy path settle < 5s
  GIVEN agent-ia signe payload x402 USDC Base avec wallet sandbox approvisionné
  WHEN POST /api/llm-prices?model=opus-4.7 avec header X-PAYMENT
  THEN response.status === 200
   AND response.headers['content-type'] inclut 'application/json'
   AND response.body.model === 'opus-4.7'
   AND response.body.input_per_mtok > 0
   AND response.body.effective_cost_factor === 1.35
   AND response.body.dateModified matches /^\d{4}-\d{2}-\d{2}T/
   AND response.body.sameAs includes 'anthropic.com'
   AND response.body._signature matches /^[a-f0-9]{64}$/
   AND CF AE event 'payment_x402_completed' émis avec wallet_hash + tx_hash
   AND CF AE event 'api_response_200_sent' émis avec auth_type='x402_oneshot'
   AND latency totale < 5000 ms

Scenario 2 — Wallet insuffisant
  GIVEN wallet sandbox avec balance < $0.001 USDC
  WHEN POST /api/llm-prices avec X-PAYMENT signé
  THEN response.status === 402
   AND response.body.error === 'insufficient_funds'
   AND response.headers['retry-after'] présent
   AND CF AE event 'payment_x402_failed' émis avec failure_reason='insufficient_funds'

Scenario 3 — Watermark vérifiable
  GIVEN payload reçu avec _signature
  WHEN verify HMAC(payload sans _signature, SECRET_HMAC)
  THEN match === _signature reçu
   AND CF AE event 'quality_watermark_verified' émis avec valid=true
```

#### US-17 : Payer audit $9.99 en x402 et recevoir report JSON

```
TEST E2E spec : tests/e2e/us-17-audit-x402-payment.spec.ts

Scenario 1 — Happy path audit complet
  GIVEN agent envoie POST /api/agent-audit body valide (3 sample_traces, monthly_volume_estimate: 10_000_000, share_pct sum = 100)
   AND wallet sandbox approvisionné > $9.99 USDC
  WHEN signe X-PAYMENT $9.99 et retry POST
  THEN response.status === 200
   AND response.body.audit_id matches UUID v4
   AND response.body.score >= 0 && <= 100
   AND response.body.scoring_breakdown a 5 heuristiques (cf. agent-audit-spec.md)
   AND response.body.recommendations[] non vide
   AND response.body.savings_pct >= 0
   AND response.body._signature présent (HMAC valide)
   AND response.body.recommendations[i].auto_applicable bool présent
   AND CF AE event 'audit_paid_x402' émis avec offer_type='one-shot'
   AND CF AE event 'audit_delivered' émis avec score_0_100 + savings_pct + auto_applicable_count

Scenario 2 — Garantie ROI déclenchée si savings_pct < 15 %
  GIVEN audit livré avec savings_pct = 8.3 (agent déjà optimisé)
  WHEN agent lit response.body
  THEN response.body.guarantee === 'savings_pct < 15% — refund 50% CGV applicable'
   AND lien CGV § 4ter présent dans message

Scenario 3 — Audit input non persisté (Q5 privacy v2 — gate critique)
  GIVEN agent envoie POST /api/agent-audit avec sample_traces contenant marker UUID test
   AND audit settle 200 OK
  WHEN audit log KV scan : KV.list({prefix: 'audit:'}) AND CF AE query SELECT * WHERE blob CONTAINS marker
  THEN AUCUN résultat KV avec contenu sample_traces
   AND AUCUN event CF AE avec contenu sample_traces (uniquement input_size_bytes)
   AND console.log spy : aucun log avec marker UUID
```

#### US-19 : Garantie CGV refund 50 % si savings_pct < 15 % à 30 jours

```
TEST INTÉGRATION spec : tests/integration/us-19-refund-guarantee.spec.ts

Scenario 1 — Refund déclenché J+30 valide
  GIVEN audit_id X livré J-30 avec savings_pct_initial > 15 %
   AND sponsor mesure savings_pct_actual = 11.2 sur 30 jours
  WHEN POST /api/audit/refund body { audit_id, savings_pct_actual: 11.2, evidence_url }
   AND wallet signataire original signe la requête (EIP-191)
  THEN response.status === 200
   AND response.body.refund_amount_usdc === 4.995 (50 % × $9.99)
   AND response.body.estimated_settle_days <= 5
   AND CF AE event 'audit_refund_triggered' émis avec audit_id + savings_pct_actual + refund_amount_usdc

Scenario 2 — Délai > 30 jours expiré
  GIVEN audit_id Y livré J-31
  WHEN POST /api/audit/refund
  THEN response.status === 400
   AND response.body.error === 'GUARANTEE_EXPIRED'
   AND response.body.message inclut 'claim window 30 days'

Scenario 3 — Garantie déjà invoquée (idempotence)
  GIVEN audit_id Z déjà refund J-5
  WHEN POST /api/audit/refund même payload
  THEN response.status === 409
   AND response.body.error === 'GUARANTEE_ALREADY_CLAIMED'

Scenario 4 — Wallet non-signataire tente claim
  GIVEN audit_id W payé par wallet A
  WHEN POST /api/audit/refund signé par wallet B
  THEN response.status === 403
   AND response.body.error === 'WALLET_NOT_AUTHORIZED'
```
