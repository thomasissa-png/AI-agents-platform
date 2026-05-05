<!-- Version: 2026-05-05T08:00 — @legal — Audit juridique initial DevRefs Phase 0 wave 1 -->

# Audit juridique & conformité — DevRefs

> **Avertissement** : ce document est un audit de référence produit par @legal (juriste digital senior). Il ne constitue pas un avis juridique formel. Les décisions structurantes (régime fiscal BNC crypto, qualification B2B/B2C internationale) doivent être validées par un avocat fiscaliste FR avant lancement commercial.

> **Périmètre** : V1 DevRefs — 2 endpoints API (`/api/llm-prices`, `/api/sdk-status`), landing publique statique, paiement primaire x402 USDC Base via facilitator Coinbase, fallback Stripe Payment Link 4,99 €/jour, JWT 24h non renouvelé, zéro PII.

---

## Résumé exécutif — Risques en 5 points (pour fondateur non-juriste)

1. **Risque P0 — Fiscalité crypto BNC** : revenus x402 USDC = prestation de service en crypto, déclaration BNC obligatoire. Plafond micro-entreprise 2026 = 83 600 €/an, largement OK pour cible 600 €/mois. Cotisations sociales BNC autres prestations = 25,6 % au 1er janvier 2026. **Action obligatoire** : immatriculation auto-entreprise avant 1ère transaction commerciale, ou avant dépassement seuil 200 € si activité considérée occasionnelle (à trancher avec comptable).
2. **Risque P0 — TVA internationale** : DevRefs vend international en B2B (agents IA = entités juridiques de leurs propriétaires) et B2C (devs humains via Stripe). Si auto-entreprise sous seuil franchise (37 500 € prestations services), mention "TVA non applicable, art. 293 B du CGI" obligatoire sur factures et CGV. Au-dessus du seuil : OSS B2C UE + reverse charge B2B UE + hors UE pas de TVA. **Stripe Tax automatise** la collecte si activé ; **Coinbase x402 facilitator ne gère PAS la TVA** — déclaration manuelle.
3. **Risque P1 — Privacy x402 metadata** : le protocole x402 transporte 3 champs metadata en clair (`resource_url`, `description`, `reason`) vers le facilitator Coinbase avant settlement on-chain. **Action** : documenter dans Privacy Policy que ces champs ne contiennent JAMAIS de PII côté DevRefs (uniquement nom endpoint + ref technique anonyme).
4. **Risque P1 — Scraping pricing pages LLM** : Anthropic/OpenAI/Google/Mistral pricing pages = pages publiques, mais TOS et robots.txt à respecter strictement. npm = OK (5M req/mois acceptable, 1 req/s pour crawlers expérimentaux). GitHub releases = OK via API authentifiée. **Action** : implémenter respect robots.txt + cache 6h+ + User-Agent identifié `DevRefs-Bot/1.0 (+https://devrefs.io/bot)`.
5. **Risque P2 — EU AI Act** : DevRefs est HORS scope EU AI Act (pas de système IA en runtime, pas de génération, pas de classification). Mais consommé PAR systèmes IA → fournir documentation provenance/fraîcheur (best practice non obligatoire, valeur commerciale).

**Verdict global : GO CONDITIONNEL** — sous réserve de (a) immatriculation auto-entreprise BNC avant 1ère transaction, (b) activation Stripe Tax pour TVA auto, (c) confirmation par comptable du traitement BNC sur prestation IA-to-IA payée en stablecoin (HYPOTHÈSE : assimilable à prestation de service crypto classique).

---

## 1. RGPD / Privacy — Audit de conformité

### 1.1 Constat de départ : zéro PII

DevRefs ne collecte AUCUNE donnée à caractère personnel au sens de l'art. 4(1) RGPD :

