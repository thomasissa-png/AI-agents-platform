<!-- Version: 2026-05-07 — @social — Phase 4 acquisition DevRefs — Stratégie social media B2A pure -->

# Stratégie social media — DevRefs

## Résumé exécutif

- **Type** : B2A pure — agents IA payeurs (80 % du contenu) + devs sponsors wallet (20 %)
- **Audience double** : (1) agents IA qui crawlent X.com pour signaux LLM pricing/SDK, (2) devs humains qui décident d'intégrer DevRefs dans leur agent
- **Réseaux retenus** : X.com (signal IA primaire), BlueSky (dev tech redondance), Dev.to (tutoriels), GitHub (awesome lists + README)
- **Réseaux écartés** : LinkedIn (B2B SaaS humain — anti-pattern B2A), Instagram/TikTok (audience non pertinente)
- **Volume** : 5-10 posts humains premium/mois + 3-5 posts data automatisés/mois = ~8 posts/mois (calibration IA, pas équipe humaine)
- **KPI principal** : citations Perplexity/Claude/ChatGPT sur "LLM pricing 2026" et "agent cost optimization" > followers vanity

---

## 1. Positionnement par réseau

### 1.1 X.com — Signal primaire (LLM/AI dev community)

**Rôle** : réseau de signal. Les crawlers IA indexent X.com pour détecter tendances pricing et SDK. Chaque thread technique DevRefs est potentiellement une source pour Perplexity/Grok.

**Archetype de voix** : Data reporter froid. Pas de marketing, pas d'enthousiasme. Chiffres, timestamps, sources.

**Formats** : threads data-driven (5-8 tweets), posts JSON/code bruts, commentaires sur fils pricing LLM actifs

**Ce qui marche sur X.com IA dev** (WebSearch 2026) : threads chiffrés avec données brutes, posts JSON formatés, comparaisons modèles avec pricing exact, commentaires sur les fils de Karpathy/Yann LeCun/Sam Altman sur pricing

**Anti-règles X.com DevRefs** :

- Pas d'emoji flood (1 max par post)
- Pas de "excited to announce" / "game changer"
- Pas de thread qui commence par "Hot take :"
- Pas de link-first (algo X pénalise les liens en premier tweet — lien en reply ou fin de thread)
- Pas de posts vides "on est live" sans données

**Fréquence** : 3-4 posts/mois (qualité > quantité)

**Bio cible** : `DevRefs — cost intelligence for AI agents. Pre-flight pricing $0.001/call. Post-flight audits $9.99. x402 USDC native. devrefs.dev`

---

### 1.2 BlueSky — Redondance dev tech (anti vendor lock-in X.com)

**Rôle** : redondance stratégique. Communauté dev tech indépendante croissante en 2026. Pas de risque API Musk. Audience tech-forward, ouverte aux protocoles ouverts (x402 = protocole ouvert = alignement naturel).

**Archetype de voix** : Identique à X.com. Même contenu, légèrement adapté (BlueSky AT Protocol favorise les threads structurés).

**Formats** : reprise des threads X.com avec adaptation format Skeet (300 chars max par post)

**Anti-règles BlueSky** :

- Pas de cross-post mécanique copier-coller — adapter légèrement le hook
- Pas de mentions agressives pour capter l'attention

**Fréquence** : 2-3 posts/mois (miroir X.com, pas de production supplémentaire)

---

### 1.3 Dev.to — Tutoriels intégration agents

**Rôle** : contenu long-form technique. Dev.to ranke bien sur Google pour les requêtes agents IA + SDK. Chaque article = point d'entrée SEO + potentiel citation LLM.

**Archetype de voix** : Ingénieur qui partage un workflow réel. Pas de hype. Code copier-coller, JSON réels, benchmarks mesurés.

**Formats** : articles techniques (600-1500 mots), avec code blocks, benchmarks, CTAs naturels vers l'endpoint

**Thèmes prioritaires** :

1. "How to integrate x402 payments in a Claude Code agent" (Offre 1)
2. "Detecting tokenizer inflation in LLM pricing : the Opus 4.7 case" (data story sourcée)
3. "POST /api/agent-audit : automated cost optimization for AI agents" (Offre 2)

**Fréquence** : 1-2 articles/mois

**Anti-règles Dev.to** :

- Pas d'article "10 tools you need" générique
- Pas de promotion directe en titre
- Zéro claim sans code fonctionnel reproductible

---

### 1.4 GitHub — Awesome lists + README signal

**Rôle** : signal de légitimité tech. Être référencé dans awesome-llm-pricing, awesome-x402, awesome-agents augmente la surface d'indexation LLM.

