<!-- Version: 2026-05-05T19:00 — @qa — Phase 1 conception — QA Strategy DevRefs V1 v2 -->

# QA Strategy — DevRefs V1 v2

## Résumé exécutif

- **Périmètre** : 30 features V1 (cf. `v1-scope.md` v2.1), 21 user stories backlog (US-01 à US-08c, US-09 à US-20), 52 events tracking actifs (cf. `tracking-plan.md` v2.1), 32 gates G1-G32 + GP1-GP10 + GC1-GC10.
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

| Niveau                       | % cible | Outil                                                      | Rôle                                                                                                         |
| ---------------------------- | ------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1 — Unitaires                | 60 %    | Vitest                                                     | Logique pure : parsers cron, validation Zod input audit, calcul savings_pct, signature HMAC, lookup quota KV |
| 2 — Intégration API          | 25 %    | Vitest + Wrangler dev + msw                                | Contract testing 3 endpoints + middleware x402 + KV pack + Coinbase sandbox + Stripe test mode               |
| 3 — E2E Playwright           | 10 %    | Playwright (3 devices : iPhone 13 / iPad / Desktop Chrome) | Parcours sponsor humain landing → top-up → dashboard                                                         |
| 4 — Testeur-persona-agent IA | 3 %     | `@testeur-agent-ia` custom (GP1-GP10)                      | Simule Claude Code / Cursor / AgentKit qui crawl `llms.txt` → 402 → x402 → payload                           |
| 5 — Testeur-sponsor-humain   | 2 %     | `@testeur-sponsor-humain` custom (GC1-GC10)                | Simule humain top-up wallet + dashboard sponsor                                                              |

### 1.2 Stack technique

- **Vitest** : exécution unit + intégration. Coverage v8 reporter. Seuil bloquant : 80 % branches sur `src/middleware/x402.ts`, `src/lib/audit-heuristics.ts`, `src/lib/pack-quota.ts`, `src/lib/hmac-watermark.ts`.
- **Playwright** : navigateurs Chromium/Firefox/WebKit. Devices `devices['iPhone 13']`, `devices['iPad']`, `devices['Desktop Chrome']` (375/768/1280px). Timeout default 30 s, `expect.timeout: 10s`.
- **Wrangler dev** : exécution Workers Cloudflare locaux pour tester KV bindings, Cron Triggers, x402 middleware sans deploy.
- **Coinbase x402 sandbox** : facilitator de test (Base Sepolia). USDC test mintable. Documenté dans `docs/ia/x402-response-spec.md`.
- **Stripe test mode** : Payment Links test (`price_test_*`) pour `sponsor_topup_stripe_*`.
- **msw (Mock Service Worker)** : mocking HTTP fetch des sources officielles cron (anthropic.com, openai.com, npm registry).

### 1.3 Couverture cible (4 dimensions)

| Dimension       | Cible                               | Mesure                                                                     | Gate     |
| --------------- | ----------------------------------- | -------------------------------------------------------------------------- | -------- |
| Code            | 80 % branches sur chemins critiques | Vitest coverage v8                                                         | G26      |
| User stories    | 100 % (21/21)                       | Matrice §8                                                                 | G25      |
| Events tracking | 100 % (47/47)                       | Assertion contre `tracking-plan.md` v2 §6                                  | G7       |
| Endpoints       | 100 % (3/3)                         | Suite intégration `/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit` | G26      |
| Gates           | 100 % (32 + 20)                     | §3 ci-dessous                                                              | Verdicts |

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

### 2.2 Tests dérivés synthétiques (US-01 à US-20)

Pour chaque US, le tableau ci-dessous liste : test E2E principal, tests intégration, tests unit, events à vérifier émis. Spec détaillée dans `tests/` (1 fichier par US).

