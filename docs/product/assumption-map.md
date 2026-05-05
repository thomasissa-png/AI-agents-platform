<!-- Version: 2026-05-05T09:10 — @product-manager — Phase 0 wave 2 — Assumption mapping DevRefs -->

# Assumption Map — DevRefs

## Résumé exécutif

- **Objectif** : cartographier les hypothèses business critiques de DevRefs sur une matrice 2×2 (preuve × criticité) pour identifier celles à tester en priorité avant V1, pendant V1, et à invalider/valider via les métriques V1.
- **8 hypothèses identifiées**, dont 4 à criticité haute + preuve faible/moyenne (= zone "à tester en priorité absolue").
- **Test V1 binaire (E1 du discovery-map)** : si 0 paiement x402 à J7 → invalidation forte de l'hypothèse fondatrice H1 → pivot.
- **Mitigation systématique** : Stripe Link humain en fallback dès V1 = filet de sécurité même si toutes les hypothèses agent sont invalidées.
- **Dépendances aval** : `roadmap.md` (priorisation tient compte des hypothèses critiques), `v1-scope.md` (hypothèse business centrale).

---

## 1. Matrice 2×2 (preuve × criticité)

```
                   PREUVE FAIBLE                       PREUVE MOYENNE                       PREUVE FORTE
                  ┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
   CRITICITÉ      │  H1 — Agent IA paie 0,49 €      │  H2 — Capacité technique x402   │                                 │
   HAUTE          │  vs cramer 64 K tokens          │  agents en 2026                 │                                 │
                  │  (TEST PRIORITAIRE J7 binaire)  │  (Coinbase + AWS + Cloudflare)  │                                 │
                  │                                 │                                 │                                 │
                  │  H4 — Marché B2A 12-18 mois     │  H6 — Anthropic/OpenAI ne       │                                 │
                  │  fenêtre d'opportunité          │  lanceront pas équivalent       │                                 │
                  │  (sources B2A 2026)             │  gratuit < 6 mois               │                                 │
                  │                                 │                                 │                                 │
                  ├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
   CRITICITÉ      │  H3 — Dev humain accepte        │  H5 — Cron 6 h suffit pour      │  H8 — Cloudflare Workers free   │
   MOYENNE        │  Stripe Link 4,99 €/jour        │  fraîcheur perçue agent         │  tier supporte 100 K req/jour   │
                  │  (verbatim V4 analytique)       │  (vs temps-réel)                │  (free tier docs)               │
                  │                                 │                                 │                                 │
                  ├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
   CRITICITÉ      │                                 │  H7 — Coinbase x402 facilitator │                                 │
   BASSE          │                                 │  reste stable et gratuit 12+    │                                 │
                  │                                 │  mois (Foundation 2025)         │                                 │
                  └─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
```

**Lecture** : zone CRITICITÉ HAUTE × PREUVE FAIBLE = priorité absolue de test. H1 est la plus critique (test E1 J7 binaire). H4 et H6 sont temporellement bornées (fenêtre marché).

---

## 2. Hypothèses détaillées

### H1 — Un agent IA va préférer payer 0,49 € plutôt que cramer 64 K tokens en parsing multi-source

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — verbatim V1 analytique d'@ia (project-context.md), pas de signal marché commercial validé |
| **Criticité** | HAUTE — c'est l'hypothèse fondatrice. Si fausse, le modèle x402 s'effondre. |
| **Test de validation** | E1 (J7 binaire) : >= 5 paiements x402 dans les 7 jours suivant publication landing + llms.txt + 2 posts Dev.to + 1 post Reddit |
| **Mitigation si invalidée** | Pivot vers Stripe-only (perte différenciation B2A) OU pivot super-niche specs (cf. brand-platform.md § 7) |
| **Statut** | À tester (V1) |
| **Lien feature V1** | Middleware x402 (S3.1) + endpoints atomiques (S2.1, S2.2) — on ne peut pas tester sans avoir construit. C'est le pari V1. |

### H2 — Les agents IA en 2026 ont la capacité technique de payer en x402

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — Coinbase x402 docs (mai 2025), AWS x402 agentic commerce 2026, Cloudflare blog x402, ~119 M tx Base + 35 M Solana mars 2026 |
| **Criticité** | HAUTE — sans capacité technique, H1 est intestable |
| **Test de validation** | Mesure J7 = nb wallets uniques distincts qui ont tenté un paiement x402 (réussi OU échoué). >= 3 wallets distincts = capacité confirmée |
| **Mitigation si invalidée** | Stripe Link humain en fallback dès V1 (S4.1) assure un revenu même si la couche agent est immature |
| **Statut** | À mesurer (V1) — preuve indirecte forte mais sans signal "DevRefs" spécifique |
| **Lien feature V1** | Middleware x402 (S3.1) + Stripe fallback (S4.1) |