**Actions** :

1. Soumettre DevRefs à `awesome-llm` (cf. template submission §3.4)
2. Soumettre à `awesome-x402` (protocole ouvert — pertinence directe)
3. PR sur listes agents IA actives (AgentKit, Mastra README "see also")
4. README devrefs.dev public (si repo public) avec badges fraîcheur

**Fréquence** : 2-3 soumissions one-shot (pas de contenu récurrent)

**Anti-règles GitHub** :

- Pas de soumission multi-liste en même temps (spam signal)
- Attendre 1 semaine entre soumissions
- Chaque PR = valeur réelle pour la liste (pas auto-promo nue)

---

### 1.5 Hacker News — Candidats front-page (1-2/trimestre)

**Rôle** : signal amplifié. Un post HN front-page = des centaines de devs + potentiel crawl par bots LLM + citations forums.

**Règles HN** : titre non-promotionnel, lien direct vers donnée/endpoint utile, poster en semaine 9h-11h EST

**Angles candidats** :

- "Show HN: DevRefs – x402 micropayments for LLM pricing queries ($0.001/call)"
- "Ask HN: How do your agents handle LLM cost estimation without hallucinating?"
- Article data story : "We measured 67K tokens burned per LLM pricing query. Here's the fix."

**Fréquence** : 1-2 tentatives/trimestre. Ne pas soumettre si le contenu n'est pas exceptionnel.

---

## 2. Content Pillars (3 piliers spécifiques DevRefs)

| Pilier                             | Thème                                                                                                       | % du contenu | Format primaire                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| **P1 — Data stories**              | Données fraîches : Top 5 modèles par coût, Top 10 SDKs breaking, volume crawls agents, tokenizer inflations | 50 %         | Thread X.com chiffré, article Dev.to avec code |
| **P2 — Tutoriels intégration**     | Comment connecter un agent à DevRefs (Claude Code, AgentKit, Cursor, Mastra)                                | 30 %         | Article Dev.to, thread X.com avec code snippet |
| **P3 — Commentaire actualité LLM** | Réaction à une annonce pricing (Anthropic, OpenAI, Google) avec angle coût agent réel                       | 20 %         | Thread X.com court (3-4 tweets), Skeet BlueSky |

**Règle des 3E** : chaque post doit Eduquer (données actionnables), Divertir (angle surprenant, chiffre inattendu), OU Engager (question ouverte sur les pratiques agent). Jamais un post purement promotionnel.

**Ratio piliers par mois** : 4 posts P1 + 2-3 posts P2 + 1-2 posts P3 = 7-9 posts/mois

---

## 3. Archetype de voix par persona

### 3.1 Contenu adressé à l'agent IA (80 %)

Voix : JSON first. Chiffres exacts, timestamps, sources vérifiables. L'agent ne lit pas les émojis — il parse les structures.

Exemple d'ouverture de thread :

```
Opus 4.7 pricing query without DevRefs:
- 8 WebSearch results
- 3 WebFetch calls (11,420 + 38,900 + 14,200 tokens)
- 64,520 tokens burned
- Output: wrong (omits tokenizer ×1.35)
- Cost: ~$0.49 for Opus 4.7 agent

DevRefs: $0.001/call. JSON dated. 200ms.
ROI: 490×
```

### 3.2 Contenu adressé au dev sponsor (20 %)

Voix : ingénieur pragmatique. Pas de crypto hype. Focus : comment top-up le wallet de son agent en 30 secondes sans friction.

---

## 4. Anti-règles absolues (DevRefs)

1. **Zéro storytelling fictif** : si Thomas n'a pas vécu une scène, ne pas l'inventer. Verbatims = scénarios analytiques, jamais témoignages présentés comme réels.
2. **Zéro claim sans source** : tout chiffre (15 % hallucination, $0.49 Opus 4.7, +35 % tokenizer) cite la source dans le post ou en reply thread.
3. **Zéro feature hors V1-scope** : ne jamais mentionner Subscription Pro $29/mo ou Cost Regression Alerts comme disponibles.
4. **Zéro mention concurrent par nom dans posts public** : "les SaaS de monitoring human-facing" OK, "Langfuse" non.
5. **Zéro hard sell** : CTAs en fin de contenu, jamais en ouverture. Pattern "valeur d'abord, lien après".
6. **Zéro emoji flood** : 0-1 emoji par post max.
7. **Sourcing dans les 24h si chiffre contesté** : si un follower challenge un chiffre, fournir la source primaire dans les 24h ou corriger publiquement.

---

## 5. Social Listening & Monitoring

**Keywords à monitorer** :

