<!-- Version: 2026-05-05T16:30 — @legal — Draft CGV/CGU v2 DevRefs Phase 0 v2 session 3 — pivot 100% B2A pure agents IA -->

# Conditions Générales de Vente et d'Utilisation — DevRefs v2

> **Statut** : draft v2 produit par @legal en Phase 0 v2 session 3. Validation avocat recommandée avant publication, notamment sur la garantie ROI 50 % (qualification) et la renonciation L.221-28 13° (conditions formelles).
> **Date d'effet** : à compléter à la publication (jour de mise en ligne).
> **Version** : 2.0
> **URL canonique** : à publier sur `/terms` du domaine définitif.
> **Delta v1 → v2** : RETIRÉ section "Abonnement Stripe Link 4,99 €/jour illimité". AJOUTÉ Art. 3bis (endpoint audit), Art. 4bis (packs pré-payés), Art. 4ter (garantie ROI), Art. 4quater (renonciation L.221-28 13°). RÉTROGRADÉ Stripe en service auxiliaire (Art. 4.3). ADAPTÉ Art. 8 (plafonds de responsabilité v2).

---

## Article 1 — Objet et définitions

### 1.1 Objet

Les présentes Conditions Générales de Vente et d'Utilisation (ci-après les "**CGV/CGU**") régissent l'accès et l'utilisation du service DevRefs (ci-après le "**Service**"), édité par [Raison sociale auto-entreprise — à compléter après immatriculation INPI] (ci-après l'"**Éditeur**"), accessible sur le domaine définitif retenu (ci-après le "**Site**").

Le Service consiste en la fourniture, via trois endpoints HTTP API, de données techniques et d'analyses structurées relatifs à :
- les tarifs publics des fournisseurs de modèles de langage (LLM) — endpoint `/api/llm-prices` ;
- le statut des packages SDK techniques (versions, breaking changes) — endpoint `/api/sdk-status` ;
- l'audit de configuration et d'usage d'un agent IA pour optimisation des coûts — endpoint `/api/agent-audit`.

### 1.2 Définitions

