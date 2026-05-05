<!-- Version: 2026-05-05T11:00 — @data-analyst — Phase 0 wave 3 — KPI Framework DevRefs -->

# KPI Framework — DevRefs

## Résumé exécutif

- **Objectif** : framework analytique complet pour mesurer dès J1 les critères de succès V1 quantifiés (J7 / J30 / J90 / M+6) + KPI North Star (600 €/mois revenu net x402 + Stripe).
- **Décisions clés** : (1) North Star = revenu NET (brut moins frais), pas brut. (2) AARRR adapté B2A double persona (agent IA + dev humain). (3) KPIs spécifiques DevRefs : cohérence promesse↔réalité (size, latence, fraîcheur). (4) Privacy by design zéro-PII confirmé : aucun email, aucune IP brute, aucun User-Agent string complet. (5) Stack analytics 0 € : Cloudflare Workers Analytics Engine + Coinbase facilitator dashboard + Stripe dashboard, consolidés en 1 page interne (F25).
- **Dépendances** : `tracking-plan.md` (events détaillés), `dashboard-specs.md` (maquette F25), `dev-decisions.md` (handoff @fullstack pour implémentation).

---

## 1. North Star Metric (NSM)

### 1.1 Définition

**Revenu net mensuel x402 + Stripe** = revenus bruts (USDC + EUR) convertis en EUR au cours du jour de settle, moins frais facilitator (Coinbase ~0,1 % USDC), moins frais Stripe (~3 % + 0,25 € par tx), moins frais Cloudflare (0 € sur free tier).

### 1.2 Formule de calcul

```
NSM_mois_M = SOMME_jours(j ∈ M) [
  SOMME_tx_x402(j) [ amount_usdc * fx_usd_eur(j) - 0.001 * amount_usdc * fx_usd_eur(j) ]
  +
  SOMME_tx_stripe(j) [ amount_eur - (amount_eur * 0.029 + 0.25) ]
  -
  cf_workers_paid_usage_eur(M)  // 0 € si sous quota free tier
]
```

**Sources** :
- `amount_usdc`, `amount_stripe` : Coinbase facilitator API + Stripe API (settled tx only — exclure pending).
- `fx_usd_eur(j)` : taux de change quotidien (cours BCE 16h CET, fixé pour cohérence comptable BNC cf. @legal H2).
- Frais Coinbase : valeur conservatrice 0,1 % (à ajuster si Coinbase publie barème différent — flagué dans dev-decisions.md).
- Frais Stripe : 2,9 % + 0,25 € (Standard Card EU). Si Apple Pay / Link, mêmes frais.
- Cloudflare Workers Paid (5 $/mois) : déclenché uniquement si > 100 000 req/jour (pas attendu V1).

### 1.3 Fréquence de mesure

| Cadence | Source | Affichage |
|---|---|---|
| **Live** (event-driven) | CF Analytics Engine + webhooks Coinbase + Stripe | Dashboard interne F25, compteur jour |
| **Quotidienne 00:00 UTC** | Cron agrégation | Snapshot KV `metrics:nsm:YYYY-MM-DD` |
| **Mensuelle 1er du mois 06:00 UTC** | Cron consolidation | Email automatique Thomas + snapshot KV `metrics:nsm:YYYY-MM` |

### 1.4 Valeurs cibles (cohérent v1-scope.md § 3.1)

| Échelle | Cible NSM (revenu net mensuel équivalent) | Cible cumulée depuis J0 |
|---|---|---|
| **J7** | N/A (échelle journalière) | >= 5 paiements x402 OU >= 1 JWT actif (test E1 binaire) |
| **J30** | 50 € | 50 € |
| **J90** | 100 € (montée en charge) | 200 € cumulés |
| **M+3** | 300 € | ~400 € cumulés |
| **M+6** | **600 €** (KPI North Star atteint) | ~1 800 € cumulés |
| **M+12** | >= 1 200 € (objectif extension bundle) | ~10 800 € cumulés |

### 1.5 Anti-pattern

- **NE PAS mesurer le revenu BRUT en NSM** : un coût caché (ex : Coinbase change ses frais à 0,5 %) dégraderait silencieusement le NSM net. Mesurer le brut en KPI input (cf. § 2.4) mais pas en NSM.
- **NE PAS mesurer le MRR équivalent** comme NSM principal : Stripe Link 4,99 €/jour n'est pas un abonnement récurrent V1 (cf. roadmap V2). Le MRR équivalent est un KPI input secondaire (§ 2.4).
- **NE PAS lisser sur trailing 30j en J7** : la cible J7 est binaire (5 paiements x402 OU 1 JWT actif) — un lissage masquerait le signal go/no-go.