### H3 — Un dev humain accepte de payer 4,99 €/jour quand son agent paie en boucle

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — verbatim V4 analytique d'@ia, pas de signal marché direct sur "Stripe Link 4,99 €/jour pour service IA" |
| **Criticité** | MOYENNE — fallback acceptable. Si invalidée, on a juste moins de Stripe ARR mais le modèle x402 tient seul |
| **Test de validation** | Mesure M+1 = >= 1 JWT actif. Mesure M+3 = >= 4 JWT actifs réguliers (équivalent 600 €/mois si 30 jours/mois × 4 = 4 × 4,99 € × 30 = 598,80 €) |
| **Mitigation si invalidée** | Augmenter prix x402 (E4 bump 0,49 € → 0,99 €) OU élargir bundle endpoints pour augmenter ARPU agent |
| **Statut** | À tester (V1 + M+1) |
| **Lien feature V1** | Stripe Payment Link (S4.1) + JWT 24 h (S4.2) + dashboard interne (S4.4) |

### H4 — Le marché B2A va se développer dans une fenêtre d'opportunité de 12-18 mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — sources B2A 2026 (Medium @inesvallot fév 2026, Kantar B2A retail disruption 2026, AWS x402 agentic commerce 2026) cf. competitive-benchmark.md § 5 |
| **Criticité** | HAUTE — fenêtre temporellement bornée (cf. project-context.md ligne 192 : "12-18 mois d'avance estimés") |
| **Test de validation** | Veille concurrentielle mensuelle : surveiller pricepertoken/costgoat/devtk pivot vers x402. Mesure GEO : >= 5 citations Perplexity/Claude mentionnant "DevRefs" à M+3 |
| **Mitigation si invalidée** | Si pricepertoken pivote x402 < 6 mois → accélérer features différenciantes V2 (MCP server, multi-chain Solana, schemas OpenAPI). Si Anthropic/OpenAI lance gratuit → super-niche specs (cf. brand-platform.md § 7) |
| **Statut** | Veille continue (mensuelle) |
| **Lien feature V1** | GEO claims vérifiables (creative-brief.md § 4.2) + entité nommée "DevRefs" + JSON-LD `Dataset` |

