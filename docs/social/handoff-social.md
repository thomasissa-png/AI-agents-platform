<!-- Version: 2026-05-07 — @social — Phase 4 acquisition DevRefs — Handoff structuré social media -->

# Handoff social media — DevRefs Phase 4

## Fichiers produits

| Fichier                                  | Rôle                                                                        | Priorité                            |
| ---------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------- |
| `/docs/social/social-strategy.md`        | Positionnement par réseau, archetype voix, KPIs, anti-règles, gating canaux | Lecture obligatoire avant tout post |
| `/docs/social/editorial-calendar-90d.md` | 24 posts sur 90 jours (tableau complet avec source/CTA/KPI)                 | Référence d'exécution quotidienne   |
| `/docs/social/post-templates.md`         | 8 templates réutilisables + prompts IA génération batch                     | Base de production de contenu       |
| `/docs/social/handoff-social.md`         | Ce fichier — handoff Thomas + agents aval                                   | —                                   |

---

## Décisions stratégiques prises

| Décision                                     | Justification                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **X.com primaire**                           | Signal LLM/AI le plus indexé par crawlers Perplexity/Grok en 2026. Audience dev IA concentrée.                                                                                                                           |
| **BlueSky redondance obligatoire**           | Anti vendor lock-in X.com (API Musk payante, blocages risque). Audience dev tech croissante. Pas de surcharge : miroir X.com adapté < 30 min/mois.                                                                       |
| **Dev.to tutoriels**                         | Ranke Google sur requêtes "AI agent x402", "LLM pricing". Chaque article = point d'entrée SEO + source potentielle pour LLMs.                                                                                            |
| **GitHub awesome lists**                     | Signal légitimité tech. PR acceptée = backlink + indexation. One-shot, pas de maintenance.                                                                                                                               |
| **LinkedIn écarté**                          | B2B SaaS humain. Incompatible B2A pure. Audience sans overlap avec agents IA payeurs.                                                                                                                                    |
| **Instagram/TikTok écartés**                 | Audience hors cible totale. Pas de ROI mesurable pour DevRefs.                                                                                                                                                           |
| **8 posts/mois**                             | Calibration IA, pas équipe humaine. Qualité > quantité. Chaque post doit avoir une donnée fraîche sourcée — pas de post "on est là".                                                                                     |
| **KPI principal = citations LLM**            | Le KPI North Star DevRefs est le revenu x402 → les citations Perplexity/Claude/ChatGPT sont le canal d'acquisition organique le plus direct pour les agents qui cherchent une source de pricing. Followers = KPI vanity. |
| **Mix P1/P2/P3 = 50/30/20**                  | Data stories (P1) génèrent le plus d'engagement dev. Tutoriels (P2) convertissent. Actualité (P3) capte la fenêtre d'attention sur les annonces.                                                                         |
| **Zéro mention concurrent par nom (public)** | Anti-règle absolue DevRefs. "SaaS de monitoring human-facing" OK en posts, "Langfuse/Helicone/Braintrust" non.                                                                                                           |

---

## Handoff Thomas (fondateur)

### Actions requises avant publication J1

- [ ] Créer le compte X.com `@devrefs` (ou `@devrefsdev`) et compléter la bio (cf. `social-strategy.md` § 1.1)
- [ ] Créer le compte BlueSky `@devrefs.dev` (AT Protocol — handle = domaine possible)
- [ ] Créer le compte Dev.to `devrefs` et compléter le profil avec le boilerplate long (`brand-platform.md` § 3.6)
- [ ] Installer Typefully (X.com thread scheduling) — gratuit tier suffisant pour 3-4 threads/mois
- [ ] Vérifier que CF Analytics enregistre le referrer `t.co` et `bsky.social` (paramètre referrer CF Analytics — à vérifier dans le dashboard)

### Workflow de production post par post

1. Ouvrir le calendrier éditorial (`editorial-calendar-90d.md`) — colonne "Statut"
2. Sélectionner le prochain post "A produire"
3. Appliquer le template correspondant (`post-templates.md`) — remplir les VARIABLES avec données réelles (cron live ou sources officielles)
4. Vérifier : (a) source citée pour chaque chiffre, (b) zéro feature hors V1-scope, (c) anti-mots absents
5. Scheduler dans Typefully (X.com) au créneau optimal (mardi/jeudi 15h-17h CET)
6. Miroir BlueSky : adapter le hook (pas copier-coller), publier manuellement ou via Skeetdeck
7. Mettre à jour le Statut du post dans le calendrier → "Publié - [date]"