| US     | Test E2E (parcours principal)                                                             | Tests intégration API                                                          | Tests unit                                    | Events à émettre                                                           |
| ------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------- |
| US-01  | `us-01-llms-txt.spec.ts` : GET `/llms.txt` MIME + 3 endpoints listés                      | Contract `/llms.txt` markdown valide                                           | Parser `llms-txt.ts`                          | `crawl_llms_txt_fetched`                                                   |
| US-02  | `us-02-402-augmente.spec.ts` : appel non-payé → 402 + body augmenté complet               | Schema 402 body (Zod) avec `roi_summary`, `freshness_proof`, `payload_preview` | Middleware `x402.ts` génère 402 body augmenté | `api_response_402_sent`, `payment_x402_required`                           |
| US-03  | `us-03-x402-oneshot-pricing.spec.ts` (cf. §2.1)                                           | Coinbase facilitator settle                                                    | HMAC sign + verify                            | `payment_x402_attempt`, `payment_x402_completed`, `api_response_200_sent`  |
| US-04  | `us-04-fraicheur-jsonld.spec.ts` : `dateModified` ISO 8601 + diff < 6h                    | Header `Last-Modified` aligné JSON-LD                                          | `freshness-check.ts`                          | `quality_freshness_measured`                                               |
| US-05  | `us-05-effective-cost-factor.spec.ts` : factor 1.35 Opus 4.7                              | Registre factors par modèle                                                    | `cost-factor.ts`                              | `api_response_200_sent`                                                    |
| US-06  | `us-06-sdk-status.spec.ts` : payload SDK + breaking_since                                 | Cron npm + GitHub releases                                                     | Parser `sdk-status.ts`                        | `api_response_402_sent`, `payment_x402_completed`, `api_response_200_sent` |
| US-07  | `us-07-sameas.spec.ts` : URL sameAs HTTP 200                                              | Validation sameAs                                                              | `sameas-validator.ts`                         | `api_response_200_sent`                                                    |
| US-08  | `us-08-openapi.spec.ts` : OpenAPI 3.1 valide + extension `x-x402`                         | Validation spec via openapi-types                                              | Parser OpenAPI                                | `crawl_openapi_fetched`                                                    |
| US-08b | `us-08b-pack-quota.spec.ts` : achat pack → quota KV → calls < 50ms                        | Lookup KV `pack:{wallet_hash}:remaining`                                       | `pack-quota.ts` decrement                     | `pack_purchased`, `pack_quota_consumed`, `pack_quota_exhausted`            |
| US-09  | `us-09-landing.spec.ts` : LCP < 200ms + 2 heroes JSON visibles                            | Cloudflare Pages render                                                        | N/A                                           | `landing_page_view`, `landing_scroll_depth`                                |
| US-10b | `us-10b-stripe-topup.spec.ts` : Checkout test mode → wallet créditée                      | Webhook Stripe `checkout.session.completed`                                    | `stripe-webhook-handler.ts`                   | `sponsor_topup_stripe_initiated`, `sponsor_topup_stripe_completed`         |
| US-11  | `us-11-wallet-config.spec.ts` : snippet x402-fetch copiable                               | Génération JWT HMAC                                                            | `jwt-issuer.ts`                               | N/A (events sponsor)                                                       |
| US-12  | `us-12-dashboard-sponsor.spec.ts` : 4 widgets remplis (quota + balance + audit + alertes) | API `/api/dashboard?token=JWT`                                                 | Aggregator                                    | N/A (read-only)                                                            |
| US-13  | `us-13-cgv.spec.ts` : clause art. 4ter audit garantie présente                            | Render legal pages                                                             | N/A                                           | N/A                                                                        |
| US-14  | `us-14-data-sources.spec.ts` : 6 sources listées + User-Agent bot doc                     | Render about pages                                                             | N/A                                           | `crawl_about_data_sources_viewed`                                          |
| US-15  | `us-15-admin-dashboard.spec.ts` : KPI agrégé CF AE + Coinbase                             | API `/admin/dashboard` (IP whitelist)                                          | Aggregator pack+audit                         | N/A (admin only)                                                           |
| US-16  | `us-16-audit-input-validation.spec.ts` : share_pct=100, traces 3-50, payload <= 100 KB    | Zod schema audit input (cf. agent-audit-spec.md)                               | `audit-input-validator.ts`                    | `audit_request_received`, `audit_402_served`                               |
| US-17  | `us-17-audit-x402-payment.spec.ts` (cf. §2.1)                                             | Coinbase settle audit                                                          | `audit-heuristics.ts` (5 heuristiques)        | `audit_paid_x402`, `audit_delivered`                                       |
| US-18  | `us-18-auto-applicable-patches.spec.ts` : patch JSON Schema-validable                     | Validation JSON Schema patches                                                 | Patch builder                                 | `audit_savings_realized` (déclaratif)                                      |
| US-19  | `us-19-refund-guarantee.spec.ts` (cf. §2.1)                                               | API `/api/audit/refund`                                                        | Refund engine                                 | `audit_refund_triggered`                                                   |
| US-20  | `us-20-share-supervisor.spec.ts` : dashboard sponsor montre dernier audit                 | API `/api/dashboard?token=JWT`                                                 | Audit summary formatter                       | N/A                                                                        |

**Couverture matérielle** : 21/21 US couvertes par >= 1 test E2E ou intégration. Gate G25 PASS.

---

## §3 Tests des 32 gates G1-G32 + GP/GC

### 3.1 Gates auto-testables (CI)

