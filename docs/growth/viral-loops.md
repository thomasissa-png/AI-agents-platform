<!-- Version: 2026-05-07 — @growth — Phase 4 acquisition — Boucles virales agents IA DevRefs v2 -->

# Boucles virales — DevRefs v2 (agent-first)

## Résumé exécutif

5 boucles virales conçues pour un produit B2A pur. La viralité n'est pas "partagez avec un ami" —
c'est l'agent lui-même qui encode sa trace dans des artefacts lisibles par d'autres agents et
développeurs (commits, PRs, README, payloads). Chaque boucle a un trigger machine-déclenché,
un output observable, et un K-factor estimé conservateur.

**Rappel K-factor** : K = i × c (i = invitations par utilisateur actif, c = taux de conversion
des invitations). K >= 1 = croissance virale. K = 0.1-0.3 = amplification organique utile.
[HYPOTHÈSE : aucun benchmark K-factor B2A agent IA publié en 2026 — estimations calibrées sur
analogies dev tools viraux : Vercel deploy badge K ~ 0.05-0.15, Stripe "powered by" K ~ 0.02-0.08]

---

## Boucle 1 — Audit ROI encodé dans la description de PR GitHub

### Trigger

Après `audit_paid_x402` complété, le rapport JSON inclut un champ `pr_snippet` pré-rédigé :

```json
{
  "pr_snippet": "<!-- DevRefs cost audit: score 67/100, savings_pct 40%, monthly_savings_usd 36 — audit: https://devrefs.dev/audit/{audit_id} -->",
  "auto_applicable": true
}
```

### Output

L'agent qui génère des PRs (Claude Code, Cursor agent, OpenAI Agents SDK) peut inclure automatiquement
ce snippet HTML commenté dans la description de PR. Ce commentaire est invisible dans le diff,
visible dans l'onglet "Description" de la PR, lisible par les reviewers humains et parseable par
d'autres agents qui inspectent les PRs (CI bots, review agents, agents d'orchestration).

**Signal observé par le reviewer** : "Mon agent a passé un audit de coût DevRefs — saving $36/mois."
Un reviewer curieux clique le lien → landing DevRefs → top-up potentiel de son propre agent.

### Faisabilité V1 vs V2

| Dimension                       | V1 (livrable immédiat)                                                                         | V2 (M+3 si signal)                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `pr_snippet` dans rapport audit | OUI — 1 champ JSON supplémentaire dans F1b                                                     | —                                                            |
| Auto-injection dans PR          | NON en V1 — l'agent décide lui-même d'inclure le snippet (suggestion, pas automatisme DevRefs) | OUI si DevRefs propose un MCP tool `inject_audit_pr_snippet` |
| Tracking clics `audit_id` lien  | OUI — CF AE `audit_share_clicked`                                                              | —                                                            |

### K-factor estimé

- i = 1 audit → 1 PR → 2-5 reviewers exposés au lien
- c = 5-10 % (reviewers qui cliquent + convertissent)
- **K ~ 0.05-0.30** [HYPOTHÈSE]

### Métriques V1

- `audit_delivered` WHERE `pr_snippet_included = true` (flag dans rapport)
- `audit_share_clicked` (CF AE — click sur lien `audit_id`)
- `landing_page_view WHERE referrer_bucket = github_pr`

---

## Boucle 2 — Commit message "cost-optimized" encodé par l'agent

### Trigger

Après application des recommandations audit (auto-applicable == true), l'agent applique les patches
et génère un commit. La recommandation inclut un `commit_tag` suggéré :

```json
{
  "id": "model_downgrade",
  "commit_tag": "[devref:cost -40% $36/mo saved]",
  "patch": "replace claude-opus-4-7 → claude-sonnet-4-6 in agent config",
  "auto_applicable": true
}
```

### Output

Le commit message dans le repo git de l'agent (ou du dev sponsor) inclut le tag `[devref:cost ...]`.
Ce tag est visible dans `git log`, dans les diff GitHub/GitLab, dans les changelogs auto-générés,
et indexé par les moteurs de recherche code (GitHub Code Search, Sourcegraph).

**Signal organique** : un dev qui cherche "comment réduire le coût de son agent Claude Code" et
trouve un commit tagué `[devref:cost]` dans un repo open source → discovery DevRefs via GitHub
Code Search.

### Faisabilité V1 vs V2

| Dimension                        | V1                                                            | V2                                           |
| -------------------------------- | ------------------------------------------------------------- | -------------------------------------------- |
| `commit_tag` dans recommandation | OUI — champ optionnel dans `recommendations[]` F1b            | —                                            |
| Adoption par l'agent             | Dépend du prompt système de l'agent (DevRefs ne contrôle pas) | MCP tool V2 qui génère le commit directement |
| Indexation GitHub Code Search    | Automatique si repo public                                    | —                                            |

### K-factor estimé

- i = 1 commit tagué → 1-10 devs qui lisent le repo
- c = 2-5 % (devs curieux du tag → recherche DevRefs)
- **K ~ 0.02-0.10** [HYPOTHÈSE — signal discret mais très durable (git log permanent)]

