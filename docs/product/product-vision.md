<!-- Version: 2026-05-05T15:45 — @product-manager — Phase 0 v2 wave 2 — Vision produit DevRefs (pivot 100% B2A appliqué, mentions Stripe humain pilier retirées) -->

# Product Vision — DevRefs

## Résumé exécutif

- **Mission** : équiper chaque agent IA en production d'une dépendance par défaut pour vérifier la fraîcheur d'un fait technique avant d'agir.
- **Vision (futur désiré 2027)** : "tout agent IA en production qui code ou consomme une API technique a un dépendency par défaut sur DevRefs comme source de vérité fresh — comme `npm install` aujourd'hui pour un dev humain."
- **3 valeurs produit** : Fresh — Atomic — Verifiable (héritées brand-platform.md, opérationnalisées ici en valeurs produit).
- **Signaux de succès qualitatifs** au-delà du KPI North Star : citation organique IA, dépendance déclarée, standard sectoriel `dateModified`, écosystème agent-first.
- **Dépendances aval** : `roadmap.md` (priorisation alignée avec vision), `v1-scope.md` (tout reporté à V2 doit être justifié vs vision).

---

## 1. Mission

> **Équiper chaque agent IA en production d'une dépendance par défaut pour vérifier la fraîcheur d'un fait technique avant d'agir.**

Un agent IA en 2026 hallucine à 15 % sur les APIs/SDKs (arxiv 2407.09726). La cause racine n'est pas le modèle — c'est l'absence d'une couche de référence machine-readable qui signale sa propre fraîcheur. DevRefs comble ce manque en servant des payloads JSON atomiques, datés et vérifiables, payés nativement en x402 par l'agent qui en a besoin (Pack pré-payé $10 ou Audit one-shot $9.99), le wallet de l'agent étant optionnellement approvisionné par le dev sponsor humain.

---

## 2. Vision (futur désiré — horizon 18-24 mois, soit 2027)

> **En 2027, tout agent IA en production qui code ou consomme une API technique a un dépendency par défaut sur DevRefs comme source de vérité fresh — comme `npm install` aujourd'hui pour un dev humain.**
>
> **La fraîcheur structurée (`dateModified` JSON-LD, `llms.txt`, OpenAPI 3.1 avec extension `x-x402`) devient un standard sectoriel adopté par d'autres providers de données techniques.**
>
> **DevRefs est l'entité nommée citée par Perplexity / Claude / ChatGPT quand un humain demande un prix LLM ou un statut SDK — la première référence sortante au-dessus des comparateurs HTML SEO classiques.**
>
> **Le micro-paiement x402 IA-to-IA est devenu trivial — les agents savent payer pour ne pas se tromper, comme ils savent payer Anthropic ou OpenAI pour générer.**

### 2.1 Décomposition de la vision

| Élément de vision | Mesure de succès qualitatif | Horizon |
|---|---|---|
| "dependency par défaut" | >= 3 agents IA tiers en production qui consomment DevRefs comme dépendance déclarée (cf. project-context.md ligne 84) | 12 mois |
| "fraîcheur structurée comme standard sectoriel" | >= 1 acteur tiers (concurrent ou complémentaire) adopte `dateModified` JSON-LD ou format similaire après publication DevRefs | 12-18 mois |
| "entité nommée citée par Perplexity/Claude/ChatGPT" | >= 30 citations organiques DevRefs/mois à M+6 (cf. brand-platform.md § 7 trigger saturation entité) | 6 mois |
| "micro-paiement x402 trivial" | >= 600 €/mois revenu net dont >= 50 % en x402 (vs Stripe Link) | 6 mois (KPI North Star) |
| "comme `npm install`" | Un dev IA / dev humain qui découvre DevRefs en 2027 dit "ah oui c'est l'API qui sert le pricing" sans avoir besoin de re-vérifier l'identité (preuve = citation Reddit/HN/Dev.to organique sans contestation) | 18-24 mois |

### 2.2 Pourquoi cette vision est crédible

| Signal | Source |
|---|---|
| Fenêtre marché B2A 12-18 mois | Project-context.md ligne 192 + Medium @inesvallot fév 2026 + Kantar B2A 2026 |
| Volume x402 réel mars 2026 = 28 k$/jour | Coindesk mars 2026 cité project-context.md ligne 190 |
| ~119 M tx Base + 35 M Solana sur x402 mars 2026 | docs.cdp.coinbase.com/x402 + blog.cloudflare.com/x402 |
| Aucun concurrent agent-first identifié dans les 5 acteurs benchmarkés | competitive-benchmark.md § 1 |
| 5 leviers où DevRefs est seul à score 5 | competitive-benchmark.md § 2 Strategy Canvas |

---