| Gate    | Méthode test                                                                                                                                                                                       | Outil                         | Seuil PASS                     |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------ | ------- | ---------- | ------- | ------- | ------- | -------------------------- | ----------- | ------------------ |
| G1      | Grep `[TODO]`, `[À REMPLIR]` dans docs/livrables-finaux/                                                                                                                                           | bash + grep                   | 0 occurrence                   |
| G2      | Glob chemins cités dans docs/                                                                                                                                                                      | bash                          | 100 % existence                |
| G3      | Grep `Handoff` en fin de chaque livrable                                                                                                                                                           | bash                          | 1+ par livrable                |
| G4      | Grep nombres dans livrables, vérifier note source                                                                                                                                                  | manuel par @reviewer          | 100 % chiffres sourcés         |
| G5      | Grep nom persona "agent IA autonome" + "sponsor wallet" dans livrables client-facing                                                                                                               | bash                          | >= 2 occurrences               |
| G6      | Grep KPI North Star "600 €/mois" + "M+6" + "66 ventes"                                                                                                                                             | bash                          | >= 2 occurrences               |
| G7      | Cross-check user-flows + functional-specs + tracking-plan v2                                                                                                                                       | @reviewer Read + comparaison  | 0 contradiction                |
| G8      | Grep registre tu/vous (cf. brand-voice.md)                                                                                                                                                         | bash                          | uniformité                     |
| G9      | Grep pattern `→ @[a-z-]+` (handoff structuré)                                                                                                                                                      | bash                          | >= 1 par recommandation        |
| G10     | Grep "envisager", "pourrait", "probablement"                                                                                                                                                       | bash                          | < 5 occurrences                |
| G11     | Grep critères validation binaires (PASS/FAIL, oui/non)                                                                                                                                             | bash                          | 100 % critères binaires        |
| G12     | Read sections action — verbe + objet + done criteria                                                                                                                                               | manuel @reviewer              | 100 % implémentables           |
| G13     | Grep chiffres sans source dans prose                                                                                                                                                               | bash                          | 0                              |
| G14     | Glob livrables référencés                                                                                                                                                                          | bash                          | 100 % existence ou flag absent |
| **G15** | **Grep automatisé CI** : `[À REMPLIR\|[À COMPLÉTER\|[PLACEHOLDER\|[TODO\|[NOM\|[EXEMPLE\|[XX\|[VOTRE\|[INSÉRER\|[REMPLACER\|{{[A-Z_]+}}\|Lorem ipsum\|TBD` dans `src/` et `docs/livrables-finaux/` | bash + grep                   | 0 occurrence — BLOQUANT        |
| G16     | Grep "DevRefs" >= 3 + "agent IA"/"sponsor" >= 2 + ref >= 2 livrables amont                                                                                                                         | bash                          | OK                             |
| **G17** | **Code review humain** : test d'inversion (livrable copiable concurrent générique IA pricing API ?)                                                                                                | @reviewer manuel              | < 50 % réutilisable sans modif |
| G18     | Grep exemples DevRefs spécifiques (Opus 4.7, 1.35, $9.99, $10)                                                                                                                                     | bash                          | >= 1 par section livrable      |
| G19     | Grep 5 états UI par écran (default, loading, vide, erreur, succès)                                                                                                                                 | manuel via @design specs      | 100 % écrans                   |
| G20     | Tests axe-core dans Playwright E2E + ratios contraste                                                                                                                                              | axe-playwright                | 0 violation A/AA               |
| G21     | Grep hex en dur (`#[0-9a-f]{3,6}`) en dehors de tokens                                                                                                                                             | bash                          | 0                              |
| G22     | Grep cohérence tu/vous corpus copy                                                                                                                                                                 | bash                          | uniformité                     |
| G23     | Grep formule + seuil par KPI (cf. kpi-framework.md)                                                                                                                                                | manuel                        | 100 %                          |
| G24     | Playwright screenshot vs baselines `tests/screenshots/`                                                                                                                                            | playwright + pixelmatch       | < 0.5 % diff                   |
| G25     | Tableau matrice US ↔ tests (cf. §8)                                                                                                                                                                | bash grep `US-XX` dans tests/ | 21/21 US ont 1+ test           |
| **G26** | **Pipeline pre-deploy** : `tsc --noEmit && npx eslint src/ && npm test && npx playwright test --project=chromium`                                                                                  | bash                          | 0 erreur, 0 fail               |
| G27     | Pattern layout par section (cf. page-compositions.md)                                                                                                                                              | manuel @design                | 100 % sections                 |
| G28     | >= 1 image spécifiée par page (cf. design specs)                                                                                                                                                   | manuel                        | 100 % pages                    |
| G29     | Architecture tokens 3 tiers — Grep références primitives directes                                                                                                                                  | bash                          | 0 référence directe            |
| G30     | 6 états composant interactif                                                                                                                                                                       | manuel @design                | 100 % composants               |
| **G31** | **Bash script favicon-checklist.md §3** : 12 fichiers `public/` + 7 balises HTML `<head>`                                                                                                          | bash                          | 12/12 + 7/7 PASS               |
| **G32** | **Grep typographie FR** : `m2                                                                                                                                                                      | \.\.\.                        | oe                             | "[^"]+" | '[A-Za-zé] | [a-z] : | [a-z] ! | [a-z] ? | [a-z] %` dans livrables FR | bash + grep | 0 occurrence ASCII |

### 3.2 Gates testeur-persona-agent (GP1-GP10)

Exécutés par `@testeur-agent-ia` (à créer Phase 2 par @agent-factory). Cf. §6.

### 3.3 Gates testeur-sponsor-humain (GC1-GC10)

Exécutés par `@testeur-sponsor-humain` (à créer Phase 2 par @agent-factory). Cf. §7.

---

## §4 Tests spécifiques pivot v2

### 4.1 Test garantie ROI 50 % refund (US-19, F1b)

```
TEST INTÉGRATION : tests/integration/refund-guarantee-end-to-end.spec.ts

Setup :
  - Audit J-30 sandbox avec audit_id = 'test-uuid-001'
  - savings_pct_initial = 38 % (KV log)
  - savings_pct_actual mesuré sponsor-side = 11.2 %
  - Wallet signataire approvisionné, EIP-191 sign

Run :
  POST /api/audit/refund body={audit_id, savings_pct_actual: 11.2, evidence_url, signature}
  → response.status === 200
  → CF AE event 'audit_refund_triggered' émis
  → Coinbase sandbox settle refund $4.995 USDC vers wallet original < 5 jours

Assert :
  - Wallet sandbox balance += $4.995 USDC après settle
  - audit_id status flag dans KV : 'refunded'
  - Re-tentative claim → 409 GUARANTEE_ALREADY_CLAIMED
```

