<!-- Version: 2026-05-05 — @ux — Phase 1 conception — User flows DevRefs V1 v2 -->

# User Flows — DevRefs V1 v2

> Persona principal : Agent IA autonome PAYEUR (80 % du trafic, payeur x402 USDC Base).
> Persona secondaire : Dev humain SPONSOR wallet (15 %, top-up uniquement).
> Persona tertiaire : Crawler IA passif (consultation llms.txt / pages publiques, sans paiement).
> Source de vérité pricing : `docs/ia/agent-economics.md` § C.1. Zéro invention.
> Cohérence Phase 0 v2 : `personas.md` v2 + `v1-scope.md` v2 + `backlog.md` v2 + `x402-response-spec.md` + `cgu-draft.md` v2.

---

## §1 — Architecture parcours (vue d'ensemble)

### 1.1 Surfaces V1 (6 surfaces)

| Surface | URL | Accès | Description fonctionnelle |
|---|---|---|---|
| Landing publique | `/` | Public | Hero "Cost intelligence", démo JSON payload, CTAs top-up/pack |
| llms.txt | `/llms.txt` | Public | Découverte agent — 3 endpoints + pricing pack x402 |
| Endpoint pricing | `/api/llm-prices?model=X` | x402 ou pack | Payload JSON-LD prix modèle LLM (< 200 ms p95) |
| Endpoint SDK status | `/api/sdk-status?pkg=X` | x402 ou pack | Payload JSON-LD statut SDK npm / GitHub |
| Endpoint audit | `/api/agent-audit` | x402 ($9.99) | Analyse config agent IA — score + recommendations[] |
| Dashboard sponsor | `/dashboard?token=JWT` | JWT 24 h (post top-up) | Quota pack restant, solde wallet estimé, historique audits |

### 1.2 Matrice persona x surface

