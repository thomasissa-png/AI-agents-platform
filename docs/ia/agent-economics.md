<!-- Version: 2026-05-05T13:20 — @ia — Phase 0 v2 — Spec 2 ROI tokens et pricing 100% x402 -->

# Agent Economics — DevRefs

## Résumé exécutif

- **Objectif** : chiffrer le ROI tokens des 2 offres pour un agent IA, déterminer le pricing 100% x402 qui rend chaque offre no-brainer, et calculer le volume d'agents actifs nécessaire pour atteindre 600 €/mois (cible) et 2-3 K€/mois (stretch).
- **Décisions clés** :
  1. **Offre 1 — Calcul coût** : pricing à la query = $0.001/call (pas no-brainer en revenue) → bascule sur **packs pré-payés** $5 / $10 / $50 USDC (réduit friction signature x402 par call).
  2. **Offre 2 — Audit** : pricing $9.99 USDC par audit (one-shot) ou pack $49 = 6 audits, ROI 10×+ sur agent moyen 5-15M tokens/mois.
  3. **Abonnement x402 récurrent** : techniquement supporté en x402 V2 (sessions SIWx + deferred payment scheme, cf. `x402.org/writing/x402-v2-launch`). Recommandé Pro tier $29 USDC/mois.
  4. **Volume d'agents nécessaire pour 600 €/mois** : ~80-120 agents actifs achetant Pack Standard $10 OU 25-40 audits Pro/mois.
- **Risque assumé documenté** : adoption x402 < 2% en 2026 → mitigation par packs pré-payés (ticket moyen plus haut) + Audit one-shot (faible volume mais marge ~99% suffit pour 600 €/mois avec 60 audits/mois).
- **Sources vérifiées** (mai 2026) : Anthropic pricing 2026 ($5/$25 Opus 4.7, $3/$15 Sonnet 4.6, $1/$5 Haiku 4.5 + tokenizer +35% Opus), x402 V2 spec sessions, `coinbase/x402` GitHub.

---

## Section A — ROI Calcul coût (Offre 1)

### A.1 Coût alternative agent sans DevRefs

Un agent qui veut estimer le coût d'un appel `messages.create()` avant de l'envoyer doit aujourd'hui :
1. WebSearch sur "claude opus 4.7 pricing"
2. WebFetch 3-5 sources HTML (anthropic.com/pricing, pricepertoken.com, llm-prices.com)
3. Parser le HTML pour extraire 2 nombres (input + output per MTok)
4. Détecter la fraîcheur (pas de signal machine-readable → heuristique)

**Mesure agent réel** (verbatim V1 project-context.md, agent Claude Code halluciné sur Opus 4.7) :
- WebSearch : 8 résultats → ~2 000 tokens (analyse résultats)
- WebFetch × 3 : 11 420 + 38 900 + 14 200 = **64 520 tokens cumulés** d'input parsing
- Output LLM (synthèse) : ~500 tokens
- **Total : ~67 000 tokens consommés par estimation pricing**

### A.2 Conversion tokens → coût $ par modèle (mai 2026)

| Modèle agent (qui interroge) | Coût input/MTok | Coût des 67K tokens parsing | Coût output 500 tok | Total $ par estimation |
|---|---|---|---|---|
| **Opus 4.7** ($5/$25, ×1.35 tokenizer) | $5 × 1.35 = $6.75 effectif | 67 × $0.00675 = **$0.452** | $0.034 | **~$0.49** |
| **Sonnet 4.6** ($3/$15) | $3.00 | 67 × $0.003 = $0.201 | $0.0075 | **~$0.21** |
| **Haiku 4.5** ($1/$5) | $1.00 | 67 × $0.001 = $0.067 | $0.0025 | **~$0.07** |
| **GPT-5** ($2.50/$10 [HYPOTHÈSE H5 — prix variables sources WebSearch mai 2026]) | $2.50 | 67 × $0.0025 = $0.168 | $0.005 | **~$0.17** |
| **Gemini 2.5 Pro** ($1.25/$5) | $1.25 | 67 × $0.00125 = $0.084 | $0.0025 | **~$0.09** |