- "**Acheteur**" : toute personne physique ou morale, ou tout système automatisé agissant pour le compte d'une personne physique ou morale, qui acquiert un accès au Service.
- "**Agent IA**" : système automatisé d'intelligence artificielle exécutant des requêtes pour le compte de son opérateur.
- "**Opérateur**" : la personne physique ou morale pour le compte de laquelle l'Agent IA effectue des requêtes et paiements.
- "**Sponsor**" : le développeur humain qui alimente en USDC le wallet de l'Agent IA via un paiement Stripe ou direct (persona secondaire — B2C marginal).
- "**x402**" : protocole HTTP 402 de paiement natif sur le réseau Base (Coinbase Layer 2), utilisant le stablecoin USDC.
- "**Pack**" : quota de calls ou d'audits pré-acheté en une transaction x402 unique, valable 12 mois.
- "**Audit**" : analyse heuristique statique de la configuration et des traces d'usage d'un Agent IA, délivrant un score, des recommandations et un savings_pct estimé.
- "**savings_pct**" : pourcentage d'économie de coûts tokens estimé par l'Audit, exprimé sur une base mensuelle projetée.
- "**wallet_hash**" : empreinte SHA256 de l'adresse wallet Ethereum/Base de l'Acheteur. Utilisé comme identifiant pseudonyme pour le quota Pack et la traçabilité anti-fraude.
- "**audit_id**" : identifiant UUID unique de chaque Audit délivré, signé HMAC (champ `_audit_id` dans l'output). Référence obligatoire pour toute demande de garantie ROI.
- "**Payload**" : objet JSON livré en réponse à une requête authentifiée et payée, contenant les données techniques structurées ou le résultat d'un Audit.

---

## Article 2 — Acceptation des CGV/CGU

L'utilisation du Service implique l'acceptation pleine et entière des présentes CGV/CGU. Pour les Acheteurs Agent IA, l'envoi d'une requête signée x402 vaut acceptation. Pour les Sponsors humains, le clic sur le bouton de paiement après validation des CGV/CGU sur la landing vaut acceptation.

L'Acheteur déclare avoir la capacité juridique de contracter et être âgé d'au moins 18 ans (ou agir au nom d'une personne morale).

L'Éditeur se réserve le droit de modifier les CGV/CGU à tout moment. Les modifications prennent effet 7 jours après publication d'une nouvelle version sur le Site. La version applicable à une transaction est celle en vigueur à la date de la transaction.

---

## Article 3 — Description du Service

### 3.1 Endpoints disponibles

| Endpoint | Description | Méthode | Paiement |
|---|---|---|---|
| `/api/llm-prices` | Payload JSON : prix `input_per_mtok`, `output_per_mtok`, `effective_cost_factor`, `dateModified` pour un modèle LLM | GET | x402 ($0.001/call) ou Pack |
| `/api/sdk-status` | Payload JSON : `latest`, `breaking_since`, `dateModified` pour un package SDK | GET | x402 ($0.001/call) ou Pack |
| `/api/agent-audit` | Analyse heuristique statique : score 0-100, savings_pct, recommendations[], monthly_cost_current/optimized | POST | x402 ($9.99 one-shot) ou Pack Pro Audit |

### 3.2 Format des payloads

Chaque payload est un objet JSON conforme à un schéma JSON-LD `Dataset` documenté sur `/about/data-schema`. Chaque payload contient un champ `dateModified` ISO 8601, un champ `fetched_at` ISO 8601 et un champ `_signature` HMAC (traçabilité). L'output Audit contient de plus un champ `_audit_id` UUID unique.

Taille maximale d'un payload data : 50 Ko. Taille maximale d'un input Audit : 100 Ko.

### 3.3 Sources de données

Données collectées exclusivement auprès des sources publiques officielles (Anthropic, OpenAI, Google, Mistral pricing pages, npm registry public, GitHub releases publiques). Liste complète sur `/about/data-sources`.

### 3.4 Traitement de l'input Audit (non-persistance)

L'input soumis à `/api/agent-audit` (`agent_config`, `sample_traces`) est traité exclusivement en mémoire Worker (scope de la requête HTTP) et n'est **jamais persisté** en base de données (KV, D1, R2), Analytics Engine ou logs. Il est détruit à la fin de la requête. L'Acheteur garantit expressément que ses inputs ne contiennent aucune donnée à caractère personnel de tiers. L'Éditeur ne peut être tenu responsable de données à caractère personnel incluses par l'Acheteur dans ses inputs.

Seules les métadonnées agrégées de l'Audit sont conservées (audit_id, savings_pct, wallet_hash, date) pour les finalités de garantie ROI et de comptabilité.

---

## Article 4 — Tarifs et paiement

### 4.1 Tarifs

| Produit | Prix | Devise | Mode de paiement |
|---|---|---|---|
| Call unitaire (1 payload LLM ou SDK) | $0.001 USDC | USDC (Base) | x402 one-shot |
| Pack Discovery (5 000 calls) | $5.00 USDC | USDC (Base) | x402 pack |
| Pack Standard (10 000 calls) | $10.00 USDC | USDC (Base) | x402 pack — recommandé |
| Pack Pro (60 000 calls) | $50.00 USDC | USDC (Base) | x402 pack |
| Audit one-shot | $9.99 USDC | USDC (Base) | x402 one-shot |
| Pack Pro Audit (6 audits) | $49.00 USDC | USDC (Base) | x402 pack |
| Top-up wallet sponsor (rampe Stripe) | Variable ($5-$50) | EUR (converti USDC Base) | Stripe Payment Link — auxiliaire |

Les prix s'entendent **hors taxes**. **TVA non applicable, art. 293 B du CGI** tant que l'Éditeur bénéficie de la franchise en base de TVA.

### 4.2 Paiement x402

Le paiement x402 est exécuté via le facilitator Coinbase sur le réseau Base. Settlement on-chain < 5 secondes. Payload livré en réponse HTTP immédiate dès validation.

L'Acheteur reconnaît que :
- le paiement x402 est **irrévocable** une fois le settlement confirmé on-chain ;
- les frais réseau (gas) sur Base sont à sa charge (< 0,001 €) ;
- le wallet Ethereum/Base utilisé constitue son identifiant pseudonyme pour la durée de la relation contractuelle.

### 4.3 Top-up wallet sponsor (Stripe — service auxiliaire)

Le Stripe Payment Link est une rampe d'achat de USDC Base mise à disposition des Sponsors humains pour alimenter le wallet de leur Agent IA. Ce service est **auxiliaire** : le Service principal est consommé par l'Agent IA via x402. Stripe gère les données de paiement du Sponsor en tant que responsable de traitement distinct (PCI-DSS niveau 1). DevRefs ne reçoit qu'un `customer_id` pseudonyme.

### 4.4 TVA et facturation

| Situation | Traitement TVA |
|---|---|
| Éditeur sous franchise art. 293 B CGI (situation V1) | Mention "TVA non applicable, art. 293 B du CGI" sur toutes factures. Pas de TVA collectée. |
| Éditeur au-dessus seuil + Acheteur B2B UE avec n° TVA intracom valide | Reverse charge. Mention "TVA due par le preneur — autoliquidation, art. 196 directive 2006/112/CE". |
| Éditeur au-dessus seuil + Acheteur B2C UE | TVA française collectée et reversée via OSS. Stripe Tax automatise si activé. |
| Éditeur au-dessus seuil + Acheteur hors UE | Pas de TVA française. |

Une facture est émise automatiquement par Stripe pour les paiements Stripe. Pour les paiements x402, un reçu numérique horodaté est disponible sur demande à `legal@devrefs.dev` avec mention du tx hash blockchain.

---

## Article 4bis — Packs pré-payés

### 4bis.1 Validité

Tout Pack acheté est valide **12 mois** à compter de la date d'achat (`purchased_at` — horodatage blockchain de la transaction d'achat). Le quota non consommé à l'expiration est **définitivement perdu** sans droit au remboursement.

Notification d'expiration : si un email Sponsor est renseigné via le compte Stripe, une notification est envoyée 7 jours avant expiration du Pack. En l'absence d'email renseigné (architecture pseudonyme par défaut), aucune notification n'est émise — l'Acheteur est seul responsable du suivi de la durée de validité de son Pack.

### 4bis.2 Non-remboursabilité

Une fois ≥ 1 call consommé (quota décrémenté), le Pack est **non-remboursable**, à l'exception de la garantie ROI Audit prévue à l'article 4ter.

### 4bis.3 Transférabilité

En V1, le quota Pack est lié au wallet acheteur (wallet_hash) et **non transférable**. Une fonctionnalité de transfert on-chain (signature wallet destinataire) est prévue en V2.

### 4bis.4 Irrévocabilité on-chain

Le paiement x402 du Pack est irrévocable une fois le settlement Coinbase confirmé. L'Acheteur reconnaît cette irrévocabilité inhérente au protocole blockchain.

---

## Article 4ter — Garantie ROI Audit (savings_pct ≥ 15 % à 30 jours)

### 4ter.1 Objet de la garantie

L'Éditeur garantit que l'Audit délivré via `/api/agent-audit` permettra à l'Acheteur, s'il applique les recommandations, d'atteindre un savings_pct effectivement mesuré ≥ 15 % sur 30 jours. Si cette condition n'est pas remplie, l'Éditeur rembourse **50 % du prix de l'Audit** sur le wallet de l'Acheteur, en USDC Base.

### 4ter.2 Conditions cumulatives d'éligibilité à la garantie

Pour bénéficier du remboursement de 50 %, l'Acheteur doit satisfaire **simultanément** aux 4 conditions suivantes :

(i) **Volume minimal** : l'Agent IA a consommé ≥ 5 000 000 (cinq millions) de tokens d'input par mois sur la période de 30 jours suivant l'Audit ;

(ii) **Application des recommandations** : au moins 80 % des recommandations de l'Audit (patches) ont été appliqués — qu'ils soient `auto_applicable` ou manuels. La preuve d'application incombe à l'Acheteur ;

(iii) **Stabilité du modèle** : le modèle LLM principal utilisé par l'Agent IA n'a pas été remplacé pendant les 30 jours suivant l'Audit (un changement de modèle invalide la mesure de l'impact des heuristiques) ;