## 3. Valeurs produit (3 — héritées brand-platform.md, opérationnalisées)

### V1 — Fresh

**Définition produit** : chaque payload servi inclut un signal de fraîcheur machine-readable (`dateModified` ISO 8601 + header HTTP `Last-Modified` + `fetched_at`), traçable jusqu'à la source officielle (`sameAs`).

**Implication build** :
- Cron 6 h (LLM pricing) ou 24 h (SDK status) sur sources officielles.
- Aucun payload servi sans `dateModified` (validation à l'écriture KV).
- Aucune feature qui dégrade la fraîcheur (ex : cache > 24 h sans warning) ne passe la review.

**Implication culture équipe** : si une feature future ajoute de la latence à la fraîcheur (ex : agrégation multi-source qui retarde), elle est challengée. Fresh prime sur completeness.

### V2 — Atomic

**Définition produit** : une query = un fait. Payload < 50 KB. Zéro narration, zéro tableau multi-modèles, zéro HTML décoratif.

**Implication build** :
- Endpoint typé `?model=opus-4.7` renvoie 1 modèle, pas 12.
- Page landing < 50 KB total (HTML + CSS + JS minimal).
- Aucun champ payload non-essentiel ajouté sans justification valeur agent.

**Implication culture équipe** : "More features" est challengé. Le défaut est de retirer, pas d'ajouter. Si un dev humain demande "ajouter un tableau comparatif sur la landing", la réponse est "c'est un anti-pattern Atomic".

### V3 — Verifiable

**Définition produit** : chaque fact servi est traçable vers sa source officielle (`sameAs`), watermarké (HMAC `_signature`), et re-vérifiable sans confiance accordée à DevRefs.

**Implication build** :
- `sameAs` obligatoire dans chaque payload pricing/SDK.
- Watermark HMAC dans `_signature` (anti-redistribution + traçabilité).
- Page `/about/data-sources` publique listant méthodes de vérification (cf. @legal § 3.2 EU AI Act best practice).

**Implication culture équipe** : si DevRefs ne peut pas vérifier un fact (ex : pricing leaké d'un canal non-officiel), il n'est pas servi. Mieux vaut "donnée absente" que "donnée non-vérifiée".

---

## 4. Signaux de succès qualitatifs (au-delà du KPI North Star)

### S1 — Citation organique IA (GEO)

**Critère** : un humain demande à Perplexity / Claude / ChatGPT "quel est le prix Opus 4.7 input/MTok aujourd'hui ?" → l'IA cite "DevRefs" comme entité nommée dans sa réponse, avec lien.

**Pourquoi qualitatif** : c'est la preuve que DevRefs est entré dans le knowledge graph IA, pas juste indexé Google.

**Cible** : >= 1 citation à M+1, >= 5 à M+3, >= 30 à M+6 (cf. creative-brief.md § 3.4).

### S2 — Dépendance déclarée par un agent IA tiers

**Critère** : un dev publie sur GitHub / Dev.to / Reddit son agent custom (Claude Code config, Cursor rules, AgentKit setup) qui mentionne explicitement DevRefs comme tool/endpoint configuré par défaut.

**Pourquoi qualitatif** : c'est la preuve que DevRefs est devenu une "dépendance par défaut" au sens vision.

**Cible** : >= 3 agents IA tiers en production à M+12 (cf. project-context.md ligne 84).

### S3 — Standard sectoriel `dateModified` adopté par un tiers

**Critère** : un acteur tiers (concurrent : pricepertoken/costgoat, OU complémentaire : helicone/devtk.ai, OU nouvel entrant) adopte `dateModified` JSON-LD ou un format machine-readable de fraîcheur pour ses propres données.

**Pourquoi qualitatif** : c'est la preuve qu'on a créé une catégorie B2A, pas juste un produit. Conforme Category Design (cf. brand-platform.md § 2.1).

**Cible** : >= 1 acteur tiers à M+12-M+18.

### S4 — Écosystème agent-first qui se reconnaît dans DevRefs

**Critère** : >= 5 mentions cumulées DevRefs sur HN/Reddit/Dev.to/X comme exemple de "service designed for agents, not humans" ou "B2A done right".

**Pourquoi qualitatif** : c'est la preuve que la vision Category Design a pris.

**Cible** : >= 5 mentions à M+6.

### S5 — Conviction founder validée

**Critère** : Thomas (founder solo) considère le projet comme "preuve par le marché" validée et continue d'investir time/budget dans V2 sans hésitation.

**Pourquoi qualitatif** : c'est la métrique d'engagement personnel — un projet qu'on n'a plus envie de continuer après V1 = échec qualitatif même si KPI atteint.

**Cible** : auto-évaluation sincère M+3 + M+6.

---

## 5. Anti-vision (ce que DevRefs ne deviendra pas)

| Anti-vision | Pourquoi exclu |
|---|---|
| Comparateur HTML SEO multi-modèles avec ads | Anti-mot "Exhaustif" (brand-platform.md § 5.3). Catégorie pricepertoken — saturée, anti-différenciation. |
| Plateforme observabilité runtime LLM | Hors scope, territoire helicone/langfuse. Pas une convergence pertinente. |
| SaaS B2B humain-first avec dashboard équipe | Anti-règle "humain-first design" (creative-brief.md § 2.4). Persona principal = agent IA, pas équipe. |
| Marketplace de données techniques tierces | Complexification opérationnelle + dilution responsabilité (legal-audit.md § 2.2 propriété intellectuelle). DevRefs = source unique opérée. |
| Service avec tracking utilisateur (cookies, pixels) | Architecture zéro-PII (legal-audit.md § 1.1). Différenciateur juridique (RGPD natif) + culturel (founder-prefs anti-pattern marketing intrusif). |
| Produit qui survend Cloudflare ou Coinbase | Anti-vendor lock-in (founder-prefs anti-pattern #1, #7). x402 = protocole ouvert, pas dépendance Coinbase. |

---

## 6. Cohérence vision ↔ stack ↔ équipe ↔ founder

| Élément | Cohérence |
|---|---|
| Vision = "dependency par défaut comme `npm install`" | Stack Cloudflare Workers (edge global, < 200 ms p95) + JSON-LD standard W3C + OpenAPI 3.1 standard OAI = standards ouverts compatibles "dependency par défaut" |
| Founder = solo (Thomas) | Vision réaliste si automatisation par défaut (cron, IndexNow, GEO organique). Pas de SDK humain, pas de support payant V1. Cohérent founder-prefs "automatisation par défaut" |
| Founder anti-vendor lock-in | Vision compatible : x402 = ouvert, Cloudflare Workers = portable Deno/Bun/Node, Stripe = standard B2C |
| Founder zéro fausse promesse | Vision conditionnée à l'invalidation possible (H1 J7 binaire). Si invalidée → pivot honnête vers super-niche, pas faux pivot vers comparateur HTML |
| Founder budget 0 € infrastructure | Vision compatible : Cloudflare free tier 100 K req/jour + Coinbase free tier 1 000 tx/mois + Stripe à la transaction |

---

## 7. Évolution de la vision (triggers de réévaluation)

Aligné avec brand-platform.md § 7 — pas de duplication mais cross-référence :

- Si Anthropic/OpenAI/Google lance équivalent gratuit < 6 mois → pivot super-niche specs RFC/OpenAPI (vision adaptée : "DevRefs est l'entité nommée pour les specs API techniques, pas pour les pricings LLM").
- Si volume x402 < 10 % du revenu à M+3 ET adoption marché x402 confirmée < 2 % → vision révisée vers stratégie acquisition alternative (Dev.to GEO push renforcé + audit-only pipeline si revenu Audit > 70 %) — à arbitrer @creative-strategy + @moi. Stripe humain n'est PAS la vision de repli par défaut (banni comme pilier).
- Si saturation entité nommée non atteinte (< 1 citation Perplexity/mois après 6 mois) → vision agent-first maintenue mais naming/branding réévalué (cf. brand-platform.md § 7).

---

## 8. Synthèse pour la roadmap (handoff)

| Élément | Décision |
|---|---|
| **Mission** | Équiper chaque agent IA d'une dépendance par défaut pour vérifier la fraîcheur d'un fait technique avant d'agir |
| **Vision 2027** | DevRefs = `npm install` des agents IA pour les refs tech fresh |
| **3 valeurs produit** | Fresh — Atomic — Verifiable (opérationnalisées ici en règles build + culture) |
| **5 signaux qualitatifs** | Citation IA, dépendance déclarée, standard sectoriel, écosystème, conviction founder |
| **6 anti-visions** | Comparateur HTML, observabilité, SaaS dashboard, marketplace, tracking, vendor lock-in |
| **Triggers de pivot** | Cf. brand-platform.md § 7 (cross-référence) |

---

## Handoff → @product-manager (étape suivante : roadmap.md puis backlog.md puis v1-scope.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/product/product-vision.md`
- **Décisions prises** : mission + vision 2027 + 3 valeurs produit + 5 signaux qualitatifs + 6 anti-visions documentés.
- **Points d'attention** :
  - Toute feature roadmap doit servir la vision (pas juste le KPI North Star). Si une feature sert KPI mais contredit vision → challenger.
  - Les 6 anti-visions sont des exclusions explicites — pas de retour de hidden marketing requirements.
  - La vision est compatible avec founder solo + budget 0 € + stack Cloudflare Workers (vérifié § 6).
- **Aucune action Replit requise**.