### 4.2 Test 3 checkboxes L.221-28 13° gate paywall sponsor (US-10b, art. 4quater CGU)

```
TEST E2E : tests/e2e/sponsor-checkboxes-l22128-13.spec.ts

Scenario : Impossible bypass paywall sans 3 checkboxes
  GIVEN sponsor sur landing avec CTA "Top-up wallet $10"
  WHEN clic CTA
  THEN modale checkbox affichée avec 3 checkboxes :
    [1] "J'accepte les CGU et la Privacy Policy DevRefs"
    [2] "Je renonce expressément au droit de rétractation L.221-28 13° code conso (contenu numérique fourni immédiatement)"
    [3] "Je comprends que le top-up wallet est non remboursable une fois transféré sur la blockchain (irrévocabilité on-chain)"
   AND bouton "Pay with Stripe" disabled tant que 3 boxes pas cochées

  WHEN sponsor coche 1 ou 2 boxes seulement
  THEN bouton "Pay with Stripe" reste disabled

  WHEN sponsor coche les 3 boxes
  THEN bouton "Pay with Stripe" enabled
   AND clic redirige vers Stripe Checkout (test mode)
   AND CF AE event 'sponsor_topup_stripe_initiated' émis
```

### 4.3 Test audit input non persisté (Q5 privacy v2 — audit code obligatoire)

```
TEST AUDIT CODE : tests/audit/non-persistence-audit-input.spec.ts

A. Audit statique (linter custom CI)
  Grep src/ pour patterns interdits :
    - await env.KV.put(*, agent_config*)
    - await env.KV.put(*, sample_traces*)
    - await env.D1.prepare(*).bind(*agent_config*)
    - await env.R2.put(*agent_config*)
    - console.log(*agent_config*)
    - console.log(*sample_traces*)
  → AUCUN match autorisé. Exit 1 si match.

B. Audit runtime (Vitest intégration)
  Setup : marker UUID v4 inséré dans sample_traces[0].request_excerpt
  Run : POST /api/agent-audit avec body contenant marker
  After response 200 :
    - KV.list({prefix: ''}) puis KV.get sur chaque clé → AUCUNE valeur ne contient marker
    - CF AE query : SELECT * WHERE blob CONTAINS marker → 0 row
    - console.log spy (vi.spyOn) → 0 call avec marker
  Assert : marker uniquement présent dans response body (output audit), jamais persisté
```

### 4.4 Test watermark HMAC `_signature` (F13)

```
TEST UNIT : tests/unit/hmac-watermark.spec.ts

Test 1 : Sign et verify cohérent
  payload = {model: 'opus-4.7', input_per_mtok: 15.0, output_per_mtok: 75.0, dateModified: '2026-05-05T12:00:00Z'}
  signature = HMAC-SHA256(JSON.stringify(payload), SECRET_HMAC)
  verify(payload, signature, SECRET_HMAC) === true

Test 2 : Tampering détecté
  payload_tampered = {...payload, input_per_mtok: 99.0}
  verify(payload_tampered, signature, SECRET_HMAC) === false

Test 3 : Mauvais secret
  verify(payload, signature, 'wrong_secret') === false

Test 4 : audit_id UUID v4 dans output audit
  audit_response.audit_id matches /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}/
```

### 4.5 Test pack expiration J+365 (F8b)

```
TEST INTÉGRATION : tests/integration/pack-expiration.spec.ts

Setup : KV pré-rempli avec pack expirant J+1 :
  pack:{wallet_hash}:expires_at = '2026-05-04T12:00:00Z' (hier)
  pack:{wallet_hash}:remaining = 5000

Run : agent appelle GET /api/llm-prices?model=opus-4.7

Assert :
  - response.status === 402
  - response.body.error === 'PACK_EXPIRED'
  - CF AE event 'pack_expired' émis avec reason='ttl_expired', remaining_quota=5000
  - KV pack:{wallet_hash}:* keys supprimés post-expiry
```

### 4.6 Test pack quota lookup `/api/pack/quota` < 50 ms p95

```
TEST PERF : tests/perf/pack-quota-latency.spec.ts

Setup : 100 packs actifs dans KV (pré-seed)

Run : 1000 appels parallèles GET /api/pack/quota?wallet_hash=X (50 walls × 20 req)

Assert :
  - p50 < 20 ms
  - p95 < 50 ms (gate critique F8b)
  - p99 < 100 ms
  - 0 erreur 5xx
```

### 4.7 Test 47 events tracking-plan v2 émis avec bons payloads

```
TEST INTÉGRATION : tests/integration/tracking-plan-coverage.spec.ts

Pour chaque event de tracking-plan.md v2 §2 (47 events) :
  1. Déclencher action correspondante (cf. mapping v2 §6)
  2. Query CF AE local (Wrangler dev) WHERE event_name === 'X'
  3. Vérifier propriétés typées présentes (cf. v2 §2.X colonne "Propriétés")
  4. Vérifier zéro PII (cf. v2 §4 anti-pattern)

Assert : 47/47 events détectés avec schémas valides.
```

---

## §5 Tests non-fonctionnels

### 5.1 Performance (3 endpoints sur edge CF)