### Temps de production estimé

| Type de post             | Temps Thomas                                          |
| ------------------------ | ----------------------------------------------------- |
| Thread X.com data story  | 20-30 min (données disponibles dans cron + templates) |
| Miroir BlueSky           | 5-10 min (adaptation hook)                            |
| Article Dev.to           | 45-60 min (code à tester + prompt IA pour structure)  |
| GitHub PR                | 10-15 min                                             |
| HN post                  | 20 min (rédaction + vérification timing)              |
| **Total mensuel estimé** | **3-4 heures/mois**                                   |

---

## Handoff @growth

### Alignement canaux sociaux / stratégie d'acquisition

| Canal social         | Lien acquisition                                                                        | Action @growth                                                                        |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Dev.to articles      | SEO + GEO signal — chaque article avec lien `devrefs.dev` = backlink + source pour LLMs | Vérifier que Dev.to articles sont référencés dans IndexNow push (cf. Phase 2)         |
| GitHub awesome lists | Backlinks de qualité — domaine technique                                                | Vérifier que les PR soumises sont dans la liste des backlinks trackés                 |
| HN front-page (si)   | Spike trafic + crawl massif par bots                                                    | Préparer landing pour pics trafic (CF Cache + rate-limiting OK V1)                    |
| X.com threads        | Signal primaire crawlers Perplexity/Grok                                                | Vérifier que devrefs.dev est dans les sources indexées Perplexity (test manuel hebdo) |

**Point d'attention @growth** : les posts sociaux avec liens vers `devrefs.dev` doivent être trackés dans CF Analytics par referrer. S'assurer que le reporting referrer distingue `t.co` (X.com), `bsky.social` (BlueSky), `dev.to`, `news.ycombinator.com`.

---

## Handoff @copywriter

### Rotation copy par persona

