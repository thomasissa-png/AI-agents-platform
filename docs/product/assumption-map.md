<!-- Version: 2026-05-05T15:30 — @product-manager — Phase 0 v2 wave 2 — Assumption Map DevRefs PIVOT 100% B2A -->

# Assumption Map — DevRefs v2

## Résumé exécutif

- **Pivot acté 2026-05-05** : H3 (dev humain Stripe Link 4,99 €/jour) retirée comme hypothèse principale — Stripe humain banni pilier.
- **10 hypothèses business v2** (8 v1 ajustées + H9 audit ROI + H10 adoption x402 volume).
- **5 hypothèses techniques** conservées + ajout HT6 (audit heuristiques statiques fiables sans IA runtime).
- **Test E1 J7 binaire recalibré** : threshold passé de >= 5 paiements (v1) à >= 1 paiement x402 réel d'un agent IA autonome (v2) — preuve de fonctionnement end-to-end prime sur le volume.
- **Mitigation v2** : sans Stripe humain pilier, la seule mitigation si H1+H10 invalidées = GEO push + diagnostic SEO/GEO + Stripe transitoire.
- Source pricing : `docs/ia/agent-economics.md` § C.1. Zéro invention.

---

## 1. Matrice 2×2 v2 (preuve × criticité)

```
                   PREUVE FAIBLE                       PREUVE MOYENNE                       PREUVE FORTE
                  ┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
   CRITICITÉ      │  H1 — Agent IA achète Pack       │  H2 — Capacité technique x402   │                                 │
   HAUTE          │  $10 ou Audit $9.99 en autonomie │  agents en 2026                 │                                 │
                  │  (TEST PRIORITAIRE E1 J7 binaire)│  (Coinbase + AWS + Cloudflare)  │                                 │
                  │                                  │                                 │                                 │
                  │  H10 — 66 transactions/mois      │  H6 — Anthropic/OpenAI ne       │                                 │
                  │  atteignables à M+6              │  lanceront pas équivalent       │                                 │
                  │  (adoption x402 suffisante)      │  gratuit < 6 mois               │                                 │
                  │                                  │                                 │                                 │
                  │  H4 — Marché B2A 12-18 mois      │                                 │                                 │
                  │  fenêtre d'opportunité           │                                 │                                 │
                  │                                  │                                 │                                 │
                  ├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
   CRITICITÉ      │  H9 — Audit ROI 30-50 %          │  H5 — Cron 6 h suffit pour      │  H8 — Cloudflare Workers free   │
   MOYENNE        │  économies réelles validables    │  fraîcheur perçue agent         │  tier OK 100 K req/jour         │
                  │  sur agent >= 5M tok/mois        │  (vs temps-réel)                │  (docs CF)                      │
                  │                                  │                                 │                                 │
                  ├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
   CRITICITÉ      │  H3 — ⚠️ ARCHIVÉE v2             │  H7 — Coinbase x402 facilitator  │                                 │
   BASSE          │  (Stripe humain pilier banni)    │  stable gratuit 12+ mois        │                                 │
                  │                                  │                                 │                                 │
                  └─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

**Lecture** : zone CRITICITÉ HAUTE × PREUVE FAIBLE = priorité absolue de test. H1 + H10 sont les paris fondateurs v2. H3 est archivée (Stripe humain pilier banni). H9 est ajoutée (audit ROI).

---

## 2. Hypothèses détaillées

### H1 — Un agent IA achète un Pack pré-payé $10 ou un Audit $9.99 en x402 en autonomie

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — verbatim V1 analytique @ia (project-context.md), 28 k$/jour x402 marché mars 2026 (preuve indirecte) |
| **Criticité** | HAUTE — hypothèse fondatrice v2. Si fausse, 100 % du revenue cible s'effondre (v2 sans fallback Stripe pilier) |
| **Test de validation** | E1 J7 binaire : >= 1 paiement x402 réel dans les 7 jours suivant publication llms.txt + 2 posts Dev.to + 1 post Reddit. **Threshold = 1 (pas 5 comme v1)** : v2 valide la mécanique end-to-end avant de viser le volume |
| **Mitigation si invalidée** | (a) Diagnostic SEO/GEO — agents ne trouvent pas DevRefs → push GEO + IndexNow. (b) Si J14 toujours 0 → activation Stripe humain transitoire (perte différenciation B2A mais revenu). (c) Pivot super-niche specs RFC/OpenAPI (cf. brand-platform.md v2 § 7) |
| **Statut** | À tester (V1) |
| **Lien feature V1** | Middleware x402 (S3.1) + pack KV (S3.1b) + audit endpoint (S5.1) + llms.txt 3 endpoints |

### H2 — Les agents IA en 2026 ont la capacité technique de payer en x402

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — Coinbase x402 docs (mai 2025), AWS x402 agentic commerce 2026, ~119 M tx Base + 35 M Solana mars 2026, `x402-axios`/`x402-fetch` wrappers opérationnels (cf. `agent-integration.md`) |
| **Criticité** | HAUTE — sans capacité technique, H1 est intestable |
| **Test de validation** | Mesure J7 : nb wallets distincts ayant tenté paiement x402 (réussi OU échoué). >= 1 wallet distinct = capacité confirmée |
| **Mitigation si invalidée** | Stripe top-up wallet sponsor comme rampe onboarding crypto — aide les agents non-x402-natifs à transitionner |
| **Statut** | À mesurer (V1) |
| **Lien feature V1** | Middleware x402 (S3.1) + pack KV (S3.1b) + agent-integration.md wrappers |

### H3 — ⚠️ ARCHIVÉE v2 — "Dev humain accepte Stripe Link 4,99 €/jour"

| Champ | Valeur |
|---|---|
| **Statut** | **ARCHIVÉE** — Stripe humain banni comme pilier (décision Thomas 2026-05-05). Hypothesis non applicable v2 |
| **Remplacement** | H10 (adoption x402 volume) et H9 (audit ROI) prennent le relai |
| **Mitigation conservée** | Stripe top-up wallet sponsor reste optionnel comme rampe, mais ne génère pas de revenu DevRefs direct |

### H4 — Le marché B2A se développe dans une fenêtre 12-18 mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — sources B2A 2026 (Medium @inesvallot fév 2026, Kantar B2A 2026, AWS x402 agentic commerce 2026) |
| **Criticité** | HAUTE — fenêtre temporellement bornée (project-context.md ligne 192 : "12-18 mois d'avance estimés") |
| **Test de validation** | Veille concurrentielle mensuelle : pricepertoken/costgoat/devtk pivot vers x402 ? Anthropic Token Counting / Claude Code Optimizer rumeurs Q3 2026 (cf. competitive-benchmark v2 § 6) |
| **Mitigation si invalidée** | Si concurrent x402 < 6 mois → accélérer V2 (MCP server, Cost Regression Alerts). Si Anthropic gratuit → super-niche specs |
| **Statut** | Veille continue mensuelle |
| **Lien feature V1** | GEO entité nommée + JSON-LD Dataset + llms.txt monétisé |

### H5 — Cron 6 h suffit pour fraîcheur perçue agent

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — pricing LLM bouge par semaine, SDK par jour. Cron 6 h capture bien le delta |
| **Criticité** | MOYENNE |
| **Test de validation** | Mesure M+1 : % requêtes avec `dateModified` > 24 h dans payload. Si > 5 % → bump cron 6 h → 3 h ou 1 h |
| **Mitigation si invalidée** | Augmenter fréquence cron (CF Workers cron = par heure OK sur free tier) |
| **Statut** | À mesurer (V1) |
| **Lien feature V1** | Cloudflare Worker cron 6 h + champ `fetched_at` |

### H6 — Anthropic / OpenAI / Google ne lanceront pas un endpoint pricing-of-models gratuit avec `dateModified` natif < 6 mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — pas d'annonce roadmap publique. Rumeurs : Anthropic Token Counting natif (existe mais pas prix à jour), Claude Code Optimizer Q3 2026 (rumeur) |
| **Criticité** | HAUTE — si lancement équivalent gratuit, DevRefs partiellement obsolète |
| **Test de validation** | Veille produit mensuelle (Anthropic/OpenAI/Google blogs + dev relations) |
| **Mitigation si invalidée** | Pivot super-niche specs + push audit endpoint (audit cross-provider = différenciation forte vs outil propriétaire Anthropic) |
| **Statut** | Veille continue |

### H7 — Coinbase x402 facilitator reste stable et gratuit pendant 12+ mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — Foundation septembre 2025, spec ouverte, ~119 M tx Base mars 2026 |
| **Criticité** | BASSE → **ÉLEVÉE v2** — sans Stripe humain pilier, Coinbase est la seule voie de revenu |
| **Test de validation** | Surveillance docs.cdp.coinbase.com/x402 + newsletter CDP |
| **Mitigation si invalidée** | Multi-facilitator Solana V2 + code Worker portable. Si Coinbase down > 24 h/mois → V2 multi-facilitator immédiat |
| **Statut** | Veille continue (vigilance accrue v2) |

### H8 — Cloudflare Workers free tier supporte 100 000 req/jour pour DevRefs V1

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Forte — documentation Cloudflare Workers free tier explicite |
| **Criticité** | MOYENNE |
| **Test de validation** | CF Analytics : alerte à 80 000 req/jour (80 % du free tier) |
| **Mitigation si invalidée** | Upgrade Workers Paid 5 $/mois |
| **Statut** | À mesurer (V1) |

### H9 — Audit ROI 30-50 % d'économies réelles validables sur agent >= 5M tokens/mois (NOUVELLE v2)

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — estimations `agent-economics.md` § B.2 basées heuristiques mid-range. Pas de dataset public d'agents non-optimisés en production 2026 |
| **Criticité** | MOYENNE — si ROI réel < 15 % → garantie CGV déclenchée + risque réputation. Modèle économique Audit tient si < 20 % audits déclenchent remboursement |
| **Test de validation** | E4 : monitoring % audits savings_pct < 15 % à 30 jours. Seuil alerte : > 20 % audits en refund → révision heuristiques |
| **Mitigation si invalidée** | (a) Relever seuil mensuel_volume_estimate (ex : limiter aux agents > 10M tokens/mois). (b) Réviser heuristiques (modèle plus conservateur). (c) Renforcer la recommandation "audit = complément, pas substitut à l'optimisation humaine" dans CGV |
| **Statut** | À tester (V1 J30) |
| **Lien feature V1** | Endpoint /api/agent-audit (F1b) + garantie CGV 50 % refund (F21 v2) + warning < 5M tokens dans 402 body (F1c) |

### H10 — Adoption x402 suffisante pour 66 transactions/mois à M+6 (NOUVELLE v2)

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — 28 k$/jour marché x402 total mars 2026 ÷ nb endpoints × conversion = preuve très indirecte. Aucun signal "DevRefs" spécifique |
| **Criticité** | HAUTE — si adoption x402 < 2 % en 2026 (risque P1 documenté `agent-economics.md` § D.1), 66 transactions/mois non atteignables avec x402 seul |
| **Test de validation** | J7 binaire E1 (>= 1 paiement) puis extrapolation J30 (si J30 < 5 paiements → adoption trop lente pour M+6 = 66). Ramp-up attendu : J7 >= 1, M+1 >= 5, M+3 >= 20, M+6 >= 66 |
| **Mitigation si invalidée** | (a) GEO push : citations Perplexity/Claude/ChatGPT accélèrent la découvrabilité par agents qui crawlent pour trouver des endpoints. (b) Dev.to tutorials x402 + Agent SDK snippets (cf. agent-integration.md). (c) Audit ticket élevé $9.99 = 60 audits/mois suffisent seuls (H9 réussit même si H10 sur packs est lente). (d) Pack Pro $50 = 12 packs/mois suffisent (ticket élevé compense le volume faible) |
| **Statut** | À tester (V1 J7 + J30) |
| **Lien feature V1** | llms.txt 3 endpoints + GEO citations + Dev.to posts + middleware x402 unifié |

---

## 3. Hypothèses business centrale v2

> **"Un agent IA achète-t-il en autonomie un Pack pré-payé x402 ($10 Pack Standard) ET/OU un Audit one-shot ($9.99) ?"**

Agrégat de H1 + H2 + H10. La V1 répond OUI ou NON via E1 J7 binaire.

### Décision si OUI (>= 1 paiement x402 J7)

- Continuer roadmap V2 : subscription Pro $29/mois (si signal), endpoints additionnels, MCP server.
- Push agressif GEO + Dev.to scaling.
- Si revenu Audit > 70 % M+3 → bascule pipeline audit-only (creative-brief v2 § 5).

### Décision si NON (0 paiement x402 J7)

- Diagnostic : (a) SEO/GEO → push GEO + IndexNow + 5 keywords secondaires. (b) signal `llms.txt` → revue technique. (c) Si J14 toujours 0 → activation Stripe humain transitoire (perte différenciation B2A).
- Dernier recours : super-niche specs (RFC, OpenAPI) si x402 adoption < 2 % confirmée.

### Décision si AMBIGU (1-4 paiements J7)

- Continuer V1 sans modification, mesure J30.

---

## 4. Hypothèses techniques v2

| Hypothèse | Niveau preuve | Criticité | Test |
|---|---|---|---|
| HT1 — npm registry tolère 5 M req/mois (cf. @legal H6) | Forte (docs npm) | Basse | Mesure CF Analytics + alertes 429 |
| HT2 — Anthropic/OpenAI/Google pricing pages crawlables sans 429 | Moyenne (best practice + robots.txt) | Moyenne | Cron logs + alerte 429 |
| HT3 — JWT HMAC 24 h n'est pas trivialement forgé | Forte (HMAC SHA-256) | Haute | Test pen-test Phase 3 QA |
| HT4 — Watermark HMAC payload détectable si redistribué | Moyenne | Basse | Test interne + sondage Reddit |
| HT5 — Latence p95 < 200 ms tenable sur edge Cloudflare | Forte (CF benchmarks) | Moyenne | Mesure Phase 3 QA (3 endpoints) |
| HT6 — 5 heuristiques audit statiques fiables sans IA runtime (NOUVELLE v2) | Moyenne — basées Anthropic prompt caching docs + benchmarks modèles mai 2026. Applicabilité à tout agent = [HYPOTHÈSE] | Haute | E4 J30 : % audits savings_pct >= 15 %. Si < 80 % → réviser heuristiques |

**[HYPOTHÈSE H sur HT6]** : les 5 heuristiques statiques (`agent-audit-spec.md` § 5) couvrent les principaux leviers d'optimisation d'un agent IA en 2026. Si un agent utilise des patterns non couverts (ex : fine-tuning propriétaire, modèles open-source locaux sans pricing API), l'audit peut sous-estimer les savings → savings_pct < 15 % → garantie déclenchée. **Mitigation** : vérification du framework de l'agent dans le input JSON (`framework` field) — si framework non couvert → warning dans 402 "audit may underestimate savings for this framework".

---

## 5. Synthèse pour roadmap v2

| Élément | Décision v2 |
|---|---|
| **Hypothèse fondatrice** | H1 — agent achète Pack $10 ou Audit $9.99 en x402 autonome |
| **Hypothèse volume** | H10 — 66 transactions/mois à M+6 (adoption x402 suffisante) |
| **Test fondateur** | E1 J7 binaire — >= 1 paiement x402 agent réel = continuer, 0 = diagnostic, si J14 0 = Stripe transitoire |
| **Hypothèse archivée** | H3 (Stripe humain 4,99 €/jour pilier) — ARCHIVÉE définitivement |
| **Nouvelles hypothèses** | H9 (audit ROI 30-50 % réels à 30j) + H10 (adoption x402 volume 66/mois M+6) |
| **Hypothèse technique nouvelle** | HT6 (heuristiques audit statiques fiables sans IA runtime) |
| **Risque sans Stripe humain pilier** | H7 (Coinbase stabilité) = criticité élevée v2 — mitigation : code Worker portable + plan B Solana V2 |
| **Temporellement bornées** | H4 (fenêtre 12-18 mois) + H6 (Anthropic ne lance pas < 6 mois) — veille mensuelle |