| Métrique                                                    | Seuil V1                                             | Outil mesure                                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Latence p95 `/api/llm-prices` (cache pack KV hit)           | < 200 ms                                             | Playwright + CF AE `quality_latency_measured`                                        |
| Latence p95 `/api/sdk-status`                               | < 200 ms                                             | Idem                                                                                 |
| Latence p95 `/api/agent-audit` (computation 5 heuristiques) | < 1 000 ms                                           | Idem                                                                                 |
| Pack quota lookup `/api/pack/quota` p95                     | < 50 ms                                              | k6 ou Playwright                                                                     |
| Payload size p99                                            | < 50 KB                                              | Content-Length header                                                                |
| Mesure 3 régions                                            | EU (Paris CF colo) + US (Ashburn) + APAC (Singapore) | Playwright `playwright.config.ts` `webServer.host` ou test depuis Workers in 3 colos |

### 5.2 Fraîcheur (3 cron)

| Source                       | TTL max | Test                                                 |
| ---------------------------- | ------- | ---------------------------------------------------- |
| Pricing (cron 6h)            | < 6h    | Cron exec puis CF AE `cron_dateModified_bumped` < 6h |
| SDK (cron 24h)               | < 24h   | Idem                                                 |
| Audit heuristiques (cron 1h) | < 1h    | Idem                                                 |

### 5.3 Disponibilité (SLO 99.5 % V1)

- Test : Cloudflare Health Checks sur 3 endpoints + dashboard publique status. Alerte Mailchannels si > 0.5 % downtime sur 30j.

### 5.4 Sécurité (OWASP top 10)

| OWASP                         | Test                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| A01 Broken Access Control     | Test wallet B essaie pack quota wallet A → 402 (US-08b limite 1)            |
| A02 Cryptographic Failures    | HMAC `_signature` — test §4.4 + secrets via Wrangler secret (pas hardcoded) |
| A03 Injection                 | Audit input Zod schema strict — pas de raw SQL (KV only)                    |
| A04 Insecure Design           | Test irrévocabilité x402 documentée CGU                                     |
| A05 Security Misconfiguration | Test headers : CSP, HSTS, X-Frame-Options, Referrer-Policy                  |
| A06 Vulnerable Components     | `npm audit --audit-level=high` en CI — 0 high/critical                      |
| A07 Auth Failures             | JWT HMAC validation (US-11), cookie `Secure;HttpOnly;SameSite=Strict` (F11) |
| A08 Data Integrity            | Watermark HMAC payloads (F13), wallet_hash signed                           |
| A09 Logging Failures          | Privacy : zéro PII (cf. §4.3), wallet_hash vs raw addr                      |
| A10 SSRF                      | Pas de fetch user-controlled URL — sources cron whitelist                   |

### 5.5 RGPD (privacy by design)

- Grep CI `wallet_hash` (présent) vs raw `0x[0-9a-f]{40}` patterns dans logs CF AE.
- Grep CI `customer_id` (Stripe pseudonyme) vs `email` patterns.
- Test runtime : envoyer audit avec sample_traces marker → vérifier non-persistance (cf. §4.3).
- Test stockage : KV `pack:{wallet_hash}:*` clés uniquement hashées SHA-256.

---

## §6 Plan de tests testeur-persona-agent (GP1-GP10)

**Agent à créer** : `@testeur-agent-ia` via @agent-factory (specs déjà dans brand-platform.md v2 §8). Simule Claude Code, Cursor, AgentKit MCP-host.

| Gate | Test                                                       | Méthode                                                                     | Seuil PASS                                                                                       |
| ---- | ---------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GP1  | Crawl `/llms.txt` parsing OK                               | Agent fetch `https://devrefs.dev/llms.txt`, parse markdown llmstxt.org spec | 3 endpoints détectés + pricing pack visible                                                      |
| GP2  | `/api/llm-prices` non-payé → HTTP 402 augmenté reçu        | Agent appelle endpoint sans X-PAYMENT                                       | 402 + body avec `roi_summary`, `payload_preview`, `freshness_proof`, `alternative_cost_estimate` |
| GP3  | Agent extrait ROI body et décide paiement                  | Agent lit `roi_summary`, calcule break-even, décide GO si savings > 10×     | Décision logique cohérente : GO ou NO-GO motivé                                                  |
| GP4  | Paiement x402 USDC Base sandbox réussi                     | Agent signe X-PAYMENT, retry endpoint                                       | Settle Coinbase sandbox < 5s, balance débitée                                                    |
| GP5  | Retry endpoint avec X-PAYMENT → payload reçu               | Idem GP4                                                                    | 200 + payload JSON complet schema-validable                                                      |
| GP6  | Validation `dateModified` JSON-LD < 6h                     | Agent parse JSON-LD, calcule diff timestamp                                 | < 6h pour pricing, < 24h pour SDK                                                                |
| GP7  | Ground truth check tokens économisés mesurable             | Agent compare DevRefs payload vs WebSearch+parse alt cost                   | Économies > 10× (paramètre roi_summary)                                                          |
| GP8  | Audit endpoint paid + output watermark verified            | Agent POST audit, paie $9.99, vérifie HMAC `_signature`                     | Score reçu, signature valide                                                                     |
| GP9  | Pack purchase + quota consumption + alerte -10 %           | Agent achète pack $10, consomme jusqu'à 10 % restants                       | Alerte reçue à seuil 90 % via header `X-DevRefs-Quota-Remaining`                                 |
| GP10 | Retry après quota exhausted → reroute pack ou pay-per-call | Agent épuise pack, tente call                                               | 402 avec message "Pack expired — re-purchase or pay-per-call"                                    |