### Métriques V1

- `landing_page_view WHERE referrer_bucket = github_code_search` (CF AE)
- Recherche manuelle mensuelle GitHub Code Search : `"devref:cost"` (nombre de résultats)

---

## Boucle 3 — ROI Calculator embeddable (sponsor partage le widget)

### Trigger

Après top-up wallet sponsor, la section `/docs/sponsor` propose un badge ROI embeddable :

```html
<!-- DevRefs ROI: mon agent économise $36/mois vs parsing HTML brut -->
<a href="https://devrefs.dev/roi-calculator">
  <img
    src="https://devrefs.dev/badge/roi?savings=36&period=monthly"
    alt="DevRefs cost intelligence"
  />
</a>
```

Le badge est généré dynamiquement par un endpoint CF Worker (F16 étendu) avec les paramètres
`savings` (montant économisé) + `period` (monthly/yearly) passés en query string.

### Output

Le sponsor embed ce badge dans :

- Son README de projet (GitHub, GitLab) → visible par tous les visiteurs du repo
- Son article de blog / Dev.to post → backlink + signal SEO
- Ses slides de présentation (conférence, meetup) → offline → discovery

**Différence clé vs badge Stripe "powered by"** : le badge encode une valeur économique
($36/mois économisés) pas un logo. Un dev qui voit ça calcule immédiatement son propre ROI.

### Faisabilité V1 vs V2

| Dimension                        | V1                                                   | V2                                                           |
| -------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Endpoint badge SVG               | OUI — 1 CF Worker route simple, < 1h dev             | —                                                            |
| Widget interactif ROI Calculator | NON en V1 — badge statique suffit                    | OUI — widget JS embeddable avec inputs (tokens/mois, modèle) |
| Tracking clicks badge            | OUI — CF AE `badge_roi_clicked` avec `savings` param | —                                                            |

### K-factor estimé

- i = 1 badge embed → 20-100 visiteurs README/mois exposés
- c = 1-3 % (visiteurs qui cliquent + convertissent)
- **K ~ 0.02-0.08** [HYPOTHÈSE — niche dev IA, trafic README variable]

### Métriques V1

- `badge_roi_clicked` (CF AE)
- `landing_page_view WHERE referrer_bucket = github_readme` (CF AE)
- Monitoring mensuel backlinks via Google Alerts "devrefs.dev" (pipeline 7 earned media)

---

## Boucle 4 — llms.txt propagation inter-agents (boucle agent-to-agent)

### Trigger

DevRefs est référencé dans `devrefs.dev/llms.txt` ET dans les registres publics llms.txt
(llmstxt.directory, llmstxt.info). Quand un agent IA orchestre un sous-agent et lui fournit sa
liste de ressources, il peut inclure `devrefs.dev/llms.txt` dans le contexte de démarrage du
sous-agent.

### Output

