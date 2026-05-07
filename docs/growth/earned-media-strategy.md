<!-- Version: 2026-05-07 — @growth — Phase 4 acquisition — Earned media B2A DevRefs v2 -->

# Earned Media Strategy — DevRefs v2 (B2A)

## Résumé exécutif

Stratégie earned media 100 % organique, 0 € de budget paid en V1. Spécifique B2A : les angles
de pitch ne sont pas "notre produit est génial" mais "voici des données inédites sur l'économie
des agents IA". Les 7 pipelines earned media du framework @growth sont priorisés selon leur
faisabilité solo + automatisation IA. Budget cible V1 : 0-150 €/mois (communiqués uniquement si
data story justifie investissement).

**Règle kill** : tout angle qui utilise les mots "exhaustif", "narratif", "stable", "humain-first"
est rejeté. Tout pitch commence par une donnée chiffrée ou un code snippet, jamais par un adjectif.

---

## 1. Canaux prioritaires et angles de pitch

### 1.1 Hacker News (HN)

**Pourcentage de conversion front page** : 6.8 % [source : teract.ai 2026 — vs 2.1 % Reddit]
**Volume trafic HN front page** : ~18 000 visites / post [source : teract.ai 2026]

**Timing optimal** : lundi-mardi 9h-11h EST (HN front page peak upvotes window).