**Note limitation** : un LLM qui simule un agent reste indulgent. GP1-GP10 sont un pré-filtre. Validation finale par observation parcours réel agent IA externe (Claude Code production) sur 3 parcours critiques avant deploy.

---

## §7 Plan de tests testeur-sponsor-humain (GC1-GC10)

**Agent à créer** : `@testeur-sponsor-humain` via @agent-factory. Simule humain dev qui top-up wallet de son agent IA via Stripe.

| Gate | Test                                              | Méthode                                                                                             | Seuil PASS                                        |
| ---- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| GC1  | Landing publique compréhensible < 30s             | Sponsor lit hero "Cost intelligence for AI agents — know before you spend, optimize after you ship" | Compréhension proposition de valeur en 1 phrase   |
| GC2  | 3 checkboxes L.221-28 13° gate Stripe             | Cf. §4.2 — sponsor force bypass et fail                                                             | 3/3 boxes obligatoires, bouton disabled sinon     |
| GC3  | Stripe Payment Link top-up $10 réussi (test mode) | Sponsor utilise card `4242 4242 4242 4242`                                                          | Checkout success, redirect dashboard              |
| GC4  | Email récap reçu sous 60s                         | Sponsor reçoit email post-Checkout via Stripe receipt                                               | Email présent, contenu correct                    |
| GC5  | Dashboard sponsor JWT accès OK                    | Sponsor visite `/dashboard?token=JWT`                                                               | 200 + 4 widgets remplis                           |
| GC6  | 4 widgets dashboard remplis correctement          | Quota pack restant + balance wallet + dernier audit + alertes                                       | 4/4 widgets avec données fresh < 1 min            |
| GC7  | Alerte pack expire -7j email reçu                 | Pré-seed pack expirant J+7, trigger cron alerte                                                     | Email reçu via Mailchannels avec lien re-purchase |
| GC8  | Déclenchement garantie refund J30 (UI sponsor)    | Sponsor clique "Demander remboursement" sur audit_id avec savings_pct < 15 %                        | Form submit, CF AE event émis                     |
| GC9  | Signature wallet on-chain via wallet popup        | MetaMask ou Coinbase Wallet popup EIP-191 sign                                                      | Signature valide acceptée par `/api/audit/refund` |
| GC10 | Refund 50 % USDC reçu sous 7j                     | Vérification balance wallet sandbox post-refund                                                     | Balance += $4.995 USDC < 7 jours                  |

---

## §8 Matrice de traçabilité (gate G27 + G25)

### 8.1 Bidirectionnelle US ↔ Tests ↔ Events ↔ Gates

