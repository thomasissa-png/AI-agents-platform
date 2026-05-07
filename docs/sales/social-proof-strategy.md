<!-- Version: 2026-05-07 — @copywriter (sales-enablement brief) — Phase 4 — Social proof strategy V1 -->

# Stratégie Social Proof V1 — DevRefs

[Framework : AIDA — Attention → Interest → Desire → Action]
[Conscience : Problem-Aware → Solution-Aware selon la phase]

## Principes non négociables

- **Zéro testimonial fictif** (règle absolue `founder-prefs` + G15). Aucun "Thomas B., CTO à Paris" inventé.
- **Zéro case study client X inventé**. Pas de "Agent Startup X a économisé $Y/mois".
- **Sources réelles uniquement** : compteurs live, données dashboard Coinbase/Cloudflare, code open-source, citations LLM réelles.
- **Transparence sur le stade** : J0 = pas de paiements. On le dit. L'honnêteté est différenciante.

---

## 1. Sources de social proof réelles disponibles V1

### 1.1 Compteur de paiements x402 cumulés (live)

**Source** : Dashboard Coinbase facilitator (nombre de transactions USDC sur Base liées à `devrefs.dev`).

**Usage** :

- Affichage live sur `devrefs.dev` : `X paiements x402 autonomes traités`
- Mise à jour : toutes les heures via Cloudflare Worker qui poll le dashboard facilitateur

**Copy** :

```
X paiements x402 autonomes traités
Aucun humain dans la boucle — chaque paiement vient d'un agent IA.
```

**Règle** : si X = 0, ne pas afficher ce compteur. Afficher à partir de 1 paiement réel.

### 1.2 ARPU agent (Average Revenue Per Unit)

**Source** : Coinbase facilitator + Stripe dashboard, consolidé dans F25 (dashboard interne).

**Usage** :

- Internal : piloter la stratégie de packaging
- Public (J30+) : si ARPU > $5, afficher "Ticket moyen par agent : $X USDC"

**Calcul** : total USDC collecté / nombre de wallets uniques ayant payé.

### 1.3 Dashboard screenshot anonymisé

**Source** : capture d'écran du dashboard CF Analytics montrant le volume de calls API (sans aucun wallet, IP ou donnée PII).

**Usage** :

- Posts Dev.to/Reddit : "Voici le volume de calls sur 7 jours" (graphe CF Analytics anonymisé)
- Preuve d'activité réelle sans révéler de données clients

**Règle RGPD** : seules les métriques agrégées. Zéro wallet address, zéro IP, zéro device ID.

### 1.4 Étoiles GitHub sur le repo coinbase/x402

**Source** : `https://github.com/coinbase/x402` — étoiles publiques.

**Usage** :

- Preuve indirecte de l'adoption du protocole x402 (pas de DevRefs spécifique, mais signal d'intérêt de l'écosystème)
- Copy : "DevRefs utilise le protocole x402 (coinbase/x402, X+ étoiles GitHub)"

### 1.5 Citations LLM réelles (Perplexity / Claude / ChatGPT)

**Source** : recherches manuelles sur les moteurs de réponse LLM, documentées avec capture d'écran + date.

**Processus V1 (manuel)** :

1. Rechercher "DevRefs" sur Perplexity, Claude.ai, ChatGPT chaque semaine
2. Si une citation apparaît : capture d'écran + date + requête exacte → stocker dans `docs/assets/llm-citations/`
3. Ne jamais paraphraser la citation — copier le texte exact du LLM

**Copy si citation obtenue** :

```
Mentionné par [Perplexity/Claude/ChatGPT] sur la requête "[requête exacte]"
[Date de la capture]
```

