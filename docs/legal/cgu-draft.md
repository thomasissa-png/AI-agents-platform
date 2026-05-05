<!-- Version: 2026-05-05T08:20 — @legal — Draft CGV/CGU initial DevRefs Phase 0 wave 1 -->

# Conditions Générales de Vente et d'Utilisation — DevRefs

> **Statut** : draft v1 produit par @legal en Phase 0. Validation avocat recommandée avant publication. Le naming définitif "DevRefs" sera tranché par @creative-strategy en Phase 0 — find-replace `DevRefs` à appliquer après décision si différent.
> **Date d'effet** : à compléter à la publication (jour de mise en ligne).
> **Version** : 1.0
> **URL canonique** : à publier sur `/terms` du domaine définitif.

---

## Article 1 — Objet et définitions

### 1.1 Objet

Les présentes Conditions Générales de Vente et d'Utilisation (ci-après les "**CGV/CGU**") régissent l'accès et l'utilisation du service DevRefs (ci-après le "**Service**"), édité par [Raison sociale auto-entreprise — à compléter après immatriculation INPI] (ci-après l'"**Éditeur**"), accessible sur le domaine définitif retenu (ci-après le "**Site**").

Le Service consiste en la fourniture, via deux endpoints HTTP API, de payloads JSON techniques relatifs à :
- les tarifs publics des fournisseurs de modèles de langage (LLM) — endpoint `/api/llm-prices` ;
- le statut des packages SDK techniques (versions, breaking changes) — endpoint `/api/sdk-status`.

### 1.2 Définitions

- "**Acheteur**" : toute personne physique ou morale, ou tout système automatisé agissant pour le compte d'une personne physique ou morale, qui acquiert un accès au Service.
- "**Agent IA**" : système automatisé d'intelligence artificielle exécutant des requêtes pour le compte de son opérateur.
- "**x402**" : protocole HTTP 402 de paiement natif sur le réseau Base (Coinbase Layer 2), utilisant le stablecoin USDC.
- "**JWT**" : JSON Web Token signé HMAC-SHA256, valable 24 heures, non renouvelé automatiquement.
- "**Payload**" : objet JSON livré en réponse à une requête authentifiée et payée, contenant les données techniques structurées.

---

## Article 2 — Acceptation des CGV/CGU

L'utilisation du Service implique l'acceptation pleine et entière des présentes CGV/CGU. Pour les Acheteurs Agent IA, l'envoi d'une requête signée x402 vaut acceptation. Pour les Acheteurs humains, le clic sur le Stripe Payment Link vaut acceptation.