Un agent "parent" (ex : agent d'orchestration Claude Code) qui a utilisé DevRefs inclut
`devrefs.dev/llms.txt` dans le fichier de configuration de ses sous-agents. Les sous-agents
découvrent DevRefs sans intervention humaine. La propagation est de génération en génération.

**Mécanisme concret** : un dev qui utilise Mastra ou AgentKit configure son agent parent avec
`contextFiles: ["https://devrefs.dev/llms.txt"]`. L'agent parent passe ce contexte aux sous-agents
(comportement standard Mastra `agent.withContext()`).

### Faisabilité V1 vs V2

| Dimension                         | V1                                                                                           | V2                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| llms.txt optimisé pour re-partage | OUI — F15 inclut section `# For agent orchestrators: include this file in sub-agent context` | —                                                   |
| Registres llms.txt soumis         | OUI — soumission llmstxt.directory + llmstxt.info (one-shot, formulaire web)                 | —                                                   |
| Tracking propagation              | Difficile V1 — CF AE UA bucket suffit à détecter nouveaux agents                             | Tracking `referrer_agent_id` V2 si x402 V2 sessions |

### K-factor estimé

- i = 1 agent parent → 1-5 sous-agents créés qui héritent le contexte
- c = 30-50 % (sous-agents qui crawlent effectivement llms.txt)
- **K ~ 0.15-0.50** [HYPOTHÈSE — boucle la plus prometteuse B2A, sans équivalent SaaS humain]

### Métriques V1

- `crawl_llms_txt_fetched` par `ua_bucket` (CF AE) — croissance semaine/semaine
- Nouveaux `wallet_hash` DISTINCT vs wallets existants (ratio acquisition organique)

---

## Boucle 5 — Data story "Top 5 modèles les plus chers à crawler" (contenu programmatique)

### Trigger

Toutes les 30 jours, un cron CF Worker génère automatiquement un rapport JSON public :

```json
{
  "report": "top_5_most_expensive_models_to_crawl",
  "period": "2026-05",
  "data": [
    {"model": "opus-4-7", "effective_cost_factor": 1.35, "cost_per_pricing_query_usd": 0.49},
    {"model": "gpt-5", "cost_per_pricing_query_usd": 0.17},
    ...
  ],
  "methodology": "67K tokens average HTML parsing × model price",
  "source": "https://devrefs.dev/api/llm-prices"
}
```

Ce rapport est publié à `devrefs.dev/data/monthly-report-YYYY-MM.json` + indexé IndexNow.
Un article Dev.to le résume (pipeline @copywriter + @social).

### Output

Le rapport est une **data story citeable** : journalistes tech, devs, autres agents qui cherchent
des comparatifs prix LLM trouvent des données originales sourcées DevRefs. Les agents Perplexity
et Claude citent `devrefs.dev` comme source primaire pour les requêtes "LLM pricing 2026".

**Signal SEO/GEO** : chaque rapport mensuel = 1 URL fraîche indexable + 1 article Dev.to + 1 thread
X.com/BlueSky = 3 signaux de fraîcheur entité "DevRefs" pour Perplexity/Claude.

### Faisabilité V1 vs V2

| Dimension                              | V1                                                   | V2                            |
| -------------------------------------- | ---------------------------------------------------- | ----------------------------- |
| Rapport JSON auto-généré               | OUI — 1 cron CF Worker + 1 route publique (< 2h dev) | —                             |
| Article Dev.to auto-généré             | OUI — pipeline @copywriter batch mensuel             | —                             |
| Widget embeddable "live pricing table" | NON V1 — rapport statique JSON suffit                | OUI V2 — widget JS temps-réel |

### K-factor estimé

- i = 1 rapport/mois → 1 article Dev.to → 500-5K lecteurs [HYPOTHÈSE : article tech Dev.to moyen]
- c = 0.5-2 % (lecteurs qui testent l'API)
- **Contribution acquisition** : 5-100 nouvelles sessions sponsor/mois [HYPOTHÈSE]

### Métriques V1

- `landing_page_view WHERE referrer_bucket = devto` (CF AE)
- Citations Perplexity/Claude/ChatGPT sur "LLM pricing 2026" (test manuel hebdomadaire)
- Fetches `devrefs.dev/data/monthly-report-*.json` (monitoring CF AE `crawl_*` — endpoint V2 backlog, non tracké séparément en V1)

---

## Synthèse K-factor et priorisation V1

| Boucle                   | K-factor estimé       | Effort V1                  | Impact V1                  | Priorité                   |
| ------------------------ | --------------------- | -------------------------- | -------------------------- | -------------------------- |
| 4 — llms.txt propagation | 0.15-0.50             | Faible (déjà en place)     | Élevé                      | P0 — activer immédiatement |
| 5 — Data story mensuel   | 0.02-0.10 par article | Faible (pipeline IA)       | Moyen-Élevé                | P1 — pipeline J7           |
| 1 — Audit PR snippet     | 0.05-0.30             | Très faible (1 champ JSON) | Élevé si adoption          | P1 — ajouter dans F1b      |
| 3 — Badge ROI embeddable | 0.02-0.08             | Faible (1 Worker route)    | Moyen                      | P2 — sprint M+1            |
| 2 — Commit tag           | 0.02-0.10             | Très faible (1 champ JSON) | Faible-Moyen (signal lent) | P3 — M+2                   |

**Note** : les K-factors B2A sont naturellement inférieurs aux virales SaaS consumer. L'objectif
V1 n'est pas K >= 1 (viralité explosive) mais K = 0.1-0.3 (amplification organique qui réduit
le CAC effectif à 0 € et accélère la croissance des wallets uniques de 20-30 %/mois).

---

## Handoff → @orchestrator

**Fichiers produits** : `docs/growth/viral-loops.md`

**Décisions prises** :

- 5 boucles virales définies, toutes activables sans budget paid
- Boucle 4 (llms.txt propagation) est la plus haute priorité — comportement agent natif
- Boucle 1 (audit PR snippet) requiert 1 champ JSON supplémentaire dans F1b — handoff @fullstack
- Boucle 3 (badge ROI) requiert 1 nouvelle route CF Worker — handoff @fullstack
- K-factors marqués [HYPOTHÈSE] — recalibrer après 30 jours de données

**Points d'attention** :

- Le contrôle de la boucle 2 (commit tag) dépend du prompt système de l'agent hôte — DevRefs
  ne peut que suggérer, pas forcer. Adoption dépend de l'écosystème Mastra/AgentKit.
- La boucle 4 est la seule boucle purement agent-to-agent — surveiller `crawl_llms_txt_fetched`
  croissance semaine/semaine comme proxy de propagation
- Aucun programme referral humain avec incentives cash en V1 — contra-indiqué pour audience dev
  qui perçoit les referral programs comme spam. La viralité est technique, pas marketing.

**Sources** :

- K-factor benchmarks dev tools : [teract.ai HN vs Reddit 2026](https://www.teract.ai/resources/reddit-vs-hackernews-tech-marketing-2026)
- llms.txt standard : [llmstxt.directory](https://llmstxt.directory)
- x402 agent payment adoption : [x402.org](https://www.x402.org/)
