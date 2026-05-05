<!-- Version: 2026-05-05T17:00 — @legal — Privacy Policy v2 DevRefs Phase 0 v2 session 3 — 5 questions PII tranchées + 12 nouveaux events validés -->

# Politique de confidentialité — DevRefs v2

> **Statut** : draft v2 produit par @legal Phase 0 v2 session 3. Validation avocat recommandée avant publication.
> **Date d'effet** : à compléter à la publication.
> **Version** : 2.0
> **URL canonique** : `/privacy` du domaine définitif.
> **Delta v1 → v2** : 5 questions PII tranchées (wallet_hash, tx_hash, customer_id, L.221-28 13°, input audit non persisté). 12 nouveaux events validés zéro-PII. Tableau traitements enrichi (audit_id, pack quota, wallet_hash qualification). Responsabilité partagée art. 26 RGPD documentée pour input audit. Section §2.5 nouvelle (Nouvelles données v2 — 12 events).

---

## Résumé en clair (TL;DR)

DevRefs a été conçu selon une architecture **zéro PII** :

- **Aucune donnée personnelle directe** n'est collectée par DevRefs lorsque vous payez en x402 (votre wallet_hash est un pseudonyme).
- **Vos inputs d'audit** (`agent_config`, `sample_traces`) ne sont jamais stockés — traitement en mémoire Worker uniquement, détruits après la requête.
- **Pour les top-ups Stripe** (sponsor), vos données de carte sont collectées directement par Stripe, pas par DevRefs. Nous ne recevons qu'un identifiant client pseudonyme (customer_id).
- **Aucun cookie analytique ni traceur tiers** n'est déposé sur votre navigateur.
- **Aucune donnée n'est revendue** à un tiers, jamais.
- **Vous gardez le contrôle** : contactez-nous à tout moment pour exercer vos droits RGPD.

---

## 1. Identité du responsable de traitement

**Éditeur** : [Raison sociale auto-entreprise — à compléter après immatriculation INPI]
**Statut** : auto-entrepreneur (micro-entreprise française)
**SIREN** : [Numéro SIREN à compléter après immatriculation]
**Domicile fiscal** : [Adresse à compléter après immatriculation]
**Contact protection des données** : `dpo@devrefs.dev` (à activer après acquisition du domaine définitif)

L'Éditeur n'a pas désigné de Délégué à la Protection des Données (DPO) obligatoire au sens de l'art. 37 RGPD (pas d'autorité publique, pas de surveillance systématique à grande échelle, pas de catégories spéciales à grande échelle). L'adresse `dpo@devrefs.dev` est maintenue comme point de contact unique.

---

## 2. Données collectées et finalités

### 2.1 Architecture zéro PII — principe général