---

## 2. KPIs AARRR adaptés B2A (double persona)

### 2.1 Acquisition

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Crawls bots IA identifiés (UA-bucket : claude / gpt / perplexity / bing / google) | COUNT(crawl_*) WHERE ua_bucket LIKE 'ai_bot/*' GROUP BY day | CF Analytics Engine | >= 10 | >= 50 | >= 300 |
| Requêtes `llms.txt` | COUNT(crawl_llms_txt_fetched) | CF AE | >= 5 | >= 30 | >= 200 |
| Requêtes `sitemap.xml` | COUNT(crawl_sitemap_fetched) | CF AE | >= 3 | >= 20 | >= 100 |
| Requêtes `openapi.json` | COUNT(crawl_openapi_fetched) | CF AE | >= 1 | >= 10 | >= 50 |
| Visites uniques landing humaine (IP-hash 24h) | COUNT(DISTINCT ip_hash) WHERE event = landing_page_view | CF AE | >= 20 | >= 100 | >= 500 |
| Sources de trafic landing (referrers : Dev.to / Reddit / HN / X / direct) | COUNT(landing_page_view) GROUP BY referrer_bucket | CF AE | N/A J7 | top 5 documenté | top 5 documenté |

**Note B2A** : un "crawl agent" et une "visite humaine" sont mesurés séparément via UA-bucket. Le ratio agent/humain est un KPI de validation persona (§ 2.6).

### 2.2 Activation

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Agents IA détectant 402 (= ratio crawl_endpoint → response_402) | COUNT(api_response_402_sent) / COUNT(api_request_received WHERE path LIKE '/api/*' AND ua_bucket LIKE 'ai_bot/*') | CF AE | >= 80 % (sanity) | >= 90 % | >= 95 % |
| Agents IA tentant paiement après 402 (= ratio 402 → payment_x402_attempt) | COUNT(payment_x402_attempt) / COUNT(api_response_402_sent WHERE ua_bucket LIKE 'ai_bot/*') | CF AE | >= 5 % | >= 10 % | >= 15 % |
| Humains cliquant Stripe Link (= ratio landing_view → cta_clicked) | COUNT(landing_cta_stripe_clicked) / COUNT(landing_page_view WHERE ua_bucket LIKE 'human/*') | CF AE | >= 2 % | >= 5 % | >= 8 % |
| Agents IA complétant paiement x402 (= ratio attempt → completed) | COUNT(payment_x402_completed) / COUNT(payment_x402_attempt) | CF AE + Coinbase | >= 80 % (sanity protocole) | >= 90 % | >= 95 % |
| Humains complétant Stripe checkout | COUNT(payment_stripe_checkout_completed) / COUNT(landing_cta_stripe_clicked) | Stripe dashboard | >= 30 % | >= 40 % | >= 50 % |

### 2.3 Rétention

| KPI | Formule | Outil | Cible J7 | Cible M+1 | Cible M+6 |
|---|---|---|---|---|---|
| Wallets x402 récurrents (>= 2 paiements en 7j) | COUNT(DISTINCT wallet_hash) WHERE COUNT(payment_x402_completed) >= 2 IN trailing_7d | CF AE | N/A J7 | >= 3 wallets | >= 30 wallets |
| JWT humains réutilisés > 1 fois en 24h | COUNT(DISTINCT jwt_id) WHERE COUNT(payment_jwt_validated) > 1 IN 24h_post_issuance | CF AE | >= 50 % JWT | >= 70 % JWT | >= 85 % JWT |
| Renouvellements quotidiens Stripe Link même customer (signal V2 mensuel) | COUNT(DISTINCT customer_id) WHERE COUNT(stripe_checkout_completed) >= 5 IN trailing_7d | Stripe dashboard | N/A J7 | >= 1 customer | >= 5 customers |

**Note B2A** : la rétention agent IA est mesurée par récurrence du **wallet** (pseudonyme blockchain), pas par identité personnelle. Un wallet qui revient = un agent (ou un humain pilotant un agent) qui revient.

### 2.4 Revenue