L'Acheteur déclare avoir la capacité juridique de contracter et être âgé d'au moins 18 ans (ou agir au nom d'une personne morale).

L'Éditeur se réserve le droit de modifier les CGV/CGU à tout moment. Les modifications prennent effet 7 jours après publication d'une nouvelle version sur le Site. La version applicable à une transaction est celle en vigueur à la date de la transaction.

---

## Article 3 — Description du Service

### 3.1 Endpoints disponibles

Le Service propose deux endpoints HTTP API :

| Endpoint | Description | Méthode | Paiement |
|---|---|---|---|
| `/api/llm-prices` | Payload JSON listant prix `input_per_mtok`, `output_per_mtok`, `effective_cost_factor`, `dateModified` pour un modèle LLM identifié par paramètre `?model=` | GET | x402 (0,49 €) ou JWT Stripe |
| `/api/sdk-status` | Payload JSON listant `latest`, `breaking_since`, `dateModified` pour un package SDK identifié par paramètre `?pkg=` | GET | x402 (0,49 €) ou JWT Stripe |

### 3.2 Format des payloads

Chaque payload est un objet JSON conforme à un schéma JSON-LD `Dataset` documenté sur la page `/about/data-schema`. Chaque payload contient :
- les données factuelles demandées ;
- un champ `dateModified` ISO 8601 indiquant la dernière mise à jour côté Éditeur ;
- un champ `fetched_at` ISO 8601 indiquant la dernière requête réussie auprès de la source officielle ;
- un champ `_signature` HMAC permettant la traçabilité d'origine (anti-fraude).

Taille maximale d'un payload : 50 Ko.

### 3.3 Sources de données

Les données sont collectées exclusivement auprès des sources publiques officielles, notamment : pages publiques de tarification des fournisseurs LLM (Anthropic, OpenAI, Google, Mistral), npm registry public, GitHub releases publiques. La liste complète et à jour est publiée sur `/about/data-sources`.

---

## Article 4 — Tarifs et paiement

### 4.1 Tarifs

| Produit | Prix | Devise | Mode de paiement |
|---|---|---|---|
| Requête unitaire (1 payload) | 0,49 € HT | EUR (équivalent USDC au cours du jour) | x402 (USDC sur Base) |
| Accès journalier illimité (cross-endpoints, JWT 24h non renouvelable) | 4,99 € HT | EUR | Stripe Payment Link (carte bancaire, Apple Pay, Google Pay) |

Les prix s'entendent **hors taxes**. **TVA non applicable, art. 293 B du CGI** tant que l'Éditeur bénéficie de la franchise en base de TVA. Au-dessus du seuil, la TVA française sera appliquée selon les règles en vigueur (cf. article 4.4).

### 4.2 Paiement x402

Le paiement x402 est exécuté via le facilitator Coinbase sur le réseau Base. Le settlement on-chain est effectif en moins de 5 secondes. Le payload est livré en réponse HTTP immédiate dès validation du paiement.

L'Acheteur reconnaît que :
- le paiement x402 est **irrévocable** une fois le settlement confirmé ;
- le wallet Ethereum/Base utilisé pour le paiement constitue son identifiant pseudonyme unique pour la durée de la transaction ;
- les frais réseau (gas) sur Base sont à sa charge (négligeables, < 0,001 €).

### 4.3 Paiement Stripe Payment Link

L'Acheteur clique sur le Stripe Payment Link `https://buy.stripe.com/[lien-final-après-config-stripe]` (URL définitive publiée sur la landing après configuration Stripe Phase 1) et complète son paiement sur le domaine `checkout.stripe.com`. Stripe est le responsable de traitement des données de paiement (PCI-DSS niveau 1).

Après paiement réussi, un JWT signé HMAC valable 24 heures est généré et livré à l'Acheteur via la page de confirmation Stripe. Ce JWT permet l'accès illimité aux deux endpoints pendant 24 heures glissantes à compter de l'émission.

### 4.4 TVA et facturation

| Situation | Traitement TVA |
|---|---|
| Éditeur sous franchise art. 293 B CGI (situation V1) | Mention "TVA non applicable, art. 293 B du CGI" sur factures. Pas de TVA collectée. |
| Éditeur au-dessus seuil franchise + Acheteur B2B UE avec n° TVA intracom | Reverse charge. Mention "TVA due par le preneur — autoliquidation, art. 196 directive 2006/112/CE". |
| Éditeur au-dessus seuil + Acheteur B2C UE | TVA française collectée et reversée via OSS. |
| Éditeur au-dessus seuil + Acheteur hors UE | Pas de TVA française. |

Une facture est émise automatiquement par Stripe pour les paiements Stripe (téléchargeable sur le dashboard Stripe customer). Pour les paiements x402, un reçu numérique horodaté est disponible sur demande à `legal@devrefs.dev` avec mention du tx hash blockchain.

### 4.5 Remboursement et droit de rétractation

#### Acheteurs B2B (Agent IA agissant pour un opérateur professionnel, ou personne morale)

**Aucun droit de rétractation** ne s'applique aux contrats B2B (art. L.221-3 Code conso ne s'applique qu'aux relations B2C).

Aucun remboursement n'est dû pour les requêtes x402 (prestation exécutée instantanément, payload livré).

Pour les abonnements journaliers Stripe, un remboursement intégral peut être demandé à `legal@devrefs.dev` si et seulement si le Service a été indisponible pendant plus de 4 heures cumulées sur la durée des 24 heures du JWT (cf. SLA article 5).

#### Acheteurs B2C (consommateur personne physique non professionnel)

Conformément à l'art. L.221-18 Code conso, l'Acheteur consommateur dispose en principe d'un droit de rétractation de 14 jours.

**EXCEPTION expresse** : conformément à l'art. L.221-28 13° Code conso, l'Acheteur reconnaît expressément, en cliquant sur le Stripe Payment Link et en validant son paiement, **renoncer à son droit de rétractation** en demandant l'exécution immédiate du Service (livraison du JWT 24h dès validation du paiement). Cette renonciation est rappelée explicitement sur la page de confirmation Stripe.

Cette exception est conforme à la jurisprudence sur les contenus numériques à exécution immédiate (CJUE, affaires diverses 2020-2024).

---

## Article 5 — Niveau de service (SLA)

### 5.1 Disponibilité

L'Éditeur s'engage à un taux de disponibilité **mensuel de 99,5 %** (équivalent à environ 3h40 d'indisponibilité maximale par mois). La disponibilité est mesurée sur la base des logs Cloudflare Workers (uptime endpoints `/api/llm-prices` et `/api/sdk-status`).

### 5.2 Fraîcheur des données

L'Éditeur s'engage sur la **fraîcheur structurée** des payloads :
- `/api/llm-prices` : `dateModified` < 6 heures (cron de scraping toutes les 6 heures).
- `/api/sdk-status` : `dateModified` < 24 heures (cron quotidien).

En cas de dépassement de fraîcheur (> 48 heures pour LLM pricing, > 7 jours pour SDK status), l'Acheteur peut signaler l'incident à `legal@devrefs.dev` ; le bénéfice du SLA d'indisponibilité (article 5.1) s'applique alors aux abonnements Stripe concernés. Aucun mécanisme de crédit automatique sur paiement x402 n'est implémenté en V1 (dispositif candidat V2 sous réserve de volume de signalements).

### 5.3 Latence

Latence cible p95 < 200 ms sur edge Cloudflare. Cet objectif est indicatif et ne constitue pas un engagement contractuel ferme (SLA de moyens, non de résultat).

### 5.4 Limites du SLA

L'Éditeur garantit la fraîcheur structurée (timestamp exact de la dernière vérification source) mais **ne garantit pas la véracité métier absolue** des données. Si une source officielle (Anthropic, OpenAI, etc.) publie une donnée erronée et que DevRefs reflète cette donnée, la responsabilité reste sur la source. L'Acheteur conserve la responsabilité finale de ses décisions opérationnelles fondées sur les données livrées.

---

## Article 6 — Propriété intellectuelle et licence

### 6.1 Données factuelles

Les données factuelles brutes (prix LLM, versions SDK, dates de breaking changes) ne sont pas, en tant que telles, protégées par le droit d'auteur (art. L.112-1 CPI ne protège pas les faits bruts). Elles proviennent de sources publiques officielles.

### 6.2 Format DevRefs

La structure JSON-LD propriétaire des payloads DevRefs (incluant notamment les champs `effective_cost_factor`, `dateModified`, `fetched_at`, `_signature`, ainsi que la base de données consolidée) constitue :
- une **œuvre composite** protégée au titre du droit d'auteur (art. L.113-2 CPI) ;
- une **base de données** protégée au titre du droit *sui generis* du producteur de base de données (art. L.341-1 CPI), l'Éditeur ayant procédé à un investissement substantiel dans la collecte, la vérification et la maintenance de ces données.

### 6.3 Licence accordée à l'Acheteur

L'Éditeur accorde à l'Acheteur, pour chaque payload livré contre paiement, une licence **non exclusive, mondiale, limitée à l'usage interne** de l'Acheteur ou de l'opérateur pour le compte duquel il agit.

L'Acheteur **s'interdit expressément** :
- de redistribuer, revendre, sous-licencier ou rendre publiquement accessibles les payloads ou tout extrait substantiel de ceux-ci ;
- d'inclure les payloads dans une base de données concurrente ou un service tiers reproduisant tout ou partie du Service ;
- de retirer, masquer ou contourner le champ `_signature` de traçabilité ;
- d'extraire et réutiliser systématiquement les données pour reconstituer la base de données DevRefs (art. L.342-1 CPI — atteinte aux droits du producteur de base de données).

L'usage par l'Acheteur (ou son Agent IA) à des fins d'enrichissement de réponses internes, de scaffolding de code, ou de prises de décisions opérationnelles internes est expressément autorisé.

### 6.4 Marques et signes distinctifs

Le nom "DevRefs", le logo et les éléments graphiques du Site sont la propriété exclusive de l'Éditeur. Toute reproduction non autorisée est interdite (art. L.713-1 CPI).

---

## Article 7 — Anti-fraude et rate-limiting

### 7.1 Mesures de prévention

L'Éditeur met en œuvre les mesures suivantes pour prévenir les usages frauduleux :

- **Watermark HMAC** : chaque payload contient un champ `_signature` calculé à partir d'une clé serveur secrète + identifiants Acheteur + timestamp + nonce. Permet de prouver l'origine d'un payload redistribué illégalement.
- **Rate-limit par wallet (x402)** : maximum 1 000 requêtes par jour par wallet. Au-delà, throttling progressif.
- **Rate-limit par JWT (Stripe)** : maximum 10 000 requêtes par JWT (équivalent à un usage humain raisonnable et abondant).
- **Signature HMAC traçable** sur chaque JWT, vérifiée à chaque requête.
- **Logs de traçabilité** conservés 30 jours pour analyse en cas de fraude présumée.

### 7.2 Sanctions en cas de fraude

| Comportement | Sanction |
|---|---|
| Dépassement rate-limit fair-use sans réponse à un avertissement | Throttling progressif puis blacklist 24 heures |
| Redistribution de payload détectée (watermark cassé ou retrouvé sur tiers) | Blacklist permanente du wallet et du JWT, signalement à `abuse@coinbase.com` et information aux autorités si préjudice > 100 € |
| Tentative de bypass paiement (replay attack, JWT forgé, signature invalide) | Blacklist permanente, dépôt de plainte si préjudice > 100 € |
| Scraping massif sans paiement (HTTP 402 ignoré, requêtes sans signature valide) | Blacklist IP via Cloudflare WAF + conservation logs 30 jours |

### 7.3 Renonciation au remboursement en cas de fraude

En cas de blacklist pour fraude avérée, aucun remboursement n'est dû à l'Acheteur fautif. Les paiements antérieurs valides ne sont pas remis en cause.

---

## Article 8 — Responsabilité

### 8.1 Plafond de responsabilité

La responsabilité totale de l'Éditeur envers l'Acheteur, toutes causes confondues, est limitée :
- à **0,49 €** pour une transaction unitaire x402 (montant de la requête concernée) ;
- à **4,99 €** pour un abonnement journalier Stripe (montant de la journée concernée).

### 8.2 Exclusions

L'Éditeur exclut toute responsabilité pour :
- les dommages indirects ou consécutifs : perte d'exploitation, perte de données, perte de chance, atteinte à l'image, manque à gagner ;
- les décisions opérationnelles prises par l'Acheteur ou son Agent IA sur la base des payloads livrés (l'Acheteur conserve la responsabilité finale de ses décisions) ;
- les inexactitudes propres aux sources officielles tierces reflétées par les payloads ;
- les indisponibilités liées à des cas de force majeure : panne Cloudflare, panne Coinbase facilitator, panne Stripe, panne Internet globale, attaque DDoS massive.

### 8.3 Garanties exclues (B2B)

Pour les Acheteurs B2B, les garanties légales de conformité et d'éviction sont exclues dans la mesure permise par le droit français applicable.

Pour les Acheteurs B2C, les garanties légales (art. L.217-3 et suivants Code conso) demeurent applicables.

---

## Article 9 — Données personnelles et confidentialité

### 9.1 Architecture zéro-PII

L'Éditeur a conçu le Service selon un principe d'architecture **zéro PII** : aucune donnée à caractère personnel n'est collectée par l'Éditeur dans le cadre des transactions x402 (wallet anonyme + JWT pseudonyme). Pour les paiements Stripe, les données de paiement sont collectées et traitées par Stripe (responsable de traitement distinct), l'Éditeur ne reçoit qu'un identifiant client pseudonyme (`customer_id`).

### 9.2 Politique de confidentialité

Les modalités complètes de traitement des données sont décrites dans la **Politique de confidentialité** accessible sur `/privacy`.

### 9.3 Sous-traitants

L'Éditeur fait appel aux sous-traitants suivants :
- **Stripe Payments Europe Ltd** (Irlande) — paiement carte bancaire et émission factures ;
- **Coinbase Inc.** (USA) — facilitator paiement x402 USDC sur Base ;
- **Cloudflare Inc.** (USA) — hébergement Pages, exécution Workers, stockage KV, analytics agrégés.

Les transferts de données vers les USA sont encadrés par les clauses contractuelles types (SCC) européennes.

---

## Article 10 — Suspension et résiliation

### 10.1 Suspension

L'Éditeur peut suspendre l'accès au Service sans préavis en cas de :
- fraude avérée ou suspicion sérieuse de fraude (cf. article 7) ;
- non-respect des présentes CGV/CGU ;
- demande des autorités compétentes ;
- maintenance technique programmée (notification 48h à l'avance dans la mesure du possible).

### 10.2 Résiliation

Les paiements x402 étant unitaires et instantanés, il n'y a pas de relation contractuelle continue à résilier.

Les abonnements journaliers Stripe expirent automatiquement à l'issue des 24 heures du JWT, sans reconduction automatique. Pas de procédure de résiliation requise.

---

## Article 11 — Droit applicable et juridiction compétente

### 11.1 Droit applicable

Les présentes CGV/CGU sont régies par le **droit français**.

### 11.2 Juridiction compétente

#### Pour les litiges B2B

Tout litige relatif à l'interprétation, l'exécution ou la résiliation des présentes CGV/CGU sera soumis à la compétence exclusive du **Tribunal de commerce du ressort du siège de l'Éditeur** (à confirmer après immatriculation auto-entreprise — par défaut Paris).

#### Pour les litiges B2C

Conformément au règlement (UE) n° 1215/2012 (Bruxelles I bis), articles 17-19, les litiges impliquant un consommateur résidant dans un autre État membre de l'Union européenne relèvent de la juridiction du domicile du consommateur, sans qu'une clause contraire puisse lui être opposée.

### 11.3 Médiation de la consommation (B2C uniquement)

Conformément à l'art. L.616-1 Code conso, l'Acheteur consommateur peut recourir à un médiateur de la consommation en cas de litige non résolu amiablement dans un délai de deux mois. Coordonnées du médiateur : à publier après adhésion à un service de médiation agréé (action @legal Phase 5).

### 11.4 Plateforme européenne de règlement des litiges

Conformément au règlement (UE) n° 524/2013, l'Acheteur consommateur peut recourir à la plateforme européenne ODR : https://ec.europa.eu/consumers/odr.

---

## Article 12 — Dispositions finales

### 12.1 Intégralité

Les présentes CGV/CGU constituent l'intégralité de l'accord entre les parties et prévalent sur tout document ou échange antérieur.

### 12.2 Nullité partielle

Si une clause est déclarée nulle, les autres restent en vigueur.

### 12.3 Non-renonciation

Le fait pour l'Éditeur de ne pas se prévaloir d'une clause ne vaut pas renonciation.

### 12.4 Contact

Toute question ou réclamation : `legal@devrefs.dev` (adresse à activer après acquisition du domaine définitif post-naming @creative-strategy).

---

**Date d'effet** : à compléter à la publication.
**Dernière mise à jour** : 2026-05-05 (draft initial @legal Phase 0).
