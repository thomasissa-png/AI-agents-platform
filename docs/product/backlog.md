<!-- Version: 2026-05-05T15:00 — @product-manager — Phase 0 v2 wave 2 — Backlog V1 DevRefs PIVOT 100% B2A -->

# Backlog — DevRefs V1 v2

## Résumé exécutif

- **Format** : template allégé Phase 0 (specs complètes en Phase 1 functional-specs).
- **21 user stories V1** : US-01 à US-15 (conservées + mises à jour pivot) + US-16 à US-20 (audit endpoint, nouvelles v2) + US-08c (endpoint achat pack, officialisation 2026-05-07).
- **Ajout v2** : US-16 à US-20 couvrent le 3e endpoint `/api/agent-audit` (parcours complet agent).
- **Ajout v2** : US-08b (Pack pré-payé KV quota lookup) + US-08c (route d'achat `POST /api/pack/purchase`) + US-10b (sponsor wallet top-up) remplacent le persona Stripe humain pilier.
- **Persona principal** : agent IA autonome (US-01 à US-08, US-08b, US-16 à US-20).
- **Persona secondaire** : dev humain SPONSOR wallet (US-09, US-10b, US-11 à US-15) — plus "dev humain payeur Stripe 4,99 €/jour".
- **V4 verbatim archivé** : le scenario "dev qui paie 4,99 €/jour Stripe Link" est retiré des critères d'acceptance (pivot v2). Remplacé par scenario "sponsor top-up wallet USDC Base".
- **Critères Given/When/Then** : minimum 9 par story (3 happy + 2 erreur + 2 limites + 1 permission + 1 données existantes).
- Source pricing : `docs/ia/agent-economics.md` § C.1. Zéro invention.

---

## Format des user stories (allégé Phase 0)

```
### US-NN : Titre — verbe action
- **Persona** : agent IA OU dev humain sponsor wallet
- **JTBD** : job-to-be-done référencé depuis personas.md v2
- **Opportunité** : O1-O5 du discovery-map.md v2
- **Features liées** : F1 à F26 + F1b + F1c + F8b + F8c de roadmap.md v2
- **Dépendances** : US précédentes ou "Aucune"
- **Effort** : S (< 4 h IA), M (< 1 j IA), L (> 1 j IA)
- **Critères acceptance** : 9 minimum (3 happy + 2 erreur + 2 limites + 1 permission + 1 données existantes)
```

---

## Stories — Persona principal : Agent IA autonome

### US-01 : Découvrir les 3 endpoints DevRefs via `llms.txt`

- **Persona** : Agent IA autonome (Claude Code, Cursor, AgentKit, MCP-host)
- **JTBD** : Job 1 personas.md v2 — vérifier la fraîcheur d'un fait technique avant de générer
- **Opportunité** : O2 + O3
- **Features liées** : F15 (`llms.txt` v2 — 3 endpoints)
- **Dépendances** : Aucune (entrée du parcours)
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent fetch `https://devrefs.dev/llms.txt` WHEN MIME type retourné THEN `text/plain; charset=utf-8`
  - Happy 2 : GIVEN agent parse `llms.txt` WHEN cherche endpoints THEN trouve les 3 endpoints monétisés (`/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit`) avec pricing pack x402 affiché (Pack Standard $10)
  - Happy 3 : GIVEN agent vérifie syntaxe llmstxt.org WHEN parse THEN aucune erreur format markdown
  - Erreur 1 : GIVEN cron source down 12 h WHEN agent fetch `llms.txt` THEN 200 + warning "stale data > 24 h" inclus
  - Erreur 2 : GIVEN Cloudflare edge erreur WHEN agent fetch THEN 5xx + retry-after header
  - Limite 1 : GIVEN agent fetch 1 000 fois/jour WHEN rate-limit non déclenché (read-only) THEN tous succèdent
  - Limite 2 : GIVEN agent fetch avec User-Agent inhabituel WHEN parse THEN aucune restriction (public read)
  - Permission 1 : GIVEN aucun paiement x402 ni JWT WHEN agent fetch `llms.txt` THEN 200 OK (page publique)
  - Données existantes 1 : GIVEN nouvelle version `llms.txt` déployée (nouvel endpoint V2) WHEN agent re-fetch THEN nouvelle version (cache CF max 5 min)

### US-02 : Recevoir HTTP 402 augmenté sur appel non payé

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 — détecter besoin paiement + lire ROI immédiatement dans 402 body
- **Opportunité** : O3
- **Features liées** : F8 (middleware x402 unifié + body augmenté `x402-response-spec.md`)
- **Dépendances** : US-01
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent appelle `GET /api/llm-prices?model=opus-4.7` sans `X-PAYMENT` WHEN middleware x402 intercepte THEN HTTP 402 + body JSON avec champs `x402.price`, `x402.currency`, `x402.facilitator`, `x402.asset`, `x402.network`, `alternative_cost_estimate`, `roi_summary`, `freshness_proof`, `payload_preview`
  - Happy 2 : GIVEN body 402 reçu WHEN agent parse `roi_summary` THEN lit "vous économisez 100×-490× vs WebSearch+parse HTML" avec chiffres concrets
  - Happy 3 : GIVEN body 402 reçu WHEN agent parse `payload_preview` THEN reçoit aperçu partiel du payload (pour décision d'achat)
  - Erreur 1 : GIVEN Coinbase facilitator down WHEN middleware appelé THEN 503 + retry-after 60s + log Cloudflare
  - Erreur 2 : GIVEN agent envoie payload x402 invalide WHEN middleware vérifie THEN 402 re-renvoyé + "invalid payment signature"
  - Limite 1 : GIVEN agent appelle endpoint inexistant WHEN middleware THEN 404 (pas 402)
  - Limite 2 : GIVEN agent envoie X-PAYMENT pour mauvais endpoint WHEN middleware vérifie THEN 402 + warning "payment mismatch"
  - Permission 1 : GIVEN pack actif présent (quota KV > 0) WHEN middleware THEN bypass 402 direct (lookup KV < 50 ms)
  - Données existantes 1 : GIVEN agent retry après paiement one-shot réussi WHEN re-fetch THEN 200 + payload (paiement settled)

### US-03 : Payer en x402 (one-shot) et recevoir payload pricing

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 + Job 4 — payer pour ground truth
- **Opportunité** : O3
- **Features liées** : F1, F8
- **Dépendances** : US-02
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent signe payload x402 USDC Base WHEN re-appelle `GET /api/llm-prices?model=opus-4.7` avec X-PAYMENT THEN settle < 5 s + 200 + payload JSON
  - Happy 2 : GIVEN payload reçu WHEN agent parse THEN champs requis présents : `model`, `input_per_mtok`, `output_per_mtok`, `dateModified`, `effective_cost_factor`, `sameAs`, `fetched_at`, `_signature` (watermark)
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie taille THEN < 50 KB (Content-Length header)
  - Erreur 1 : GIVEN wallet insuffisant WHEN settle THEN 402 + `{"error":"insufficient_funds"}` + retry-after
  - Erreur 2 : GIVEN settle blockchain timeout > 10 s WHEN middleware THEN 504 + retry-after + tx hash partial
  - Limite 1 : GIVEN agent demande modèle inexistant WHEN endpoint THEN 404 + `{"error":"model_not_found","available":[...]}`
  - Limite 2 : GIVEN agent demande sans param `?model=` WHEN endpoint THEN 400 + `{"error":"model_param_required"}`
  - Permission 1 : GIVEN paiement one-shot (pas pack) WHEN agent re-fetch même endpoint 1 sec après THEN 402 (1 tx = 1 payload)
  - Données existantes 1 : GIVEN cron planté 25 h WHEN agent paie THEN 200 + payload + `_warning: "data older than 24h"`

### US-04 : Vérifier fraîcheur via `dateModified` JSON-LD

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 + Job 5 — citer source machine-vérifiable
- **Opportunité** : O1
- **Features liées** : F3, F4, F6
- **Dépendances** : US-03
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN payload reçu WHEN agent parse JSON-LD `@type: Dataset` THEN `dateModified` ISO 8601 présent
  - Happy 2 : GIVEN payload reçu WHEN agent vérifie diff timestamp THEN < 6 h pour pricing (cron 6 h) / < 24 h pour SDK
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie header HTTP `Last-Modified` THEN aligné avec JSON-LD `dateModified`
  - Erreur 1 : GIVEN cron source en panne 30 h WHEN payload servi THEN `dateModified` reflète panne + champ `_warning` explicite
  - Erreur 2 : GIVEN payload corrompu WHEN agent vérifie THEN propose retry
  - Limite 1 : GIVEN cron exact timestamp WHEN agent vérifie `dateModified` THEN < 1 sec d'écart vs cron log
  - Limite 2 : GIVEN multi-payload dans 1 réponse (cas erreur batching) WHEN agent parse THEN détecte format invalide
  - Permission 1 : GIVEN agent suit `sameAs` URL (ex anthropic.com/pricing) WHEN THEN 200 + page officielle
  - Données existantes 1 : GIVEN même endpoint payé 2× consécutif WHEN comparé THEN `dateModified` identique tant que cron pas re-tourné

### US-05 : Recevoir `effective_cost_factor` Opus 4.7

- **Persona** : Agent IA autonome
- **JTBD** : Job 4 — estimer coût réel d'opération (tokenizer inflation détectée)
- **Opportunité** : O1
- **Features liées** : F5
- **Dépendances** : US-03
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent paie `?model=opus-4.7` WHEN payload THEN `effective_cost_factor: 1.35` présent (tokenizer +35 % Opus 4.7 silent inflation)
  - Happy 2 : GIVEN agent paie autre modèle sans inflation connue WHEN payload THEN `effective_cost_factor: 1.0`
  - Happy 3 : GIVEN agent calcule coût réel (input × `input_per_mtok` × `effective_cost_factor`) WHEN génération THEN coût aligné avec facture Anthropic réelle
  - Erreur 1 : GIVEN modèle absent du registre factor (nouveau modèle) WHEN endpoint THEN `effective_cost_factor: 1.0` + `_warning: "no inflation factor known, defaulting to 1.0"`
  - Erreur 2 : GIVEN champ absent (bug parser) WHEN agent parse THEN considéré 1.0 par défaut
  - Limite 1 : GIVEN Opus 4.7 + factor 1.35 WHEN agent affiche THEN explicite "tokenizer inflate +35 %"
  - Limite 2 : GIVEN futur modèle factor 0.9 (déflation hypothétique) WHEN endpoint THEN servi correctement
  - Permission 1 : N/A (champ public dans payload payé)
  - Données existantes 1 : GIVEN factor change après update Anthropic WHEN cron met à jour THEN nouveau factor reflété < 6 h

### US-06 : Consulter statut SDK via `/api/sdk-status`

- **Persona** : Agent IA autonome
- **JTBD** : Job 2 personas.md v2 — détecter breaking change SDK
- **Opportunité** : O1 + O2
- **Features liées** : F2
- **Dépendances** : US-02 (réutilise middleware x402)
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent paie `GET /api/sdk-status?pkg=ai` WHEN endpoint THEN payload `{latest, breaking_since, dateModified, changelog_url, sameAs}`
  - Happy 2 : GIVEN payload `breaking_since` WHEN agent compare version utilisée THEN détecte si version pré-breaking
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie `sameAs` THEN URL pointe npm registry ou GitHub releases officiel
  - Erreur 1 : GIVEN package npm inexistant WHEN endpoint THEN 404 + `{"error":"package_not_found"}`
  - Erreur 2 : GIVEN GitHub rate-limit 429 lors cron WHEN endpoint sert cache stale THEN warning explicite + suggestion retry
  - Limite 1 : GIVEN package monorepo `@scope/pkg` WHEN endpoint THEN URL-encoded correctement
  - Limite 2 : GIVEN package sans release WHEN endpoint THEN 200 + `{"latest":null,"_note":"no releases yet"}`
  - Permission 1 : GIVEN pack actif ou paiement one-shot x402 WHEN endpoint THEN 200 direct
  - Données existantes 1 : GIVEN package mis à jour entre 2 cron WHEN agent paie THEN cache max 24 h stale signalé

### US-07 : Suivre `sameAs` pour vérifier source officielle

- **Persona** : Agent IA autonome
- **JTBD** : Job 5 — citer source machine-vérifiable
- **Opportunité** : O1
- **Features liées** : F3
- **Dépendances** : US-03 ou US-06
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN payload pricing WHEN agent suit `sameAs` URL (ex anthropic.com/pricing) THEN 200 + page officielle
  - Happy 2 : GIVEN payload SDK WHEN agent suit `sameAs` (npm ou GitHub) THEN 200 + données cohérentes
  - Happy 3 : GIVEN agent compare prix DevRefs vs page officielle WHEN match THEN confiance haute
  - Erreur 1 : GIVEN page source officielle 404 WHEN agent suit `sameAs` THEN détecte 404, signale support
  - Erreur 2 : GIVEN page source TOS-blocked l'agent WHEN suit `sameAs` THEN agent peut citer URL sans la fetcher
  - Limite 1 : GIVEN `sameAs` pointe page modifiée depuis cron WHEN comparé THEN diff signalé `_warning` côté DevRefs cron suivant
  - Limite 2 : GIVEN multi-source pour 1 payload (rare) WHEN payload THEN `sameAs` array 2 URLs
  - Permission 1 : GIVEN agent fetch `sameAs` directement WHEN page publique THEN OK (pas DevRefs auth)
  - Données existantes 1 : GIVEN URL `sameAs` change WHEN cron suivant THEN nouveau `sameAs` reflété

### US-08 : Découvrir et appeler DevRefs via OpenAPI 3.1 spec

- **Persona** : Agent IA autonome (MCP-host avancé)
- **JTBD** : Job 1 + 2 — discovery automatique capacités
- **Opportunité** : O2 + O3
- **Features liées** : F18 (OpenAPI 3.1 + extension `x-x402` — 3 endpoints v2)
- **Dépendances** : US-01
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent fetch `https://devrefs.dev/openapi.json` WHEN parse THEN spec OpenAPI 3.1 valide
  - Happy 2 : GIVEN spec parsée WHEN agent lit `info.x-x402` THEN champs `enabled: true, facilitator: coinbase, asset: USDC, network: base`
  - Happy 3 : GIVEN spec parsée WHEN agent lit `paths` THEN 3 paths documentés (`/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit`) avec exemples
  - Erreur 1 : GIVEN spec corrompue WHEN agent parse THEN invalid OpenAPI + suggère `llms.txt` fallback
  - Erreur 2 : GIVEN spec 404 WHEN agent fetch THEN signal erreur + retry
  - Limite 1 : GIVEN spec >= 5 KB WHEN agent fetch THEN OK (pas de limite stricte)
  - Limite 2 : GIVEN agent supporte uniquement OpenAPI 3.0 WHEN parse THEN compat partielle (champs essentiels OK)
  - Permission 1 : GIVEN spec publique WHEN agent fetch THEN 200 sans auth
  - Données existantes 1 : GIVEN nouvelle version spec déployée WHEN agent re-fetch THEN spec versionée

### US-08b : Acheter un Pack pré-payé x402 et utiliser le quota KV

- **Persona** : Agent IA autonome
- **JTBD** : Job 3 personas.md v2 — réduire friction paiement x402 par-call, réserver quota
- **Opportunité** : O3
- **Features liées** : F8b (pack KV quota lookup)
- **Dépendances** : US-02
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent signe paiement x402 $10 USDC (Pack Standard) WHEN settle THEN quota KV = 10 000 calls actif, calls suivants répondent < 50 ms p95 sans nouvelle signature
  - Happy 2 : GIVEN pack actif WHEN agent appelle `GET /api/llm-prices` sans `X-PAYMENT` THEN 200 direct (lookup KV, pas 402)
  - Happy 3 : GIVEN agent interroge quota restant WHEN header `X-DevRefs-Quota-Remaining` THEN nombre calls restants affiché
  - Erreur 1 : GIVEN quota KV épuisé (0 calls restants) WHEN agent appelle THEN 402 + body augmenté mentionnant "Pack expired — re-purchase Pack Standard $10"
  - Erreur 2 : GIVEN pack acheté mais KV lookup fail (panne edge) WHEN agent appelle THEN fallback : 402 classique avec message retry
  - Limite 1 : GIVEN agent achète Pack Discovery $5 (5 000 calls) WHEN 5 001e call THEN 402 quota épuisé
  - Limite 2 : GIVEN agent achète Pack Pro $50 (60 000 calls) WHEN utilise < 50 ms p95 THEN OK perfo (KV read ultra-rapide)
  - Permission 1 : GIVEN pack wallet A WHEN agent wallet B tente utiliser quota THEN 402 (quota lié au wallet signataire)
  - Données existantes 1 : GIVEN pack acheté hier avec 8 000 calls restants WHEN agent re-fetch aujourd'hui THEN quota intact (pas de TTL journalier)

### US-08c : Appeler `POST /api/pack/purchase` pour acheter un pack pré-payé (F8c — officialisé 2026-05-07)

- **Persona** : Agent IA autonome (ou sponsor humain configurant son agent)
- **JTBD** : Job 3 personas.md v2 — acquérir un quota pack en 1 signature x402 pour éviter la friction par-call
- **Opportunité** : O3
- **Features liées** : F8c (`POST /api/pack/purchase`), F8b (KV quota lookup activé après achat), F8 (middleware x402)
- **Dépendances** : US-02 (middleware x402 en place), US-08b (quota KV pattern)
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent envoie `POST /api/pack/purchase` avec body `{"pack":"standard"}` et header x402 signé $10 USDC WHEN Coinbase facilitator settle THEN HTTP 200 + `{pack:"standard", calls_remaining:10000, expires_at, pack_id}`
  - Happy 2 : GIVEN pack acheté via US-08c WHEN agent appelle `/api/llm-prices` sans header x402 THEN HTTP 200 direct (F8b KV lookup actif)
  - Happy 3 : GIVEN agent choisit `{"pack":"pro"}` WHEN achat THEN HTTP 200 + `calls_remaining:60000`
  - Erreur 1 : GIVEN body `{"pack":"enterprise"}` (valeur hors enum) WHEN Worker reçoit THEN HTTP 400 `INVALID_PACK_TYPE` — SANS déclencher paiement x402
  - Erreur 2 : GIVEN pack "standard" déjà actif (3 000 calls restants) WHEN agent tente achat pack "standard" THEN HTTP 409 `PACK_ALREADY_ACTIVE` + `calls_remaining:3000` — SANS déclencher paiement x402
  - Limite 1 : GIVEN Coinbase facilitator timeout > 5 s WHEN Worker attend settlement THEN HTTP 402 `facilitator_timeout` — quota KV NON créé
  - Limite 2 : GIVEN double POST race condition < 500 ms WHEN 2 requêtes simultanées THEN 1 HTTP 200, 1 HTTP 409 (KV write atomique)
  - Permission 1 : GIVEN body valide mais aucun header x402 WHEN endpoint THEN HTTP 402 standard avec `packs_available[]`
  - Données existantes 1 : GIVEN pack "discovery" épuisé (0 calls restants) WHEN agent tente achat "standard" THEN HTTP 200 autorisé (pack précédent épuisé, pas actif)

---

## Stories — 3e endpoint : `/api/agent-audit` (nouvelles v2, US-16 à US-20)

### US-16 : Envoyer config agent et traces à `/api/agent-audit` — recevoir 402 augmenté

- **Persona** : Agent IA autonome
- **JTBD** : Job 4 personas.md v2 — initier audit post-flight pour optimisation coût
- **Opportunité** : O5
- **Features liées** : F1b, F1c, F8 (middleware x402 sur audit)
- **Dépendances** : US-08b ou US-03 (wallet approvisionné)
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent envoie `POST /api/agent-audit` avec body JSON valide (framework, models_used, system_prompts, tools, sample_traces, monthly_volume_estimate) WHEN middleware x402 intercepte THEN 402 + body `{"roi_summary":"save 40% = $36/mois en avg, payback $9.99 en 8 jours", "price":"9.99 USDC"}`
  - Happy 2 : GIVEN body 402 reçu WHEN agent parse THEN `roi_summary` + `alternative_cost_estimate` + `freshness_proof` tous présents
  - Happy 3 : GIVEN monthly_volume_estimate = 10 000 000 WHEN 402 body THEN estimation ROI spécifique ("agent 10M tok/mois, 40% économie = $36/mois")
  - Erreur 1 : GIVEN models_used share_pct != 100 WHEN Worker valide THEN HTTP 400 `INVALID_MODEL_SHARE` (avant 402)
  - Erreur 2 : GIVEN sample_traces < 3 WHEN Worker valide THEN HTTP 400 `SAMPLE_TRACES_OUT_OF_RANGE`
  - Limite 1 : GIVEN payload > 100 KB WHEN Worker THEN HTTP 413 `PAYLOAD_TOO_LARGE`
  - Limite 2 : GIVEN monthly_volume_estimate < 5 000 000 WHEN 402 body THEN warning "audit recommended for agents > 5M tokens/month" visible dans 402
  - Permission 1 : GIVEN pack actif (F8b) WHEN POST audit THEN quota décrémenté pour 1 audit (pack Pro $49 = 6 audits)
  - Données existantes 1 : GIVEN agent re-soumet même config WHEN 2e audit THEN nouveau audit_id + nouveau score (pas cache stale)

### US-17 : Payer audit $9.99 en x402 et recevoir report JSON

- **Persona** : Agent IA autonome
- **JTBD** : Job 4 — recevoir recommandations actionnables + patches auto-applicables
- **Opportunité** : O5
- **Features liées** : F1b, F8
- **Dépendances** : US-16
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent signe paiement x402 $9.99 USDC WHEN settle THEN 200 + JSON audit complet avec `audit_id`, `score`, `scoring_breakdown`, `monthly_cost_current_usd`, `monthly_cost_optimized_usd`, `savings_pct`, `savings_usd_per_month`, `recommendations[]`
  - Happy 2 : GIVEN report reçu WHEN agent parse `recommendations[]` THEN chaque item a `id`, `severity`, `delta_usd_month`, `confidence`, `auto_applicable`, `summary`, `evidence`, `patch`
  - Happy 3 : GIVEN `auto_applicable: true` dans recommandation WHEN agent lit patch THEN patch JSON Schema-validable et appliquable sans intervention humaine
  - Erreur 1 : GIVEN wallet $9.98 USDC (insuffisant) WHEN settle THEN 402 `{"error":"insufficient_funds","required":"9.99 USDC"}`
  - Erreur 2 : GIVEN Worker timeout audit computation > 10 s WHEN THEN 504 + retry-after 30s
  - Limite 1 : GIVEN score = 95/100 (agent déjà très optimisé) WHEN report THEN savings_pct < 10 % → garantie refund 50 % mentionnée dans response `{"guarantee":"savings_pct < 15% — refund 50% CGV applicable"}`
  - Limite 2 : GIVEN agent sans traces (sample_traces vides) WHEN audit THEN impossible (bloqué US-16 validation 400)
  - Permission 1 : GIVEN paiement audit one-shot WHEN agent re-soumet même audit_id THEN nouveau paiement requis (1 tx = 1 audit)
  - Données existantes 1 : GIVEN agent a déjà appliqué le patch PROMPT_CACHING WHEN re-audit THEN nouveau score reflète amélioration

### US-18 : Appliquer les patches `auto_applicable` du report audit

- **Persona** : Agent IA autonome
- **JTBD** : Job 4 — auto-optimisation sans intervention humaine
- **Opportunité** : O5
- **Features liées** : F1b (patch auto_applicable)
- **Dépendances** : US-17
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent lit recommandation `MODEL_DOWNGRADE_SIMPLE_TASKS` avec `auto_applicable: true` WHEN applique patch THEN routage modèle mis à jour (Opus → Haiku sur tâches simples)
  - Happy 2 : GIVEN agent lit `ENABLE_PROMPT_CACHING_SYSTEM_PROMPTS` avec snippet TypeScript WHEN applique THEN `cache_control: {type:'ephemeral'}` ajouté aux system prompts > 1024 tokens
  - Happy 3 : GIVEN patch appliqué WHEN agent comptabilise économies 30 jours THEN savings_pct >= 15 % (garantie CGV non déclenchée)
  - Erreur 1 : GIVEN patch `auto_applicable: false` (ex BATCH_PARALLELIZATION) WHEN agent vérifie THEN flag explicite "manual review required" — agent ne tente pas d'appliquer seul
  - Erreur 2 : GIVEN patch JSON invalide (bug Worker) WHEN agent parse THEN JSON Schema validation fail → agent signale erreur au superviseur
  - Limite 1 : GIVEN agent applique 3 patches simultanément WHEN conflit possible THEN severity order : high > medium > low
  - Limite 2 : GIVEN agent autonome sans superviseur WHEN patch auto_applicable THEN applique + log action dans traces (auditabilité)
  - Permission 1 : GIVEN patch affecte budget Opus WHEN auto_applicable THEN agent agit dans son périmètre décisionnel (pas d'escalade superviseur requise pour patches "high confidence > 0.8")
  - Données existantes 1 : GIVEN patch déjà appliqué (cache local agent) WHEN re-lit recommandation THEN idempotent — applique uniquement si config actuelle différente du patch

### US-19 : Vérifier garantie CGV si savings_pct < 15 % à 30 jours

- **Persona** : Agent IA autonome (ou superviseur sponsor)
- **JTBD** : Job 4 — invoquer garantie ROI si audit sous-performant
- **Opportunité** : O5
- **Features liées** : F1b (garantie), F21 (CGV v2 clause audit)
- **Dépendances** : US-17 + US-18 (post application patches)
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN 30 jours post-audit + savings_pct mesuré < 15 % WHEN agent ou sponsor soumet request refund (audit_id + preuves savings mesurées) THEN DevRefs répond avec process refund 50 % = $5 USDC remboursés
  - Happy 2 : GIVEN request refund soumise WHEN CGV clause audit vérifiée THEN délai remboursement <= 5 jours ouvrés mentionné
  - Happy 3 : GIVEN agent autonome WHEN savings_pct >= 15 % THEN garantie non déclenchée + confirmation dans response "savings_pct=38% > seuil 15% — garantie non applicable"
  - Erreur 1 : GIVEN audit_id invalide WHEN request refund THEN 404 `AUDIT_NOT_FOUND`
  - Erreur 2 : GIVEN délai > 30 jours WHEN request refund THEN 400 `GUARANTEE_EXPIRED — claim window 30 days only`
  - Limite 1 : GIVEN agent autonome sans superviseur WHEN garantie applicable THEN alerte envoyée superviseur (pas prise de décision autonome sur remboursement)
  - Limite 2 : GIVEN Pack Pro $49 (6 audits) WHEN 1 audit < 15 % THEN remboursement = 50 % × $8.17 = ~$4 USDC pour cet audit
  - Permission 1 : GIVEN seul wallet signataire original WHEN claim refund THEN autorisé (pas d'autre agent)
  - Données existantes 1 : GIVEN garantie déjà invoquée pour audit_id X WHEN re-tentative THEN 409 `GUARANTEE_ALREADY_CLAIMED`

### US-20 : Lire le score d'audit et partager avec superviseur sponsor

- **Persona** : Agent IA autonome → sponsor wallet humain (handoff)
- **JTBD** : Job 4 — communiquer ROI démontré au superviseur pour validation
- **Opportunité** : O5
- **Features liées** : F1b, F26 (dashboard sponsor)
- **Dépendances** : US-17
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent reçoit report audit (score 62, savings_pct 40.4%) WHEN formate pour superviseur THEN résumé lisible "Agent audit score : 62/100 — économies potentielles : $36.4/mois (40%) — 3 patches auto-applicables"
  - Happy 2 : GIVEN superviseur visite `/dashboard?token=JWT` WHEN page rendu THEN dernier audit_id visible + score + savings_pct + recommendations count
  - Happy 3 : GIVEN sponsor veut voir rapport complet WHEN dashboard THEN lien download JSON audit_id complet disponible
  - Erreur 1 : GIVEN dashboard JWT expiré WHEN superviseur visite THEN 401 + instruction top-up wallet pour renouveler accès
  - Erreur 2 : GIVEN report audit > 50 KB (rare, beaucoup de traces) WHEN dashboard download THEN streaming JSON ou pagination
  - Limite 1 : GIVEN superviseur sur mobile WHEN dashboard rendu THEN responsive sans overflow
  - Limite 2 : GIVEN superviseur sans JWT (non-sponsor) WHEN tente download THEN 403 (rapport lié au payer wallet uniquement)
  - Permission 1 : GIVEN rapport contient config agent interne WHEN dashboard THEN données NON partagées avec tiers (confidentialité, CGV)
  - Données existantes 1 : GIVEN 3 audits successifs WHEN dashboard THEN historique 3 audits visible avec delta score entre chaque

---

## Stories — Persona secondaire : Dev humain sponsor wallet

### US-09 : Découvrir DevRefs via la landing publique

- **Persona** : Dev humain sponsor wallet (comprend la valeur en 5 secondes pour son agent)
- **JTBD** : Comprendre pourquoi son agent dépense des tokens sur pricing WebSearch + saisir la proposition de valeur "Cost intelligence"
- **Opportunité** : O4
- **Features liées** : F16 (landing v2 — 2 heroes JSON)
- **Dépendances** : Aucune
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev arrive sur `https://devrefs.dev` WHEN landing rendu THEN < 50 KB total + < 200 ms LCP
  - Happy 2 : GIVEN dev scroll WHEN voit hero 1 THEN bloc démo JSON pricing (avant : 64K tokens, après : 1 call $0.001) visible
  - Happy 3 : GIVEN dev scroll WHEN voit hero 2 THEN bloc démo JSON audit score (score 62/100, savings $36/mois) visible + CTA "Audit your agent $9.99"
  - Erreur 1 : GIVEN Cloudflare Pages down WHEN dev fetch THEN 503 + lien support
  - Erreur 2 : GIVEN dev navigateur sans JS WHEN fetch THEN HTML statique fonctionnel
  - Limite 1 : GIVEN dev mobile (375px) WHEN landing THEN responsive sans overflow horizontal
  - Limite 2 : GIVEN dev écran 4K WHEN landing THEN max-width respectée
  - Permission 1 : GIVEN dev sans cookie ni JWT WHEN visite THEN 200 (public)
  - Données existantes 1 : GIVEN dev déjà JWT actif WHEN visite THEN bouton "Dashboard" apparaît en header

### US-10b : Top-up wallet USDC Base de l'agent via Stripe (sponsor)

- **Persona** : Dev humain sponsor wallet
- **JTBD** : Approvisionner le wallet x402 de son agent IA sans gérer crypto directement
- **Opportunité** : O4 (marginale — rampe onboarding sponsor)
- **Features liées** : F9 (Stripe top-up wallet sponsor), F12 (Stripe Tax)
- **Dépendances** : US-09
- **Effort** : S
- **Note v2** : Cette story remplace US-10 v1 ("Cliquer Stripe Payment Link 4,99 €/jour"). Le flux n'est PLUS "Stripe → JWT 24h illimité" mais "Stripe → top-up wallet USDC Base agent → agent utilise en x402". Sponsor ne reçoit plus un accès direct ; il recharge le wallet de son agent.
- **Critères acceptance** :
  - Happy 1 : GIVEN dev clique CTA "Top-up wallet" sur landing WHEN redirect THEN Stripe Checkout chargé avec montant sélectionnable ($5 / $10 / $50 USDC)
  - Happy 2 : GIVEN dev sélectionne $10 USDC WHEN paie THEN confirmation + instruction "Adresse wallet Base à renseigner : [champ]" + USDC transféré dans 5 min
  - Happy 3 : GIVEN dev en UE B2C WHEN paie THEN Stripe Tax applique TVA FR automatiquement (cf. @legal H4)
  - Erreur 1 : GIVEN paiement carte refusé WHEN Stripe THEN reste sur page Stripe + retry possible
  - Erreur 2 : GIVEN adresse wallet invalide renseignée WHEN transfert THEN email sponsor "adresse invalide, re-saisir"
  - Limite 1 : GIVEN dev veut top-up $1 000 USDC WHEN Stripe THEN plafond $500/transaction (anti-fraude) + possibilité 2e transaction
  - Limite 2 : GIVEN dev sans wallet crypto WHEN tente THEN documentation "Comment créer un wallet USDC Base en 3 min" affichée
  - Permission 1 : GIVEN dev non-authentifié WHEN top-up THEN Stripe gère son propre flow (pas de compte DevRefs requis pour top-up)
  - Données existantes 1 : GIVEN dev a déjà top-up wallet WHEN re-top-up THEN nouvelle transaction indépendante (pas d'historique lié)

### US-11 : Récupérer infos wallet et configurer l'agent

- **Persona** : Dev humain sponsor wallet
- **JTBD** : S'assurer que l'agent est configuré pour payer en x402 avec le wallet approvisionné
- **Opportunité** : O4
- **Features liées** : F10 (JWT optionnel), F26 (dashboard sponsor)
- **Dépendances** : US-10b
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev post top-up visite `/dashboard?token=JWT` WHEN page THEN balance wallet actuelle affichée + nb calls restants Pack Standard si actif
  - Happy 2 : GIVEN dev lit instructions WHEN configure agent THEN snippet clair : `x402-fetch` wrapper + `EVM_PRIVATE_KEY` env var + `RESOURCE_SERVER_URL: https://devrefs.dev`
  - Happy 3 : GIVEN dev avec JWT optionnel WHEN copie dans agent config THEN agent peut skip 402 pour accès sponsor (optionnel, non-recommandé vs pack)
  - Erreur 1 : GIVEN JWT expiré (24 h) WHEN agent tente call avec JWT THEN 401 + body "JWT expired, re-purchase top-up or use x402 pack"
  - Erreur 2 : GIVEN dev oublie de configurer wallet agent WHEN agent appelle endpoint sans X-PAYMENT ni JWT THEN 402 standard
  - Limite 1 : GIVEN dev clique copy snippet 100 fois WHEN copy buffer THEN OK
  - Limite 2 : GIVEN dev sur navigateur sans Clipboard API WHEN copy THEN fallback select + Cmd+C
  - Permission 1 : GIVEN cookie `Secure;HttpOnly;SameSite=Strict` posé WHEN dev re-visite `/dashboard` même session THEN reconnu sans re-saisie
  - Données existantes 1 : GIVEN JWT précédent expiré WHEN nouveau JWT (si re-top-up) THEN ancien définitivement invalide

### US-12 : Consulter le dashboard sponsor (quota pack + wallet balance)

- **Persona** : Dev humain sponsor wallet (Thomas ou superviseur)
- **JTBD** : Piloter l'utilisation et le budget x402 de son agent
- **Opportunité** : O4
- **Features liées** : F26 (dashboard sponsor v2 — quota pack + balance)
- **Dépendances** : US-11
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev avec JWT actif visite `/dashboard?token=JWT` WHEN page rendu THEN affiche : quota pack restant (ex "8 432 calls restants sur Pack Standard"), balance wallet USDC (si lecture possible), dernier audit score si applicable
  - Happy 2 : GIVEN dev consulte sur mobile WHEN page rendu THEN responsive
  - Happy 3 : GIVEN dev refresh WHEN re-fetch THEN données < 1 min de fraîcheur
  - Erreur 1 : GIVEN JWT expiré WHEN visite THEN 401 + redirect landing "JWT expired"
  - Erreur 2 : GIVEN JWT invalide WHEN visite THEN 401 + suggestion top-up wallet
  - Limite 1 : GIVEN dev 0 quota restant WHEN page THEN affiche "Pack épuisé — Acheter Pack Standard $10" + lien direct
  - Limite 2 : GIVEN dev avec Pack Pro (60 000 calls) WHEN affiche THEN compteur exact + % utilisé
  - Permission 1 : GIVEN visiteur sans token WHEN visite `/dashboard` THEN 401 + redirect landing
  - Données existantes 1 : GIVEN JWT expire pendant session WHEN refresh THEN 401 immédiat (pas de page périmée)

### US-13 : Consulter les CGV v2 avec clause audit

- **Persona** : Dev humain sponsor wallet (et agent IA pour conformité aval)
- **JTBD** : Vérifier conformité juridique + garantie audit ROI avant achat
- **Opportunité** : Conformité (cf. @legal)
- **Features liées** : F21 v2, F22, F23
- **Dépendances** : Aucune
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN dev clique "/legal/cgv" WHEN page rendu THEN clause audit présente : "Garantie : si savings_pct < 15 % à 30 jours post-audit → remboursement 50 % du prix de l'audit"
  - Happy 2 : GIVEN dev lit CGV WHEN cherche clause paiement x402 THEN irrévocabilité on-chain clairement mentionnée (paiement x402 = définitif sauf garantie audit)
  - Happy 3 : GIVEN dev cherche clause Stripe top-up WHEN lit THEN "top-up wallet sponsor = service distinct de l'offre commerciale DevRefs, non remboursable"
  - Erreur 1 : GIVEN page legal 404 WHEN visite THEN page erreur custom + lien retour landing
  - Erreur 2 : GIVEN page corrompue WHEN visite THEN fallback texte brut
  - Limite 1 : GIVEN dev imprime CGV WHEN print stylesheet THEN lisible
  - Limite 2 : GIVEN page CGV > 20 KB WHEN rendu THEN load OK (pas hero)
  - Permission 1 : GIVEN visiteur sans cookie WHEN visite THEN 200 sans auth
  - Données existantes 1 : GIVEN CGV mise à jour (changement clause) WHEN dev re-visite THEN nouvelle version + date modif visible

### US-14 : Consulter `/about/data-sources` pour vérifier provenance

- **Persona** : Dev humain sponsor + agent IA (conformité)
- **JTBD** : Vérifier transparence provenance avant achat pack ou audit
- **Opportunité** : O1 (Verifiable)
- **Features liées** : F19
- **Dépendances** : Aucune
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN dev ouvre "/about/data-sources" WHEN rendu THEN liste sources : anthropic.com/pricing, openai.com/api/pricing, google ai pricing, mistral.ai/pricing, npm registry, GitHub releases
  - Happy 2 : GIVEN page rendue WHEN dev lit méthode THEN explication cron 6 h LLM / 24 h SDK + parser regex stable
  - Happy 3 : GIVEN page rendue WHEN dev cherche User-Agent bot THEN `DevRefs-Bot/1.0 (+https://devrefs.dev/bot)` mentionné
  - Erreur 1 : GIVEN page 404 WHEN visite THEN 404 custom
  - Erreur 2 : GIVEN page corrompue WHEN visite THEN fallback texte brut
  - Limite 1 : GIVEN page < 50 KB WHEN rendu THEN OK
  - Limite 2 : GIVEN page imprimable WHEN print THEN lisible
  - Permission 1 : GIVEN visiteur public WHEN visite THEN 200 sans auth
  - Données existantes 1 : GIVEN nouvelle source ajoutée V2 WHEN page mise à jour THEN sources reflètent

### US-15 : Consulter le dashboard interne consolidé (Thomas only)

- **Persona** : Dev humain sponsor — Thomas (admin owner)
- **JTBD** : Pilotage KPI North Star + diagnostic Phase 4
- **Opportunité** : O4 (mesure pilotage)
- **Features liées** : F25 v2 (events `pack_*` + `audit_*`, retrait events Stripe humain pilier)
- **Dépendances** : Aucune (admin only)
- **Effort** : L
- **Critères acceptance** :
  - Happy 1 : GIVEN Thomas admin JWT (long-lived ou IP whitelist) visite `/admin/dashboard` WHEN rendu THEN affiche : revenu net mensuel x402, nb packs vendus 24h, nb audits vendus 24h, latence p95 3 endpoints, sources cron status
  - Happy 2 : GIVEN Thomas consulte WHEN page agrège CF Analytics + Coinbase THEN données < 5 min fresh
  - Happy 3 : GIVEN Thomas mobile WHEN rendu THEN responsive
  - Erreur 1 : GIVEN admin JWT expiré WHEN visite THEN 401 + IP whitelist fallback
  - Erreur 2 : GIVEN une source data (CF ou Coinbase) down WHEN page THEN les autres affichées + warning rouge source down
  - Limite 1 : GIVEN volume 30 jours WHEN aggregation THEN Worker CPU < 50 ms
  - Limite 2 : GIVEN trigger "revenu Audit > 70 % M+3" WHEN dashboard THEN alerte rouge "Trigger pivot audit-only atteint — voir creative-brief v2 § 5"
  - Permission 1 : GIVEN visiteur non-admin WHEN visite `/admin/dashboard` THEN 403 (pas 401 — masquer existence)
  - Données existantes 1 : GIVEN cron planté 2 h WHEN Thomas dashboard THEN warning rouge visible

---

## Mapping stories ↔ features V1 v2 (couverture complète)

| Feature V1 v2                                   | User stories couvrant                   |
| ----------------------------------------------- | --------------------------------------- |
| F1 — `/api/llm-prices`                          | US-03, US-04, US-05, US-07              |
| F1b — `/api/agent-audit`                        | US-16, US-17, US-18, US-19, US-20       |
| F1c — Validation input audit                    | US-16                                   |
| F2 — `/api/sdk-status`                          | US-06                                   |
| F3 — JSON-LD Dataset + dateModified             | US-04, US-07                            |
| F4 — Header Last-Modified                       | US-04                                   |
| F5 — effective_cost_factor                      | US-05                                   |
| F6 — Cron sources                               | US-04 (indirect) — backend              |
| F7 — IndexNow Bing                              | Backend — pas de story user directe     |
| F8 — Middleware x402 unifié 3 endpoints         | US-02, US-03, US-06, US-16              |
| F8b — Pack pré-payé KV quota lookup             | US-08b                                  |
| F9 — Stripe top-up wallet sponsor               | US-10b                                  |
| F10 — JWT HMAC (optionnel)                      | US-11                                   |
| F11 — Cookie Secure JWT                         | US-11                                   |
| F12 — Stripe Tax                                | US-10b                                  |
| F13 — Watermark HMAC                            | Backend (vérifié US-03 via \_signature) |
| F14 — Rate-limit                                | US-12 limites (compteur visible)        |
| F15 — llms.txt 3 endpoints                      | US-01                                   |
| F16 — Landing v2 (2 heroes JSON)                | US-09                                   |
| F17 — Sitemap.xml + robots.txt                  | Backend SEO/GEO                         |
| F18 — OpenAPI 3.1 (3 endpoints)                 | US-08                                   |
| F19 — /about/data-sources                       | US-14                                   |
| F20 — /about/data-schema                        | Backend doc                             |
| F21 v2 — /legal/cgv + clause audit              | US-13                                   |
| F22 — /legal/privacy                            | US-13                                   |
| F23 — /legal/mentions-legales                   | US-13                                   |
| F24 — /bot                                      | US-14 (mentionné)                       |
| F25 v2 — Dashboard interne (pack*\* + audit*\*) | US-15                                   |
| F26 v2 — /dashboard sponsor (quota + balance)   | US-12, US-20                            |

**Couverture** : 100 % features avec parcours user direct couvertes. F7, F13, F17, F20 = features backend sans story user directe — à traiter en Phase 1 functional-specs comme stories techniques.

---

## Stories Phase 4 (post-launch — flags)

| ID              | Owner             | Titre v2                                                                                             | Effort |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------------- | ------ |
| US-21 (Phase 4) | @sales-enablement | Playbook commercial : upsell audit post-pricing call (agent actif sans audit → relance audit $9.99)  | M      |
| US-22 (Phase 4) | @sales-enablement | ROI calculator agent : break-even Pack Standard $10 vs tokens cramés (interactive pour sponsor)      | M      |
| US-23 (Phase 4) | @growth           | Data story earned media : "Opus 4.7 +35 % tokenizer — l'inflation silencieuse"                       | M      |
| US-24 (Phase 4) | @growth           | Data story earned media : "Top 10 SDKs breaking changes Q1-Q2 2026 — ce que votre agent ne sait pas" | M      |

---

## Synthèse backlog v2

| Élément                       | Valeur v2                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nb user stories V1**        | 20 (US-01 à US-08, US-08b, US-09, US-10b, US-11 à US-20)                                                                                                              |
| **Nb stories Phase 4**        | 4 (US-21 à US-24)                                                                                                                                                     |
| **Personas couverts**         | Agent IA autonome (US-01 à US-08b, US-16 à US-20) + Dev sponsor wallet (US-09 à US-15)                                                                                |
| **Couverture features V1 v2** | 100 % features avec parcours user direct                                                                                                                              |
| **Delta v1→v2**               | +6 stories (US-08b, US-16 à US-20), US-10→US-10b réécrit top-up wallet, US-02 enrichi body 402 augmenté, US-01 enrichi 3e endpoint, US-15 recalibré events pack+audit |
| **Verbatim archivé**          | V4 "dev qui paie 4,99 €/jour Stripe Link" — plus référencé dans aucune story v2                                                                                       |