| Surface | Agent IA autonome | Dev humain SPONSOR | Crawler IA passif |
|---|---|---|---|
| `/llms.txt` | Entrée principale (fetch avant call API) | Rarement (humain lit OpenAPI ou landing) | Cible principale (citation GEO) |
| Landing `/` | Rarement (agent ne consomme pas de prose) | Entrée principale (conviction top-up) | Possible (index SEO/GEO) |
| `/api/llm-prices` | Principal — 80 % du volume x402 | N/A (n'appelle pas directement) | N/A |
| `/api/sdk-status` | Secondaire — 20 % du volume x402 | N/A | N/A |
| `/api/agent-audit` | Audit post-flight — ticket $9.99 | Peut déclencher via instruction agent | N/A |
| `/dashboard` | N/A | Suivi quota + balance après top-up | N/A |

### 1.3 Métriques HEART framework — niveau parcours global

| Dimension | Signal | Métrique | Cible V1 |
|---|---|---|---|
| **Happiness** | Agent reçoit payload en < 200 ms, ROI > 100× lisible dans body 402 | CSAT sponseur post-top-up (optionnel J30) | N/A J7 — > 7/10 M+3 |
| **Engagement** | Appels par wallet/24 h, endpoints distincts utilisés | Calls/wallet/jour | >= 3 calls/wallet/jour M+1 |
| **Adoption** | crawl llms.txt → paiement x402 | Ratio crawl → 1er paiement | >= 5 % J7, >= 10 % M+1 |
| **Retention** | Wallet qui revient >= 2 jours distincts | Rétention wallet J7 | >= 30 % (agent autonome récurrent) |
| **Task success** | Paiement x402 reussi + payload 200 reçu | Taux succès paiement x402 (vs timeout/erreur) | >= 95 % |

---

## §2 — Parcours agent IA — Pricing call (parcours principal V1)

> Métrique HEART primaire : **Task success** — taux de complétion du cycle crawl → payload 200.
> KPI North Star direct : paiements x402 autonomes/24 h.
> US concernées : US-01, US-02, US-03, US-04, US-08b.

### 2.1 Happy path — pay-per-call one-shot

```
ÉTAPE 1 — Découverte llms.txt
  Agent fetch GET /llms.txt (gratuit, public, MIME text/plain)
  → Parse 3 endpoints + pricing Pack Standard $10 / $0.001 per call
  → Parse: alternative_cost_estimate présent dans llms.txt (stub preview)
  → Décision machine : "endpoint disponible, prix < coût WebSearch alternative"
  Temps estimé : < 500 ms
  Sortie : URL target = /api/llm-prices?model={model}

ÉTAPE 2 — Premier appel → HTTP 402 augmenté
  Agent GET /api/llm-prices?model=opus-4.7 (sans X-PAYMENT)
  → Middleware x402 intercepte → HTTP 402 + body JSON augmenté :
    {
      "x402": { "price_usdc": "0.001", "network": "base", "facilitator": "https://x402.org/facilitator" },
      "alternative_cost_estimate": { "tokens_estimated": 67000, "cost_in_usd.claude-opus-4-7": 0.49 },
      "roi_summary": { "roi_multiplier": 490, "verdict": "no_brainer_buy" },
      "freshness_proof": { "dateModified": "2026-05-05T06:00Z", "hmac_signature": "..." },
      "payload_preview": { "model": "claude-opus-4-7", "input_per_mtok": "...", "effective_cost_factor": 1.35 },
      "packs_available": [{ "id": "standard", "price_usdc": "10", "calls": 10000 }]
    }
  Headers: X-DevRefs-ROI-Multiplier: 490, X-DevRefs-Pack-Available: discovery|standard|pro
  Temps : < 50 ms (middleware Cloudflare Worker edge)
  Décision agent : lit roi_summary.verdict → "no_brainer_buy" → proceed to pay

ÉTAPE 3 — Paiement x402 one-shot USDC Base
  Agent signe transaction USDC 0.001 depuis wallet (Coinbase MCP / wrapper x402-axios / x402-fetch)
  → Coinbase facilitator vérifie signature on-chain (< 2 s settle)
  → Header X-PAYMENT généré automatiquement par SDK
  Wallet provisioning requis : wallet doit avoir >= $0.01 USDC (10 calls buffer minimum recommandé)
  [FRICTION F1] Si wallet vide → signal sponsor needed (cf. §8)

ÉTAPE 4 — Retry avec X-PAYMENT → payload 200
  Agent GET /api/llm-prices?model=opus-4.7 + header X-PAYMENT: {signed_tx}
  → Middleware x402 valide signature via facilitator
  → KV lookup : données fraîches (TTL 6 h)
  → HTTP 200 + payload JSON-LD :
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "model": "claude-opus-4-7",
      "input_per_mtok": 15.00,
      "output_per_mtok": 75.00,
      "effective_cost_factor": 1.35,
      "dateModified": "2026-05-05T06:00:00Z",
      "sameAs": "https://anthropic.com/api",
      "_signature": "HMAC_watermark"
    }
  Latence cible : < 200 ms p95 (Cloudflare KV edge)

ÉTAPE 5 — Ground truth check (agent-side)
  Agent utilise effective_cost_factor = 1.35 dans son estimation de coût
  → Tracking interne agent : tokens_saved vs alternative WebSearch (67K vs payload 2 KB)
  → Event côté DevRefs : aucun (payload livré, paiement confirmé on-chain — pas de tracking agent-side)
  KPI DevRefs : paiement x402 confirmé dans Coinbase facilitator dashboard
```

### 2.2 Installation — critères de rapidité (time-to-value)

| Voie d'intégration | Temps d'installation estimé | Source spec |
|---|---|---|
| Coinbase MCP (Claude Code natif) | 6-8 min (config MCP server) | `agent-integration.md` |
| `x402-axios` wrapper (Node.js agent) | 3-5 min (npm install + 3 lignes) | `agent-integration.md` |
| `x402-fetch` wrapper (Deno/Bun) | 3-5 min (import + 2 lignes) | `agent-integration.md` |
| Manual wallet signature | 15-30 min (low-level, rare) | `agent-integration.md` |

**Aha moment agent IA** : réception du premier payload 200 avec `effective_cost_factor: 1.35` — information qu'aucune source alternative ne fournit de manière machine-readable. Atteint en 1 cycle (< 10 min install + 1 call).

### 2.3 Cognitive walkthrough — first-time agent (US-01 à US-04)

| Étape | L'agent sait quoi faire ? | L'action est visible ? | Lien but-action clair ? | Feedback immédiat ? |
|---|---|---|---|---|
| 1. Fetch llms.txt | OUI — llms.txt = convention standard agent | OUI — URL `/llms.txt` explicite dans llms.txt standard | OUI — endpoints listés avec pricing direct | OUI — 200 + texte parsable immédiat |
| 2. Appel 402 | OUI — endpoint dans llms.txt | OUI — URL directe avec ?model= | OUI — body 402 dit "pay $0.001 to unlock" | OUI — 402 avec body JSON structuré |
| 3. Payer x402 | OUI si SDK x402 installé | OUI — SDK automatise le header X-PAYMENT | OUI — roi_summary.verdict = "no_brainer_buy" | OUI — settle < 2 s on-chain |
| 4. Retry + 200 | OUI — retry automatique SDK | OUI — SDK gère le retry post-paiement | OUI — payload contient les données attendues | OUI — JSON-LD parsable immédiatement |
| 5. Utiliser effective_cost_factor | OUI — champ explicite dans payload | OUI — présent dans payload preview (avant paiement) | OUI — champ nommé explicitement | OUI — valeur numérique utilisable directement |

**Résultat** : 0 friction critique sur le happy path agent installé. 1 friction potentielle : wallet vide (§8 F1).

---

## §3 — Parcours agent IA — Pack pré-payé (réduction friction pay-per-call)

> Métrique HEART primaire : **Engagement** — calls/wallet/jour (cible >= 3).
> Déclencheur : agent > 3-5 paiements pay-per-call détecte coût récurrent → signal sponsor.
> US concernées : US-08b, US-09, US-10b.

### 3.1 Happy path — transition pay-per-call → Pack Standard $10

```
ÉTAPE 1 — Détection volume par l'agent
  Agent a effectué 3-5 paiements pay-per-call ($0.001 chacun)
  → Body 402 (prochain appel) inclut : "packs_available": [{"id": "standard", "calls": 10000, "price_usdc": "10"}]
  → Agent parse : 10K calls × $0.001 = $10 → Pack Standard = même prix mais prévisible
  → Agent décision : si calls_per_session > 50 → achat pack recommandé
  [HYPOTHÈSE H8 : logique décision agent configurable par sponsor — à valider Phase 4]

ÉTAPE 2A — Achat Pack Standard directement en x402 (agent autonome)
  Agent POST /api/pack/purchase { "pack_id": "standard", "wallet": "0x..." }
  → HTTP 402 : $10 USDC en 1 signature (pas 10K signatures individuelles)
  → Coinbase facilitator vérifie → KV write : pack:{wallet_hash}:remaining = 10000
  → KV TTL : 12 mois (CGV Art. 4bis)
  → Réponse : { "pack_id": "standard", "remaining": 10000, "expires_at": "2027-05-05" }

ÉTAPE 2B — Signal sponsor + top-up Stripe (si wallet agent insuffisant)
  Agent génère signal sponsor (log, notification) : "wallet balance < $10 for pack purchase"
  → Sponsor reçoit signal → envoie USDC Base directement (Coinbase Wallet / MetaMask / Rainbow)
  → Top-up < 30 secondes (V4 v2 scenario)
  → Agent retry achat pack automatiquement

ÉTAPE 3 — Calls suivants avec quota KV
  Agent GET /api/llm-prices?model=opus-4.7 (avec header wallet identifié)
  → Middleware x402 : lookup KV pack:{wallet_hash}:remaining
  → Si remaining > 0 : decrement → HTTP 200 directement (bypass 402 total)
  → Latence lookup KV : < 50 ms p95 (KV edge Cloudflare)
  → Agent ne voit plus de 402 tant que quota > 0

ÉTAPE 4 — Tracking quota et alertes
  Event Cloudflare : pack_quota_consumed (endpoint, remaining, wallet_hash)
  Alerte sponsor à 10 % restant : email optionnel (si email fourni au moment top-up)
  Alerte sponsor à 7j expiration : email optionnel
  [Note : alertes email = V1 marginales — webhook V2 si signal demande]
```

### 3.2 Avantages Pack vs pay-per-call (machine-readable dans body 402)

| Dimension | Pay-per-call | Pack Standard $10 |
|---|---|---|
| Coût unitaire | $0.001/call | $0.001/call (identique) |
| Friction par call | 1 signature x402 | 0 (lookup KV) |
| Latence middleware | < 200 ms | < 50 ms |
| Prévisibilité budget sponsor | Faible | Haute (1 transaction, 10K calls) |
| Signal sponsor requis | Oui (wallet doit rester approvisionné) | 1 fois tous les 10K calls |

---

## §4 — Parcours agent IA — Audit post-flight (upsell volume)

> Métrique HEART primaire : **Task success** — taux de complétion POST audit → rapport JSON reçu.
> Déclencheur : agent >= 5M tokens/mois (warning dans body 402 si monthly_volume_estimate < 5M).
> US concernées : US-16, US-17, US-18, US-19, US-20.

### 4.1 Happy path — audit one-shot $9.99

```
ÉTAPE 1 — Détection coût élevé
  Agent détecte via son instrumentation interne : monthly_tokens >= 5M OU sponsor signale facture élevée
  → Agent prépare requête audit : input = agent_config + sample_traces (min 3, max 50, <= 100 KB)
  → Validation pre-send (F1c) : somme share_pct = 100, payload <= 100 KB

ÉTAPE 2 — Premier POST /api/agent-audit → HTTP 402 ($9.99)
  Agent POST /api/agent-audit { "agent_config": {...}, "sample_traces": [...], "monthly_volume_estimate": 10000000 }
  → Middleware x402 : HTTP 402 + body augmenté spécifique audit :
    {
      "x402": { "price_usdc": "9.99", "offer": "audit" },
      "roi_summary": { "roi_multiplier": 10.8, "verdict": "no_brainer_buy", "basis": "$9.99 vs $36/mois savings mid-range 10M tokens" },
      "payload_preview": { "score": "0-100", "recommendations": ["model_downgrade","prompt_caching","batch","tool_trimming","effort_mismatch"] },
      "packs_available": [{ "id": "pro_audit", "price_usdc": "49", "audits": 6 }],
      "guarantee": { "type": "refund_50pct", "condition": "savings_pct < 15% at J30", "amount_max": 4.99 }
    }
  Headers: X-DevRefs-Offer: audit, X-DevRefs-ROI-Multiplier: 10

ÉTAPE 3 — Paiement x402 $9.99 one-shot OU Pack Pro $49 (6 audits)
  Décision agent : one-shot si 1er audit, Pack Pro si volume élevé prévisible
  → Signature wallet USDC (1 transaction)
  → Facilator settle < 2 s

ÉTAPE 4 — Retry POST → rapport JSON structuré (200)
  Worker exécute 5 heuristiques statiques (mémoire Worker only — zéro stockage persistant des traces) :
    H1 — model_downgrade (portion Opus sur tâches Sonnet-éligibles)
    H2 — prompt_caching (répétitions système détectées dans traces)
    H3 — batch_processing (calls sequentiels batchables)
    H4 — tool_trimming (tools inutilisés dans traces)
    H5 — effort_mismatch (thinking tokens > requis pour la tâche)
  → Output JSON livré :
    {
      "@type": "AuditReport",
      "score": 32,
      "savings_pct": 67,
      "monthly_cost_current_usd": 400,
      "monthly_cost_optimized_usd": 145,
      "recommendations": [
        { "id": "model_downgrade", "saving_usd": 240, "confidence": "high", "auto_applicable": true },
        { "id": "prompt_caching", "saving_usd": 35, "confidence": "high", "auto_applicable": true },
        { "id": "effort_mismatch", "saving_usd": 30, "confidence": "medium", "auto_applicable": false }
      ],
      "_audit_id": "uuid-v4",
      "_signature": "HMAC_watermark",
      "guarantee": { "active": true, "check_date": "2026-06-05", "refund_if_savings_pct_below": 15 }
    }
  Sécurité : traces non stockées post-traitement (Worker only) — conformité zéro-PII

ÉTAPE 5 — Application patches + monitoring savings_pct 30j
  Agent applique recommendations auto_applicable en autonomie
  Agent transmet recommendations supervision_required au sponsor humain
  → J30 : si savings_pct mesuré < 15 % → trigger garantie refund (§6)
  Event Cloudflare : audit_delivered (score, savings_pct, wallet_hash, recommendations_count)
```

### 4.2 Cognitive walkthrough — audit first-time

| Étape | L'agent sait quoi faire ? | L'action est visible ? | Lien but-action clair ? | Feedback immédiat ? |
|---|---|---|---|---|
| 1. Préparer input | OUI si schema documenté dans OpenAPI | OUI — schema dans `/about/data-schema` + OpenAPI | OUI — body 402 preview montre structure attendue | OUI — validation erreur F1c avant 402 |
| 2. Lire 402 audit | OUI — format identique à pricing 402 | OUI — corps JSON structuré | OUI — roi_summary.basis chiffré "$9.99 vs $36/mois" | OUI — verdict "no_brainer_buy" |
| 3. Payer $9.99 | OUI — même flow x402 que pricing | OUI — SDK automatise | OUI — price_usdc: 9.99 explicite | OUI — settle < 2 s |
| 4. Recevoir rapport | OUI — retry automatique SDK | OUI — JSON structuré immédiat | OUI — recommendations[] avec saving_usd | OUI — _audit_id UUID + _signature |
| 5. Appliquer patches | OUI pour auto_applicable | OUI — auto_applicable: true flag | OUI — instruction JSON-Schema validable | OUI — agent mesure savings sur calls suivants |

**[FRICTION F3] : Heuristique H5 effort_mismatch non auto-applicable** → requiert supervision sponsor. Solution : inclure dans rapport une instruction machine-readable `"sponsor_action_required": "review thinking budget config"`.

---

## §5 — Parcours sponsor humain — Top-up wallet (B2C marginal)

> Métrique HEART primaire : **Adoption** — ratio sponsor qui complète top-up sans abandon.
> Entrée principale : landing publique `/` (conviction-first, CTA en fin de section — founder-pref Sarani S8).
> Cible : < 3 étapes avant top-up effectif.
> US concernées : US-09, US-10b, US-11.

### 5.1 Happy path — top-up sponsor wallet agent

```
ÉTAPE 1 — Landing publique (conviction-first)
  Sponsor arrive via Dev.to / Reddit / bouche-à-oreille
  → Hero : "Cost intelligence for AI agents — know before you spend, optimize after you ship"
  → Section "How it works for your agent" : 3 étapes (llms.txt → 402 → payload)
  → Section "Pricing transparent" : Pack Standard $10 = 10K calls | Audit $9.99
  → Section "Garantie ROI" : savings_pct < 15 % → refund 50 %
  → CTA "Top-up your agent's wallet" en bas de section (pas en hero — conviction-first founder-pref)
  Parcours conviction : sponsor comprend AVANT de payer (zéro charm pricing, prix ronds)

ÉTAPE 2 — Pré-paiement : 3 conditions CGU Art. 4quater (OBLIGATOIRE L.221-28 13°)
  Page interstitielle `/sponsor/checkout` avant Stripe Payment Link :
  ┌─────────────────────────────────────────────────────────────────┐
  │ Avant de continuer                                              │
  │                                                                 │
  │ ☐ Je consens à l'exécution immédiate du service avant          │
  │   l'expiration du délai de rétractation de 14 jours           │
  │   (Article L.221-25 du Code de la consommation).               │
  │                                                                 │
  │ ☐ Je reconnais et accepte de perdre mon droit de              │
  │   rétractation une fois le service exécuté                     │
  │   (Article L.221-28 alinéa 13° du Code de la consommation).   │
  │                                                                 │
  │ [Email] Adresse email pour confirmation écrite                  │
  │ (récapitulatif légal envoyé automatiquement)                   │
  │                                                                 │
  │ [CONTINUER VERS LE PAIEMENT]  ← disabled si >= 1 checkbox vide │
  └─────────────────────────────────────────────────────────────────┘
  Conditions cumulatives (3) : checkbox 1 + checkbox 2 + email valide
  Bouton disabled tant que les 3 conditions ne sont pas remplies (H5 — prévention erreurs)
  UX note : ces checkboxes sont UNIQUEMENT sur la page paywall sponsor, JAMAIS sur la landing entière

ÉTAPE 3 — Stripe Payment Link
  Sponsor sélectionne montant : $5 / $10 / $25 / $50 / $100 USDC
  → Stripe Payment Link (hébergé Stripe, PCI géré) — pas de page de paiement custom
  → Stripe Tax activé (F12) — conformité TVA OSS B2C UE
  → Note UI : "Ce top-up approvisionne le wallet USDC Base de votre agent. Vous ne payez pas directement DevRefs."

ÉTAPE 4 — Webhook Stripe → confirmation wallet
  Stripe webhook → Cloudflare Worker → webhook handler
  → Enregistrement top-up (amount, wallet_address fourni, timestamp) dans KV
  → Email de confirmation (récapitulatif CGU + montant + adresse wallet)
  → Sponsor peut envoyer USDC depuis son wallet (Coinbase Wallet / MetaMask / Rainbow) vers le wallet agent

ÉTAPE 5 — Dashboard sponsor /dashboard?token=JWT
  Sponsor accède à /dashboard?token=JWT (JWT HMAC 24h, émis post-top-up Stripe)
  Dashboard affiche :
  - Quota pack restant (si pack actif) : pack:{wallet_hash}:remaining
  - Historique audits demandés (si /api/agent-audit utilisé)
  - Lien Basescan pour export CSV transaction history (autonomie totale — pas un service DevRefs)
  Note : dashboard = information + autonomie, pas coaching (anti-pattern "bibliothèque" non applicable ici — context B2A technique)
```

### 5.2 Cognitive walkthrough — sponsor first-time

| Étape | Sait quoi faire ? | Action visible ? | Lien but-action clair ? | Feedback immédiat ? |
|---|---|---|---|---|
| 1. Landing | OUI — copy "top-up your agent's wallet" | OUI — CTA visible en bas de section | OUI — "your agent pays DevRefs autonomously" | OUI — sections claires avec prix |
| 2. Checkboxes CGU | OUI — texte légal explicite | OUI — checkboxes + bouton disabled | OUI — libellé "perdre mon droit de rétractation" | OUI — bouton enabled dès 3 conditions remplies |
| 3. Stripe Payment Link | OUI — interface Stripe familière | OUI — sélecteur de montant + bouton Stripe | OUI — "top-up $X USDC" | OUI — redirect Stripe + email de confirmation |
| 4. Webhook | N/A (automatique) | N/A | N/A | OUI — email confirmation envoyé < 60 s |
| 5. Dashboard | OUI — JWT link dans email | OUI — URL /dashboard dans email | OUI — "voir l'activité de votre agent" | OUI — données affichées immédiatement |

**[FRICTION F4] : Sponsor non familier avec les wallets crypto** (premier top-up). Solution : section dédiée `/docs/sponsor` avec 3 exemples visuels (Coinbase Wallet, MetaMask, Rainbow) + FAQ "Qu'est-ce qu'un wallet USDC Base ?". Lien visible depuis le dashboard.

---

## §6 — Parcours sponsor humain — Garantie refund (rétractation conditionnelle)

> Métrique HEART primaire : **Task success** — taux de refund validé sans friction pour sponsors éligibles.
> Déclencheur : savings_pct < 15 % mesuré à J30 après audit.
> Contrainte légale : garantie CGV Art. 4ter — 4 conditions cumulatives.

### 6.1 Happy path — activation garantie refund 50 %

```
ÉTAPE 1 — Monitoring savings_pct J30
  Agent mesure savings_pct interne sur 30j post-audit (appels pricing avant/après patches)
  Si savings_pct < 15 % à J30 (heuristique auto-calculée dans logs agent ou input sponsor)
  → Notification email automatique au sponsor : "Votre audit DevRefs du [date] n'a pas atteint l'objectif de 15 % d'économies. Vous êtes éligible à un remboursement partiel."
  Email contient : _audit_id UUID, savings_pct mesuré, lien activation garantie

ÉTAPE 2 — Sponsor déclare refund
  POST /api/audit/refund { "audit_id": "uuid-v4", "savings_pct_measured": 8, "wallet": "0x..." }
  → Authentification : signature wallet on-chain OU JWT 24h (si session dashboard active)
  → Vérification préliminaire côté DevRefs : _audit_id valide + signature HMAC correspondante

ÉTAPE 3 — Validation 4 conditions cumulatives (CGV Art. 4ter)
  C1 : monthly_volume_estimate >= 5M tokens/mois (vérifié dans audit_input original)
  C2 : >= 80 % des patches auto_applicable appliqués (déclaré par sponsor — sur l'honneur V1)
  C3 : Pas de changement de modèle LLM depuis l'audit (déclaré par sponsor)
  C4 : savings_pct_measured < 15 % à J30 (déclaré par sponsor, _audit_id correspondant)
  Si toutes validées → refund calculé : 50 % du prix payé ($4.99 si one-shot / $24.50 si Pack Pro)
  Si conditions non remplies → email explicatif avec condition manquante

ÉTAPE 4 — Remboursement USDC
  Worker déclenche transaction on-chain : montant_refund USDC → wallet sponsor
  Délai max : 7 jours (CGV Art. 4ter — concrètement < 24h Worker automatique)
  → Email de confirmation refund envoyé
  Event Cloudflare : audit_refund_processed (audit_id, savings_pct_declared, amount_refund)
```

### 6.2 État d'erreur — conditions non remplies

```
Condition C2 non validée (patches < 80 % appliqués)
→ Réponse HTTP 400 : { "error": "refund_conditions_not_met", "missing_condition": "C2",
   "detail": "Les recommandations auto-applicables n'ont pas été toutes appliquées (< 80 %). Appliquez les patches restants et contactez-nous." }
→ Email sponsor avec détail de la condition manquante ET aide pour appliquer les patches restants

Condition C1 non validée (volume < 5M tokens)
→ Réponse HTTP 400 : { "error": "volume_below_threshold", "detail": "L'audit est garantie pour les agents >= 5M tokens/mois. Votre volume déclaré était X." }
```

---

## §7 — Parcours crawler IA passif (consultation sans paiement)

> Métrique HEART primaire : **Adoption** — nombre de citations Perplexity / Claude / ChatGPT (KPI North Star secondaire).
> Ce parcours ne génère AUCUN revenu direct — il alimente le KPI GEO.

### 7.1 Happy path — crawler IA (Perplexity / Claude / ChatGPT)

```
ÉTAPE 1 — Crawl llms.txt
  Crawler GET /llms.txt (User-Agent: PerplexityBot / ClaudeBot / GPTBot)
  → HTTP 200 + text/plain + cache CF max 5 min
  → robots.txt : crawlers IA autorisés sur /llms.txt + /about/* + pages légales
  → Sitemap.xml référence ces pages (F17)

ÉTAPE 2 — Citation dans réponse LLM
  Crawler indexe contenu llms.txt + landing + /about/data-sources
  → Réponse future Perplexity/Claude/ChatGPT sur "LLM pricing 2026" peut citer DevRefs
  → Signal de qualité : JSON-LD dateModified + sameAs = signal fraîcheur pour citation IA (G1 GEO)
  KPI North Star secondaire : >= 1 citation organique M+1, >= 10 citations M+6

ÉTAPE 3 — Anti-pattern détecté (crawler humain déguisé)
  UA detection bucket : si User-Agent humain classique (Chrome/Firefox) fetch llms.txt
  → Pas de 402 déclenché (page publique)
  → Pas de funnel paiement forcé
  → Redirection douce vers landing (lien en bas de llms.txt : "For human — devrefs.dev")
```

### 7.2 Distinction technique : crawlers autorisés vs bloqués

| User-Agent pattern | Comportement | Raison |
|---|---|---|
| PerplexityBot, GPTBot, ClaudeBot | Autorisé — llms.txt + /about/* | KPI GEO citations |
| Googlebot, Bingbot | Autorisé — landing + pages légales + /about | SEO indexation |
| Curl sans UA / agent dev | Autorisé — test naturel développeur | Persona agent IA = développeur |
| Scrapers HTML massifs (> 1000 req/min) | Rate-limit CF 429 | Anti-abus |

---

## §8 — Frictions identifiées + résolutions

> Application principe conviction-first (founder-prefs Sarani S8) : CTAs en fin de parcours, ROI exposé avant demande de paiement.

| # | Friction | Étape concernée | Impact KPI | Résolution |
|---|---|---|---|---|
| **F1** | Wallet agent vide — agent ne peut pas payer x402 | §2 Étape 3 | Bloque 100 % du revenu si endémique | Signal sponsor automatique dans log agent + message JSON dans corps 402 : `"wallet_status": "insufficient_balance", "sponsor_action": "top_up_min_0.01_usdc"` |
| **F2** | Latence facilitator Coinbase > 2 s (peak) | §2 Étape 3 | Dégradation UX agent — retry agressif | Retry x2 SDK intégré + `X-Resource-Fresh-Until` header pour décision agent de retry plus tard |
| **F3** | Heuristique H5 effort_mismatch non auto-applicable | §4 Étape 5 | savings_pct partiel — garantie risquée | Rapport inclut `"sponsor_action_required": "review thinking budget config"` avec instruction markdown human-readable |
| **F4** | Sponsor non familier wallets crypto (1er top-up) | §5 Étape 1 | Abandon entonnoir sponsor | Section `/docs/sponsor` dédiée + FAQ 3 wallets (Coinbase / MetaMask / Rainbow) + lien visible dashboard |
| **F5** | Checkbox CGU manquée — bouton disabled bloque | §5 Étape 2 | Friction paiement légal (nécessaire) | Bouton CTA disabled avec tooltip explicatif "Cochez les 2 cases pour continuer" (H5 prévention erreurs) |
| **F6** | ROI audit invisible si agent < 5M tokens/mois | §4 Étape 2 | Audit vendu à mauvais profil → garantie déclenchée | Warning dans body 402 : `"warning": "monthly_volume_estimate below 5M tokens — ROI guarantee may not apply"` |

### 8.1 Audit heuristique Nielsen — parcours agent IA pricing (parcours principal)

| # | Heuristique | Statut | Évidence |
|---|---|---|---|
| H1 | Visibilité état du système | PASS | Body 402 : `freshness_proof.dateModified` + `X-DevRefs-Cache-Age-Seconds` — agent sait toujours la fraîcheur |
| H2 | Correspondance système/monde réel | PASS | Vocabulaire machine (`roi_multiplier`, `effective_cost_factor`) = vocabulaire agent IA natif |
| H3 | Contrôle et liberté | PASS | Agent peut ignorer 402, retenter plus tard, choisir pack vs one-shot |
| H4 | Cohérence et standards | PASS | Format 402 identique sur les 3 endpoints — pattern unique mémorisable |
| H5 | Prévention des erreurs | PASS | Validation F1c pre-paiement audit (somme share_pct, taille payload) |
| H6 | Reconnaissance plutôt que rappel | PASS | Payload preview dans body 402 avant paiement — pas de confiance aveugle |
| H7 | Flexibilité et efficacité | PASS | Pack KV bypass 402 (< 50ms vs < 200ms) pour agents volume |
| H8 | Design esthétique et minimaliste | PASS | Payload < 2 KB, zéro prose, zéro champ inutile |
| H9 | Aide à la reconnaissance et correction des erreurs | PASS | Erreurs JSON avec `error` + `detail` + `action` human-readable |
| H10 | Aide et documentation | PASS | llms.txt + OpenAPI 3.1 + /about/data-schema — découvrabilité complète sans sortir du flow |

### 8.2 Audit heuristique Nielsen — parcours sponsor (top-up)

| # | Heuristique | Statut | Évidence |
|---|---|---|---|
| H1 | Visibilité état du système | PASS | Email confirmation + dashboard /dashboard avec quota restant |
| H2 | Correspondance système/monde réel | PASS | "Wallet", "USDC", "top-up" = vocabulaire dev crypto standard |
| H3 | Contrôle et liberté | PASS | Sponsor peut envoyer USDC directement sans passer par DevRefs |
| H4 | Cohérence et standards | PASS | Stripe Payment Link = interface standard reconnaissable |
| H5 | Prévention des erreurs | PASS | Bouton paiement disabled tant que 3 conditions CGU non remplies |
| H6 | Reconnaissance plutôt que rappel | PASS | Montants prédéfinis ($5/$10/$25/$50/$100) — pas de saisie libre montant |
| H7 | Flexibilité et efficacité | PASS | Sponsor peut aussi envoyer USDC directement (bypass Stripe) |
| H8 | Design esthétique et minimaliste | PASS | Page pré-paiement : 2 checkboxes + 1 champ email + 1 bouton — rien de plus |
| H9 | Aide à la reconnaissance et correction des erreurs | FAIL → CORRECTION | Condition C2 refund non remplie → message d'erreur doit citer la condition exacte et proposer l'action corrective. Actuellement spécifié en §6.2. |
| H10 | Aide et documentation | PASS | /docs/sponsor accessible depuis dashboard + landing |

---

## §9 — Architecture information landing publique

> Conviction-first (founder-pref Sarani S8) : la page suit l'intention du visiteur (comprendre avant d'agir).
> CTAs commerciaux en fin de section, pas en hero.
> H1 unique à cette page.

### 9.1 Structure page landing `/`

**Section 1 — Hero (above the fold)**
- Pattern : full-width, split 60/40 (texte gauche / démo JSON droite)
- H1 : "Cost intelligence for AI agents" (unique à cette page)
- Sous-titre : "Know before you spend, optimize after you ship."
- Bloc démo JSON droite (verbatim V1 — bloc tool-call JSON — exploitable hero selon personas.md v2 § 1.6)
- CTA secondaire : "Read the docs" → /llms.txt (pour agents qui arrivent via landing)
- Responsive : sur mobile (< 768px), JSON démo en dessous du texte — texte en priorité

**Section 2 — How it works for your agent**
- Pattern : stack vertical 3 étapes numérotées (Step 1 / Step 2 / Step 3)
- Étape 1 : "Your agent fetches /llms.txt — discovers 3 endpoints, pricing, ROI summary" + snippet curl
- Étape 2 : "Receives HTTP 402 with roi_summary.verdict: no_brainer_buy — payload preview included"
- Étape 3 : "Pays $0.001 USDC via x402, receives JSON-LD with dateModified and effective_cost_factor"
- Note : "Install time: 6-15 min (Coinbase MCP or x402-axios wrapper)"
- Responsive : stack vertical mobile — ordre conservé (étapes 1→2→3)
- CTA en bas : "Read integration guide" → /about/data-schema

**Section 3 — Pricing transparent**
- Pattern : grille 2 colonnes (Offre 1 / Offre 2) + ligne comparative pack
- Offre 1 — Calcul coût : Pay-per-call $0.001 | Pack Discovery $5 (5K) | Pack Standard $10 (10K) | Pack Pro $50 (60K)
- Offre 2 — Audit : One-shot $9.99 | Pack Pro Audit $49 (6 audits)
- Note : "Subscription Pro $29/mois — Q3 2026"
- Anti-charm pricing : prix ronds (sauf $9.99 = prix arrêté en v-scope)
- Responsive : grille 1 colonne sur mobile — Offre 1 en premier

**Section 4 — Garantie ROI (Offre 2)**
- Pattern : full-width, fond distinct, texte centré
- Titre : "30-day ROI guarantee on audit"
- Corps : "If your agent doesn't save at least 15 % on monthly token costs within 30 days after applying recommendations — we refund 50 % of the audit price."
- Conditions : lien → /legal/cgv (Art. 4ter)
- Responsive : pleine largeur mobile — typographie scale down

**Section 5 — Preuves / Verbatims**
- Pattern : carrousel horizontal (desktop) / stack vertical (mobile) — 3-4 verbatims
- Verbatim V1 (bloc JSON complet — agent halluciné pricing) — format code block
- Verbatim V2 (frustration multi-sources, première personne agent)
- Verbatim V5 (schema SDK obsolète, Vercel AI SDK 5.0)
- Verbatim V6 `[HYPOTHÈSE: scénario analytique, à valider Phase 4]` (audit post-budget cramé)
- Note @copywriter : verbatims = scénarios analytiques, JAMAIS témoignages réels (personas.md v2 § 1.6)
- Responsive : stack vertical mobile — V1 en premier (bloc JSON visuellement fort)

**Section 6 — Top-up your agent's wallet (sponsor)**
- Pattern : split 50/50 texte + instructions wallet
- Texte : "Your agent pays autonomously. You just keep the wallet topped up."
- Instructions : 3 étapes wallet (Coinbase Wallet / MetaMask / Rainbow)
- Lien : "/docs/sponsor — full guide with screenshots"
- CTA : "Top-up agent wallet" → /sponsor/checkout
- Positioning conviction-first : cette section est EN BAS de landing, pas en hero

**Footer**
- Pattern : grille 3 colonnes (Legal / Resources / Contact) + copyright
- Colonne Legal : CGV, Politique de confidentialité, Mentions légales
- Colonne Resources : /llms.txt, OpenAPI spec, /about/data-sources, /about/data-schema, /bot
- Note : checkboxes L.221-28 UNIQUEMENT sur `/sponsor/checkout` — JAMAIS dans le footer ni sur la landing entière

---

## §10 — Tests UX

### Tests UX — Parcours agent IA pricing (parcours principal)

| Test | Critère de succès | Statut |
|---|---|---|
| Parcours agent : découvre, paie, reçoit payload en < 3 étapes | llms.txt → 402 → 200 en < 3 interactions agent | ✅ Documenté §2 |
| Charge cognitive : aucune décision > 3 options | body 402 propose pay-per-call OU pack (2 options) | ✅ |
| Time-to-value : <= 3 étapes (installation hors scope) | Étape 1 llms.txt → Étape 2 402 → Étape 3 200 = 3 exactement | ✅ |
| Edge case : wallet vide | Signal JSON dans body 402 + log agent | ✅ §8 F1 |
| Edge case : facilitator timeout | Retry x2 SDK + X-Resource-Fresh-Until header | ✅ §8 F2 |
| Accessibilité WCAG 2.2 AA | N/A — parcours machine (agent IA, pas UI humaine) | N/A |

### Tests UX — Parcours sponsor top-up

| Test | Critère de succès | Statut |
|---|---|---|
| Sponsor complète top-up sans aide externe | Landing → checkout → Stripe → email en < 5 min | ✅ Documenté §5 |
| Charge cognitive : <= 3 actions écran checkout | 2 checkboxes + 1 email + 1 bouton = 4 éléments max | ✅ |
| Time-to-value : <= 3 étapes | Landing → checkout CGU → Stripe = 3 étapes | ✅ |
| Edge case : sponsor non familier crypto | /docs/sponsor + FAQ 3 wallets | ✅ §8 F4 |
| Edge case : condition CGU manquée | Bouton disabled + tooltip explicatif | ✅ §8 F5 |
| Accessibilité WCAG 2.2 AA | Bouton disabled doit avoir aria-disabled + aria-describedby sur tooltip | ⚠️ À vérifier @fullstack |

### Tests UX — Parcours audit

| Test | Critère de succès | Statut |
|---|---|---|
| Agent reçoit rapport JSON valide après paiement $9.99 | score + savings_pct + recommendations[] présents | ✅ Documenté §4 |
| Validation input F1c bloque payload invalide avant 402 | Erreur HTTP 400 si somme share_pct != 100 | ✅ §4 Étape 1 |
| Garantie refund : conditions documentées machine-readable | CGV Art. 4ter + body 402 "guarantee" field | ✅ §6 |
| Edge case : savings_pct < 15 % à J30 | Notification email + /api/audit/refund disponible | ✅ §6 |
| Edge case : agent < 5M tokens/mois | Warning dans body 402 avant paiement | ✅ §8 F6 |
| Accessibilité WCAG 2.2 AA | N/A — parcours machine | N/A |

---

## §11 — Handoff structuré

### Pour @design — 3 wireframes critiques prioritaires

1. **Landing hero + section "How it works"** (Section 1+2 — §9.1)
   - Pattern layout : split 60/40 + 3 étapes stack vertical
   - Contenu critique : bloc JSON verbatim V1 exploitable hero tel quel (personas.md v2 § 1.6)
   - Responsive : JSON sous texte sur mobile (< 768px)
   - Voice : "Fresh — Atomic — Verifiable" (brand-platform v2)

2. **Page pré-paiement sponsor `/sponsor/checkout`** (§5 Étape 2)
   - Pattern layout : carte centrée, fond sobre, largeur max 480px
   - Contenu critique : 2 checkboxes CGU + champ email + bouton CTA (disabled par défaut)
   - Interaction : bouton CTA enabled uniquement si 2 checkboxes cochées + email valide
   - Accessibilité : aria-disabled, aria-describedby, focus visible sur checkboxes

3. **Dashboard sponsor `/dashboard`** (§5 Étape 5)
   - Pattern layout : grille 2 colonnes (quota pack / historique) — stack mobile
   - Contenu : quota pack restant (progress bar) + historique audits + lien Basescan
   - Responsive : stack vertical mobile (quota en premier)

### Pour @copywriter — 5 surfaces de texte avec contraintes voice

| Surface | Contrainte voice | Longueur cible | Éléments critiques |
|---|---|---|---|
| Hero landing H1 + sous-titre | Fresh — Atomic — Verifiable. Pas de prose. Machine-first. | H1 : 4-6 mots. Sous-titre : 1 phrase. | "Cost intelligence for AI agents" (acté) |
| `/llms.txt` | Machine-readable uniquement. Zéro storytelling. Format llmstxt.org. | 30-50 lignes max | 3 endpoints + pricing + roi_summary stub |
| Body 402 augmenté (texte des champs JSON) | First-person agent ("your agent"). Chiffres concrets. Verdict en 1 mot (`no_brainer_buy`). | Champs JSON < 200 chars chacun | roi_summary.verdict, alternative_cost_estimate.agent_action_if_no_devrefs |
| Dashboard sponsor (labels + messages) | Tutoiement sponsor. Direct. Pas de jargon. | Labels < 30 chars | "Quota restant", "Historique audits", "Voir sur Basescan" |
| Email refund garantie J30 | Factuel. Zéro culpabilisation. Action claire. | 150-200 mots | _audit_id, savings_pct, lien /api/audit/refund |

### Pour @product-manager — 12 contracts API à formaliser en specs

| # | Endpoint / Contract | Description |
|---|---|---|
| A1 | `GET /llms.txt` | Format llmstxt.org, MIME, TTL cache, endpoints listés |
| A2 | `GET /api/llm-prices?model=X` | Schema query, payload JSON-LD, body 402 augmenté |
| A3 | `GET /api/sdk-status?pkg=X` | Schema query, payload JSON-LD, body 402 augmenté |
| A4 | `POST /api/agent-audit` | Schema input (agent_config + sample_traces), validation F1c, body 402, output JSON |
| A5 | `POST /api/pack/purchase` | Pack id, wallet, body 402, KV write format |
| A6 | `GET /api/pack/quota` | wallet_hash lookup, remaining, expires_at |
| A7 | `POST /api/audit/refund` | audit_id, wallet signature, 4 conditions validation, response JSON |
| A8 | `GET /openapi.json` | OpenAPI 3.1 avec extension x-x402 sur 3 endpoints |
| A9 | `GET /dashboard?token=JWT` | JWT validation, données quota + historique audits |
| A10 | `POST /webhook/stripe` | Stripe event parsing, KV top-up write, email trigger |
| A11 | `GET /about/data-schema` | Schema JSON payload pricing + audit (doc agent) |
| A12 | `GET /about/data-sources` | Sources officielles scrapées, transparence provenance |

### Pour @qa — 6 parcours E2E à tester

| Parcours E2E | Persona | Critère de succès |
|---|---|---|
| E1 — Agent pricing one-shot | Agent IA (Claude Code + Coinbase MCP) | llms.txt → 402 → paiement → 200 payload en < 30 s |
| E2 — Agent pack achat + quota bypass | Agent IA (x402-axios) | Pack acheté → calls suivants 200 direct (bypass 402) |
| E3 — Agent audit one-shot | Agent IA autonome | POST audit → 402 → paiement → rapport JSON complet |
| E4 — Sponsor top-up Stripe | Dev humain sponsor | Landing → checkout CGU → Stripe → email → dashboard JWT |
| E5 — Sponsor garantie refund | Dev humain sponsor | /api/audit/refund → validation 4 conditions → email refund |
| E6 — Crawler IA llms.txt | Crawler passif (curl User-Agent PerplexityBot) | GET /llms.txt → 200 → parse 3 endpoints valide |

---

## Agents spécialisés recommandés pour ce projet

| Agent proposé | Type | Rôle | Justification (lié au parcours) | Priorité |
|---|---|---|---|---|
| @testeur-agent-ia | Testeur persona | Simule agent IA (Claude Code / Cursor / AgentKit) — parse llms.txt, interprète 402 augmenté, décide pay/skip, valide payload reçu | Persona principal = agent machine — seul un testeur agent peut valider la lisibilité machine des flows §2-§4 | Haute |
| @testeur-sponsor-humain | Testeur persona | Simule dev humain sponsor — valide clarté checkboxes CGU, compréhension top-up wallet, dashboard sponsor | Persona secondaire B2C — valide les parcours §5-§6 | Haute |

→ Handoff @agent-factory : créer ces agents si pas encore existants (v1-scope.md § 7.3 les référence).

---

*Fichier produit : `docs/ux/user-flows.md` — @ux — Phase 1 conception — 2026-05-05*