**Si aucune citation** : ne rien afficher (pas de "bientôt mentionné par les LLMs" — c'est une promesse non vérifiable).

### 1.6 Verbatim développeurs (opt-in)

**Source** : développeurs humains qui ont intégré DevRefs et acceptent de partager leur retour.

**Process** :

1. Email post-intégration (envoi manuel par Thomas) : "Bonjour, tu as utilisé DevRefs. Tu acceptes de partager ton retour en anonyme ?"
2. Si oui : collecter métier + ville (ex. "Développeur IA indépendant, Lyon") — jamais de nom complet
3. Valider que le retour décrit un bénéfice réel et mesurable (ex. "J'ai réduit le nombre de retries de X à Y")

**Format anonymisé conforme** :

```
"[Citation verbatim]"
— Développeur IA indépendant, [Ville]
```

---

## 2. Plan de rotation par phase

### Phase J0 (lancement → 0 paiement réel)

**Social proof disponible** : code open-source, protocole x402 (compteur GitHub coinbase/x402), données ROI sourcées `agent-economics.md`.

**Copy landing** :

```
DevRefs est live sur devrefs.dev.
Protocole : x402 (coinbase/x402, protocole ouvert).
ROI mesuré sur agent réel : 490× (Opus 4.7 vs parsing HTML 67K tokens).
Source : docs/ia/agent-economics.md
```

**Ce qu'on NE dit PAS** : "Déjà X agents utilisent DevRefs" (faux à J0).

### Phase J7-J30 (1-10 paiements x402)

**Social proof disponible** : compteur live paiements x402, screenshots CF Analytics anonymisés.

**Copy landing** (s'activer dès 1er paiement) :

```
X paiements x402 autonomes traités depuis le lancement.
Premier paiement reçu : [date du 1er paiement — ex. "7 mai 2026"].
```

**Posts Dev.to** : "DevRefs reçoit son premier paiement autonome d'un agent IA — voici les données brutes".

### Phase J30-J60 (10-66 paiements/mois)

**Social proof disponible** : compteur, ARPU, 1ère citation LLM potentielle, premiers verbatims opt-in.

**Copy landing** :

```
X paiements x402 autonomes / mois.
Ticket moyen : $Y USDC.
```

**Posts Dev.to** : data story "Ce que les agents paient vraiment pour du pricing frais" avec graphes CF Analytics.

### Phase J60-J90 (objectif 66+ ventes/mois)

**Social proof disponible** : volume mensuel stable, verbatims développeurs, citations LLM.

**Objectif copy** : remplacer les métriques de démarrage par des métriques d'usage.

```
X agents actifs ce mois.
[Citation Perplexity si disponible]
[Verbatim développeur opt-in si disponible]
```

---

## 3. Ce qu'on évite absolument

| Interdit                                            | Raison                              | Alternative                                        |
| --------------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| "Des milliers d'agents font confiance à DevRefs"    | Faux à V1                           | "X paiements x402 traités" (chiffre réel)          |
| Noms d'entreprises sans accord écrit                | Risque légal + fausse promesse      | Métier + ville (anonyme)                           |
| Screenshots de wallets tiers                        | RGPD + vie privée                   | Screenshots dashboard interne CF agrégé uniquement |
| "Utilisé par [concurrent de l'agent ou son client]" | Zéro mention concurrent (CLAUDE.md) | Protocole x402 (neutre)                            |
| Projections ("sera cité par X LLMs")                | Promesse non tenue                  | Citation réelle uniquement                         |
| Étoiles GitHub DevRefs si repo privé                | Non vérifiable                      | Étoiles coinbase/x402 (repo public officiel)       |

---

## 4. Métriques de suivi de l'efficacité social proof

| Métrique                                | Source                     | Fréquence    | Seuil d'action                             |
| --------------------------------------- | -------------------------- | ------------ | ------------------------------------------ |
| Taux de conversion landing → pack achat | CF Analytics               | Hebdomadaire | < 2% → A/B test copy social proof          |
| Temps passé sur la section social proof | CF Analytics scroll events | Hebdomadaire | < 5s → simplifier le format                |
| CTR sur le compteur de paiements        | CF Analytics               | Mensuel      | < 1% → déplacer le compteur above the fold |
| Volume citations LLM                    | Recherche manuelle         | Hebdomadaire | 0 citation à J90 → push GEO                |

---

## 5. Automatisation V2 (signaler à @fullstack pour backlog)

Pour V2, automatiser la collecte et mise à jour :

- **Live counter** : Worker CF qui poll Coinbase dashboard API toutes les heures → KV → widget HTML
- **LLM citations** : [aucune API publique disponible en mai 2026 — manuel V1]
- **Verbatims opt-in** : formulaire simple (cf. F26 dashboard) avec champ "Partager mon retour" → email Thomas

---

**Handoff → @growth + @social**

- Fichier produit : `docs/sales/social-proof-strategy.md`
- Décisions non négociables : zéro testimonial inventé, zéro compteur affiché avant 1er paiement réel
- Phase J0 copy validée : ROI 490× sourcé `agent-economics.md` § A.4 uniquement
- Actions immédiates @growth : monitorer Coinbase dashboard pour déclencher l'affichage du compteur au 1er paiement
- Actions immédiates @social : préparer 3 posts "data story" pour J7, J30, J60 (formats dans `docs/copy/ad-copy-templates.md` à créer)