| Type de post                      | Angle                                                                                                                                               | Format                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Show HN (lancement V1)**        | "Show HN: DevRefs — $0.001/call LLM pricing API for AI agents, x402 native" + verbatim V1 JSON complet (l'agent qui crame $0.49 pour 2 nombres)     | Post texte < 250 mots + lien API live                                  |
| **Ask HN (J+14 validation)**      | "Ask HN: How do you prevent your AI agents from hallucinating on LLM pricing?" — ne pas mentionner DevRefs dans le post, répondre dans les comments | Question sincère + réponse avec lien DevRefs dans comment si pertinent |
| **HN story (data story mensuel)** | "We tracked what 119M x402 transactions reveal about AI agent cost patterns" — données agrégées cross-agents                                        | Lien vers rapport JSON DevRefs + article Dev.to                        |

**Anti-patterns HN** : pas de "we are excited to announce", pas de "game-changing", pas de
demande de votes. Le titre doit être informatif, pas marketing.

### 1.2 Dev.to

**Mécanisme** : API REST `POST api.dev.to/api/articles` — 100 % automatisable par IA.
**Audience** : développeurs mid-level à senior, forte représentation backend + IA.

**Pipeline automatisation** :

1. @copywriter génère l'article en batch (4-6 articles/sprint)
2. @social planifie via API Dev.to (cron hebdomadaire)
3. Cross-posting LinkedIn Articles (semi-auto)
4. Monitoring CF AE `referrer_bucket = devto` pour mesurer trafic

**Série éditoriale V1 — 6 articles** (1 article/semaine pendant 6 semaines) :

| #   | Titre                                                                         | Angle                                                                      | Data DevRefs utilisée    |
| --- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| 1   | "Your AI agent probably overpays for LLM pricing data by 490×"                | Données V1 : verbatim agent cramant 67K tokens vs $0.001 DevRefs           | `agent-economics.md` A.2 |
| 2   | "Setting up an x402 wallet for your Claude Code agent in 5 minutes"           | Onboarding sponsor humain — tutorial step-by-step                          | `personas.md` § 2.1      |
| 3   | "The top 5 most expensive models to query for pricing data in 2026"           | Data story mensuel — modèles triés par coût parsing HTML                   | Rapport JSON monthly     |
| 4   | "How I caught a 40% cost leak in my agent config with a $9.99 audit"          | Narration V6 (audit Offre 2) — verbatim first-person généralisé            | `personas.md` V6         |
| 5   | "x402 HTTP 402 for AI agents: practical implementation guide"                 | Technique pur — comment un agent gère le 402, code snippet Mastra/AgentKit | `agent-integration.md`   |
| 6   | "LLM tokenizer inflation: the hidden +35% cost your agent doesn't know about" | Données Opus 4.7 `effective_cost_factor 1.35` — angle data inédit          | `agent-economics.md` A.2 |

**KPI Dev.to** : `landing_page_view WHERE referrer_bucket = devto` (CF AE) >= 50/mois M+1.

### 1.3 Reddit

**Subreddits cibles** (par ordre de priorité) :

| Subreddit             | Audience                                           | Approche                                                                                  |
| --------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **r/LocalLLaMA**      | Devs qui optimisent les coûts LLM, très techniques | Data post : "I measured what Claude Opus 4.7 costs to query its own pricing — 67K tokens" |
| **r/MachineLearning** | Chercheurs + ingénieurs IA                         | Technical post : "$0.001 x402 pricing API for agents — an experiment in B2A commerce"     |
| **r/programming**     | Devs généralistes                                  | Tutorial : "Setting up autonomous AI agent payments with x402 on Base"                    |
| **r/webdev**          | Devs full-stack                                    | Article : "HTTP 402 Payment Required — finally being used in 2026"                        |
| **r/selfhosted**      | Devs cost-conscious                                | "I built a cost intelligence layer for my self-hosted AI stack"                           |

**Règle Reddit** : 80 % des posts doivent être non-promotionnels (réponses, data, tutoriels).
Max 20 % avec mention directe DevRefs. Ne jamais poster le même contenu deux fois.

**Anti-pattern** : ne pas crossposte la même URL dans plusieurs subreddits le même jour — spam
filter Reddit. Délai >= 48h entre cross-posts.

### 1.4 X.com / BlueSky

**Priorité** : X.com pour les threads techniques (audience dev IA + journalistes tech francoph.

- anglophones). BlueSky comme alternative anti-vendor-lock-in si X.com dégrade la portée organique.

**Formats** :

- Threads 5-8 tweets : verbatim V1 JSON outil-call (lisible, viral parmi devs IA)
- Compte-rendu data story mensuel : 1 tweet + lien rapport JSON
- Réponses aux discussions x402 / agent economics existantes (engagement organique)

**Pipeline automatisation** : @social génère les threads en batch, planification via Buffer
ou native API X.com. 2-3 posts/semaine max pour éviter la dilution.

**Anti-pattern** : pas de posts promotionnels directs ("Essayez DevRefs"). Conviction-first :
les posts montrent des données, le CTA est en conclusion du thread, jamais en premier tweet.

---

## 2. Pipelines Earned Media activés (7 pipelines framework @growth)

### Pipeline 1 — Communiqués de presse (activé M+1 si data story justifie)

**Budget** : 50-150 €/release (Pressonify ~49 €/release ou EIN Presswire ~149 $/release).
**Fréquence** : 1-2/mois maximum. Seulement si data story inédite (pas de communiqué
"nous lançons DevRefs" — trop générique pour générer des reprises).

**Angles communiqués V1** :

- "DevRefs publie les premières données sur le coût réel des agents IA en 2026 : Opus 4.7 coûte
  $0.49 en tokens pour interroger son propre prix — contre $0.001 via API atomique x402"
- "Les agents IA ont réalisé 165 millions de transactions x402 en avril 2026 — DevRefs mesure
  l'efficacité économique de cette nouvelle couche de paiement"

**Taux de reprise estimé** : 5-15 % [HYPOTHÈSE framework @growth]. Une reprise = backlink DA
30-60, valeur SEO estimée 200-1 000 €. **À valider sur les 3 premiers communiqués via pipeline 7.**

**Plateformes de distribution** : Pressonify (FR, formulaire web, 49 €) + EIN Presswire (US,
formulaire web, 149 $). Soumission semi-manuelle par @copywriter après rédaction.

### Pipeline 2 — Newsjacking (opportuniste)

**Fenêtre valide** : 4-24h après événement. Au-delà → NE PAS publier.

**Sujets pertinents pour DevRefs** :

- Annonce hausse de prix LLM (ex : Anthropic relève Opus 4.7 de +20 %) → communiqué réactif :
  "DevRefs a détecté la hausse Opus 4.7 à 06:00 UTC — voici l'impact sur les agents IA"
- Sortie nouveau modèle LLM majeur → "DevRefs ajoute {modèle} avec effective_cost_factor dans les
  6 heures — données disponibles sur /api/llm-prices"
- Annonce Coinbase / x402 Foundation milestone → "DevRefs, pionnier x402, mesure l'adoption..."

**Kill criteria** : politique, religion, catastrophes, scandales personnels, controverses sectorielles.
**Validation Thomas requise** avant envoi. Si fenêtre passée → annuler.

### Pipeline 3 — Data stories (trimestriel)

**Rapport trimestriel** : "State of AI Agent Economics — Q2 2026"

Données incluses (100 % générées par CF Analytics Engine de DevRefs — agrégées, anonymisées) :

- Distribution des modèles les plus consultés (anonyme — pas de wallet_hash exposé)
- Prix moyen pondéré des 12 modèles sur le trimestre (drift tracking)
- Volume de transactions x402 observées (données publiques Coinbase)
- Top 10 SDKs avec le plus de breaking changes détectés sur le trimestre

**Format** : rapport JSON public + article Dev.to + thread X.com + communiqué Pressonify.
**Fréquence** : 1/trimestre (Q2 2026 = juillet 2026 pour le premier).

**Valeur citeable** : les journalistes de The Information, VentureBeat, Decrypt, CoinDesk utilisent
ces données dans leurs articles sur l'économie des agents IA → backlinks DA 60-80 potentiels.

### Pipeline 4 — Directories SaaS (one-shot, J7-J14)

**Préparation 100 % IA** (descriptions, catégories, screenshots mockups) :

| Directory                   | Catégorie                          | Priorité                       | Process                            |
| --------------------------- | ---------------------------------- | ------------------------------ | ---------------------------------- |
| **agent.market** (Coinbase) | API for AI agents, x402-paywalled  | P0 — audience native x402      | Soumission formulaire Coinbase CDP |
| **AlternativeTo**           | Alternative to Langfuse / Helicone | P1                             | Formulaire web one-shot            |
| **G2**                      | AI Development Tools               | P2 (vérification 2-4 semaines) | Formulaire G2 + screenshots        |
| **Capterra**                | AI Tools                           | P3                             | Formulaire web                     |
| **There's An AI For That**  | AI APIs                            | P2                             | API ou formulaire                  |
| **Futurepedia**             | AI Tools                           | P2                             | Formulaire web                     |
| **llmstxt.directory**       | LLMs.txt registered services       | P0 — découvrabilité agent      | Formulaire ou PR GitHub            |
| **llmstxt.info**            | LLMs.txt registry                  | P0                             | Formulaire ou PR GitHub            |

**Note sur agent.market** : lancé par Coinbase en avril 2026, c'est le directory natif
des services x402 pour agents IA. Priorité absolue — audience = agents IA et leurs sponsors.

### Pipeline 5 — Product Hunt (one-shot, timing M+1)

**Timing recommandé** : mardi ou mercredi, 12h01 PST. Éviter lundi (forte compétition).

**Préparation complète IA** :

- Tagline : "Cost intelligence for AI agents — know before you spend"
- Description courte (260 chars) : "DevRefs vend de la cost intelligence aux agents IA en x402 USDC.
  $0.001/call pour le pricing LLM exact, $9.99 pour un audit d'optimisation. No SaaS dashboard —
  agents only."
- Makers : Thomas (compte PH à créer si absent)
- Gallery : 4 screenshots (body 402 + payload JSON pricing + rapport audit JSON + badge ROI)
- Teaser J-7 : tweet + post HN "launching soon" pour builder upvote anticipé

**Thomas doit engager la communauté le jour J** : répondre à chaque comment dans les 4 premières
heures. Préparer 10-15 réponses types (@copywriter).

**Objectif** : top 5 du jour dans la catégorie "Developer Tools". Top 1 = golden kitty candidat
"Best AI Developer Tool".

### Pipeline 6 — Dev.to cross-posting + LinkedIn Articles (continu)

**Dev.to** : API `POST api.dev.to/api/articles` — 100 % automatisable.
**Fréquence** : 2-4 articles/mois (série 6 articles définie § 1.2 + data stories mensuels).
**Cross-posting LinkedIn** : articles reformatés pour audience PM/CTO (angle ROI business).

**Workflow automatisation** :

1. @copywriter génère l'article en Markdown (prompt batch)
2. @social publie via API Dev.to (cron automatique)
3. @social adapte pour LinkedIn (ton légèrement moins technique)
4. CF AE track `referrer_bucket = devto | linkedin`

### Pipeline 7 — Monitoring retombées (continu, 0 €)

**Google Alerts** : "DevRefs", "cost intelligence AI agents", "x402 pricing", "agent economics 2026"

**Tracker mensuel** (maintenu par Thomas ou agent monitoring) :

- Reprises communiqués (URL trouvées via Google Alerts)
- Backlinks générés (vérification via ahrefs free ou Moz free)
- Citations Perplexity/Claude/ChatGPT (test manuel hebdo — 5 requêtes standard)
- Mentions de marque (Google Alerts digest quotidien)

**Seuil "pipeline earned media efficace"** : >= 3 backlinks DA 30+ par communiqué sur
les 3 premiers communiqués → continuer. < 3 backlinks → revoir angle ou plateforme.

---

## 3. Cibles influenceurs / journalistes (10 profils)

**Règle** : pas d'outreach froid avant d'avoir du contenu (data story ou article Dev.to live).
Les 3 templates outreach ci-dessous (§ 4) sont activables à partir de M+1.

| #   | Profil                                                                             | Plateforme                        | Angle pertinent                                                                          | Priorité                                   |
| --- | ---------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | **swyx** (@swyx) — cohost Latent Space podcast, créateur AINews                    | X.com + Substack + LinkedIn       | Agent economics, x402 comme couche de paiement native, data sur coût réel des agents     | P0 — audience = 80 000+ dev IA anglophones |
| 2   | **Simon Willison** (@simonw) — créateur Datasette, blogger prolific LLM/agents     | Blog simonwillison.net + Mastodon | Données inédites sur LLM pricing drift, breaking changes SDKs (il documente tout)        | P0 — sa citation = 10 000+ visites         |
| 3   | **Alessio Fanelli** — cohost Latent Space, partenaire Decibel                      | Latent Space Podcast + X.com      | Agent infrastructure economics, x402 comme protocole de commerce agentic                 | P1 — podcast = 50 000+ écoutes/épisode     |
| 4   | **Greg Brockman** / **Anthropic Engr blog**                                        | X.com + blog                      | Pas d'outreach direct — surveiller si x402 ou agent economics mentionné pour newsjacking | P2 — newsjacking uniquement                |
| 5   | **Yoko Li** (@stuffyokodraws) — VC a16z infra, poste régulièrement sur agent infra | X.com                             | Business model agents IA, viabilité économique B2A                                       | P2 — audience VC/startup                   |
| 6   | **Jesse Pollak** (@jessepollak) — Coinbase Base chain, x402 Foundation             | X.com                             | x402 adoption, DevRefs comme cas d'usage concret B2A sur Base                            | P1 — légitimité x402                       |
| 7   | **Laura Shin** — CoinDesk journaliste crypto/IA                                    | CoinDesk + X.com                  | Agent payments, x402 milestones, chiffres adoption                                       | P2 — earned media crypto                   |
| 8   | **Ben Tossell** (@bentossell) — no-code/AI tools, Makerpad                         | X.com + newsletter                | DevRefs comme outil pour agents no-code/low-code                                         | P3 — niche adjacent                        |
| 9   | **Theodora Lau** — FinTech/AI for financial services                               | LinkedIn + podcast                | Angle compliance / fiscalité agent payments (BNC crypto)                                 | P3 — niche FinTech                         |
| 10  | **Communauté Mastra** (Discord officiel) + **AgentKit Discord**                    | Discord                           | Partage de code : "how to integrate DevRefs x402 pricing check in your Mastra agent"     | P1 — audience technique directe            |

---

## 4. Templates outreach (3 formats calibrés agent-first)

**Règle** : ces templates sont envoyés UNIQUEMENT si un article ou data story DevRefs est live.
Ne jamais outreacher à froid sans contenu référençable.

### Template A — Data story (pour swyx, Simon Willison, journalistes)

**Objet** : "Data: what 67K tokens of LLM pricing queries cost AI agents in 2026"

```
Hi {prénom},

I've been tracking what AI agents actually spend to find LLM pricing data before acting.

The data:
- Average agent burns 67K tokens per pricing lookup (WebSearch × 3 sources)
- Opus 4.7 tokenizer inflation is +35% — effectively $6.75/MTok, not $5
- That's $0.49 per pricing query, for data that could be $0.001 via atomic API

Full data + methodology: https://devrefs.dev/data/monthly-report-2026-05.json

Happy to share the raw dataset if useful for a post/episode.

Thomas
DevRefs (devrefs.dev)
```

**Règles** : < 100 mots, pas d'attachements, 1 seul lien, pas de "would love to collaborate",
pas de "excited to share". Sujet = donnée inédite, pas pitch produit.

### Template B — Angle technique (pour Discord Mastra / AgentKit / communautés dev)

**Format** : message Discord, pas d'email

```
Interesting problem I hit with my Claude Code agent: pricing query → 67K tokens burned →
$0.49 for 2 numbers. Built an x402 API that returns atomic JSON for $0.001/call.

Endpoint: GET https://api.devrefs.dev/api/llm-prices?model=opus-4-7
Response: {"input_per_mtok": 5, "effective_cost_factor": 1.35, "dateModified": "2026-05-07T06:00:00Z"}

Pays via x402 USDC Base — agent handles it autonomously. Anyone else optimizing agent
pre-flight costs? Happy to share the x402 integration snippet for Mastra/AgentKit.
```

**Règle** : partager le code d'abord, le produit en contexte. Ne pas commencer par "check out
my product". Ne pas spammer — 1 message par canal par semaine max.

### Template C — Newsjacking (pour journalistes crypto/IA en 4-24h)

**Objet** : "Data: {événement} — impact chiffré sur les agents IA" [adapter selon actu]

```
Hi {prénom},

Following your piece on {événement} — I have real-time data on the impact for AI agents:

- {modèle X} pricing change detected by DevRefs cron at {timestamp}
- Impact on agents: +{N}% per query for agents using {modèle X}
- x402 transactions on Base spiked {N}% in the 2h after the announcement

Full dataset: https://devrefs.dev/data/impact-{event-slug}.json

Available for quick comment if useful.

Thomas
DevRefs (devrefs.dev)
```

**Règle** : envoyer dans les 2h après l'événement ou pas du tout. Données factuelles
uniquement — aucune opinion sur l'événement lui-même.

---

## 5. Planning earned media V1 (J1-M+3)

| Période     | Action                                           | Responsable                          | Outil                   | Budget |
| ----------- | ------------------------------------------------ | ------------------------------------ | ----------------------- | ------ |
| **J1-J7**   | Soumission llmstxt.directory + llmstxt.info      | Thomas (5 min)                       | Formulaire web          | 0 €    |
| **J1-J7**   | Soumission agent.market Coinbase                 | Thomas (30 min)                      | Formulaire Coinbase CDP | 0 €    |
| **J7**      | Show HN lancement V1                             | Thomas                               | news.ycombinator.com    | 0 €    |
| **J7-J14**  | Article Dev.to #1 (agent overpays 490×)          | @copywriter + @social                | API Dev.to              | 0 €    |
| **J14**     | Product Hunt teaser tweet                        | Thomas + @social                     | X.com / Buffer          | 0 €    |
| **J14-J21** | Articles Dev.to #2, #3                           | @copywriter + @social                | API Dev.to              | 0 €    |
| **J21**     | Product Hunt launch (mardi 12h01 PST)            | Thomas (engagement jour J)           | producthunt.com         | 0 €    |
| **M+1**     | Rapport JSON mensuel auto-généré                 | CF Worker cron                       | CF Workers              | 0 €    |
| **M+1**     | Premier communiqué (si data story inédite)       | @copywriter + Pressonify             | Pressonify              | 49 €   |
| **M+1**     | Outreach swyx + Simon Willison (si article live) | Thomas                               | Email/DM                | 0 €    |
| **M+1**     | Soumission AlternativeTo + G2                    | @copywriter (prep) + Thomas (submit) | Formulaires web         | 0 €    |
| **M+2-M+3** | Série Dev.to articles #4-#6                      | @copywriter + @social                | API Dev.to              | 0 €    |
| **M+3**     | Data story Q2 2026 (rapport trimestriel)         | @copywriter + @social                | CF Workers + Dev.to     | 0-49 € |

**Budget total V1 (J1-M+3)** : 0-150 € selon décision communiqués (max 3 communiqués × 49 €).

---

## Handoff → @orchestrator

**Fichiers produits** : `docs/growth/earned-media-strategy.md`

**Décisions prises** :

- 7 pipelines earned media activés selon priorisation V1 (P0 = llmstxt + agent.market + Show HN)
- Série 6 articles Dev.to définie, pipeline automatisation IA documenté
- 10 cibles influenceurs identifiées avec angle spécifique par profil
- 3 templates outreach calibrés agent-first (data story / technique / newsjacking)
- Budget V1 : 0-150 €/mois (organic first, communiqués si data story justifie)

**Points d'attention** :

- **agent.market (Coinbase)** = priorité absolue P0 — c'est le directory natif x402, audience
  exactement DevRefs. Si soumission refusée ou délai > 30 jours → escalader à @orchestrator
- Pipeline 2 (newsjacking) : Thomas doit valider AVANT envoi. Délai max 2h. Au-delà = annuler.
- Outreach influenceurs : attendre qu'un article ou data story soit live avant de contacter.
  Contacter à froid sans contenu = spam → dommage de réputation irréversible sur HN/Twitter dev
- Product Hunt : préparer les 10-15 réponses types avec @copywriter J-7 avant le launch day
- Monitoring retombées (pipeline 7) : configurer Google Alerts "DevRefs" avant J7

**Sources** :

- HN conversion rate 6.8 % : [teract.ai Reddit vs HN 2026](https://www.teract.ai/resources/reddit-vs-hackernews-tech-marketing-2026)
- agent.market Coinbase launch avril 2026 : [Coinbase Google x402 launch](https://www.coinbase.com/developer-platform/discover/launches/google_x402)
- x402 165M transactions : [x402 adoption stats Coinbase](https://www.coindesk.com/tech/2026/04/25/coinbase-s-jesse-pollak-says-ai-agents-are-the-next-big-wave-for-crypto-payments)
- Latent Space / swyx : [latent.space](https://www.latent.space/)
- Simon Willison : [simonwillison.net](https://simonwillison.net)