| Type de post                   | Persona adressé                                 | %    | Voix                                                 |
| ------------------------------ | ----------------------------------------------- | ---- | ---------------------------------------------------- |
| Data story P1 (thread chiffré) | Agent IA (80 %) + dev sponsor incidentel (20 %) | 50 % | JSON-first, chiffres bruts, sources visibles         |
| Tutoriel P2 (code intégration) | Dev sponsor (qui code l'agent)                  | 30 % | Ingénieur pragmatique, code copier-coller, zéro hype |
| Actualité P3                   | Dev sponsor (qui suit l'écosystème)             | 20 % | Observateur factuel, pas d'opinion sans données      |

**Anti-mots à ne jamais utiliser dans les drafts** : Exhaustif, Narratif, Stable, Humain-first, dashboard, subscription (sauf backlog), unlimited, équipe, collaborateur, humain superviseur (en pitch produit)

**Règle copy V6 verbatim** : le scénario V6 (agent qui demande un audit après cramer son budget) est marqué `[HYPOTHÈSE: scénario analytique]` — ne jamais le présenter comme un témoignage client réel. Formulation correcte : "Un agent qui tourne 80 % en Opus 4.7 sur des tâches basiques pourrait économiser X. Voici ce que le rapport /api/agent-audit retourne." — pas "Notre client Thomas a économisé X."

**Livrables demandés à @copywriter** :

1. Drafts des 8 posts Mois 1 (posts #1 à #8 du calendrier éditorial) — en appliquant templates T1-T5
2. Vérification anti-mots + anti-fausse-promesse sur chaque draft
3. Variantes de hooks pour les posts P1 Data (3 hooks alternatifs par post — pattern interrupt / statistique choc / open loop)

---

## Critères de pivot / itération J30 / J60 / J90

### J30 (5 juin 2026)

**Métriques à mesurer** :

- Clics devrefs.dev depuis X.com (CF Analytics) — cible 20 clics
- Saves articles Dev.to — cible 10 saves
- Citation manuelle Perplexity : tester "LLM pricing 2026 api" et "agent cost optimization"
- 1 PR GitHub ouverte

**Pivot si** :
| Signal | Action |
|---|---|
| Clics < 5 depuis X.com | Revoir hooks — tester format post unique (pas thread) la semaine suivante |
| 0 save Dev.to après 2 articles | Revoir angle — passer d'intégration générique à cas d'usage spécifique Claude Code |
| 0 trafic depuis aucun réseau | Vérifier CF Analytics tracking referrer (problème technique possible) avant toute décision contenu |

### J60 (4 juillet 2026)

**Métriques à mesurer** :

- 100 clics cumulés depuis X.com + BlueSky
- 50 saves cumulés Dev.to
- 3 PR GitHub (soumissions awesome list)
- 1ère mention DevRefs dans un fil X.com tiers

**Pivot si** :
| Signal | Action |
|---|---|
| 0 mention tierce X.com | Activer stratégie commentaires HN (commenter 2-3 fils actifs sur pricing LLM) |
| 0 trafic Dev.to | Ajouter tags SEO manquants, vérifier que articles publiés (not draft) |
| X.com engagement plat | Tester format post court (post unique) vs thread — mesurer sur 2 semaines |

### J90 (4 août 2026)

**Métriques à mesurer** :

- > = 300 clics cumulés devrefs.dev depuis canaux sociaux
- > = 150 saves cumulés Dev.to
- > = 1 citation LLM (Perplexity/Claude/ChatGPT) sur "LLM pricing" ou "agent cost"
- > = 1 mention HN (commentaire ou post front-page)

**Pivot si** :
| Signal | Décision |
|---|---|
| 0 citation LLM après 90j | Escalade @geo : DevRefs n'est pas indexé comme source par les LLMs — audit `llms.txt` + JSON-LD + IndexNow |
| Revenue x402 >= 600 €/mois J90 | Augmenter fréquence Dev.to → 2-3 articles/mois (amplifier ce qui marche) |
| Revenue < 50 €/mois J90 | Diagnostic @growth : problème acquisition vs produit vs pricing — pas social uniquement |
| X.com API bloquée/coûteuse | Basculer 100 % effort sur BlueSky + Dev.to (anti vendor lock-in prévu) |

---

## Auto-évaluation (5 critères, 0-5)

| Critère                                                      | Score     | Justification                                                                                                                           |
| ------------------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Plateformes limitées à 2-3 avec justification (pas toutes)   | 5/5       | 4 canaux retenus sur 7+ analysés, chacun justifié par audience B2A spécifique. LinkedIn/Instagram/TikTok écartés avec raison explicite. |
| Calendrier réaliste avec ressources documentées              | 5/5       | 8 posts/mois = 3-4h/mois Thomas solo. Workflow documenté étape par étape. Temps de production estimé par type.                          |
| Ton cohérent avec brand voice (Direct/Technique/Agent-first) | 5/5       | Chaque template respecte la voix, les anti-mots, le vocabulaire prescrit/proscrit. Prompts IA calibrés sur brand voice.                 |
| KPIs définis avec seuils cibles                              | 4/5       | Tableau KPIs par réseau + critères J30/J60/J90. Manque : baseline pré-lancement (0 post existant = pas de baseline mesurable).          |
| Stratégie alignée avec @growth (canaux cohérents)            | 5/5       | Dev.to = SEO + GEO signal, GitHub = backlinks, HN = spike trafic. Alignés avec Phase 2 acquisition (IndexNow, Dev.to API, Reddit).      |
| **Total**                                                    | **24/25** | —                                                                                                                                       |

---

**Handoff → @orchestrator**

Fichiers produits :

- `/docs/social/social-strategy.md` (positionnement, archetype voix, KPIs, anti-règles, gating)
- `/docs/social/editorial-calendar-90d.md` (24 posts 90 jours, tableau complet)
- `/docs/social/post-templates.md` (8 templates + prompts IA)
- `/docs/social/handoff-social.md` (ce fichier)

Décisions prises :

- X.com primaire, BlueSky redondance, Dev.to tutoriels, GitHub awesome lists, HN candidats trimestriels
- LinkedIn/Instagram/TikTok écartés (incompatibilité B2A)
- Volume 8 posts/mois (calibration IA, pas équipe humaine)
- Mix 50 % P1 Data / 30 % P2 Tutoriels / 20 % P3 Actualité
- KPI principal : citations LLM > followers vanity
- 4 créneaux de pivot documentés (J30/J60/J90)

Points d'attention pour les agents aval :

- @copywriter : produire drafts posts Mois 1 (#1 à #8), respecter anti-mots + anti-fausse-promesse, V6 verbatim = scénario analytique (jamais témoignage réel)
- @growth : vérifier tracking referrer CF Analytics (t.co, bsky.social, dev.to, news.ycombinator.com), IndexNow push pour articles Dev.to
- @legal : si concours/challenges lancés (non prévu V1), handoff obligatoire. Si partenariats influence (non prévu V1), handoff obligatoire. Posts actuels = contenu technique organique sans implications juridiques spécifiques.
- @fullstack : si scheduling automatisé souhaité post-J30 (endpoint `/api/social/generate`), spécification dans backlog V2.
