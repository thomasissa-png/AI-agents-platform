<!-- Version: 2026-05-05T08:30 — @legal — Privacy Policy initiale DevRefs Phase 0 wave 1 -->

# Politique de confidentialité — DevRefs

> **Statut** : draft v1 produit par @legal en Phase 0. Le naming définitif "DevRefs" sera tranché par @creative-strategy en Phase 0 — find-replace `DevRefs` à appliquer après décision si différent.
> **Date d'effet** : à compléter à la publication.
> **Version** : 1.0
> **URL canonique** : à publier sur `/privacy` du domaine définitif.

---

## Résumé en clair (TL;DR)

DevRefs a été conçu selon une architecture **zéro PII** :

- **Aucune donnée personnelle n'est collectée** par DevRefs lorsque vous payez en x402 (votre wallet est un identifiant pseudonyme suffisant).
- **Pour les paiements Stripe**, vos données de carte et email sont collectés directement par Stripe, pas par DevRefs. Nous ne recevons qu'un identifiant client pseudonyme.
- **Aucun cookie analytique ni traceur tiers** n'est déposé sur votre navigateur.
- **Aucune donnée n'est revendue** à un tiers, jamais.
- **Vous gardez le contrôle** : vous pouvez nous contacter à tout moment pour exercer vos droits RGPD.

---

## 1. Identité du responsable de traitement

**Éditeur** : [Raison sociale auto-entreprise — à compléter après immatriculation INPI]
**Statut** : auto-entrepreneur (micro-entreprise française)
**SIREN** : [Numéro SIREN à compléter après immatriculation]
**Domicile fiscal** : [Adresse à compléter après immatriculation]
**Contact protection des données** : `dpo@devrefs.dev` (adresse à activer après acquisition du domaine définitif)