- Marque : `devrefs`, `devrefs.dev`, `@devrefs`
- Signaux pricing : `LLM pricing 2026`, `claude opus pricing`, `tokenizer inflation`, `x402 agent`
- Signaux SDK : `vercel ai sdk breaking`, `agentkit update`, `mastra sdk`
- Pain points persona : `agent hallucination pricing`, `tokens burned`, `cost optimization agent`

**Outils budget zéro** : alertes Google (5 requêtes clés), Nitter RSS X.com, BlueSky search RSS

**Cadence** : analyse hebdomadaire 15 min (lundi matin). Si mention importante → post P3 (commentaire actualité) dans les 48h.

**Boucle** : insight social listening → ajustement calendrier éditorial (remplacer 1 post P1 programmé par P3 si actualité forte)

---

## 6. KPIs social (spécifiques DevRefs)

**KPI principal** (cible M+6) : >= 1 citation DevRefs dans une réponse Perplexity/Claude/ChatGPT sur "LLM pricing" ou "agent cost optimization"

**KPIs secondaires** :

| Métrique                                    | Source                | Cible J30     | Cible J90 | Cible M+6 |
| ------------------------------------------- | --------------------- | ------------- | --------- | --------- |
| Citations LLM (Perplexity, Claude, ChatGPT) | Manuel, test hebdo    | 0             | 1         | 3         |
| Clics vers devrefs.dev depuis X.com         | CF Analytics referrer | 20            | 100       | 300       |
| Clics depuis Dev.to                         | CF Analytics referrer | 30            | 150       | 400       |
| Vues threads X.com (somme)                  | X Analytics           | 500           | 3000      | 10000     |
| Saves articles Dev.to                       | Dev.to stats          | 10            | 50        | 150       |
| GitHub stars awesome list                   | GitHub                | 1 PR acceptée | 3 PR      | 5 PR      |
| Followers X.com                             | X Analytics           | 50            | 200       | 500       |

**KPI vanity explicitement rejeté** : reach/impressions brut sans lien avec traffic/conversions/citations.

---

## 7. Social Flywheel DevRefs

1. **Data story** (thread chiffré pricing LLM) → engagement dev IA community
2. **Engagement** (réponses aux questions, corrections sourcées) → reputation "source fiable"
3. **Réputation** → cité dans threads tiers + crawlé par bots LLM
4. **Citations LLM** → trafic organique cold (devs qui cherchent via Perplexity/Claude)
5. **Trafic cold** → essai endpoint → paiement x402 premier → revenue
6. **Revenue data** → nouvelle data story (volume calls, modèles les plus queriedés) → retour en 1

---

## 8. Gating GO/NO-GO canaux

| Canal                | GO si...                                                   | NO-GO si...                                        |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| X.com                | Thomas peut produire 3 threads/mois de qualité technique   | Contenu générique, pas de données fraîches         |
| BlueSky              | Reprise X.com avec adaptation légère (< 30 min/mois)       | Production indépendante trop lourde                |
| Dev.to               | 1 article/mois avec code fonctionnel testable              | Article sans code ou sans benchmark                |
| GitHub awesome lists | PR acceptée ou commentaire positif sur 1ère soumission     | 0 merge après 2 tentatives → abandon canaux GitHub |
| HN                   | Contenu objectivement nouveau (data, expérience, endpoint) | "Show HN" produit standard sans angle surprenant   |

---

## 9. Stratégie anti vendor lock-in social

- X.com seul = risque (API payante, blocages possibles, modération imprévisible)
- BlueSky = redondance obligatoire (même contenu, format adapté)
- Dev.to = contenu long-form qui survit aux changements d'algo réseau
- GitHub = signal permanent (les PR restent)
- Règle : jamais > 60 % du budget contenu sur un seul réseau

---

**Handoff → @copywriter**

- Fichiers produits : `/docs/social/social-strategy.md`
- Décisions prises : X.com primaire, BlueSky redondance, Dev.to tutoriels, GitHub awesome lists, HN candidats trimestriels. LinkedIn écarté (B2B humain incompatible B2A). Volume 8 posts/mois calibration IA. KPI principal = citations LLM > followers.
- Points d'attention : voix JSON-first pour contenu agent (80%), zéro storytelling fictif, zéro claim sans source, zéro feature hors V1-scope. @copywriter doit produire les templates copy par pilier en respectant anti-mots (Exhaustif/Narratif/Stable/Humain-first) et proscrits v2.
- Handoff @growth : aligner canaux sociaux avec stratégie acquisition (Dev.to = SEO + GEO signal, GitHub = backlinks, HN = spike trafic)