| KPI | Formule | Outil | Cible M+6 |
|---|---|---|---|
| Revenu BRUT x402 (€) | SUM(amount_usdc * fx_usd_eur) | Coinbase | >= 305 € |
| Revenu BRUT Stripe (€) | SUM(amount_eur) | Stripe | >= 320 € |
| Revenu NET (= NSM, cf. § 1.2) | cf. § 1.2 | Calcul agrégé | >= 600 € |
| MRR équivalent Stripe (signal abonnement V2) | (revenu Stripe trailing_30d / 30) * 30 | Stripe | indicateur, pas cible V1 |
| ARPU x402 | SUM(amount_x402) / COUNT(DISTINCT wallet_hash) | CF AE + Coinbase | indicateur diagnostic |
| ARPU Stripe | SUM(amount_stripe) / COUNT(DISTINCT customer_id) | Stripe | indicateur diagnostic |
| % revenu x402 vs Stripe | revenu_x402_brut / revenu_total_brut | dashboard agrégé | cible cohérente positionnement B2A : >= 40 % x402 |

### 2.5 Referral (mesurable Phase 4 par @geo)

| KPI | Formule | Outil | Cible M+1 | Cible M+6 |
|---|---|---|---|---|
| Citations Perplexity / Claude / ChatGPT mentionnant "DevRefs" | requête manuelle ou outil GEO (ahrefs Brand Radar gratuit, alternative @geo Phase 4) | manuel + tooling Phase 4 | >= 5 | >= 30 |
| Backlinks organiques Dev.to / Reddit / HN | COUNT(landing_page_view) WHERE referrer_bucket IN ('devto', 'reddit', 'hn') GROUP BY referrer_url | CF AE | >= 3 sources distinctes | >= 10 sources |
| Forks GitHub / MCP servers dérivés | manuel (recherche GitHub "DevRefs") | manuel | N/A V1 | >= 1 mention |
| Mentions HN/Reddit/X spontanées (search "devrefs") | manuel + alerts Google Alerts gratuit | manuel | >= 1 | >= 5 |