DevRefs a été conçu pour fonctionner sans collecte de données à caractère personnel directes. Les paiements x402 utilisent un `wallet_hash` SHA256 pseudonymisé. Les paiements Stripe sont traités par Stripe en tant que responsable de traitement distinct (DevRefs ne reçoit qu'un identifiant pseudonyme). Les inputs d'audit ne sont jamais persistés.

### 2.2 Qualification des données pseudonymes collectées — positions RGPD

**`wallet_hash` (SHA256 d'adresse Base blockchain)** : pseudonyme au sens de l'art. 4(5) RGPD. Le SHA256 est unidirectionnel — la réversibilité directe est computationnellement impossible. L'adresse Base n'est pas un identifiant civil (aucun KYC chez DevRefs). Toutefois, un tiers disposant d'un exchange KYC pourrait théoriquement effectuer un croisement → quasi-identifiant potentiel. Traitement licite sur base intérêt légitime art. 6(1)(f) (anti-fraude, rate-limiting, quota tracking) et exécution contrat art. 6(1)(b) (pack quota). Mesures compensatoires : hash unidirectionnel, TTL 24h sur logs rate-limit, aucun mapping wallet_hash ↔ identité civile.

**`tx_hash` (référence transaction blockchain publique)** : donnée publique inscrite sur la blockchain Base. Non-PII en soi. Combiné avec wallet_hash, constitue un quasi-identifiant par agrégation (croisement possible via explorateur blockchain public Basescan). Traitement licite sur double base légale : obligation légale art. 6(1)(c) (justificatifs comptables 10 ans) + intérêt légitime art. 6(1)(f) (dispute resolution refund, anti-fraude). Conservation 30j en CF AE pour analytics NSM + conservation 10 ans comptabilité (tx hash uniquement).

**`customer_id` Stripe** : pseudonyme interne Stripe réversible via API Stripe. Traitement minimal acceptable côté DevRefs si et seulement si aucun email/nom n'est stocké conjointement. Règle opérationnelle : si Stripe envoie un email via webhook, le hasher SHA256 AVANT tout stockage KV. Finalité unique : comptabilité 10 ans (obligation légale) + émission JWT sponsor 24h.

### 2.3 Tableau exhaustif des traitements v2

| Donnée | Finalité | Base légale RGPD | Conservation | Source |
|---|---|---|---|---|
| **wallet_hash** SHA256 (paiements x402, packs, audits) | Identification pseudonyme, rate-limiting, quota pack, référence garantie ROI | Exécution contrat (art. 6(1)(b)) + intérêt légitime (art. 6(1)(f)) | Rate-limit : < 24h KV. Quota pack : 12 mois (durée validité). audit_id : 31j (fenêtre refund). | Acheteur via facilitator Coinbase x402 |
| **tx_hash** blockchain Base | Comptabilité paiements (calls + packs + audits + refunds), dispute resolution | Obligation légale (art. 6(1)(c)) + intérêt légitime (art. 6(1)(f)) | Comptabilité : 10 ans. CF AE analytics : 30 jours. | Réseau Base (public on-chain) |
| **customer_id** Stripe (top-up sponsor) | Émission JWT sponsor 24h, comptabilité | Exécution contrat + obligation légale (10 ans) | 10 ans (obligation comptable) | Stripe (après top-up réussi) |
| **JWT signé HMAC** (sponsor) | Authentification accès endpoints pendant 24h | Exécution du contrat | 24 heures | Généré par DevRefs |
| **audit_id** UUID + savings_pct | Référence garantie ROI 50 %, preuve watermark HMAC | Exécution contrat (obligation garantie contractuelle) | 31 jours (fenêtre refund) | Généré par DevRefs à l'output audit |
| **Quota pack** (wallet_hash + remaining + expires_at) | Contrôle accès calls sans re-paiement | Exécution contrat | 12 mois (durée validité pack) | Généré par DevRefs après achat pack |
| **Adresse IP éphémère** | Rate-limiting anti-DDoS, prévention fraude | Intérêt légitime (art. 6(1)(f)) | < 24 heures (KV TTL) | Requête HTTP |
| **Métadonnées x402** (`resource_url`, `description`, `reason`) | Validation paiement par facilitator Coinbase | Exécution du contrat | Conservées par Coinbase selon sa politique | Acheteur via protocole x402 |
| **Logs Cloudflare Workers** (URL, statut HTTP, timestamp) | Sécurité, debug, anti-fraude | Intérêt légitime | < 30 jours | Cloudflare |
| **Métriques agrégées CF AE** (47 events v2) | Suivi performance, analytics NSM, optimisation | Intérêt légitime (statistiques anonymes) | Jusqu'à 3 mois (configuration CF AE) | Cloudflare server-side |

### 2.4 Input audit — traitement sans persistance

L'input soumis à `/api/agent-audit` (`agent_config`, `sample_traces`) est traité **exclusivement en mémoire Worker** (scope de la requête HTTP) et n'est **jamais persisté** en base de données (KV, D1, R2), Analytics Engine ou logs Workers. Il est détruit automatiquement à la fin de la requête HTTP.

DevRefs ne devient pas responsable de traitement au sens de l'art. 4(7) RGPD pour les données contenues dans l'input, dans la mesure où ces données ne sont pas persistées. Si l'Opérateur inclut des données à caractère personnel de tiers dans ses inputs (ex. traces contenant des emails utilisateurs), l'Opérateur demeure seul responsable de ce traitement. DevRefs agit comme sous-traitant technique au sens de l'art. 4(8) RGPD pour la seule durée du traitement en mémoire (< 2 secondes).

Seules les métadonnées agrégées sont conservées : audit_id, savings_pct, wallet_hash, date d'audit (voir tableau §2.3).

### 2.5 Validation zéro-PII sur les 12 nouveaux events v2

| Event v2 | Données capturées | PII ? | Qualification |
|---|---|---|---|
| `audit_request_received` | wallet_hash, timestamp, path | NON | wallet_hash = pseudonyme |
| `audit_402_served` | wallet_hash, offer_type, price_usdc | NON | idem |
| `audit_paid_x402` | wallet_hash, tx_hash, amount_usdc | NON | pseudonymes / référence publique |
| `audit_delivered` | wallet_hash, audit_id, score, savings_pct, latency_ms | NON | métriques agrégées, jamais input brut |
| `audit_savings_realized` | wallet_hash, audit_id, savings_pct_actual, days_since_audit | NON | métriques déclarées agrégées |
| `audit_refund_triggered` | wallet_hash, audit_id, refund_usdc | NON | pseudonymes + montant |
| `pack_purchased` | wallet_hash, tx_hash, pack_type, quota_total | NON | pseudonymes / référence publique |
| `pack_quota_consumed` | wallet_hash, pack_type, remaining (échantillonnage 1/100) | NON | pseudonyme + état agrégé |
| `pack_quota_exhausted` | wallet_hash, pack_type | NON | pseudonyme |
| `pack_expired` | wallet_hash, pack_type, quota_wasted | NON | pseudonyme |
| `sponsor_topup_stripe_initiated` | (clic CTA JS — aucune donnée personnelle captée) | NON | event comportemental anonyme |
| `sponsor_topup_stripe_completed` | customer_id Stripe (webhook), amount_eur | PARTIEL | customer_id = pseudonyme Stripe. Ne jamais capturer email. |

**Verdict §2.5** : 12 nouveaux events validés zéro-PII directe. `sponsor_topup_stripe_completed` nécessite l'attention opérationnelle : ne capturer que customer_id (jamais email) lors du webhook Stripe.

### 2.6 Données NON collectées (engagement explicite)

DevRefs s'engage à ne jamais collecter :
- adresse email côté wallet x402 (collectée uniquement par Stripe sur son propre domaine si le Sponsor la fournit) ;
- nom, prénom, adresse postale ;
- données de navigation persistantes (pas de cookies analytiques, pas de fingerprint, pas de pixel marketing) ;
- données de géolocalisation précise ;
- données biométriques ou de santé ;
- données de mineurs (Service réservé aux 18+) ;
- contenu brut des inputs audit (`agent_config`, `sample_traces`) — jamais stocké.

---

## 3. Cookies et traceurs — inchangé v2

### 3.1 Cookies déposés

| Cookie | Finalité | Durée | Statut |
|---|---|---|---|
| `devrefs_jwt` | Stockage du JWT 24h après top-up sponsor Stripe | 24 heures | Strictement nécessaire — exempté du consentement (art. 82 LIL) |

Configuration sécurisée : `Secure; HttpOnly; SameSite=Strict; Max-Age=86400`.

### 3.2 Pas de bannière cookies

Vu l'absence d'analytics tiers, de pixels marketing et de cookies de profilage, **aucune bannière de consentement n'est requise** (conformité doctrine CNIL 2020). Si analytics tiers ajoutés Phase 4 → bannière TCF v2.2 obligatoire.

### 3.3 Cookies tiers (Stripe)

Lors du top-up wallet via Stripe Payment Link, redirection vers `checkout.stripe.com`. Stripe gère ses propres cookies sur son domaine (https://stripe.com/privacy) — hors périmètre DevRefs.

---

## 4. Sous-traitants — v2 mise à jour

| Sous-traitant | Rôle | Localisation | Garanties transferts |
|---|---|---|---|
| **Stripe Payments Europe Ltd** | Paiement carte top-up sponsor, émission factures | Siège Irlande (UE) + sous-traitance USA | DPA Stripe (https://stripe.com/legal/dpa) + SCC + Data Privacy Framework EU-US |
| **Coinbase Inc. (x402 facilitator)** | Validation paiements x402 USDC Base (calls + packs + audits) | USA | [HYPOTHÈSE H1] DPA Coinbase global GDPR + SCC (contact `dpo@coinbase.com` pour copie DPA x402 spécifique). DevRefs s'engage à ne JAMAIS inclure de PII dans les métadonnées x402 (`resource_url`, `description`, `reason`). |
| **Cloudflare Inc.** | Hébergement Pages + Workers + KV + Analytics Engine | USA par défaut (Data Localization Suite = option payante, non activée free tier) | DPA Cloudflare (https://www.cloudflare.com/cloudflare-customer-dpa/) + SCC Module 2 (Controller→Processor) |

Aucune cession ni revente de données à des partenaires commerciaux ou publicitaires.

---

## 5. Transferts internationaux de données

Coinbase et Cloudflare sont localisés aux États-Unis. Les transferts sont encadrés par :
- les **clauses contractuelles types (SCC)** — décision d'exécution UE 2021/914 ;
- pour Stripe : certification au **Data Privacy Framework EU-US**.

Cloudflare free tier n'active pas de data residency EU forcée (Data Localization Suite payante). Les données Workers sont exécutées sur l'edge global Cloudflare (y compris US) — couvert par SCC Cloudflare DPA.

Aucune donnée n'est transférée vers des pays sans décision d'adéquation ni garanties appropriées.

---

## 6. Vos droits (RGPD) — v2 enrichi

| Droit | Procédure DevRefs v2 |
|---|---|
| **Droit d'accès (art. 15)** | Email à `dpo@devrefs.dev`. Réponse < 1 mois. Côté wallet x402 : preuve ownership = signature cryptographique d'un challenge DevRefs. Données accessibles : wallet_hash (pseudonyme), audit_id + savings_pct des 31 derniers jours, quota pack restant. Côté Stripe sponsor : customer_id, dates, montants. |
| **Droit de rectification (art. 16)** | Sans objet côté DevRefs (aucun profil utilisateur modifiable). Aucun input audit stocké à rectifier. |
| **Droit à l'effacement (art. 17)** | Email à `dpo@devrefs.dev`. Suppression : wallet_hash KV (quota pack + audit_id) + JWT sponsor actif. **Exception légale** : conservation tx_hash + customer_id pour transactions facturées 10 ans (obligation comptable, art. 17(3)(b) RGPD). |
| **Droit à la limitation (art. 18)** | Email à `dpo@devrefs.dev`. Procédure documentée sous 30 jours. |
| **Droit à la portabilité (art. 20)** | Sans objet (aucune donnée structurée portable — pseudonymes + comptabilité). |
| **Droit d'opposition (art. 21)** | Sans objet (aucun profilage, aucun marketing direct). |
| **Droit de retrait du consentement** | Sans objet (aucun traitement basé sur le consentement). |
| **Droit de réclamation CNIL** | Vous pouvez saisir la CNIL (https://www.cnil.fr/fr/plaintes) à tout moment. |

**Délai de réponse** : 1 mois, prolongeable de 2 mois supplémentaires avec information préalable.

**Justification d'identité** :
- Wallet x402 : signature cryptographique d'un message challenge DevRefs (preuve de propriété du wallet).
- Stripe sponsor : email associé au compte Stripe ou customer_id.
- L'Éditeur ne peut répondre aux demandes portant sur l'input audit car ces données ne sont pas persistées.

---

## 7. Sécurité des données — v2

DevRefs met en œuvre les mesures techniques et organisationnelles appropriées (art. 32 RGPD) :

- **Chiffrement en transit** : TLS 1.3 sur l'ensemble des endpoints (Cloudflare).
- **Chiffrement at-rest** : Cloudflare KV chiffre les données stockées AES-256 par défaut.
- **Authentification** : JWT signé HMAC-SHA256, secret stocké en variable d'environnement chiffrée Cloudflare Workers Secrets.
- **Watermark HMAC** : champ `_signature` sur chaque payload + `_audit_id` sur chaque output audit.
- **Non-persistance input audit** : traitement en mémoire Worker uniquement, aucune écriture externe.
- **Rate-limiting et anti-DDoS** : protection Cloudflare WAF + rate-limit applicatif.
- **Logs** : conservation < 30 jours, purge automatique. Jamais de log des champs `agent_config`/`sample_traces`.
- **Rotation des secrets** : tous les 6 mois ou en cas de compromission suspectée.
- **Notification incident** : violation de données → notification CNIL < 72h (art. 33 RGPD) + information personnes concernées si risque élevé (art. 34).

---

## 8. Données techniques fournies par DevRefs (transparence AI Act)

DevRefs n'est **pas un système d'intelligence artificielle au sens de l'EU AI Act** (pas de modèle d'apprentissage, pas d'inférence, pas de génération en runtime). L'endpoint `/api/agent-audit` utilise des heuristiques statiques déterministes (pure JS if/then). HORS SCOPE EU AI Act — confirmé au 2026-05-05.

Pour transparence aval (clients Acheteurs soumis à l'AI Act) :
- Provenance des données : page `/about/data-sources`.
- Fréquence de mise à jour : `/api/llm-prices` toutes les 6h, `/api/sdk-status` toutes les 24h.
- Champ `dateModified` ISO 8601 dans chaque payload.
- Champ `_audit_heuristics_version` dans chaque output audit (version des règles heuristiques utilisées).

---

## 9. Modifications de la politique

DevRefs se réserve le droit de modifier la présente politique. Toute modification substantielle sera notifiée par publication sur `/privacy` avec date d'effet + mention sur la landing pendant 30 jours.

---

## 10. Contact

**Email DPO / Protection des données** : `dpo@devrefs.dev`
**Email général juridique** : `legal@devrefs.dev`

**Autorité de contrôle** : Commission Nationale de l'Informatique et des Libertés (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07 — https://www.cnil.fr.

---

**Date d'effet** : à compléter à la publication.
**Dernière mise à jour** : 2026-05-05 (draft v2 @legal Phase 0 v2 session 3 — 5 questions PII tranchées, 12 events validés).