| Composant | Donnée collectée | Qualification PII ? |
|---|---|---|
| Endpoint `/api/llm-prices` (x402) | Wallet address Ethereum/Base 0x... | NON — wallet anonyme par défaut, l'adresse seule n'est pas PII (CJUE Breyer C-582/14 a posé que la PII suppose un moyen raisonnable d'identifier la personne) |
| Endpoint `/api/sdk-status` (x402) | Idem | NON |
| Stripe Payment Link 4,99 €/jour | Email + carte bancaire | OUI mais collecté DIRECTEMENT par Stripe (PCI-DSS), DevRefs ne reçoit que le `customer_id` Stripe + statut paiement |
| JWT 24h | Hash HMAC + claim `wallet` ou `stripe_customer_id` | NON (pseudonyme + durée 24h non renouvelée) |
| Logs Cloudflare Workers | IP éphémère pour rate-limiting | OUI brièvement — IP = PII selon CNIL si conservée. **Action** : conservation < 24h, pas de log persistant en KV |
| Cloudflare Analytics | Métriques agrégées server-side | NON (CF Analytics ne pose pas de cookie, agrégation anonyme) |

**Verdict 1.1** : DevRefs est une plateforme **near-zero PII**. Les seules PII traitées sont (a) IP éphémères pour rate-limit (durée < 24h, intérêt légitime art. 6(1)(f) RGPD) et (b) email/carte côté Stripe (Stripe = responsable de traitement distinct pour la collecte paiement, DevRefs ne reçoit que pseudonymes).

### 1.2 Registre des traitements (art. 30 RGPD)

DevRefs n'est PAS soumis à l'obligation de tenue de registre (art. 30(5) : exemption < 250 employés ET traitement non régulier ET pas de catégories spéciales). Mais best practice = tenir un registre minimal :

| Finalité | Base légale | Données | Conservation | Destinataires |
|---|---|---|---|---|
| Rate-limiting anti-fraude | Intérêt légitime (art. 6(1)(f)) | IP, wallet address, timestamp | < 24h en KV Cloudflare | Aucun (interne) |
| Authentification JWT post-paiement | Exécution contrat (art. 6(1)(b)) | Hash wallet ou customer_id Stripe | 24h (durée JWT) | Aucun (interne) |
| Comptabilité paiements x402 | Obligation légale (art. 6(1)(c) — code commerce 10 ans) | Tx hash, montant USDC, timestamp | 10 ans | Comptable, administration fiscale FR |
| Comptabilité paiements Stripe | Obligation légale (10 ans) | Stripe customer_id, montant EUR, facture | 10 ans | Stripe (sous-traitant), comptable, fisc FR |

### 1.3 DPA avec sous-traitants

| Sous-traitant | Service | Statut DPA | Localisation données | Action |
|---|---|---|---|---|
| **Stripe Inc.** | Paiement carte humain | DPA standard signé automatiquement à l'inscription Stripe (https://stripe.com/legal/dpa). SCC européennes incluses | Irlande (Stripe Payments Europe Ltd) + transferts US | Aucune action — DPA Stripe couvre les obligations |
| **Coinbase Global Inc. (x402 facilitator)** | Validation paiement USDC Base | **HYPOTHÈSE — DPA non publié séparément pour x402 facilitator au 2026-05-05.** Coinbase Privacy Policy globale et SCC standard (contact dpo@coinbase.com pour copie). Le facilitator transmet 3 champs metadata (resource_url, description, reason) en clair | US (Coinbase Inc.) + transferts SCC | **Action P0** : email dpo@coinbase.com pour confirmer DPA x402 facilitator + documenter dans Privacy Policy que metadata ne contient pas de PII |
| **Cloudflare Inc.** | Hébergement Pages + Workers + KV + Analytics | DPA standard https://www.cloudflare.com/cloudflare-customer-dpa/ | EU possible via Data Localization Suite (option payante) ou US par défaut | **Action P1** : vérifier avec @infrastructure si Data Localization EU est activable sur free tier (probablement non — hypothèse à lever) |

### 1.4 Droits des utilisateurs (art. 15-22 RGPD)

Vu la quasi-absence de PII côté DevRefs, la procédure droits utilisateurs est ultra-allégée :

| Droit | Procédure DevRefs |
|---|---|
| Droit d'accès (art. 15) | Email à `dpo@devrefs.io` (ou `legal@devrefs.io`). Réponse < 1 mois. Données disponibles : aucune côté wallet x402 (pseudonyme). Côté Stripe customer : customer_id, dates de paiement. |
| Droit de rectification (art. 16) | Sans objet — pas de profil utilisateur stocké côté DevRefs |
| Droit à l'effacement (art. 17) | Email pour suppression du customer_id Stripe + JWT actif. Conservation comptable 10 ans pour transactions facturées (obligation légale = exception art. 17(3)(b)) |
| Droit à la portabilité (art. 20) | Sans objet — pas de profil utilisateur portable |
| Droit d'opposition (art. 21) | Email — DevRefs n'effectue pas de profilage ni marketing direct |

### 1.5 Cookies & traceurs

| Élément | Statut | Justification |
|---|---|---|
| Cookies fonctionnels (JWT post-paiement) | Strictement nécessaire — pas de consentement requis (art. 82 LIL/CNIL) | JWT requis pour livrer le service payé |
| Cookies analytics | **AUCUN** (Cloudflare Analytics est server-side via Pages Edge, pas de JS tracker, pas de cookie) | Pas de bannière requise |
| Cookies tiers (Stripe Payment Link) | Stripe gère ses propres cookies sur son domaine — hors périmètre DevRefs | Stripe Privacy Policy applicable côté Stripe |

**Verdict 1.5** : **PAS DE BANNIÈRE COOKIES REQUISE** sur la landing DevRefs tant que (a) aucun analytics tiers (Plausible, PostHog, GA) n'est ajouté, (b) aucun pixel marketing (Meta, X, LinkedIn) n'est intégré. Si ajout futur → bannière TCF v2.2 + recueil consentement positif obligatoire.

**Verdict global RGPD : GO** — conformité native via architecture zéro-PII. Action P0 unique : confirmer DPA Coinbase x402 par email DPO.

---

## 2. CGU / CGV adaptées au modèle x402 + Stripe

### 2.1 Qualification juridique du modèle

DevRefs propose **deux contrats distincts** :

| Contrat | Cible | Qualification | Régime applicable |
|---|---|---|---|
| Contrat A : pay-per-query x402 0,49 €/query | Agent IA autonome (B2A — Business-to-Agent, agissant pour le compte d'un opérateur professionnel) | Prestation de service technique à exécution instantanée | B2B par défaut (l'agent agit pour un opérateur professionnel — dev, entreprise SaaS). Pas de droit de rétractation B2C applicable. |
| Contrat B : abonnement journalier 4,99 €/jour via Stripe Payment Link | Développeur humain (persona secondaire) | Prestation numérique à exécution instantanée + accès JWT 24h | À qualifier au cas par cas. Si dev pro = B2B (pas de rétractation). Si dev personne physique consommateur = B2C avec droit de rétractation 14j (art. L.221-18 Code conso) MAIS exception art. L.221-28 13° : exécution immédiate avec consentement exprès = renonciation rétractation. **À documenter dans CGV.** |

### 2.2 Clauses essentielles à inclure (cf. `cgu-draft.md`)

- **Objet** : fourniture d'accès à 2 endpoints HTTP retournant des payloads JSON techniques sur le pricing LLM et le statut des SDK npm.
- **Conditions d'accès et paiement** :
  - Voie A x402 : protocole HTTP 402 + signature USDC sur Base via facilitator Coinbase. Paiement settlement on-chain en < 5 secondes. Une transaction = un payload livré.
  - Voie B Stripe : Payment Link 4,99 €/jour, JWT signé HMAC valable 24h, NON reconductible automatiquement (l'utilisateur doit cliquer à nouveau le Stripe Link pour renouveler).
- **Remboursement** : ABSENT pour x402 (prestation exécutée instantanément, payload livré). Pour Stripe : remboursement sur demande si le service a été indisponible > 4h cumulées sur les 24h JWT (SLA), sinon non remboursable (exécution immédiate consentie).
- **SLA implicite** :
  - Uptime cible : 99,5 % mensuel (Cloudflare Workers free tier).
  - Fraîcheur des données : `dateModified` JSON-LD daté à H-6 maximum (cron 6h sur LLM pricing, 24h sur SDK status).
  - Remboursement automatique par crédit transactionnel si fraîcheur dépasse 48h sur LLM pricing ou 7 jours sur SDK status.
- **Responsabilité** :
  - DevRefs garantit la **fraîcheur structurée** du payload (timestamp `dateModified` exact à la seconde près).
  - DevRefs ne garantit PAS la **véracité métier** : si Anthropic publie un prix erroné sur sa page officielle et DevRefs reflète ce prix, la responsabilité reste sur la source. L'agent acheteur conserve la responsabilité de ses décisions downstream.
  - Plafond de responsabilité : limité au montant payé pour la requête concernée (0,49 €) ou pour la journée concernée (4,99 €). Exclusion de tout dommage indirect ou consécutif (perte d'exploitation, perte de données, perte de chance).
- **Propriété intellectuelle** :
  - Les **données factuelles** (prix LLM, versions SDK) ne sont PAS protégées par le droit d'auteur (art. L.112-1 CPI ne protège pas les faits bruts). Source : pages publiques officielles.
  - Le **format DevRefs** (structure JSON-LD propriétaire avec champs `effective_cost_factor`, `dateModified`, `fetched_at`, watermark) est protégé en tant qu'œuvre composite + base de données (art. L.341-1 CPI — droit sui generis du producteur de base de données, investissement substantiel dans la collecte/vérification).
  - Licence accordée à l'acheteur : usage interne du payload pour ses propres systèmes IA. PAS de redistribution, PAS de revente, PAS d'inclusion dans une base de données concurrente.
- **Anti-fraude** :
  - Watermark invisible HMAC dans chaque payload JSON (champ `_signature`).
  - Rate-limit par wallet (x402) ou par JWT (Stripe) : max 1 000 requêtes/jour par wallet pour le tier x402, illimité documenté pour Stripe (avec fair-use clause).
  - Sanctions : suspension JWT immédiate, blacklist wallet, conservation logs 30 jours pour traçabilité fraude.

### 2.3 Droit applicable et juridiction

- Droit applicable : **droit français**.
- Juridiction : pour B2B → tribunal de commerce du ressort du siège DevRefs (Paris ou domiciliation auto-entrepreneur). Pour B2C UE → règlement Bruxelles I bis (art. 17-19) impose juridiction du domicile du consommateur — clause non opposable au consommateur UE.

**Verdict 2 : GO** — modèle contractuel clair, draft fourni dans `cgu-draft.md`.

---

## 3. Conformité EU AI Act

### 3.1 Classification

| Critère | DevRefs |
|---|---|
| DevRefs est-il un "système IA" au sens art. 3(1) AI Act ? | NON — DevRefs est un **fournisseur de données structurées**. Aucun modèle d'apprentissage automatique en runtime, aucune inférence, aucune génération. Le cron qui scrape est un fetch HTTP déterministe + parser regex. |
| DevRefs est-il un "modèle GPAI" (general-purpose AI) ? | NON |
| DevRefs est-il un "fournisseur d'IA" ou "déployeur d'IA" ? | NON |
| DevRefs entraîne-t-il un modèle ? | NON |

**Verdict 3.1** : **HORS SCOPE EU AI Act**. Aucune classification de risque applicable, aucune obligation de marquage, aucune obligation d'enregistrement.

### 3.2 Obligation de transparence aval (best practice non obligatoire)

DevRefs est consommé PAR des systèmes IA (Claude Code, Cursor, AgentKit). Pour faciliter la conformité aval de ces clients (qui eux peuvent être soumis à l'AI Act selon leur usage) :

- Documenter publiquement la **provenance** des données (URLs sources : anthropic.com/pricing, openai.com/pricing, etc.).
- Documenter la **fréquence de mise à jour** (cron 6h LLM, 24h SDK).
- Exposer le champ `dateModified` JSON-LD machine-readable.
- Page `/about/data-sources` dédiée listant les sources, last-fetched, méthode de vérification.

**Verdict 3.2** : **VALEUR COMMERCIALE > obligation légale**. À implémenter Phase 1 par @fullstack (page `/about/data-sources` + champ payload).

---

## 4. Fiscalité crypto FR — Régime BNC + TVA

### 4.1 Qualification de l'activité

| Critère | Analyse DevRefs |
|---|---|
| Nature de l'activité | Prestation de service technique récurrente à titre habituel (cron permanent + commercialisation continue). |
| Catégorie fiscale | **BNC — Bénéfices Non Commerciaux** — prestation de service intellectuelle/technique. (Pas BIC car pas d'achat-revente, pas d'intermédiation, pas de marchandises.) |
| Régime fiscal recommandé | **Micro-BNC sous statut auto-entrepreneur** (= micro-entreprise) — seuil 2026 = 83 600 €/an pour BNC prestations services. Cible 600 €/mois = 7 200 €/an, marge énorme. |
| Cotisations sociales 2026 | 25,6 % au 1er janvier 2026 sur "Autre prestation de services" BNC (source URSSAF). Calculées sur le CA encaissé (= EUR équivalent au cours du jour de réception USDC). |
| Impôt sur le revenu | Abattement forfaitaire 34 % sur CA BNC + barème progressif IR. Versement libératoire 2,2 % BNC possible sous conditions de revenu fiscal de référence. |

### 4.2 Traitement comptable des revenus en USDC

**HYPOTHÈSE explicite — à valider avec comptable/avocat fiscaliste FR** : les paiements x402 USDC sont assimilables à des paiements en cryptomonnaie classique au sens de l'art. 150 VH bis CGI et BOFiP BIC-30-10-30. Conséquences :

1. **Évaluation au cours du jour** : chaque transaction USDC est convertie en EUR au cours du jour de réception (cours moyen du jour ou cours au timestamp de la transaction blockchain). USDC étant un stablecoin USD, taux EUR/USD du jour à appliquer.
2. **Enregistrement en CA BNC** : le montant EUR équivalent est inscrit en chiffre d'affaires BNC à la date de réception de la transaction blockchain (pas au moment de la conversion en EUR).
3. **Plus-value de cession crypto** (art. 150 VH bis CGI) : si HODLing entre la réception USDC et la conversion EUR avec variation de cours > 0, la plus-value est imposable séparément (PFU 30 % par défaut, ou option barème). Pour USDC stablecoin, la variation est minime mais existe (peg ±0,5 %). **Recommandation** : convertir USDC → EUR rapidement (hebdomadaire) pour minimiser le risque plus-value et simplifier la comptabilité.
4. **Méthode d'évaluation** : prix unitaire moyen pondéré (PUMP) recommandé pour stablecoin (FIFO complexe inutilement).
5. **Justificatifs à conserver 10 ans** : tx hash blockchain Base + cours EUR/USDC du jour (ex : capture CoinGecko ou oracle Chainlink) + facture émise au client.

### 4.3 TVA

| Type de client | Localisation | Traitement TVA |
|---|---|---|
| Auto-entreprise SOUS seuil franchise (< 37 500 € prestations services 2026) | Tous pays | **TVA non applicable, art. 293 B du CGI** — mention obligatoire sur factures et CGV. Pas de TVA collectée, pas de TVA déductible. |
| Auto-entreprise AU-DESSUS seuil franchise | Client B2B UE avec n° TVA intracom valide | Reverse charge (autoliquidation). Mention "TVA due par le preneur — autoliquidation, art. 196 directive 2006/112/CE". Stripe Tax automatise si activé et si le client renseigne son VAT ID. |
| Idem | Client B2C UE | TVA française collectée + reversée via OSS (One-Stop-Shop) UE. Stripe Tax automatise complètement (collecte + reporting OSS trimestriel). |
| Idem | Client hors UE (US, UK, Asie) | Pas de TVA française. Mais possibles obligations locales (UK VAT pour B2C UK, sales tax US par État). Stripe Tax gère la conformité internationale (option payante). |

**HYPOTHÈSE forte — paiements x402** : Coinbase x402 facilitator **NE GÈRE PAS** la TVA automatiquement. La transaction blockchain est un transfert USDC, sans information sur la qualité du payeur (B2B/B2C, localisation). Pour un agent IA anonyme payant en x402, **impossible de déterminer la TVA applicable a priori**. Conséquences pratiques :

- **Sous franchise (cible 600 €/mois)** : aucun problème, mention art. 293 B CGI universelle. **Statut RECOMMANDÉ jusqu'à scaling 12-18 mois.**
- **Au-dessus franchise** : devra implémenter une étape déclarative (formulaire optionnel sur landing : "êtes-vous B2B UE ? Renseignez votre VAT ID") OU appliquer la TVA française par défaut sur tous les paiements x402 anonymes (sécurité juridique mais perte de marge sur reverse charge possible).

### 4.4 Mentions légales obligatoires sur la landing

Si auto-entreprise FR :

```
Mentions légales

Éditeur : [Nom auto-entreprise tel qu'inscrit au RNE] — auto-entrepreneur
Domicile fiscal : [Adresse de domiciliation auto-entrepreneur — à fournir par le fondateur lors de l'immatriculation INPI/Guichet unique]
SIREN : [Numéro SIREN à 9 chiffres délivré par INSEE après immatriculation]
APE : 6201Z (Programmation informatique) ou 6311Z (Traitement de données, hébergement)
TVA : non applicable, art. 293 B du CGI
Directeur de la publication : [Nom du fondateur]
Hébergeur : Cloudflare Inc., 101 Townsend St, San Francisco, CA 94107, USA
Contact : legal@devrefs.io (ou domaine définitif après naming @creative-strategy)
```

**HYPOTHÈSE** : ces champs (raison sociale, SIREN, adresse) seront fournis par Thomas après immatriculation INPI. Ils ne constituent pas des placeholders à éliminer mais des champs à fournir au moment de la mise en ligne.

**Verdict 4 : GO CONDITIONNEL** — sous réserve (a) immatriculation auto-entreprise BNC AVANT 1ère transaction commerciale, (b) ouverture compte bancaire séparé, (c) confirmation comptable du traitement BNC stablecoin, (d) activation Stripe Tax si scaling au-dessus seuil franchise.

---

## 5. Cookies & consentement

### 5.1 État zéro

V1 DevRefs n'utilise AUCUN cookie tiers ni traceur tiers :

- Cloudflare Pages : aucun cookie côté client par défaut.
- Cloudflare Analytics : exclusivement server-side (Edge), aucun cookie déposé sur le navigateur du visiteur.
- JWT post-paiement Stripe : cookie de session strictement nécessaire (durée 24h, scope DevRefs uniquement). **Exempté du consentement** (art. 82 LIL — cookies strictement nécessaires).
- Stripe Payment Link : redirige vers `checkout.stripe.com`. Stripe gère ses propres cookies sur son domaine, hors périmètre DevRefs.

**Verdict 5.1** : **PAS DE BANNIÈRE COOKIES REQUISE** en V1.

### 5.2 Cas d'ajout futur

Si Phase 4+ ajoute :

- **Plausible.io** (recommandé si analytics tiers requis) — cookieless par défaut, exempté de bannière. Conformité CNIL acquise.
- **PostHog** ou **Mixpanel** — utilisent cookies + fingerprint → **bannière TCF v2.2 obligatoire** + recueil consentement positif AVANT dépôt cookie.
- **Pixels marketing** (Meta, LinkedIn, X) — **bannière obligatoire** + opt-in.

**Action** : à re-évaluer par @legal en Phase 4 si @growth/@data-analyst demande analytics tiers.

**Verdict 5 : GO** — état actuel conforme natif, pas d'action requise V1.

---

## 6. Accessibilité (RGAA / WCAG)

### 6.1 Obligation légale

| Critère | DevRefs |
|---|---|
| Service public ou délégation de service public ? | NON |
| Entreprise FR avec CA > 250 M€ ? | NON (auto-entreprise micro) |
| E-commerce avec CA > 2 M€ (loi accessibilité 2025) ? | NON (cible 600 €/mois) |
| Établissement bancaire / assurance / transport ? | NON |

**Verdict 6.1** : **AUCUNE OBLIGATION LÉGALE RGAA/EAA** en V1 et probablement jamais à l'échelle DevRefs.

### 6.2 Recommandation best practice

Cible primaire = agent IA crawler. Cible secondaire = dev humain. WCAG 2.2 AA recommandé non par obligation mais parce que :

- Crawlers IA bénéficient d'un HTML sémantique propre (landmarks, alt text, headings hiérarchiques).
- Screen readers et agents IA partagent les mêmes patterns d'accès au DOM.
- SEO/GEO : les sites accessibles ranquent mieux (Lighthouse score = facteur indirect).

**Action** : @design + @fullstack respectent WCAG 2.2 AA par défaut (couvert par gates G20 du framework Gradient).

**Verdict 6 : GO** — pas d'action légale, standard professionnel automatique via gates framework.

---

## 7. TOS scraping sources officielles

### 7.1 Audit source par source

| Source | TOS / robots.txt verdict | Méthode recommandée DevRefs | Rate-limit recommandé |
|---|---|---|---|
| **npm registry** (registry.npmjs.org) | ✓ AUTORISÉ. Crawler policy npm explicite : 1 req/s pour crawlers expérimentaux, 5M req/mois acceptable. CouchDB replication recommandée pour gros volumes. Source : https://docs.npmjs.com/policies/crawlers/ | API REST `https://registry.npmjs.org/{package}` ou replication CouchDB. User-Agent identifié obligatoire. | 1 req/s + cache KV 24h |
| **GitHub releases publiques** (api.github.com) | ✓ AUTORISÉ via API. Rate-limit officiel : 5 000 req/h authentifié (PAT), 60 req/h anonyme. Source : GitHub REST API docs. | API REST `/repos/{owner}/{repo}/releases` avec PAT GitHub | 5 000 req/h max, cache KV 6h |
| **Anthropic pricing** (anthropic.com/pricing) | ✓ PAGE PUBLIQUE. Robots.txt anthropic.com autorise crawl pages publiques. Pas d'API officielle pricing JSON. **Action** : vérifier robots.txt à chaque cron via WebFetch + respecter delay 5s entre requêtes. | Fetch HTML + parser regex stable. User-Agent : `DevRefs-Bot/1.0 (+https://devrefs.io/bot)` | 1 req/6h (cron) |
| **OpenAI pricing** (openai.com/api/pricing) | ✓ PAGE PUBLIQUE. Idem Anthropic — pas d'API JSON pricing officielle, fetch HTML + parser. ChatGPT-User bot OpenAI ne respecte pas toujours robots.txt selon presse 2024 — pas notre problème côté consommateur de leur page publique. | Fetch HTML + parser | 1 req/6h |
| **Google AI / Vertex pricing** (cloud.google.com/vertex-ai/pricing) | ✓ PAGE PUBLIQUE Google Cloud. Documentation publique, pas de restriction TOS pour crawl raisonnable. | Fetch HTML | 1 req/6h |
| **Mistral pricing** (mistral.ai/pricing) | ✓ PAGE PUBLIQUE. Vérifier robots.txt mistral.ai. | Fetch HTML | 1 req/6h |
| **Crunchbase** | ✗ INTERDIT. TOS Crunchbase prohibe expressément le scraping. | NE PAS UTILISER (déjà acté project-context.md) | N/A |
| **SimilarWeb** | ✗ INTERDIT. TOS restrictives + paywall. | NE PAS UTILISER (déjà acté) | N/A |

### 7.2 Mitigations à implémenter (handoff @fullstack/@infrastructure)

- [ ] Respect strict robots.txt sur chaque source : fetch et parse robots.txt avant chaque cron, abort si `Disallow: /pricing` apparaît.
- [ ] User-Agent identifié unique : `DevRefs-Bot/1.0 (+https://devrefs.io/bot)` avec page `/bot` documentant la finalité.
- [ ] Rate-limit applicatif côté Cloudflare Worker cron : pas plus de 1 req/source/6h.
- [ ] Cache KV 6h (LLM pricing) ou 24h (SDK status) pour éviter sur-fetch.
- [ ] Logging tx hash + URL fetched + status code pour audit en cas de réclamation source.
- [ ] Email contact `bot@devrefs.io` ou `legal@devrefs.io` actif et surveillé pour gérer cease-and-desist éventuels.

**Verdict 7 : GO** sur npm + GitHub + Anthropic + OpenAI + Google + Mistral. **NO-GO** sur Crunchbase + SimilarWeb (déjà acté).

---

## 8. Anti-fraude

### 8.1 Mesures techniques (déjà prévues project-context.md)

- **Watermark invisible HMAC** dans chaque payload JSON : champ `_signature` calculé sur `(wallet || jwt) + timestamp + endpoint + nonce` avec clé serveur secrète. Permet de prouver l'origine d'un payload redistribué illégalement.
- **Rate-limit par wallet** (x402) : 1 000 req/jour par wallet sur tier x402, fair-use clause au-delà.
- **Rate-limit par JWT** (Stripe) : 10 000 req/jour par JWT (équivalent illimité usage humain raisonnable, mais coupe les abus).
- **HMAC signature traçable** sur chaque JWT.

### 8.2 Sanctions (à intégrer dans CGU)

| Comportement | Sanction |
|---|---|
| Dépassement rate-limit fair-use sans réponse à 1er warning | Throttling progressif puis blacklist 24h |
| Redistribution payload détectée (watermark cassé ou recoupé sur tiers) | Blacklist permanente wallet + JWT, signalement abuse@coinbase.com |
| Tentative de bypass paiement (replay attack, JWT forgé) | Blacklist permanente + dépôt de plainte si > 100 € préjudice |
| Scraping massif sans paiement (HTTP 402 ignoré, retry sans signature) | IP blacklist Cloudflare WAF + log Cloudflare 30 jours |

**Verdict 8 : GO** — mesures techniques prévues, clauses CGU drafted dans `cgu-draft.md`.

---

## Vérifications infrastructure attendues (handoff descendant @infrastructure)

@infrastructure devra confirmer en Phase 2 (Acquisition + Infra setup) les points suivants pour finaliser la conformité légale :

| # | Vérification | Pourquoi (lien légal) |
|---|---|---|
| INF-1 | **Data residency Cloudflare EU** : le free tier Cloudflare Pages + Workers + KV permet-il de forcer le stockage des données et l'exécution edge dans une région EU (FR/DE/IRL) ? Si non, documenter dans Privacy Policy le transfert SCC US. | RGPD art. 44-49 — transferts hors UE sous SCC européennes. Coinbase + Cloudflare hébergent US par défaut. |
| INF-2 | **Chiffrement KV** : Cloudflare KV chiffre les données at-rest par défaut (AES-256). Confirmer + documenter dans Privacy Policy. | RGPD art. 32 — sécurité du traitement. |
| INF-3 | **Backups KV** : politique de backup Cloudflare KV (pas de backup user-side sur free tier). Si destruction accidentelle = perte définitive — acceptable car données reproductibles via cron mais à documenter. | RGPD art. 32(1)(b) — disponibilité. |
| INF-4 | **Logs d'accès** : Cloudflare Workers logs (durée par défaut, accès, retention). Confirmer rétention < 30 jours et purge automatique. Configurer KV TTL < 24h pour rate-limit. | RGPD art. 5(1)(e) — limitation conservation. |
| INF-5 | **Conformité hébergeur Cloudflare** : DPA signé automatiquement, SCC européennes incluses. Vérifier statut Privacy Shield / Data Privacy Framework EU-US 2026. | RGPD art. 28 + 44-49. |
| INF-6 | **Headers sécurité** : HSTS, CSP strict (script-src 'self'), X-Content-Type-Options, Referrer-Policy strict-origin. Aucun lien avec PII directement, mais best practice CNIL. | Recommandation CNIL Hardening 2024. |
| INF-7 | **Rate-limit edge Cloudflare** : configurer Rules > Rate Limiting (free tier inclut 10 000 req/jour). Confirmer cohérence avec rate-limits applicatifs documentés CGU. | Conformité contractuelle : ne pas promettre dans CGU ce qui n'est pas configuré infra. |
| INF-8 | **Domaine légal** : achat domaine après naming @creative-strategy. Vérifier que les WHOIS sont protégés (privacy WHOIS) ou que les coordonnées affichées sont celles de l'auto-entreprise (cohérence mentions légales). | Loi Informatique et Libertés + LCEN 2004. |
| INF-9 | **`/bot` page publique** : créer une page `/bot` documentant le User-Agent `DevRefs-Bot/1.0` avec finalité scraping, fréquence, contact. Standard de courtoisie pour les sources. | Best practice TOS scraping (point 7). |
| INF-10 | **Cookies fonctionnels JWT** : configurer cookie `Secure; HttpOnly; SameSite=Strict` sur le JWT post-Stripe. | OWASP + recommandation CNIL session management. |

---

## Hypothèses à lever (à valider avant production)

| # | Hypothèse | Qui doit lever | Quand | Impact si invalidée |
|---|---|---|---|---|
| H1 | Coinbase x402 facilitator dispose d'un DPA séparé ou applique son DPA global (à confirmer dpo@coinbase.com) | @legal (email DPO Coinbase) | Avant 1ère transaction x402 | Si pas de DPA acceptable → fallback Stripe-only ou self-host facilitator x402 |
| H2 | Traitement BNC d'une prestation IA-to-IA payée en stablecoin USDC (assimilable à crypto classique art. 150 VH bis CGI) | Avocat fiscaliste FR ou expert-comptable | Avant immatriculation auto-entreprise | Si requalification (ex : prestation numérique électronique soumise à TVA dès le 1er euro) → revoir modèle TVA |
| H3 | Cloudflare free tier permet stockage EU forcé (Data Localization Suite gratuit ou non) | @infrastructure | Phase 2 | Si non → mention SCC dans Privacy Policy obligatoire |
| H4 | Stripe Tax automatise reverse charge B2B UE et OSS B2C UE sur Payment Link standard | @fullstack vérifie config Stripe Phase 1 | Phase 1 | Si non → dépassement franchise = obligation manuelle déclaration TVA |
| H5 | Persona principal "agent IA" agissant pour opérateur professionnel = qualification B2B sécurisée (pas de droit rétractation) | Avocat | Avant lancement commercial public | Si requalification B2C → ajouter parcours rétractation 14j Stripe + clause renonciation expresse |
| H6 | npm registry tolère DevRefs sous le tier 1 req/s + 5M req/mois (largement OK pour cible 600 €/mois) | Auto-vérification métriques | Phase 4 mesure | Si dépassement → bascule CouchDB replication |

---

## Verdict global de l'audit

**GO CONDITIONNEL** — le projet DevRefs est juridiquement viable en V1 sous réserve des 4 actions P0 suivantes AVANT 1ère transaction commerciale :

1. **P0** : immatriculation auto-entreprise BNC (Guichet unique INPI) — délai 7-14 jours.
2. **P0** : email à `dpo@coinbase.com` pour confirmer DPA x402 facilitator + RGPD compliance.
3. **P0** : confirmation par expert-comptable du traitement BNC stablecoin USDC (cours du jour, PUMP, justificatifs).
4. **P0** : activation Stripe Tax pour gestion automatique TVA B2C UE (OSS) et reverse charge B2B UE.

Les autres risques (P1, P2) sont gérables dans le cours normal du projet et documentés dans les livrables associés (`rgpd-checklist.md`, `cgu-draft.md`, `privacy-policy.md`).

---

**Handoff → @orchestrator** (cf. fin de session, format complet hors fichier)