**Note Phase 4 @geo** : instrumentation citations LLM est complexe (pas d'API publique sur Perplexity/Claude/ChatGPT). Méthode V1 : recherche manuelle hebdo avec query types ("LLM pricing 2026", "Anthropic Opus 4.7 pricing", "Vercel AI SDK breaking changes"). V2 : outil dédié si signal d'intérêt (ahrefs Brand Radar 99 $/mois est hors budget V1).

### 2.6 Validation persona (référence brand-platform.md / personas.md)

3 métriques pour vérifier que les personas sont réels et pas hypothèses :

| KPI validation persona | Formule | Cible M+1 | Verdict si raté |
|---|---|---|---|
| Ratio agents IA identifiés (UA bot reconnaissable) sur trafic API | COUNT(api_request_received WHERE ua_bucket LIKE 'ai_bot/*') / COUNT(api_request_received) | >= 50 % | persona principal NON validé → revoir positionnement B2A |
| Latence avant 1er paiement après détection 402 (médiane) | MEDIAN(timestamp_payment_x402_attempt - timestamp_response_402_sent) GROUP BY session | < 5 secondes | comportement non-autonome → revoir intégration MCP |
| Ratio Stripe Link clic depuis IP avec cookie session existant vs IP unique sans cookie | COUNT(landing_cta_stripe_clicked WHERE has_session_cookie = true) / COUNT(landing_cta_stripe_clicked) | >= 30 % | dev humain pas identifiable → revoir UX humaine |

---

## 3. KPIs spécifiques DevRefs (au-delà AARRR)

### 3.1 Cohérence promesse↔réalité (renforcement #12 zéro fausse promesse)

| KPI | Formule | Outil | Cible | Alerte |
|---|---|---|---|---|
| Taille payload p50 / p95 / p99 (par endpoint) | PERCENTILE(quality_payload_size_bytes, [50, 95, 99]) GROUP BY path | CF AE | p99 < 50 KB | p99 > 50 KB → ROUGE (promesse landing brisée) |
| Latence endpoint p50 / p95 / p99 (par endpoint) | PERCENTILE(quality_latency_ms, [50, 95, 99]) GROUP BY path | CF AE | p95 < 200 ms | p95 > 200 ms → ORANGE |
| Fraîcheur réelle (= now - dateModified payload) | MEDIAN(now - dateModified) GROUP BY path | CF AE | < 6h pricing, < 24h SDK | dépassement seuil → ROUGE (cron probable down) |
| % requêtes avec `dateModified` < 24h | COUNT(api_response_200_sent WHERE freshness_hours < 24) / COUNT(api_response_200_sent) | CF AE | 100 % | < 100 % → investiguer cron |

### 3.2 Validation hypothèses business

| Hypothèse | KPI de validation | Outil | Cible J30 |
|---|---|---|---|
| H1 : agent IA achète en autonomie un payload à 0,49 € | ratio crawl bot → payment_x402_completed | CF AE | >= 5 % |
| H2 : agent préfère payer 0,49 € que cramer 64 K tokens | latence avant 1er paiement après 402 (cf. § 2.6) | CF AE | < 5 s |
| Friction protocole x402 acceptable | ratio payment_x402_attempt → payment_x402_completed | CF AE + Coinbase | >= 80 % |
| V4 verbatim : humain bascule Stripe quand facture > 3 €/jour | ratio sessions wallet avec cumul_jour > 3€ → clic Stripe Link 24h après | CF AE + Coinbase + Stripe | indicateur diagnostic |

### 3.3 Validation pricing

| KPI | Formule | Cible | Décision si raté |
|---|---|---|---|
| Élasticité prix (test Phase 4 si 5-15 ventes J7 — cf. project-context.md plan d'action) | (volume_après_bump - volume_avant_bump) / volume_avant_bump | drop < 30 % entre 0,49 € et 0,99 € | si drop > 30 % → conserver 0,49 € |
| ARPU x402 mensuel | cf. § 2.4 | indicateur diagnostic | < 0,49 € → wallet ne re-paie pas (problème UX ou valeur) |
| ARPU Stripe mensuel | cf. § 2.4 | indicateur diagnostic | si 4,99 €/jour pas renouvelé > 1× → revoir packaging |

---

## 4. Validation persona — détaillée (cf. § 2.6)

3 métriques pour confirmer que les personas définis dans `personas.md` (agent IA principal + dev humain secondaire) sont réels et non pas hypothèses :

1. **Ratio agents IA identifiés** : si > 50 % du trafic API a un UA-bucket reconnaissable (`claude`, `gpt`, `perplexity`, `mistral`, `agentkit`, `cursor`, `mcp`), persona principal validé. Si < 20 %, persona principal NON validé → repositionner ou changer canal d'acquisition.

2. **Latence avant 1er paiement** : un agent autonome qui détecte 402 et réagit en < 5 s prouve l'autonomie machine. Si > 60 s médiane, c'est un humain qui regarde la réponse 402 et décide manuellement → reconsidérer l'angle B2A.

3. **Ratio session-cookie sur clics Stripe** : un humain qui clique Stripe Link depuis une session cookie active (déjà venu sur la landing) prouve un parcours d'acquisition humain réel (vs accident). Cible >= 30 %.

---

## 5. Privacy by design (zéro-PII confirmé)

### 5.1 Données NON collectées (interdit absolu)

- **Aucune adresse email** côté DevRefs (Stripe gère les emails customer dans son propre flow, hors scope DevRefs Analytics).
- **Aucune adresse IP brute** stockée. IP utilisée pour rate-limit puis hashée SHA256(IP + daily_salt) avec rotation salt quotidienne. Hash supprimé après 24h via TTL CF KV.
- **Aucun User-Agent string complet** : extraction d'un `ua_bucket` catégoriel uniquement (`ai_bot/claude`, `ai_bot/gpt`, `ai_bot/perplexity`, `ai_bot/mistral`, `ai_bot/agentkit`, `ai_bot/cursor`, `ai_bot/mcp`, `ai_bot/other`, `human/desktop`, `human/mobile`, `unknown`). Le UA brut est jeté immédiatement après extraction.
- **Aucun mapping wallet → JWT** : un wallet x402 et un JWT Stripe sont 2 identités distinctes, jamais reliées dans les analytics. L'anonymat persona principal (agent IA) est préservé.
- **Aucun cookie tiers** (analytics ou marketing). Seul cookie posé : JWT post-Stripe `Secure;HttpOnly;SameSite=Strict` (strictement nécessaire, exempté consentement RGPD art. 82 LIL).
- **Aucun outil analytics tiers** : pas de Google Analytics, pas de PostHog, pas de Mixpanel, pas d'Amplitude. CF Analytics Engine est server-side uniquement (pas de pixel JS chargé sur le navigateur humain pour la mesure de base).

### 5.2 Données collectées (justifiées)

| Donnée | Pourquoi collectée | Anonymisation | Rétention |
|---|---|---|---|
| `ua_bucket` (catégoriel) | Validation persona principal vs secondaire (§ 2.6, § 4) | catégorisation immédiate, UA brut jeté | 30 jours (CF AE retention) |
| `path`, `method`, `status_code` | Mesure fonnel API (Activation § 2.2) | aucune PII | 30 jours |
| `wallet_hash` (SHA256 wallet x402) | Rétention agents (§ 2.3) | wallet déjà pseudonyme blockchain, hashage supplémentaire | 30 jours |
| `jwt_id` (UUID v4 random) | Rétention humains (§ 2.3) | UUID non corrélable à un email Stripe | 30 jours |
| `customer_id` Stripe | Rétention paiements humains (§ 2.3) | identifiant Stripe pseudonyme, jamais lié à l'email côté DevRefs | 30 jours côté analytics, 10 ans côté Stripe (compta) |
| `referrer_bucket` (catégoriel : devto / reddit / hn / x / direct / other) | Sources de trafic (§ 2.1) | URL référente brute jetée | 30 jours |
| `payload_size_bytes`, `latency_ms`, `freshness_hours` | Cohérence promesse↔réalité (§ 3.1) | aucune PII | 30 jours |

### 5.3 Conformité

- Cohérent `legal-audit.md` § 1.1 (zéro PII confirmé).
- Cohérent `rgpd-checklist.md` § 7.1 (aucun cookie tiers, JWT exempté consentement).
- Cohérent `privacy-policy.md` (aucun analytics tiers déclaré).
- Cohérent founder-prefs (anti-vendor lock-in, budget analytics 0 €).
- Pas de bannière cookies requise V1.

---

## 6. Mapping KPIs ↔ critères de succès V1 (vérification couverture)

| Critère succès V1 (v1-scope.md § 3) | KPI(s) du framework qui mesure(nt) |
|---|---|
| J7 >= 5 paiements x402 OU >= 1 JWT | Revenue § 2.4 (compteur jour) + Activation § 2.2 |
| J30 >= 50 € revenu net | NSM § 1.2 (snapshot J30) |
| J90 >= 200 € revenu net | NSM § 1.2 (cumul J0-J90) |
| M+6 >= 600 €/mois (NSM) | NSM § 1.2 (mois M+6) |
| Crawl agent uniques / 24h cibles | Acquisition § 2.1 ligne 1 |
| Ratio crawl → paiement cibles | Activation § 2.2 ligne 2 + Validation hypothèses § 3.2 |
| Citations Perplexity cibles | Referral § 2.5 ligne 1 |
| % payloads `dateModified` < 24h | Cohérence § 3.1 ligne 4 |
| Latence p95 endpoints < 200 ms | Cohérence § 3.1 ligne 2 |

100 % des critères de succès V1 sont mesurés par >= 1 KPI du framework. Cohérence cross-fichiers vérifiée.

---

## 7. Flags Phase 4 (autres agents)

- **@sales-enablement (F27 + F28)** : KPIs utiles au playbook commercial = ARPU x402 + ARPU Stripe + nb paiements x402 cumulés (social proof "X paiements x402 en N jours") + ratio renouvellement Stripe Link (ROI calculator).
- **@growth (F29 + F30)** : data stories possibles depuis les KPIs = top 5 modèles consultés (data story "Quels modèles les agents IA consultent en 2026"), top 5 SDKs avec breaking changes (data story F30), volume crawls agents par UA-bucket (data story "1 000 agents IA ont crawlé devrefs.dev en 30j" si seuil atteint M+1).
- **@geo (Phase 4)** : instrumentation citations LLM (cf. § 2.5) — méthode V1 manuelle, V2 outil si budget débloqué.

---

## Handoff @data-analyst → tracking-plan.md (étape suivante du même agent)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/analytics/kpi-framework.md`
- **Décisions prises** : NSM = revenu NET, AARRR adapté B2A double persona, KPIs spécifiques DevRefs (cohérence promesse↔réalité), zéro-PII confirmé, stack analytics 0 € (CF AE + Coinbase + Stripe).
- **Points d'attention pour tracking-plan.md** :
  - Tous les KPIs ci-dessus doivent être instrumentés via events détaillés dans tracking-plan.md.
  - Naming convention `{domain}_{verb}_{object}` (cf. § 2 du tracking-plan).
  - Anti-PII : chaque event doit être validé contre la liste § 5.1.