| User Story | Test E2E / Intégration                                                                                       | Tests unit                                   | Events vérifiés                                                                                         | Gates impactés          |
| ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| US-01      | `tests/e2e/us-01-llms-txt.spec.ts`                                                                           | `tests/unit/llms-txt-parser.spec.ts`         | `crawl_llms_txt_fetched`                                                                                | G15, G31, GP1           |
| US-02      | `tests/e2e/us-02-402-augmente.spec.ts`                                                                       | `tests/unit/x402-middleware.spec.ts`         | `api_response_402_sent`, `payment_x402_required`                                                        | G15, GP2                |
| US-03      | `tests/e2e/us-03-x402-oneshot-pricing.spec.ts`                                                               | `tests/unit/hmac-watermark.spec.ts`          | `payment_x402_attempt`, `payment_x402_completed`, `api_response_200_sent`, `quality_watermark_verified` | G24, G26, GP4, GP5      |
| US-04      | `tests/e2e/us-04-fraicheur-jsonld.spec.ts`                                                                   | `tests/unit/freshness-check.spec.ts`         | `quality_freshness_measured`                                                                            | GP6                     |
| US-05      | `tests/e2e/us-05-effective-cost-factor.spec.ts`                                                              | `tests/unit/cost-factor.spec.ts`             | `api_response_200_sent`                                                                                 | G18                     |
| US-06      | `tests/e2e/us-06-sdk-status.spec.ts`                                                                         | `tests/unit/sdk-status-parser.spec.ts`       | `api_response_402_sent`, `payment_x402_completed`, `api_response_200_sent`                              | G26                     |
| US-07      | `tests/e2e/us-07-sameas.spec.ts`                                                                             | `tests/unit/sameas-validator.spec.ts`        | `api_response_200_sent`                                                                                 | G18                     |
| US-08      | `tests/e2e/us-08-openapi.spec.ts`                                                                            | `tests/unit/openapi-spec.spec.ts`            | `crawl_openapi_fetched`                                                                                 | G15, GP1                |
| US-08b     | `tests/e2e/us-08b-pack-quota.spec.ts` + `tests/perf/pack-quota-latency.spec.ts`                              | `tests/unit/pack-quota.spec.ts`              | `pack_purchased`, `pack_quota_consumed`, `pack_quota_exhausted`                                         | G26, GP9, GP10          |
| US-09      | `tests/e2e/us-09-landing.spec.ts`                                                                            | N/A                                          | `landing_page_view`, `landing_scroll_depth`                                                             | G20, G24, G27, GC1      |
| US-10b     | `tests/e2e/us-10b-stripe-topup.spec.ts` + `tests/e2e/sponsor-checkboxes-l22128-13.spec.ts`                   | `tests/unit/stripe-webhook-handler.spec.ts`  | `sponsor_topup_stripe_initiated`, `sponsor_topup_stripe_completed`                                      | G15, GC2, GC3, GC4      |
| US-11      | `tests/e2e/us-11-wallet-config.spec.ts`                                                                      | `tests/unit/jwt-issuer.spec.ts`              | N/A                                                                                                     | G15                     |
| US-12      | `tests/e2e/us-12-dashboard-sponsor.spec.ts`                                                                  | `tests/unit/dashboard-aggregator.spec.ts`    | N/A                                                                                                     | G19, G20, G24, GC5, GC6 |
| US-13      | `tests/e2e/us-13-cgv.spec.ts`                                                                                | N/A                                          | N/A                                                                                                     | G15, G32                |
| US-14      | `tests/e2e/us-14-data-sources.spec.ts`                                                                       | N/A                                          | `crawl_about_data_sources_viewed`                                                                       | G15, G18, G32           |
| US-15      | `tests/e2e/us-15-admin-dashboard.spec.ts`                                                                    | `tests/unit/admin-aggregator.spec.ts`        | Tous events `quality_*`, `payment_*`, `pack_*`, `audit_*`                                               | G6, G23                 |
| US-16      | `tests/e2e/us-16-audit-input-validation.spec.ts`                                                             | `tests/unit/audit-input-validator.spec.ts`   | `audit_request_received`, `audit_402_served`                                                            | G26                     |
| US-17      | `tests/e2e/us-17-audit-x402-payment.spec.ts` + `tests/audit/non-persistence-audit-input.spec.ts`             | `tests/unit/audit-heuristics.spec.ts`        | `audit_paid_x402`, `audit_delivered`, `quality_watermark_verified`                                      | G26, GP8                |
| US-18      | `tests/e2e/us-18-auto-applicable-patches.spec.ts`                                                            | `tests/unit/patch-builder.spec.ts`           | `audit_savings_realized`                                                                                | G26                     |
| US-19      | `tests/integration/us-19-refund-guarantee.spec.ts` + `tests/integration/refund-guarantee-end-to-end.spec.ts` | `tests/unit/refund-engine.spec.ts`           | `audit_refund_triggered`                                                                                | G15, GC8, GC9, GC10     |
| US-20      | `tests/e2e/us-20-share-supervisor.spec.ts`                                                                   | `tests/unit/audit-summary-formatter.spec.ts` | N/A                                                                                                     | G19, G20                |

**Couverture** :

- US ↔ Tests : 21/21 (100 %)
- Tests ↔ Events : 47/47 events couverts par >= 1 test (100 %)
- US ↔ Gates : chaque US a >= 1 gate impacté (100 %)
- Bidirectionnelle : G27 PASS

### 8.2 Mapping inverse Events → Tests

47 events de `tracking-plan.md` v2 §2 sont tous référencés dans la colonne "Events vérifiés" ci-dessus. Cf. tests/integration/tracking-plan-coverage.spec.ts (§4.7) pour validation exhaustive automatisée.

---

## §9 Process QA

### 9.1 Pre-commit (Husky + lint-staged)

```bash
# .husky/pre-commit
npx tsc --noEmit
npx next lint  # ou eslint si Workers pure
npm run build
npx vitest run --changed
node scripts/lint-no-placeholder.js  # custom : grep G15
```

Refus commit si exit != 0.

### 9.2 CI on PR (GitHub Actions ou Cloudflare CI)

```yaml
# .github/workflows/qa.yml (template — décision finale @infrastructure Phase 2)
jobs:
  qa:
    steps:
      - install
      - lint (eslint + prettier check)
      - typecheck (tsc --noEmit)
      - unit tests (vitest run --coverage, seuil 80 %)
      - integration tests (vitest run tests/integration/, Wrangler dev en background)
      - audit-code-non-persistance (script custom §4.3.A)
      - grep-G15 (placeholders)
      - grep-G17 (DevRefs spécifique)
      - grep-G31 (favicons)
      - grep-G32 (typo FR)
      - e2e Playwright (3 devices headless: iPhone 13, iPad, Desktop Chrome)
      - screenshots vs baselines (< 0.5 % diff sur 12 pages × 3 devices = 36 baselines)
      - tracking-plan-coverage (47 events)
      - npm audit (0 high/critical)
```

### 9.3 Pre-deploy (gate G26 BLOQUANT)

Tous les checks ci-dessus + :

- E2E full (parcours US-01 → US-20 séquentiel sur 3 devices)
- Testeur-persona-agent invocation (GP1-GP10) sur env staging
- Testeur-sponsor-humain invocation (GC1-GC10) sur env staging
- Lighthouse CI mobile + desktop (LCP < 2.5s desktop, < 3s mobile)

### 9.4 Post-deploy (24h monitoring)

- Smoke tests prod : 3 endpoints répondent (health checks Cloudflare)
- CF AE query : tous events `cron_*` émis dans premières 24h
- Rollback automatique si SLO < 95 % sur 1h glissante (alerte Mailchannels → re-deploy version N-1)

---

## §10 Outils + budgets