### A.3 Grille par cas d'usage

| Cas d'usage | Tokens parsing typiques | Coût alternative (Sonnet 4.6) | Coût DevRefs Pack Standard (10 000 calls / $10 = $0.001/call) | ROI |
|---|---|---|---|---|
| Pricing query simple (1 modèle) | 35-50K | $0.10 - $0.15 | $0.001 | **100×-150×** |
| Multi-source tie-breaker (3 sources, contradictions) | 65-80K | $0.20 - $0.24 | $0.001 (1 call atomique fait foi) | **200×-240×** |
| Breaking change SDK detection (CHANGELOG parsing) | 80-120K | $0.24 - $0.36 | $0.001 (1 call /api/sdk-status) | **240×-360×** |

### A.4 Threshold no-brainer

Pour qu'un agent rationnel achète DevRefs, le coût doit être **inférieur** au coût alternative. Calcul break-even :

| Modèle agent | Volume break-even (queries/jour pour qu'achat DevRefs > économies) |
|---|---|
| Opus 4.7 | **dès 1 query/jour** ($0.49 économisé vs $0.001 = ROI 490×) |
| Sonnet 4.6 | dès 1 query/jour ($0.21 économisé vs $0.001 = ROI 210×) |
| Haiku 4.5 | dès **3 queries/jour** ($0.21 cumulé > $0.003 cumulé) |

**Verdict** : ROI no-brainer dès la **1ère query** pour tout agent Opus/Sonnet/GPT-5/Gemini Pro. Dès la **3e query** pour agent Haiku.

**Limite** : ce ROI suppose que l'agent fait l'estimation pricing au moins 1×/jour. Pour un agent qui ne touche jamais aux prix LLM (cas marginal), DevRefs Offre 1 est inutile — focus Offre 2 (audit).

---

## Section B — ROI Audit (Offre 2)

### B.1 Coût mensuel typique d'un agent non-optimisé

Profil agent IA solo dev en 2026 (estimation conservatrice basée verbatims V1-V5 project-context.md) :
- Volume mensuel : 5-15M tokens mixé
- Mix modèle typique : 40% Opus (raisonnement), 40% Sonnet (génération code), 20% Haiku (tâches simples)

**Calcul coût mensuel agent moyen 10M tokens/mois** :

| Mix | Tokens | Coût per MTok (input avg) | Coût mensuel |
|---|---|---|---|
| 4M Opus 4.7 (avec ×1.35 tokenizer) | 4M × 1.35 = 5.4M effectifs | $5 input / $25 output (split 70/30) | $5.4M × ($5×0.7 + $25×0.3) = $59.4 |
| 4M Sonnet 4.6 | 4M | $3 / $15 (split 70/30) | $4M × ($2.10 + $4.50) = $26.4 |
| 2M Haiku 4.5 | 2M | $1 / $5 (split 70/30) | $2M × ($0.70 + $1.50) = $4.4 |
| **TOTAL** | **10M** | — | **~$90/mois** |

**Plage agent typique** : $80 (5M tokens, optimisé Sonnet) à $400 (15M tokens, lourd Opus).

### B.2 Économies réalistes audit STATIQUE

Heuristiques détectables sans IA runtime (cf. `agent-audit-spec.md` § 5) :

| Heuristique | Économie typique détectable |
|---|---|
| Model downgrade par task complexity (Opus → Sonnet/Haiku sur tâches simples) | 25-40% |
| Prompt caching activation (system prompts longs > 1024 tokens) | 10-25% (sur le sous-set cacheable) |
| Batch parallélisation (workloads asynchrones non urgents) | 50% sur le sous-set batchable |
| Tool description trimming (verbose > 500 tokens cumulés) | 5-10% |
| Effort level mismatch (Opus xhigh sur tâche basique) | 10-20% |

**Économie totale réaliste cumulée** : **35-55%** (bornes basses car overlap entre heuristiques).

### B.3 Calcul ROI Audit

| Profil agent | Coût mensuel actuel | Économie 40% (mid-range) | Pricing audit DevRefs cible | ROI mensuel |
|---|---|---|---|---|
| Solo dev 5M tokens | $80 | $32/mois économisés | $9.99 (one-shot) | **3.2×** premier mois, ∞× mois suivants |
| Solo dev 10M tokens | $90 | $36/mois | $9.99 | **3.6×** premier mois |
| Pro dev 15M tokens | $400 | $160/mois | $9.99 | **16×** premier mois |
| Équipe 3 agents (30M tokens) | $1 200 | $480/mois | $49 (Pack 6 audits/an, 1 par agent par trim) | **9.8×** premier mois |

### B.4 Pricing audit cible no-brainer (ROI ≥ 10×)

**Pour ROI ≥ 10× sur un agent solo 10M tokens** ($36 économisé/mois mid-range), le prix audit doit être ≤ **$3.60**.

Mais : un audit one-shot délivre des économies récurrentes mensuelles (le rapport reste valable 3-6 mois jusqu'à changement majeur de l'agent). Sur 3 mois, économies = $108 → pricing $9.99 = ROI 10.8× (no-brainer atteint).

**Décision pricing Audit DevRefs** :
- **One-shot $9.99 USDC** par audit → ROI 10×+ sur 3 mois pour tout agent ≥ 5M tokens/mois
- **Pack Pro $49 USDC** = 6 audits (1 par mois pendant 6 mois OU 1 par agent dans une équipe de 6) → réduit le coût unitaire à $8.17, augmente le LTV
- **Subscription $29 USDC/mois** = audits illimités + alertes proactives sur dégradations détectées (V2 si signal demande, voir § C.3)

---

## Section C — Pricing recommandé final (100% x402 pur)

### C.1 Tableau pricing final

#### Offre 1 — Calcul coût (Pricing + SDK Status)

| Format | Prix | Volume | Prix unitaire | Cible |
|---|---|---|---|---|
| **Pay-per-call** (x402 chaque request) | $0.001 USDC | 1 call | $0.001 | Test, agents qui n'utilisent que 1-10 calls totaux |
| **Pack Discovery** | $5 USDC | 5 000 calls | $0.001 | Premier projet, dev qui teste le produit |
| **Pack Standard** | $10 USDC | 10 000 calls | $0.001 | Usage normal solo dev mensuel (recommandé default) |
| **Pack Pro** | $50 USDC | 60 000 calls | $0.00083 | Scale-up, équipe agents prod |

**Justification packs** : un signature x402 par call à $0.001 a un overhead de signature (~50-100 ms latence). Un pack pré-payé permet à l'agent de réserver le quota en 1 signature, puis de servir les calls suivants en lookup KV ultra-rapide (latence < 50 ms p95) — meilleure UX agent + meilleur ARPU pour DevRefs.

#### Offre 2 — Audit

| Format | Prix | Volume | Prix unitaire | Cible |
|---|---|---|---|---|
| **One-shot** (x402 single payment) | $9.99 USDC | 1 audit | $9.99 | Agent solo, première vérification |
| **Pack Pro** | $49 USDC | 6 audits | $8.17 | Équipe agents, audits récurrents trim |
| **Subscription Pro** (x402 V2 récurrent — voir C.3) | $29 USDC/mois | Audits illimités + alertes | n/a | Power user ou équipe scale-up |

### C.2 Justification rentabilité atteignable

#### Cible 600 €/mois (≈ $660 USDC)

Combinaisons possibles :

| Mix possible | Ventes nécessaires/mois | Réalisme |
|---|---|---|
| 100% Pack Standard $10 | 66 packs/mois (~2.2/jour) | **Réaliste** : 1 lecteur Dev.to sur 1 000 convertit, 60-70K vues/mois |
| 100% Audit one-shot $9.99 | 66 audits/mois (~2.2/jour) | **Réaliste** : audit = ticket moyen plus élevé |
| Mix 50/50 Pack + Audit | 33 packs + 33 audits = $660/mois | **Réaliste** : démontre les 2 offres |
| Pack Pro $50 only | 14 packs/mois (~0.5/jour) | **Plus dur** : ticket élevé, persona Pro plus rare V1 |

**Verdict** : 600 €/mois atteignable avec **66 transactions/mois total** (~2.2/jour). Cohérent avec hypothèse H1 V1-scope (>= 5 paiements x402 J7 = ramp-up vers 60+/mois M+6).

#### Cible stretch 2-3 K€/mois (≈ $2 200-$3 300 USDC)

| Mix | Ventes nécessaires/mois | Réalisme |
|---|---|---|
| 220-330 Pack Standard $10 | 7-11/jour | **Réaliste M+12** si 1 citation Perplexity organique + 1 article viral Dev.to |
| 50-70 Subscription Pro $29 + 100 Pack Standard $10 = $2 450-$3 030 | n/a | **Réaliste M+12** si signal demande Subscription confirmé V2 |

### C.3 Subscription récurrent x402 V2 — faisabilité technique

**Confirmation x402 V2 supporte sessions et abonnements** (cf. `x402.org/writing/x402-v2-launch` mai 2026) :

> "x402 V2 enables subscription and session patterns for both human users and autonomous agents. The V2 protocol now includes logic to support wallet-controlled sessions or other forms of identity, allowing clients to skip the full payment flow and the need for onchain interactions for repeated access if the resource was previously purchased."

Mécanisme :
1. **Session SIWx (Sign-In-With-X)** : l'agent prouve la possession d'un wallet via une signature CAIP-122. DevRefs émet une session token (équivalent JWT mais wallet-based).
2. **Deferred payment scheme** : DevRefs facture l'agent en batch mensuel (ou rolling) via une seule signature on-chain qui couvre N appels.
3. **Subscription** : combinaison session + deferred + cron mensuel facturation = abonnement effectif.

**Recommandation V1 vs V2** :
- **V1 DevRefs** : implémenter packs pré-payés + audit one-shot uniquement (simple, déjà spec x402 v1 stable). Réserver Subscription Pro $29/mois pour V2 quand x402 V2 SDKs sont stables (estimé Q3 2026 selon roadmap Coinbase).
- **V2 DevRefs (M+3 si signal)** : ajouter Subscription Pro $29/mois.

### C.4 Comparaison vs alternatives

| Alternative pour l'agent | Coût équivalent | Verdict vs DevRefs Pack Standard $10 |
|---|---|---|
| Crawler Web manuel + parsing tokens | $0.07-$0.49 par estimation × 100 estimations/mois = $7-$49/mois en tokens cramés | **DevRefs $10 = 1.4×-4.9× moins cher** |
| MCP server pricepertoken.com gratuit | $0 mais payload monolithique 300 modèles + zéro signal fraîcheur | **DevRefs gagne sur fraîcheur signalée + atomicité** (pas sur prix) |
| API token counting Anthropic seule (`POST /v1/messages/count_tokens`) | $0 mais ne donne PAS le prix par MTok à jour, juste le compte de tokens | **Complémentaire, pas substitut** |
| Audit manuel par dev humain (ex. consultant IA) | $200-$2 000/projet | **DevRefs $9.99 = 20×-200× moins cher** |

---

## Section D — Risques assumés et mitigations

### D.1 Risque P1 — Adoption x402 < 2% en 2026

**Signalé par @ia avant Phase 0 v2.** Validation marché x402 = pari fondateur explicite project-context.md.

**Données mai 2026** :
- ~119M tx Base mars 2026 (preuve indirecte volume crypto)
- 28K$/jour réel x402 mars 2026 (preuve indirecte volume x402 spécifique — cf. project-context.md tableau risques)
- Pas de signal "DevRefs" spécifique avant Phase 4 mesure J7

**Mitigation** :
1. **Test E1 J7 binaire** (cf. v1-scope.md § 4) : si 0 paiement x402 J7, diagnostic SEO/GEO puis pivot.
2. **Audit one-shot $9.99** = ticket moyen élevé qui rentabilise même volume bas (60 audits/mois suffisent pour 600 €/mois).
3. **Packs pré-payés** : ticket moyen $10-$50 vs $0.001/call réduit le besoin en volume d'agents actifs.
4. **GEO push** (cf. roadmap.md Phase 4) : citations Perplexity/Claude/ChatGPT augmentent la découvrabilité agent.

### D.2 Risque P1 — Coinbase x402 facilitator instabilité

**Mitigation** : code Worker portable + plan B Solana facilitator V2 (cf. v1-scope.md risque R1).

### D.3 Risque P2 — Pricing x402 perçu comme "trop cher" par agent autonome

Un agent qui interroge fréquemment les prix LLM peut développer une heuristique de cap-budget interne. Si DevRefs > seuil interne, l'agent skip.

**Mitigation** :
- Pricing pack pré-payé = signal "tu paies une fois pour 10K calls" → pas de friction par-call
- Affichage dans la réponse 402 du `alternative_cost_estimate` (cf. `x402-response-spec.md`) qui montre l'agent le ROI directement → l'agent voit qu'il économise 100×-490×

### D.4 Risque P2 — Audit ROI sur-estimé

Les économies 35-55% sont mid-range. Sur un agent déjà optimisé, l'audit peut détecter < 10% d'économies → ROI < 10× promis.

**Mitigation** :
- Garantir ROI minimum dans CGV : "si savings_pct < 15% détecté → remboursement 50%"
- Limiter l'audit aux agents ayant volume > 5M tokens/mois (heuristique input check : si `monthly_volume_estimate < 5M` → message 402 spécifique "DevRefs Audit recommended for agents > 5M tokens/month")

---

## Hypothèses faites

- [HYPOTHÈSE H5] : prix GPT-5 $2.50/$10 input/output per MTok mai 2026. Sources WebSearch divergentes ($1.25 à $3.00 selon V3 verbatim project-context.md) — utiliser fourchette pour calcul ROI, non critique car GPT-5 n'est pas le modèle de référence agent V1.
- [HYPOTHÈSE H6] : profil agent moyen 5-15M tokens/mois solo dev. Estimation basée verbatims V1-V5 + retour dev community 2026, pas sur dataset benchmark public. À valider via E2 (ratio crawl→paiement Phase 4).
- [HYPOTHÈSE H7] : x402 V2 SDKs stables Q3 2026. Source : `x402.org/writing/x402-v2-launch` (V2 launched but SDK maturity à confirmer juin 2026).
- [HYPOTHÈSE H8] : 1 lecteur Dev.to sur 1 000 convertit (taux conversion BOFU technique). Standard secteur dev tools 2026.

---

## Handoff @ia → @orchestrator (Spec 2)

- Statut : COMPLETE
- Pricing final 100% x402 :
  - **Offre 1** : pay-per-call $0.001 OU Pack Discovery $5 / Standard $10 / Pro $50
  - **Offre 2** : Audit one-shot $9.99 OU Pack Pro $49 (6 audits) OU Subscription Pro $29/mois (V2)
- Volume nécessaire 600 €/mois : ~66 ventes/mois (mix packs + audits)
- Volume nécessaire 2-3 K€/mois : 220-330 ventes/mois ou subscription pro recurring
- ROI démontré : Offre 1 = 100×-490× sur tout modèle Opus/Sonnet/GPT-5/Gemini, Offre 2 = 10×+ sur 3 mois pour agent ≥ 5M tokens/mois
- x402 V2 supporte abonnement récurrent (sessions SIWx + deferred payment) — V1 packs only, V2 subscription si signal demande
- Risques signalés : R1 adoption x402 < 2% (P1), R2 instabilité Coinbase (P1), R3 pricing perçu trop cher (P2), R4 audit ROI sur-estimé sur agent déjà optimisé (P2)