### H5 — Cron 6 h suffit pour la fraîcheur perçue par l'agent (vs temps-réel)

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — pricing pages LLM bougent par semaine (project-context.md), pas par minute. SDK npm bougent par jour. Cron 6 h capture bien le delta. |
| **Criticité** | MOYENNE — si fausse, on perd la confiance agent mais le modèle tient |
| **Test de validation** | Mesure M+1 : nb requêtes avec `dateModified` > 24 h dans le payload (= retard cron). Si > 5 % → bump cron 6 h → 3 h ou 1 h |
| **Mitigation si invalidée** | Bump fréquence cron (impact CPU Worker mineur, free tier OK jusqu'à 1 h) + ajout webhook source si Anthropic/OpenAI publie |
| **Statut** | À mesurer (V1) |
| **Lien feature V1** | Cloudflare Worker cron 6 h + champ `fetched_at` (S1.3) |

### H6 — Anthropic / OpenAI / Google ne lanceront pas un endpoint pricing-of-models gratuit avec `dateModified` natif < 6 mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Faible — pas d'annonce roadmap publique. Inférence : niche trop petite pour eux (cf. project-context.md ligne 192 + brand-platform.md § 7) |
| **Criticité** | HAUTE — si Anthropic lance équivalent gratuit, DevRefs est obsolète instantanément |
| **Test de validation** | Veille produit mensuelle (Anthropic/OpenAI/Google blogs + dev relations Twitter) |
| **Mitigation si invalidée** | Pivot super-niche specs RFC/OpenAPI (cf. brand-platform.md § 7) + push agressif sur SDK status (concurrents gratuits ne le couvrent pas) |
| **Statut** | Veille continue (mensuelle) |
| **Lien feature V1** | Aucun direct — pari stratégique sur la fenêtre marché |

### H7 — Coinbase x402 facilitator reste stable et gratuit pendant 12+ mois

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Moyenne — Coinbase + Cloudflare Foundation septembre 2025, x402 spec ouverte, ~119 M tx Base mars 2026 = volume substantiel mais Coinbase peut monétiser à tout moment |
| **Criticité** | BASSE — si Coinbase monétise à 1 % fees, DevRefs peut absorber (passe de 0,49 € à 0,495 € net) ou switch vers Solana facilitator (S3.5 V2) |
| **Test de validation** | Surveillance newsletter Coinbase Developer Platform + docs.cdp.coinbase.com/x402 |
| **Mitigation si invalidée** | Multi-facilitator (S3.5 V2 — Solana) + code Worker portable (cf. brand-platform.md § 6.3 anti-vendor lock-in) |
| **Statut** | Veille continue |
| **Lien feature V1** | Aucun — anti-vendor lock-in déjà documenté creative-brief.md § 7 |

### H8 — Cloudflare Workers free tier supporte 100 000 req/jour pour DevRefs V1

| Champ | Valeur |
|---|---|
| **Niveau de preuve** | Forte — documentation Cloudflare Workers free tier explicite (100 000 req/jour, mentionné project-context.md ligne 93) |
| **Criticité** | MOYENNE — si dépassé V1, upgrade Workers Paid 5 $/mois = budget validé |
| **Test de validation** | Mesure CF Analytics : volume req/jour. Alerte à 80 % free tier (80 000/jour) |
| **Mitigation si invalidée** | Upgrade Workers Paid 5 $/mois (budget projet < 0 € confirmé tolère ce upgrade en cas de scaling — cf. founder-prefs anti-pattern #1 anti-vendor lock-in mais Workers est ouvert) |
| **Statut** | À mesurer (V1) |
| **Lien feature V1** | Toute l'infrastructure Worker — implicite |

---

## 3. Hypothèse business centrale (à valider/invalider par V1)

> **"Un agent IA achète-t-il en autonomie un payload technique fresh à 0,49 € en x402 ?"**

C'est l'agrégat de H1 + H2. La V1 doit répondre OUI ou NON avec un test J7 binaire (>= 5 paiements x402 = OUI, 0 paiement = NON).

### Décision si OUI (>= 5 paiements x402 J7)

- Continuer roadmap V2 : MCP server (E3 validé), Stripe mensuel, dashboard team, endpoints additionnels.
- Bump prix possible si > 15 ventes (E4).
- Push agressif GEO + Dev.to scaling.

### Décision si NON (0 paiement x402 J7)

- Diagnostic prioritaire : (a) défaut de SEO/GEO (agents ne trouvent pas DevRefs) → push GEO + IndexNow + 5 keywords secondaires. (b) Défaut de signal `llms.txt` → revue technique. (c) Défaut de prix → bump 0,49 € → 0,99 € invalidé, donc tester pricing alternatif.
- Si après diagnostic complet (J14), toujours 0 paiement x402 → pivot vers Stripe-only (perte différenciation B2A) ou super-niche.

### Décision si AMBIGU (1-4 paiements x402 J7)

- Continuer V1 sans modification, étendre période de mesure à J30.
- Pas de pivot mais pas de scaling agressif non plus.

---

## 4. Hypothèses dérivées (sub-hypothèses techniques)

| Hypothèse technique | Niveau preuve | Criticité | Test |
|---|---|---|---|
| HT1 — npm registry tolère 5 M req/mois (cf. @legal H6) | Forte (docs npm) | Basse | Mesure CF Analytics + alertes |
| HT2 — Anthropic/OpenAI/Google pricing pages crawlables sans 429 | Moyenne (best practice + robots.txt) | Moyenne | Cron logs + alerte 429 |
| HT3 — JWT HMAC 24 h n'est pas trivialement forgé | Forte (HMAC SHA-256) | Haute | Test pen-test Phase 3 QA |
| HT4 — Watermark HMAC payload détectable si redistribué | Moyenne | Basse | Test interne + sondage Reddit |
| HT5 — Latence p95 < 200 ms tenable sur edge Cloudflare | Forte (CF benchmarks) | Moyenne | Mesure Phase 3 QA |

---

## 5. Synthèse pour roadmap (handoff)

| Élément | Décision |
|---|---|
| **Hypothèse fondatrice** | H1 — agent paie 0,49 € vs cramer 64 K tokens |
| **Test fondateur** | E1 J7 binaire — >= 5 paiements x402 = OUI continuer, 0 paiements = pivot |
| **Filet de sécurité V1** | Stripe Link humain (H3 fallback) + diversification scaling (H4 + H6 veille) |
| **Hypothèses temporellement bornées** | H4 (fenêtre 12-18 mois) + H6 (Anthropic ne lance pas < 6 mois) — veille mensuelle obligatoire |
| **Hypothèse anti-vendor lock-in** | H7 (Coinbase stable) — mitigée par S3.5 Solana V2 + code portable |
| **Hypothèses techniques (HT1-HT5)** | Toutes adressables Phase 1-3 par @fullstack/@infrastructure/@qa |

---

## Handoff → @product-manager (étape suivante : product-vision.md puis roadmap.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/product/assumption-map.md`
- **Décisions prises** : 8 hypothèses business + 5 hypothèses techniques cartographiées. H1 = pari fondateur testé J7 binaire.
- **Points d'attention** :
  - Roadmap V1 doit prévoir le test E1 dès J7 (publication landing + 2 posts Dev.to + 1 post Reddit + llms.txt — tout présent J0).
  - V1-scope.md doit inclure explicitement l'hypothèse business centrale.
  - Si H1 invalidée → préparer plan B documenté Phase 4 par @data-analyst (déjà flagué par @growth Phase 4 dans project-context.md).
- **Aucune action Replit requise**.