| Outil                  | Coût                          | Usage                             |
| ---------------------- | ----------------------------- | --------------------------------- |
| Vitest                 | 0 €                           | Unit + intégration                |
| Playwright             | 0 €                           | E2E + screenshots + axe-core      |
| Wrangler dev           | 0 €                           | Workers local (KV, Cron, x402)    |
| Coinbase x402 sandbox  | 0 €                           | Settle test USDC Base Sepolia     |
| Stripe test mode       | 0 €                           | Payment Links sponsor top-up test |
| msw                    | 0 €                           | Mock HTTP cron sources            |
| axe-playwright         | 0 €                           | Tests accessibilité auto          |
| pixelmatch             | 0 €                           | Screenshots diff                  |
| GitHub Actions         | 0 € (free tier 2000 min/mois) | CI                                |
| **Total budget QA V1** | **0 €**                       | Free tiers exclusivement          |

**Effort estimé** : ~30 % du temps dev V1 (industry standard pour 80 % coverage + E2E 3 devices). Pyramide automatisée minimise effort manuel.

---

## §11 Handoff structuré

**Handoff → @agent-factory (Phase 2)**

- Créer 2 agents custom :
  - `@testeur-agent-ia` : prompt système simulant Claude Code / Cursor / AgentKit MCP-host. Spec : §6 GP1-GP10 + brand-platform.md v2 §8. Tools : WebFetch, Bash (curl + jq), Read.
  - `@testeur-sponsor-humain` : prompt système simulant dev humain dont l'agent IA cram des tokens, top-up wallet via Stripe. Spec : §7 GC1-GC10 + brand-platform.md v2 §8. Tools : WebFetch, Bash (curl Stripe test mode), Read.
- Modèle recommandé : Sonnet (suffisant, simulation comportement). Opus si analyse fine GP3 (décision paiement).

**Handoff → @fullstack (Phase 2)**

- Implémenter linter custom `scripts/lint-no-persistence-audit-input.js` (regex §4.3.A) — exit 1 si match interdit
- Implémenter endpoint `/api/audit/refund` (US-19) avec EIP-191 wallet signature verification
- Implémenter endpoint `/api/pack/quota?wallet_hash=X` (lookup KV < 50 ms p95) — cf. §4.6
- Watermark HMAC `_signature` sur 3 endpoints (cf. §4.4)
- Cron audit-heuristics 1h refresh (cf. tracking-plan v2 §2.8)
- Setup Wrangler `[[kv_namespaces]]` PACK_QUOTA + `[[d1_databases]]` (si nécessaire) + secret `SECRET_HMAC` + secret `COINBASE_FACILITATOR_KEY` + secret `STRIPE_SECRET_KEY`

**Handoff → @infrastructure (Phase 2)**

- Choisir CI : GitHub Actions OU Cloudflare CI Workers Builds (cf. §9.2 template)
- Configurer secrets CI : `SECRET_HMAC_TEST`, `COINBASE_SANDBOX_KEY`, `STRIPE_TEST_KEY`, `WRANGLER_API_TOKEN`
- Setup Cloudflare Health Checks 3 endpoints (SLO 99.5 %)
- Configurer Mailchannels alertes (downtime, cron failed, refund déclenché, pack expiring -7j)
- 3 environnements : `dev` (Wrangler local), `staging` (devrefs-staging.workers.dev), `prod` (devrefs.dev)

**Handoff → @reviewer (Phase 5 sub-phase 5a)**

- Audit final 32 gates G1-G32 sur livrables Phase 1+2+3
- Audit GP1-GP10 (testeur-agent-ia) + GC1-GC10 (testeur-sponsor-humain) sur staging
- Validation matrice traçabilité §8 — bidirectionnelle 100 % US ↔ Tests ↔ Events
- Test G17 manuel (inversion concurrent) sur landing + CGV + tracking-plan
- Boucle max 3 passes — relance correctives si NO-GO

**Handoff → @legal (Phase 3)**

- Validation tests §4.2 (3 checkboxes L.221-28 13°) cohérent art. 4quater CGU draft v2
- Validation tests §4.3 (audit code non-persistance) cohérent Q5 privacy v2 + art. 3bis CGU
- Validation tests §4.1 (refund 50 %) cohérent art. 4ter CGU + 4 conditions garantie ROI

---

## §12 Auto-évaluation standard de livraison

| Critère                           | Score /5 | Justification                                                                                                                                                                                             |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spécificité DevRefs (G17)         | 5        | Tests citent Opus 4.7 1.35 factor, $9.99 audit, $10 pack, refund 50 %, Coinbase USDC Base, 3 endpoints précis. Inversable par concurrent : non (dépend stack CF + x402 + spec audit-spec.md propriétaire) |
| Couverture user stories (G25)     | 5        | 21/21 US couvertes par >= 1 test (matrice §8.1)                                                                                                                                                           |
| Couverture events (G7)            | 5        | 47/47 events tracking-plan v2 référencés (§4.7 + §8.2)                                                                                                                                                    |
| Couverture gates (G1-G32 + GP/GC) | 5        | 32 gates auto + 20 GP/GC documentés avec méthode + seuil PASS                                                                                                                                             |
| Implémentabilité (G12)            | 5        | Chaque test a fichier path + scenario Given/When/Then ou seuil chiffré + outil + handoff propriétaire                                                                                                     |

**Verdict auto-éval : 5/5/5/5/5 — GO.**

---