L'Éditeur n'a pas désigné de Délégué à la Protection des Données (DPO) au sens de l'art. 37 RGPD, cette désignation n'étant pas obligatoire (pas d'autorité publique, pas de surveillance systématique à grande échelle, pas de catégories spéciales de données à grande échelle). L'adresse `dpo@devrefs.dev` est néanmoins maintenue comme point de contact unique pour toute question relative à la protection des données.

---

## 2. Données collectées et finalités

### 2.1 Architecture zéro PII — principe général

DevRefs a été conçu pour **fonctionner sans collecte de données à caractère personnel**. Les paiements x402 utilisent un wallet Ethereum/Base anonyme. Les paiements Stripe sont traités par Stripe en tant que responsable de traitement distinct (DevRefs ne reçoit qu'un identifiant pseudonyme).

### 2.2 Tableau exhaustif des traitements

| Donnée | Finalité | Base légale RGPD | Conservation | Source |
|---|---|---|---|---|
| **Adresse wallet Ethereum/Base** (paiements x402) | Identification pseudonyme transactionnelle, rate-limiting anti-fraude | Exécution du contrat (art. 6(1)(b)) + intérêt légitime (art. 6(1)(f)) | Durée de la session, supprimée après 24h en cache rate-limit | Acheteur (transmise par le facilitator Coinbase x402) |
| **Identifiant client Stripe (`customer_id`)** | Émission JWT 24h post-paiement, comptabilité | Exécution du contrat + obligation légale (art. 6(1)(c) Code commerce 10 ans) | 10 ans (obligation comptable) | Stripe (transmise après paiement réussi) |
| **JWT signé HMAC** | Authentification accès endpoints pendant 24h | Exécution du contrat | 24 heures (durée de validité) | Généré par DevRefs |
| **Adresse IP éphémère** | Rate-limiting anti-DDoS, prévention fraude | Intérêt légitime | < 24 heures (cache Cloudflare KV avec TTL) | Requête HTTP de l'Acheteur |
| **Métadonnées x402 (`resource_url`, `description`, `reason`)** | Validation paiement par le facilitator Coinbase | Exécution du contrat | Conservées par Coinbase selon sa propre politique | Acheteur via protocole x402 |
| **Tx hash blockchain Base** | Comptabilité, traçabilité paiements | Obligation légale (Code commerce) | 10 ans | Réseau Base (public on-chain) |
| **Logs Cloudflare Workers** (URL, statut HTTP, timestamp) | Sécurité, debug, anti-fraude | Intérêt légitime | < 30 jours | Cloudflare |
| **Métriques agrégées Cloudflare Analytics** | Suivi audience global et performance | Intérêt légitime (statistiques anonymes agrégées) | Indéterminée (agrégat anonyme, pas de PII) | Cloudflare server-side |

### 2.3 Données NON collectées (engagement explicite)

DevRefs s'engage à **ne jamais collecter** :
- adresse email côté wallet x402 (collectée uniquement par Stripe sur son propre domaine pour les paiements Stripe) ;
- nom, prénom, adresse postale (collectés uniquement par Stripe si l'Acheteur les fournit) ;
- données de navigation persistantes (pas de cookies analytiques, pas de fingerprint, pas de pixel marketing) ;
- données de géolocalisation précise ;
- données biométriques ou de santé ;
- données de mineurs (Service réservé aux 18+).

---

## 3. Cookies et traceurs

### 3.1 Cookies déposés

DevRefs ne dépose **qu'un seul cookie strictement nécessaire** :

| Cookie | Finalité | Durée | Statut |
|---|---|---|---|
| `devrefs_jwt` | Stockage du JWT 24h après paiement Stripe | 24 heures | Strictement nécessaire — exempté du consentement (art. 82 LIL) |

Configuration sécurisée du cookie : `Secure; HttpOnly; SameSite=Strict`.

### 3.2 Pas de bannière cookies

Vu l'absence d'analytics tiers, de pixels marketing et de cookies de profilage, **aucune bannière de consentement n'est requise** sur le Site (conformité à la doctrine CNIL 2020).

### 3.3 Cookies tiers (Stripe)

Lorsque vous cliquez sur un Stripe Payment Link, vous êtes redirigé vers le domaine `checkout.stripe.com`. Stripe gère ses propres cookies sur son domaine selon sa politique de confidentialité (https://stripe.com/privacy). Ces cookies ne relèvent pas de la responsabilité de DevRefs.

---

## 4. Sous-traitants

DevRefs fait appel aux sous-traitants suivants, avec lesquels des accords de traitement de données (DPA) conformes à l'art. 28 RGPD ont été conclus :

| Sous-traitant | Rôle | Localisation | Garanties transferts internationaux |
|---|---|---|---|
| **Stripe Payments Europe Ltd** | Paiement carte bancaire, émission factures, gestion clients humains | Siège Irlande (UE), serveurs UE + sous-traitance USA | DPA Stripe (https://stripe.com/legal/dpa) + SCC européennes + certification Data Privacy Framework EU-US |
| **Coinbase Inc. (x402 facilitator)** | Validation paiements x402 USDC sur réseau Base | USA | DPA Coinbase + SCC européennes (contact `dpo@coinbase.com` pour copie). Le facilitator transmet les métadonnées x402 (`resource_url`, `description`, `reason`) en clair lors de la validation paiement — DevRefs s'engage à ne JAMAIS y inclure de PII |
| **Cloudflare Inc.** | Hébergement Pages, exécution Workers, stockage KV, analytics agrégés server-side | USA (par défaut) — région EU à confirmer | DPA Cloudflare (https://www.cloudflare.com/cloudflare-customer-dpa/) + SCC européennes |

DevRefs n'effectue **aucune cession ni revente** de données à des partenaires commerciaux ou publicitaires.

---

## 5. Transferts internationaux de données

Certains sous-traitants (Coinbase, Cloudflare) sont localisés aux États-Unis. Les transferts de données vers les USA sont encadrés par :

- les **clauses contractuelles types (SCC)** adoptées par la Commission européenne (décision d'exécution UE 2021/914) ;
- pour Stripe : la certification au **Data Privacy Framework EU-US** (lorsque applicable).

Aucune donnée n'est transférée vers des pays ne disposant ni d'une décision d'adéquation ni de garanties appropriées.

---

## 6. Vos droits (RGPD)

Conformément aux art. 15 à 22 du RGPD, vous disposez des droits suivants concernant vos données personnelles :

| Droit | Procédure DevRefs |
|---|---|
| **Droit d'accès (art. 15)** | Email à `dpo@devrefs.dev`. Réponse < 1 mois. Côté wallet x402 : aucune donnée stockée à fournir (pseudonyme, supprimé après 24h). Côté paiements Stripe : extraction du `customer_id`, dates de paiements, montants. |
| **Droit de rectification (art. 16)** | Sans objet côté DevRefs (aucun profil utilisateur stocké). Pour les données Stripe, modification directe sur le dashboard Stripe customer. |
| **Droit à l'effacement (art. 17)** | Email à `dpo@devrefs.dev`. Suppression de votre `customer_id` Stripe et révocation du JWT actif sur demande. **Exception légale** : conservation des transactions facturées 10 ans (obligation comptable, art. 17(3)(b) RGPD). |
| **Droit à la limitation (art. 18)** | Email à `dpo@devrefs.dev`. Procédure documentée. |
| **Droit à la portabilité (art. 20)** | Sans objet (aucune donnée structurée portable). |
| **Droit d'opposition (art. 21)** | Sans objet (aucun profilage, aucun marketing direct). |
| **Droit de retirer son consentement** | Sans objet (aucun traitement basé sur le consentement). |
| **Droit d'introduire une réclamation auprès de la CNIL** | Vous pouvez à tout moment saisir la CNIL (https://www.cnil.fr/fr/plaintes) si vous estimez que vos droits ne sont pas respectés. |

**Délai de réponse** : 1 mois à compter de la réception de la demande, prolongeable de 2 mois supplémentaires en cas de complexité (avec information préalable).

**Justification d'identité** : pour les demandes portant sur des données rattachées à un wallet x402 anonyme, la preuve de propriété du wallet (signature cryptographique d'un message challenge envoyé par DevRefs) est requise. Pour les demandes portant sur un `customer_id` Stripe, l'email associé au compte Stripe sert de référence.

---

## 7. Sécurité des données

DevRefs met en œuvre les mesures techniques et organisationnelles appropriées pour garantir la sécurité des données traitées (art. 32 RGPD) :

- **Chiffrement en transit** : TLS 1.3 sur l'ensemble des endpoints (forcé par Cloudflare).
- **Chiffrement at-rest** : Cloudflare KV chiffre les données stockées avec AES-256 par défaut.
- **Authentification** : JWT signé HMAC-SHA256, secret stocké en variable d'environnement chiffrée Cloudflare Workers Secrets.
- **Rate-limiting et anti-DDoS** : protection Cloudflare WAF + rate-limit applicatif.
- **Logs d'accès** : conservation < 30 jours, purge automatique.
- **Rotation des secrets** : tous les 6 mois ou en cas de suspicion de compromission.
- **Notification incident** : en cas de violation de données à caractère personnel présentant un risque pour les droits et libertés des personnes concernées, DevRefs notifie la CNIL dans les 72 heures (art. 33 RGPD) et informe les personnes concernées si le risque est élevé (art. 34 RGPD).

---

## 8. Données techniques fournies par DevRefs (transparence AI Act)

Bien que DevRefs ne soit **pas un système d'intelligence artificielle au sens de l'EU AI Act** (pas de modèle d'apprentissage, pas d'inférence, pas de génération en runtime), nous documentons publiquement la provenance des données livrées dans les payloads, à des fins de transparence pour nos Acheteurs (notamment les Agents IA et leurs opérateurs) :

- Liste des sources publiques officielles : page `/about/data-sources`.
- Fréquence de mise à jour : `/api/llm-prices` toutes les 6 heures, `/api/sdk-status` toutes les 24 heures.
- Champ `dateModified` ISO 8601 inclus dans chaque payload.
- Champ `fetched_at` ISO 8601 indiquant la dernière requête réussie auprès de la source.

---

## 9. Modifications de la politique

DevRefs se réserve le droit de modifier la présente politique. Toute modification substantielle sera notifiée :
- par publication d'une nouvelle version sur `/privacy` avec la date d'effet ;
- par mention sur la landing pendant 30 jours après la mise à jour.

La version applicable à un traitement est celle en vigueur au moment du traitement.

---

## 10. Contact

**Email DPO / Protection des données** : `dpo@devrefs.dev`
**Email général juridique** : `legal@devrefs.dev`
(Adresses à activer après acquisition du domaine définitif post-naming @creative-strategy.)

**Autorité de contrôle** : Commission Nationale de l'Informatique et des Libertés (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07 — https://www.cnil.fr.

---

**Date d'effet** : à compléter à la publication.
**Dernière mise à jour** : 2026-05-05 (draft initial @legal Phase 0).
