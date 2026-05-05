<!-- Version: 2026-05-05T15:50 — @creative-strategy — Phase 0 v2 RELANCE — concurrence indirecte audit ajoutée -->
# Benchmark concurrentiel — DevRefs (v2 pure B2A)

## Résumé exécutif

- **Concurrence directe v2 (inchangée v1)** : pricepertoken.com, costgoat.com, devtk.ai, llm-prices.com → tous SEO HTML humain-first sur "LLM pricing comparison". Aucun ne facture l'agent en x402. Aucun ne sert d'audit cross-provider. **DevRefs reste seul sur le quadrant `agent-payeur x402 + cost intelligence pre+post-flight`.**
- **Concurrence indirecte v2 (NOUVEAU sur l'audit)** : **Langfuse** ($29/mo), **Helicone** ($79/mo), **Braintrust** ($249/mo), **LangSmith** (LangChain, freemium puis $39/seat/mo), **Latitude** (open-source, hosted $50+/mo). Tous = dashboards humains, login obligatoire, facturation SaaS humaine. **Aucun ne facture l'agent directement en x402, aucun ne propose une API audit one-shot consommée par l'agent en autonomie.**
- **Trou de marché DevRefs identifié** : `Audit cross-provider payable par l'agent en x402, sans login, sans dashboard, sans subscription humain`. Espace concurrentiel libre confirmé v2.
- **Risque concurrence 6-12 mois** : Anthropic Token Counting endpoint déjà existant (`POST /v1/messages/count_tokens`), Claude Code Optimizer (rumeur Anthropic Q3 2026), Coinbase x402 reference implementations qui pourraient inspirer un concurrent gratuit. Mitigation : exécution rapide V1 + Audit one-shot $9.99 défensif (ticket élevé, marge 99 %).

---

## 1. Concurrence directe — Calcul coût (Offre 1)

### 1.1 Tableau comparatif (mai 2026)

| Acteur | Format | Modèle économique | Audience | x402 ? | `dateModified` JSON-LD ? | Atomicité payload ? | Anti-pattern vs DevRefs |
|---|---|---|---|---|---|---|---|
| **pricepertoken.com** | HTML SEO + MCP server gratuit | Gratuit, monétisation indirecte (pub future ?) | Humain dev qui compare modèles | NON | NON | NON (300+ modèles dans 1 page) | Page HTML 380 KB pour 2 nombres → agent crame 38 900 tokens parsing |
| **costgoat.com** | HTML SEO + calculator JS | Gratuit, lead-magnet vers SaaS observability | Humain dev qui calcule budget | NON | NON | NON (multi-modèle UI) | Calculator JS = pas API, pas crawlable agent |
| **devtk.ai** | Aggregator SaaS humain | Freemium (limité) puis $19/mo | Humain dev/PM | NON | Partiel (mtime header non aligné JSON-LD) | NON | UI dashboard, login requis |
| **llm-prices.com** | HTML SEO statique | Gratuit, pas de monétisation visible | Humain dev | NON | NON | NON | Statique mais 14 200 tokens parsing pour tableau complet |

### 1.2 Différenciation DevRefs (Offre 1)

| Levier | DevRefs Offre 1 v2 | Concurrents directs |
|---|---|---|
| **Paiement agent x402** | OUI — body 402 augmenté avec `roi_summary` + `alternative_cost_estimate` (cf. `x402-response-spec.md` § 2.1) | NON — tous gratuits ou SaaS humain |
| **Atomicité payload** | OUI — 1 query = 1 modèle, < 50 KB | NON — payload monolithique 300 modèles |
| **Fraîcheur signalée machine-readable** | OUI — JSON-LD `Dataset.dateModified` + header HTTP `Last-Modified` + champ `fetched_at` + `freshness_proof.hmac_signature` | NON — pas de signal explicite, agent doit deviner |
| **`effective_cost_factor` (capte tokenizer +35% Opus 4.7)** | OUI — champ dédié | NON — aucun ne capte ce signal |
| **`alternative_cost_estimate` dans body 402** | OUI — montre ROI 490× directement à l'agent | N/A (pas de 402) |
| **Pricing pack pré-payé** | OUI — Pack Discovery $5 / Standard $10 / Pro $50 (réduit friction signature x402) | N/A |

### 1.3 Strategy Canvas — DevRefs Offre 1 vs concurrents directs

```
Levier                              | DevRefs | pricepertoken | costgoat | devtk | llm-prices
------------------------------------|---------|---------------|----------|-------|------------
Atomicité payload (< 50 KB)         |   5     |       1       |    1     |   2   |     1
Fraîcheur signalée machine-readable |   5     |       1       |    1     |   2   |     1
Paiement agent x402 natif           |   5     |       0       |    0     |   0   |     0
ROI exposé dans body 402            |   5     |       0       |    0     |   0   |     0
JSON-LD Dataset + sameAs            |   5     |       1       |    0     |   1   |     0
effective_cost_factor               |   5     |       0       |    0     |   0   |     0
llms.txt monétisé                   |   5     |       2       |    0     |   0   |     0
SEO humain (volume)                 |   2     |       5       |    4     |   3   |     3
Catalogue modèles couverts (volume) |   3     |       5       |    4     |   4   |     4
```

DevRefs gagne 7 leviers sur 9. Perd 2 (SEO humain volume, catalogue volume) — assumés car DevRefs cible l'agent, pas l'humain.

---

## 2. Concurrence INDIRECTE — Audit (Offre 2) — NOUVEAU v2

### 2.1 Tableau comparatif observabilité / cost intelligence LLM (mai 2026)

| Acteur | Format | Pricing | Audience | x402 ? | API audit one-shot ? | Cross-provider ? | Anti-pattern vs DevRefs |
|---|---|---|---|---|---|---|---|
| **Langfuse** | SaaS dashboard observability open-source + cloud | Cloud Hobby gratuit (limité) → Pro $29/mo → Team $199/mo. Self-hosted gratuit. | Humain dev/PM qui supervise agents en prod | NON | NON (dashboard interactif) | OUI (multi-LLM) | Dashboard humain, login obligatoire, intégration via SDK serveur (pas API d'audit consommable agent) |
| **Helicone** | SaaS proxy LLM + dashboard | Free 100K req/mo → Growth $79/mo → Enterprise sur devis | Humain dev/PM | NON | NON | OUI (proxy multi-LLM) | Proxy = ajoute latence, dashboard humain, pas d'audit autonome agent |
| **Braintrust** | SaaS evals + observability + prompt playground | Gratuit limité → Pro $249/mo → Enterprise sur devis | Humain ML/AI engineer | NON | NON | OUI | Pricing premium, dashboard humain, focus eval pas cost optimization pure |
| **LangSmith** (LangChain) | SaaS observability + tracing | Developer freemium → Plus $39/seat/mo → Enterprise sur devis | Humain LangChain user | NON | NON | Partiel (LangChain-centric mais multi-LLM) | Couplé écosystème LangChain, dashboard humain, paiement par seat |
| **Latitude** | Open-source observability + prompt management, hosted optionnel | Self-hosted gratuit, hosted ~$50+/mo (pricing variable) | Humain dev/PM | NON | NON | OUI | Pas d'API audit consommable agent en x402 |

### 2.2 Trou de marché identifié v2

**Aucun acteur cité ne propose** :
1. Une API d'audit one-shot consommable par l'agent en autonomie (POST + payment + response).
2. Un paiement x402 natif (tous = subscription SaaS humain $29-$249/mo).
3. Un rapport audit JSON structuré conçu pour parsing agent (vs UI interactive humaine).
4. Une approche "audit ponctuel" vs "monitoring continu" (subscription récurrente).

**DevRefs Offre 2 occupe ce quadrant seul** :

```
                  Audit ponctuel one-shot (pay-per-audit)
                            ▲
                            │
                  DevRefs ● │  (cible : x402 $9.99 + JSON pour agent)
                            │
                            │
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ▶ Cible humain (login dashboard)
                            │
                            │
                            │  Langfuse $29 ● Helicone $79 ●
                            │  Braintrust $249 ● LangSmith $39/seat ●
                            │  Latitude $50+ ●
                            │
                  Monitoring continu (subscription récurrente humaine)
```

### 2.3 Avantages décisifs DevRefs Offre 2

| Avantage | DevRefs Audit | Concurrents indirects |
|---|---|---|
| **Pas de compte / login** | OUI | NON (tous SaaS) |
| **Paiement par l'agent en autonomie** | OUI ($9.99 USDC x402) | NON (carte CB humain) |
| **Audit one-shot vs subscription** | OUI ($9.99 ou Pack Pro $49 = 6 audits) | NON (tous récurrent mensuel) |
| **Rapport JSON structuré pour agent** | OUI (`recommendations[]` avec `id`, `saving_usd`, `confidence`) | NON (UI dashboards) |
| **Garantie remboursement si savings < 15 %** | OUI (CGV cf. `agent-economics.md` § D.4) | NON |
| **Cross-provider sans intégration SDK serveur** | OUI (input = config + sample traces, agnostique) | NON (la plupart exigent SDK serveur ou proxy) |

---

## 3. Risque concurrence 6-12 mois

### 3.1 Concurrents potentiels qui pourraient entrer

| Acteur potentiel | Risque | Probabilité | Mitigation DevRefs |
|---|---|---|---|
| **Anthropic Token Counting** (`POST /v1/messages/count_tokens`) | Existe déjà mais ne donne PAS le prix par MTok à jour. Si Anthropic ajoute un endpoint pricing officiel gratuit avec `dateModified` machine-readable, DevRefs Offre 1 pricing-Anthropic devient obsolète sur Anthropic uniquement | Moyenne (Q3-Q4 2026) | DevRefs reste pertinent multi-provider (OpenAI, Google, Mistral, DeepSeek). Pivoter Offre 1 vers cross-provider exclusif. Pousser Offre 2 audit (cross-provider par construction) |
| **Claude Code Optimizer** (rumeur Anthropic Q3 2026) | Anthropic pourrait lancer un audit cost optimizer intégré natif à Claude Code, gratuit, single-provider | Moyenne (rumeur non confirmée) | Différenciation cross-provider (audit Sonnet + Opus + Haiku + GPT-5 + Gemini + Mistral simultanément). DevRefs vend la cross-provider, pas le single-vendor lock-in |
| **Coinbase x402 reference implementations** | Coinbase publie des examples x402 sur GitHub. Quelqu'un pourrait fork un endpoint pricing gratuit | Élevée (community-driven) | DevRefs garde l'avance par : (a) qualité freshness (cron 6h vs cron daily/weekly fork), (b) `effective_cost_factor` exclusif, (c) Audit Offre 2 défensif (ticket $9.99, marge 99 %) |
| **Langfuse / Helicone ajoutent une API audit** | Si un concurrent indirect lance une API audit one-shot consommable agent | Faible (12-18 mois — gros pivot pour eux) | Avantage premier entrant + branding "agent-first absolu" + intégration MCP host native |
| **Subscription Pro Cost Regression Alerts** par concurrent | Si quelqu'un lance le sticky monitoring multi-provider en x402 V2 sessions | Faible (dépend maturité x402 V2) | DevRefs lance V2 si signal demande post-V1 (M+3 si signal) — first-mover sur sa propre roadmap |

### 3.2 Anti-fragilité v2

DevRefs est anti-fragile par construction sur 3 axes :
1. **Cross-provider** — un acteur LLM peut concurrencer son propre pricing, pas le pricing des concurrents
2. **API-only no-UI** — pas de dette UX dashboard à maintenir, focus 100 % qualité freshness + ROI exposé
3. **Pricing dégressif packs** — Pack Pro $50 / 60K calls est sticky (l'agent qui a un pack actif ne change pas de fournisseur en cours de pack)

---

## 4. Veille trimestrielle (handoff @growth + @data-analyst)

À surveiller chaque trimestre via WebSearch + suivi GitHub stars + lecture changelogs :

| Source | Fréquence | Signal à surveiller |
|---|---|---|
| `coinbase/x402` GitHub releases | Mensuelle | Nouvelle référence implementation, breaking change protocole, V2 SDK maturity |
| Anthropic / OpenAI / Google docs releases | Mensuelle | Nouveau endpoint pricing officiel ou audit officiel intégré |
| Langfuse / Helicone / Braintrust changelogs | Trimestrielle | Roadmap public mentionnant audit API agent ou x402 |
| pricepertoken / costgoat / devtk / llm-prices | Trimestrielle | Migration vers x402 ou ajout `dateModified` JSON-LD |
| Latitude / LangSmith / Phoenix (Arize) | Trimestrielle | Convergence vers cost optimization pur |
| Hacker News / r/LocalLLaMA / r/ClaudeAI | Hebdomadaire (alerte) | Mention concurrent émergent x402 audit |

---

## 5. Synthèse handoff aval v2

| Élément | Décision v2 |
|---|---|
| **Concurrents directs (Offre 1)** | pricepertoken, costgoat, devtk, llm-prices — tous SEO humain, aucun x402 |
| **Concurrents indirects (Offre 2 audit)** | Langfuse $29, Helicone $79, Braintrust $249, LangSmith $39/seat, Latitude $50+ — tous dashboards humains |
| **Trou de marché DevRefs** | Audit cross-provider payable agent x402, one-shot, JSON structuré, sans login |
| **Risque 6-12 mois** | Anthropic Token Counting évolution, Claude Code Optimizer rumeur Q3 2026, Coinbase x402 reference forks |
| **Mitigation** | Cross-provider exclusif + Audit one-shot défensif + exécution rapide V1 + Pack pré-payé sticky |
| **Veille trimestrielle** | 6 sources listées, handoff @growth + @data-analyst |

---

## Handoff @creative-strategy → @orchestrator (Phase 0 v2 RELANCE)

- Statut : COMPLETE (ce fichier)
- Section concurrence indirecte audit AJOUTÉE v2 : Langfuse/Helicone/Braintrust/LangSmith/Latitude
- Trou de marché identifié : audit cross-provider payable agent x402, one-shot
- Risque concurrence 6-12 mois documenté : Anthropic Token Counting, Claude Code Optimizer (rumeur), Coinbase x402 reference forks
- Mitigation : cross-provider exclusif + Audit défensif + first-mover Subscription Pro V2
- Veille trimestrielle 6 sources handoff @growth + @data-analyst