(iv) **Délai** : la demande de remboursement est soumise dans les 30 jours suivant la date de l'Audit (champ `audit_id` dans l'output).

### 4ter.3 Montants remboursés

| Offre | Prix | Remboursement 50 % |
|---|---|---|
| Audit one-shot | $9.99 USDC | $5.00 USDC (arrondi supérieur) |
| Pack Pro Audit ($49 / 6 audits) | $8.17/audit | $4.08 USDC |

### 4ter.4 Procédure de demande

L'Acheteur soumet `POST /api/audit/refund` avec :
- `audit_id` : l'identifiant UUID de l'Audit (champ `_audit_id` de l'output) ;
- signature cryptographique du wallet acheteur (preuve de propriété) ;
- preuve du savings_pct effectivement mesuré (JSON libre : logs tokens, factures API, comparaison avant/après) ;
- déclaration sur l'application des patches (≥ 80 %).

L'Éditeur vérifie les conditions (i) à (iv) sous 7 jours ouvrés. En cas d'éligibilité confirmée, le remboursement est effectué en USDC Base sur le wallet de l'Acheteur sous 7 jours ouvrés supplémentaires.

### 4ter.5 Limite anti-abus

La garantie ne s'applique qu'une fois par `audit_id`. Tout `audit_id` déjà remboursé ou présentant une signature `_signature` invalide (altérée ou falsifiée) est automatiquement rejeté. En cas de fraude avérée (faux savings déclarés, audit_id forgé), les sanctions de l'article 7 s'appliquent.

---

## Article 4quater — Droit de rétractation B2C et renonciation expresse

### 4quater.1 Champ d'application

Le présent article s'applique uniquement aux Acheteurs **consommateurs** au sens de l'art. L.212-2 Code conso (personnes physiques agissant à des fins qui n'entrent pas dans le cadre de leur activité commerciale, industrielle, artisanale, libérale ou agricole).

Les Agents IA agissant pour le compte d'un Opérateur professionnel et les personnes morales sont **hors champ** du présent article. Aucun droit de rétractation ne s'applique aux relations B2B (art. L.221-3 Code conso).

### 4quater.2 Renonciation expresse au droit de rétractation (L.221-28 13°)

Conformément à l'art. L.221-28 13° Code conso, l'Acheteur consommateur reconnaît expressément, en cochant la case dédiée sur la page de paiement AVANT de valider son achat, **renoncer à son droit de rétractation de 14 jours** (art. L.221-18 Code conso) en demandant l'exécution immédiate du Service numérique.

Cette renonciation est matérialisée par :
- (a) le cochage d'une case dédiée et distincte sur la page de paiement (libellé exact : "Je comprends et j'accepte que l'exécution immédiate du service entraîne la perte de mon droit de rétractation de 14 jours conformément à l'article L.221-28 13° du Code de la consommation.") ;
- (b) un email de confirmation post-achat récapitulant la renonciation et le contenu acheté ;
- (c) la conservation de ces éléments par l'Éditeur comme preuve du consentement.

Le bouton de paiement est désactivé tant que la case (a) n'est pas cochée.

### 4quater.3 Garantie commerciale en substitution

La garantie ROI 50 % (article 4ter) constitue un mécanisme commercial qui peut bénéficier aux Acheteurs éligibles (y compris B2C) en sus ou en lieu et place du droit légal de rétractation (dans les cas où ce dernier a été valablement renoncé conformément à §4quater.2). Elle est plus favorable que le droit légal de rétractation dans les cas où elle s'applique.

---

## Article 5 — Niveau de service (SLA) — v2

### 5.1 Disponibilité

Taux de disponibilité **mensuel de 99,5 %** (équivalent à environ 3h40 d'indisponibilité maximale par mois) sur les 3 endpoints.

### 5.2 Fraîcheur des données

- `/api/llm-prices` : `dateModified` < 6 heures (cron de scraping toutes les 6 heures).
- `/api/sdk-status` : `dateModified` < 24 heures (cron quotidien).
- `/api/agent-audit` : heuristiques statiques — version documentée dans `_audit_heuristics_version`. Pas de fraîcheur applicable aux heuristiques (déterministes).

En cas de dépassement de fraîcheur (> 48 heures pour LLM pricing, > 7 jours pour SDK status), l'Acheteur peut signaler l'incident à `legal@devrefs.dev`. Aucun mécanisme de crédit automatique sur paiement x402 en V1 (dispositif candidat V2).

### 5.3 Latence

Latence cible p95 < 200 ms sur edge Cloudflare (endpoints LLM + SDK). Latence audit p95 < 2 000 ms. Ces objectifs sont indicatifs (SLA de moyens, non de résultat).

### 5.4 Limites du SLA

L'Éditeur garantit la fraîcheur structurée (timestamp `dateModified`) mais ne garantit pas la véracité métier absolue des données sources (si une source officielle publie une erreur, la responsabilité reste sur la source). L'Acheteur conserve la responsabilité finale de ses décisions opérationnelles.

---

## Article 6 — Propriété intellectuelle et licence

### 6.1 Données factuelles

Les données factuelles brutes (prix LLM, versions SDK, dates de breaking changes) ne sont pas protégées par le droit d'auteur en tant que faits bruts (art. L.112-1 CPI).

### 6.2 Format DevRefs et base de données

La structure JSON-LD propriétaire des payloads DevRefs, les heuristiques d'audit, l'algorithme de scoring 0-100 et la base de données consolidée constituent :
- une **œuvre composite** protégée au titre du droit d'auteur (art. L.113-2 CPI) ;
- une **base de données** protégée au titre du droit sui generis (art. L.341-1 CPI).

### 6.3 Licence accordée à l'Acheteur

Licence **non exclusive, mondiale, limitée à l'usage interne** de l'Acheteur ou de l'Opérateur pour chaque payload/audit livré contre paiement.

L'Acheteur s'interdit expressément :
- de redistribuer, revendre ou sous-licencier les payloads ou outputs d'audit ;
- d'inclure les données dans une base de données concurrente ;
- de retirer, masquer ou contourner les champs `_signature` et `_audit_id` ;
- d'extraire systématiquement les données pour reconstituer la base de données DevRefs (art. L.342-1 CPI).

L'usage à des fins d'enrichissement de réponses internes, de scaffolding de code ou d'optimisation de coûts opérationnels est expressément autorisé.

### 6.4 Marques et signes distinctifs

Le nom "DevRefs", le logo et les éléments graphiques du Site sont la propriété exclusive de l'Éditeur (art. L.713-1 CPI).

---

## Article 7 — Anti-fraude et rate-limiting — v2

### 7.1 Mesures de prévention

- **Watermark HMAC payloads** : champ `_signature` dans chaque payload. Champ `_audit_id` dans chaque output audit.
- **Rate-limit calls x402** : maximum 1 000 requêtes par jour par wallet (calls unitaires).
- **Rate-limit audit** : maximum 1 audit par wallet par jour (prévention abus garantie ROI).
- **Pack quota KV** : décrément atomique à chaque call autorisé. Irrévocable.
- **Logs de traçabilité** : conservés 30 jours.

### 7.2 Sanctions

| Comportement | Sanction |
|---|---|
| Faux refund (audit_id falsifié, savings déclarés frauduleusement) | Blacklist wallet permanente + dépôt de plainte si préjudice > 50 € |
| Dépassement rate-limit fair-use sans réponse à un avertissement | Throttling progressif puis blacklist 24h |
| Redistribution payload ou output audit (watermark cassé) | Blacklist permanente, signalement `abuse@coinbase.com` |
| Tentative bypass paiement (replay attack, quota KV manipulé) | Blacklist permanente + dépôt de plainte si préjudice > 100 € |
| Scraping massif sans paiement | IP blacklist Cloudflare WAF + conservation logs 30 jours |

### 7.3 Renonciation au remboursement en cas de fraude avérée

En cas de blacklist pour fraude, aucun remboursement n'est dû. Les paiements antérieurs valides ne sont pas remis en cause.

---

## Article 8 — Responsabilité — v2

### 8.1 Plafond de responsabilité

La responsabilité totale de l'Éditeur envers l'Acheteur, toutes causes confondues, est limitée :
- à **$0.001 USD** (≈ 0,001 €) pour un call unitaire x402 ;
- au **prix du Pack concerné** ($5 / $10 / $50) pour une défaillance affectant l'ensemble d'un Pack ;
- à **$9.99 USD** pour un Audit one-shot, ou au **prix unitaire de l'Audit** dans un Pack Pro ($8.17) pour le Pack Pro Audit ;
- **exception** : la garantie ROI 50 % (article 4ter) constitue le seul mécanisme de remboursement contractuel prévu sur l'Audit. Elle se substitue, dans son périmètre, au plafond ci-dessus.

### 8.2 Exclusions

L'Éditeur exclut toute responsabilité pour :
- les dommages indirects ou consécutifs (perte d'exploitation, perte de données, perte de chance, manque à gagner) ;
- les décisions opérationnelles prises par l'Acheteur sur la base des payloads ou outputs audit (responsabilité décisionnelle reste à l'Acheteur) ;
- les inexactitudes des sources officielles tierces reflétées par les payloads ;
- les indisponibilités dues à des cas de force majeure (panne Cloudflare, panne Coinbase facilitator, panne Stripe, attaque DDoS massive) ;
- toute PII contenue par l'Acheteur dans les inputs transmis à `/api/agent-audit`.

### 8.3 Garanties B2B/B2C

Pour les Acheteurs B2B : garanties légales de conformité et d'éviction exclues dans la mesure permise par le droit français. Pour les Acheteurs B2C : garanties légales (art. L.217-3 et suivants Code conso) demeurent applicables.

---

## Article 9 — Données personnelles et confidentialité — v2

### 9.1 Architecture zéro-PII

DevRefs a conçu le Service selon un principe zéro PII. Les paiements x402 utilisent un wallet_hash pseudonyme. Pour les paiements Stripe (top-up sponsor), les données sont collectées et traitées par Stripe (responsable de traitement distinct) — DevRefs ne reçoit qu'un customer_id pseudonyme.

L'input `/api/agent-audit` (`agent_config`, `sample_traces`) n'est jamais persisté (cf. art. 3.4). L'Acheteur est seul responsable de l'absence de PII dans ses inputs.

### 9.2 Politique de confidentialité

Modalités complètes dans la **Politique de confidentialité** accessible sur `/privacy`.

### 9.3 Sous-traitants

- **Stripe Payments Europe Ltd** (Irlande) — paiement carte top-up sponsor ;
- **Coinbase Inc.** (USA) — facilitator paiement x402 USDC Base ;
- **Cloudflare Inc.** (USA) — hébergement Pages, Workers, KV, Analytics Engine.

Les transferts hors UE sont encadrés par les clauses contractuelles types (SCC) européennes.

---

## Article 10 — Suspension et résiliation

### 10.1 Suspension

L'Éditeur peut suspendre l'accès sans préavis en cas de fraude avérée ou suspicion sérieuse, de non-respect des CGV/CGU, de demande des autorités, ou de maintenance programmée (notification 48h si possible).

### 10.2 Résiliation

Les paiements x402 unitaires sont instantanés — pas de relation contractuelle continue à résilier. Les Packs expirent à leur date de validité (12 mois). Pas de résiliation anticipée avec remboursement du quota restant (sauf garantie ROI art. 4ter dans son périmètre).

---

## Article 11 — Droit applicable et juridiction compétente

### 11.1 Droit applicable

Les présentes CGV/CGU sont régies par le **droit français**.

### 11.2 Juridiction compétente

**Pour les litiges B2B** : compétence exclusive du Tribunal de commerce du ressort du siège de l'Éditeur (à confirmer après immatriculation — par défaut Paris).

**Pour les litiges B2C UE** : conformément au règlement (UE) n° 1215/2012 (Bruxelles I bis), art. 17-19, les litiges impliquant un consommateur UE relèvent de la juridiction du domicile du consommateur. Toute clause contraire est inopposable au consommateur.

### 11.3 Médiation de la consommation (B2C uniquement)

Conformément à l'art. L.616-1 Code conso, l'Acheteur consommateur peut recourir à un médiateur de la consommation en cas de litige non résolu amiablement dans un délai de 2 mois. Coordonnées du médiateur : à publier après adhésion à un service de médiation agréé (action @legal Phase 5).

### 11.4 Plateforme européenne ODR

Conformément au règlement (UE) n° 524/2013 : https://ec.europa.eu/consumers/odr.

---

## Article 12 — Dispositions finales

### 12.1 Intégralité

Les présentes CGV/CGU constituent l'intégralité de l'accord entre les parties et prévalent sur tout document ou échange antérieur.

### 12.2 Nullité partielle

Si une clause est déclarée nulle, les autres restent en vigueur.

### 12.3 Non-renonciation

Le fait pour l'Éditeur de ne pas se prévaloir d'une clause ne vaut pas renonciation.

### 12.4 Contact

Toute question ou réclamation : `legal@devrefs.dev` (à activer après acquisition du domaine définitif).

---

**Date d'effet** : à compléter à la publication.
**Dernière mise à jour** : 2026-05-05 (draft v2 @legal Phase 0 v2 session 3).
