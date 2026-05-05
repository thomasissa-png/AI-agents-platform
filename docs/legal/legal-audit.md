<!-- Version: 2026-05-05T16:00 — @legal — Audit juridique v2 DevRefs Phase 0 v2 session 3 — pivot 100% B2A pure agents IA -->

# Audit juridique & conformité — DevRefs v2

> **Avertissement** : ce document est un audit de référence produit par @legal (juriste digital senior). Il ne constitue pas un avis juridique formel. Les décisions structurantes (régime fiscal BNC crypto, qualification B2B/B2C internationale, garantie ROI 50 % refund) doivent être validées par un avocat avant lancement commercial.

> **Périmètre v2** : 3 endpoints API (`/api/llm-prices`, `/api/sdk-status`, `/api/agent-audit`), landing publique statique, paiement primaire x402 USDC Base via facilitator Coinbase, packs pré-payés ($5/$10/$50 + Audit $9.99/Pack $49), Stripe rétrogradé en option rampe top-up sponsor, zéro PII, garantie ROI audit 50 % refund si savings_pct < 15 % à 30j.

> **Delta v1 → v2** : §§ Stripe humain pilier RETIRÉES. §§ audit endpoint AJOUTÉES (garantie ROI). §§ pack pré-payé x402 AJOUTÉES. §§ x402 V2 récurrent AJOUTÉE (HYPOTHÈSE H7). Stripe rétrogradé en service auxiliaire top-up sponsor.

---

## Résumé exécutif — Risques en 5 points (pour fondateur non-juriste)

1. **Risque P0 — Fiscalité crypto BNC** : revenus x402 USDC = prestation de service en crypto, déclaration BNC obligatoire. Plafond micro-entreprise 2026 = 83 600 €/an, largement OK pour cible 600 €/mois. Cotisations sociales BNC autres prestations = 25,6 % au 1er janvier 2026. **Action obligatoire** : immatriculation auto-entreprise avant 1ère transaction commerciale.

2. **Risque P0 — DPA Coinbase x402 facilitator** : DPA séparé non publié publiquement au 2026-05-05 (confirmé par WebSearch). La politique de confidentialité globale Coinbase couvre GDPR, mais l'accord spécifique pour le facilitator x402 nécessite confirmation. **Action obligatoire** : email à `dpo@coinbase.com` AVANT première transaction x402.

3. **Risque P1 — Garantie ROI 50 % refund** : la clause garantie savings_pct < 15 % à 30j constitue une obligation de résultat partielle sur l'audit. Risque de qualification en garantie commerciale au sens art. L.217-21 Code conso si B2C. Conditions strictes à documenter dans CGU (≥ 5M tokens/mois, ≥ 80 % patches appliqués, pas de changement modèle 30j, déclaration via wallet). **Action P1** : valider la rédaction avec un avocat conso avant activation garantie sur persona B2C.

4. **Risque P1 — Pack pré-payé : droit rétractation B2C** : sponsor humain qui achète un pack = potentiellement B2C (consommateur). Renonciation expresse L.221-28 13° Code conso nécessaire AVANT le paiement (gate checkbox sur landing). **Action** : checkbox obligatoire sur landing, pas dans les CGU post-paiement (voir §§ 2.4).

5. **Risque P2 — EU AI Act** : DevRefs est HORS scope EU AI Act (pas de système IA en runtime). CONFIRMÉ au 2026-05-05 — zéro IA runtime, cron scrape = fetch HTTP déterministe, audit = heuristiques statiques pure JS. Aucune obligation AI Act sur le produit. Obligation de transparence aval (best practice) conservée.

**Verdict global : GO CONDITIONNEL** — sous réserve de (a) immatriculation auto-entreprise BNC avant 1ère transaction, (b) email DPO Coinbase (H1), (c) confirmation comptable BNC stablecoin (H2), (d) activation Stripe Tax pour top-up sponsor si au-dessus seuil franchise, (e) checkbox renonciation L.221-28 13° sur landing avant toute vente pack/audit à un humain.

---

## 1. RGPD / Privacy — Audit de conformité v2

### 1.1 Constat de départ : zéro PII — maintenu v2 + 12 nouveaux events validés

Architecture zéro-PII confirmée sur les 47 events actifs v2 (35 events v1 + 12 nouveaux audit/pack/sponsor). Aucun des 12 nouveaux events ne capte de PII directe.

| Composant | Donnée collectée | Qualification PII v2 |
|---|---|---|
| Endpoint `/api/llm-prices` (x402) | `wallet_hash` SHA256 | Pseudonyme RGPD art. 4(5) — NON-PII direct. Voir Q1 §1.6. |
| Endpoint `/api/sdk-status` (x402) | idem | idem |
| Endpoint `/api/agent-audit` (x402) | `wallet_hash` + métriques agrégées (tokens_in, savings_pct, model) | NON-PII. Input `agent_config` + `sample_traces` en mémoire Worker uniquement, jamais persisté. Voir Q5 §1.6. |
| Pack pré-payé (KV) | `wallet_hash` + `tx_hash` + pack metadata | `wallet_hash` = pseudonyme. `tx_hash` = référence publique blockchain. Voir Q1 + Q2 §1.6. |
| Stripe top-up sponsor (marginal) | `customer_id` Stripe — jamais email côté DevRefs | Pseudonyme résiduel côté DevRefs. Voir Q3 §1.6. |
| JWT 24h (sponsor) | Hash HMAC + claim `wallet_hash` ou `customer_id` | Pseudonyme — NON-PII direct |
| Logs Cloudflare Workers | IP éphémère rate-limiting | OUI brièvement — TTL < 24h KV |
| CF Analytics Engine (47 events) | Métriques agrégées server-side, `wallet_hash` jamais raw | NON (agrégation anonyme + hash) |

**Verdict 1.1** : DevRefs reste une plateforme near-zero PII en v2. Les seules PII potentielles sont (a) IP éphémères rate-limit (TTL < 24h, intérêt légitime art. 6(1)(f)), (b) `customer_id` Stripe côté sponsor (pseudonyme, conservation 10 ans obligation comptable), (c) `wallet_hash` SHA256 (pseudonyme RGPD — voir Q1).

### 1.2 Registre des traitements (art. 30 RGPD) — v2 enrichi

| Finalité | Base légale | Données | Conservation | Destinataires |
|---|---|---|---|---|
| Rate-limiting anti-fraude | Intérêt légitime (art. 6(1)(f)) | IP hash, wallet_hash, timestamp | < 24h en KV Cloudflare | Aucun (interne) |
| Authentification JWT post-paiement sponsor | Exécution contrat (art. 6(1)(b)) | wallet_hash ou customer_id Stripe | 24h (durée JWT) | Aucun (interne) |
| Comptabilité paiements x402 (calls + packs + audits) | Obligation légale (art. 6(1)(c) — code commerce 10 ans) | tx_hash, montant USDC, timestamp, audit_id | 10 ans | Comptable, administration fiscale FR |
| Comptabilité paiements Stripe (top-up sponsor) | Obligation légale (10 ans) | customer_id Stripe, montant EUR | 10 ans | Stripe (sous-traitant), comptable, fisc FR |
| Quota pack (état opérationnel) | Exécution contrat | wallet_hash + quota restant + pack_type | 12 mois à compter de l'achat (durée validité pack) | Aucun (interne KV) |
| Résultat audit (refund éventuel) | Exécution contrat + intérêt légitime | audit_id + savings_pct (jamais input brut) | 31 jours (fenêtre refund) + 10 ans (compta si refund déclenché) | Aucun (interne) |
| Analytics agrégés (47 events CF AE) | Intérêt légitime | wallet_hash + métriques agrégées | Cloudflare AE : rétention jusqu'à 3 mois (configurable) | Cloudflare (sous-traitant) |

### 1.3 DPA avec sous-traitants — v2 mise à jour

| Sous-traitant | Service | Statut DPA | Localisation données | Action |
|---|---|---|---|---|
| **Stripe Inc.** | Paiement carte top-up sponsor | DPA standard signé automatiquement. SCC européennes incluses. | Irlande (Stripe Payments Europe Ltd) + transferts US sous SCC | Aucune action — DPA Stripe couvre les obligations |
| **Coinbase Global Inc. (x402 facilitator)** | Validation paiements USDC Base (calls + packs + audits) | **HYPOTHÈSE H1** — DPA non publié séparément pour x402 facilitator au 2026-05-05. Politique globale Coinbase GDPR disponible sur coinbase.com/legal/privacy. Le facilitator transmet metadata en clair (`resource_url`, `description`, `reason`) | US (Coinbase Inc.) + SCC | **Action P0 MAINTENUE** : email `dpo@coinbase.com` pour confirmer DPA x402 facilitator avant 1ère transaction. |
| **Cloudflare Inc.** | Hébergement Pages + Workers + KV + Analytics Engine | DPA standard https://www.cloudflare.com/cloudflare-customer-dpa/ + SCC européennes incluses (Module 2 Controller→Processor). Cloudflare Data Localization Suite disponible mais payante — non activée sur free tier. | US par défaut. EU forceable via Data Localization Suite (payant). | **Action P1 @infrastructure** : vérifier INF-1 (data residency EU activable sur free tier ? Probablement non). Si non → mention SCC obligatoire dans Privacy Policy (déjà documentée). |

### 1.4 Droits des utilisateurs (art. 15-22 RGPD) — v2 enrichi wallet_hash + audit_id

| Droit | Procédure DevRefs v2 |
|---|---|
| Droit d'accès (art. 15) | Email à `dpo@devrefs.dev`. Réponse < 1 mois. Côté wallet x402 : wallet_hash pseudonymisé (preuve ownership = signature cryptographique du challenge DevRefs). Côté Stripe sponsor : customer_id + dates + montants. Côté audit : audit_id + savings_pct (jamais input brut car non persisté). |
| Droit de rectification (art. 16) | Sans objet côté DevRefs (aucun profil utilisateur stocké). Pas d'input `agent_config`/`sample_traces` stocké (non persisté). |
| Droit à l'effacement (art. 17) | Email pour suppression wallet_hash KV (quota pack + audit_id TTL 31j). Conservation comptable 10 ans pour transactions (obligation légale = exception art. 17(3)(b)). |
| Droit à la portabilité (art. 20) | Sans objet — pas de profil utilisateur portable. |
| Droit d'opposition (art. 21) | Email — pas de profilage ni marketing direct. |

### 1.5 Cookies & traceurs — inchangé v2

**Verdict 1.5** : **PAS DE BANNIÈRE COOKIES REQUISE** — architecture zéro-cookie analytique confirmée. JWT cookie sponsor strictement nécessaire (art. 82 LIL). Si analytics tiers ou pixel marketing ajoutés Phase 4 → bannière TCF v2.2 + opt-in obligatoire.

### 1.6 Trancher les 5 questions PII — positions définitives

**Q1 — `wallet_hash` (SHA256 d'adresse blockchain publique) est-il PII sous RGPD ?**

**Position tranchée : PSEUDONYME RGPD — non-PII direct, traitement licite.**

Le SHA256 d'une adresse Base est une donnée pseudonymisée au sens de l'art. 4(5) RGPD (données dont l'attribution à une personne physique nécessite une information additionnelle). Raisonnement :
- L'adresse Base publique elle-même n'est pas un identifiant civil (pas de KYC chez DevRefs, pas de mapping wallet↔identité).
- Le SHA256 est un hash unidirectionnel : la réversibilité directe est computationnellement impossible.
- Toutefois, la chaîne Base est publique — un tiers ayant accès à un exchange KYC (Coinbase, Binance) peut théoriquement croiser le wallet_hash avec son propre KYC. → quasi-identifiant potentiel.

Conclusion conforme à l'EDPB Guidelines 4/2019 sur la pseudonymisation et à la Délibération CNIL n° 2017-269 : `wallet_hash` = pseudonyme RGPD. Traitement licite sur base intérêt légitime art. 6(1)(f) (anti-fraude, rate-limiting, quota tracking) + exécution contrat art. 6(1)(b) (pack quota).

Mesures techniques compensatoires documentées dans Privacy Policy : (a) hash SHA256 unidirectionnel, (b) TTL 24h sur logs rate-limit, (c) aucun mapping wallet_hash↔identité civile, (d) aucune croisement avec tiers KYC.

**Q2 — `tx_hash` on-chain (immuable, public) stocké 30j dans CF AE : PII ?**

**Position tranchée : NON-PII en soi — quasi-identifiant si agrégation avec wallet_hash.**

Le tx_hash est une référence publique blockchain (registre immuable Base). En soi, il n'identifie pas une personne physique. Combiné avec `wallet_hash`, il permet un traçage croisé via un explorer blockchain public (Basescan). → quasi-identifiant par combinaison.

Traitement licite justifié par double base légale :
- Obligation légale art. 6(1)(c) : conservation des justificatifs comptables 10 ans (Code commerce).
- Intérêt légitime art. 6(1)(f) : dispute resolution (refund audit, fraude avérée).

Conservation 30j dans CF AE pour analytics (formule NSM revenu net) : proportionnée à la finalité. Documentation art. 13 RGPD : finalité, durée, base légale documentées dans Privacy Policy v2.

**Q3 — `customer_id` Stripe (pseudonyme interne Stripe sans email) : PII résiduelle si enregistré côté DevRefs ?**

**Position tranchée : OUI — pseudonyme RGPD côté DevRefs, traitement minimal acceptable.**

Le `customer_id` Stripe est réversible via l'API Stripe (Stripe peut associer customer_id ↔ email ↔ données carte). Côté DevRefs, si on ne stocke que le customer_id sans email/nom/IP, le traitement est minimal et acceptable comme pseudonyme.

Règles à respecter impérativement :
- Ne jamais stocker le customer_id avec des données Stripe push (email via webhook) — si Stripe envoie un email dans un webhook, le hasher AVANT tout stockage KV.
- Finalité de stockage unique : comptabilité 10 ans (obligation légale) + émission JWT sponsor.
- Droits RGPD : accès possible via signature wallet ou email Stripe associé.

**Q4 — Garantie refund 50 % vs droit rétractation 14j L.221-18 : renonciation L.221-28 13° suffisante ?**

**Position tranchée : OUI pour B2C numérique — sous réserve des 3 conditions cumulatives strictes.**

L'art. L.221-28 13° Code conso exclut le droit de rétractation pour la fourniture de contenu numérique sans support matériel, à condition que l'exécution ait commencé après consentement préalable exprès ET reconnaissance que le droit de rétractation est perdu. Vérifié sur Légifrance au 2026-05-05 — texte inchangé (aucune réforme PSD3 n'a modifié ce point à ce jour).

Les 3 critères cumulatifs à satisfaire (art. L.221-28 13°) :
(a) Consentement préalable exprès — checkbox dédiée sur landing AVANT clic paiement ;
(b) Reconnaissance écrite que l'exécution avant 14j entraîne la perte du droit de rétractation ;
(c) Confirmation écrite — email de confirmation post-achat + JSON-LD récap de la transaction.

**IMPORTANT** : cette renonciation doit être collectée sur la landing (gate paywall), PAS dans les CGU lues post-paiement (trop tardif). La case à cocher doit être distincte des CGU générales et explicite sur la perte du droit.

Application : B2C uniquement (sponsor humain qui achète un pack via Stripe ou x402 direct). Application B2A : pas de droit de rétractation L.221-28 (relations entre professionnels, art. L.221-3 Code conso). La garantie contractuelle ROI 50 % refund est distincte du droit légal de rétractation — elle s'applique en substitut commercial B2A ET B2C (plus généreuse sous conditions).

**Action P1** : valider cette position avec un avocat conso français avant lancement Stripe top-up sponsor.

**Q5 — Contenu `agent_config` + `sample_traces` audit input : mémoire Worker uniquement — suffisant pour conformité ?**

**Position tranchée : OUI — sous réserve de 4 garanties techniques.**

L'input audit non persisté est conforme au RGPD si et seulement si :
(a) Variables locales scope `fetch()` : input jamais écrit en KV/D1/R2/Analytics Engine/logs Workers ;
(b) Logs Worker `console.log` désactivés sur les champs `agent_config`/`sample_traces` (ou redactés) ;
(c) Clauses CGU v2 art. 3.4 explicites : "l'input soumis à l'endpoint `/api/agent-audit` est traité en mémoire Worker uniquement et n'est jamais persisté, ni stocké, ni loggué" ;
(d) Audit de code Phase 3 par @qa : vérification systématique des writes KV/AE dans le handler audit.

**Responsabilité partagée** : si l'opérateur de l'agent IA inclut de la PII dans `sample_traces` (ex. emails utilisateurs réels dans les traces), il reste responsable de traitement au sens de l'art. 4(7) RGPD. DevRefs reste sous-traitant technique pour la portion traitement (art. 4(8)). Clause à intégrer dans CGU art. 9 : "l'agent IA garantit l'absence de données à caractère personnel dans les inputs transmis à `/api/agent-audit`. DevRefs ne peut être tenu responsable de PII incluse par l'opérateur dans les inputs."

**Verdict global RGPD v2 : GO** — conformité native maintenue. 5 questions PII tranchées. 12 nouveaux events validés zéro-PII.

---

## 2. CGU / CGV adaptées au modèle v2 — 3 endpoints + packs + audit + garantie

### 2.1 Qualification juridique du modèle v2

| Contrat | Cible | Qualification | Régime applicable |
|---|---|---|---|
| Contrat A : pay-per-call x402 $0.001/call | Agent IA autonome (B2A) | Prestation de service technique à exécution instantanée | B2B — pas de droit de rétractation |
| Contrat B : Pack pré-payé x402 ($5/$10/$50) | Agent IA (B2A) ou sponsor humain (B2C marginal) | Prestation numérique, quota pré-acheté, validité 12 mois | B2A : pas de rétractation. B2C sponsor : renonciation L.221-28 13° requise (gate checkbox landing) |
| Contrat C : Audit one-shot x402 $9.99 + Pack Pro $49 | Agent IA (B2A) ou sponsor humain (B2C marginal) | Prestation d'analyse technique à exécution instantanée, garantie ROI 50 % si savings_pct < 15 % à 30j | Idem Contrat B |
| Contrat D (V2 — HYPOTHÈSE H7) : Subscription Pro x402 $29/mois | Agent IA (B2A) | Abonnement récurrent x402 V2, conditionné maturité SDKs Q3 2026 + signal demande ≥ 5 agents V1 | B2A récurrent — pas de droit de rétractation |
| Contrat E (marginal) : Stripe top-up wallet sponsor | Développeur humain sponsor (B2C marginal) | Rampe USDC Base via Stripe — l'agent est le bénéficiaire final | B2C — renonciation L.221-28 13° requise si service numérique consommé immédiatement |

### 2.2 Clauses audit endpoint `/api/agent-audit`

**Input non persisté** : l'input soumis (`agent_config`, `sample_traces`) est traité exclusivement en mémoire Worker (scope `fetch()` handler) et n'est jamais persisté en KV, D1, R2, Analytics Engine ou logs. Il est supprimé de la mémoire à la fin de la requête HTTP. L'Acheteur est seul responsable de l'absence de PII dans les inputs transmis.

**Output watermark HMAC** : chaque output d'audit est signé HMAC (champ `_signature` + `_audit_id` UUID). Ce watermark permet (a) de vérifier l'intégrité de l'output en cas de litige, (b) de prouver l'origine DevRefs pour le refund, (c) de détecter toute altération post-livraison.

**Garantie ROI** :
- Déclencheur : savings_pct effectivement mesuré par l'agent < 15 % à J+30 après la date de l'audit.
- Conditions cumulatives : (i) l'agent a consommé ≥ 5 millions de tokens d'input/mois sur la période de 30 jours, (ii) les patches recommandés ont été appliqués à ≥ 80 % (auto_applicable ou manuels), (iii) aucun changement de modèle principal n'a été effectué pendant les 30 jours.
- Montant remboursé : 50 % du prix d'audit = $5.00 USDC (one-shot $9.99) ou $4.08 USDC (Pack Pro $49 / 6 audits = $8.17/audit × 50 %).
- Process refund : déclaration via `POST /api/audit/refund` avec `audit_id` (signé wallet on-chain) + preuve savings_pct (format JSON libre). DevRefs transfère manuellement V1 en USDC Base sous 7 jours ouvrés vers le wallet de l'Acheteur (même wallet que l'achat). V2 : automation API Coinbase si volume > 5 refunds/mois.

### 2.3 Clauses pack pré-payé x402

- **Validité** : 12 mois à compter de la date d'achat (`purchased_at` horodatage blockchain). Aucun remboursement du quota non consommé à l'expiration.
- **Non-refundable** : une fois ≥ 1 appel consommé (quota décrémenté), le pack est non-remboursable sauf déclenchement de la garantie ROI audit ci-dessus.
- **Transferability** : quota lié au wallet acheteur (`wallet_hash`). Transférable uniquement par signature on-chain au wallet destinataire (mécanisme `POST /api/pack/transfer` — V2). En V1, non transférable.
- **Notification expiration** : si un email sponsor est renseigné dans le compte sponsor (via Stripe customer), une notification email est envoyée 7 jours avant expiration. Sinon, le quota est perdu sans notification — choix de l'Acheteur (architecture pseudonyme).
- **Irrévocabilité on-chain** : le paiement x402 de l'achat du pack est irrévocable une fois le settlement Coinbase confirmé.

### 2.4 Clause renonciation droit de rétractation B2C (L.221-28 13°)

**Applicable uniquement aux Acheteurs B2C consommateurs** (sponsor humain personne physique non professionnelle).

Conformément à l'art. L.221-28 13° Code conso, l'Acheteur consommateur reconnaît expressément, EN CLIQUANT SUR LE BOUTON DE PAIEMENT après avoir coché la case dédiée sur la page de paiement, renoncer à son droit de rétractation de 14 jours (art. L.221-18 Code conso) en demandant l'exécution immédiate du Service (livraison du quota pack ou de l'audit dès validation du paiement).

La case à cocher sur la landing est obligatoire et distincte des CGU. Libellé exact : "Je comprends et j'accepte que l'exécution immédiate du service entraîne la perte de mon droit de rétractation de 14 jours conformément à l'article L.221-28 13° du Code de la consommation."

La garantie ROI 50 % refund (§ 2.2) constitue un mécanisme commercial de substitution plus avantageux que le droit légal de rétractation dans les cas où elle s'applique.

### 2.5 Stripe — rétrogradé en service auxiliaire top-up sponsor

**CLAUSE RETIRÉE v2** : section "Abonnement Stripe Link 4,99 €/jour illimité" — offre dépréciée. Aucune mention d'un abonnement journalier Stripe comme offre commerciale dans les CGU v2.

**Clauses Stripe conservées (rétrogradées)** : Stripe reste disponible comme rampe d'achat de USDC pour les sponsors humains. Le Stripe Payment Link permet le top-up wallet sponsor (versement de USDC Base via conversion fiat). Les clauses d'identification Stripe (customer_id pseudonyme, DPA Stripe, PCI-DSS) sont conservées en service auxiliaire.

### 2.6 x402 V2 — Subscription Pro $29/mois

[HYPOTHÈSE H7 — non activé V1] La Subscription Pro $29/mois via x402 V2 (sessions SIWx + deferred payment scheme) est conditionnée à (a) maturité des SDKs x402 V2 (estimée Q3 2026), (b) signal de demande ≥ 5 agents V1 actifs exprimant un besoin de récurrence. Cette offre n'est pas disponible en V1 et ne figure pas dans les CGU V1. Elle fera l'objet d'une révision des CGU lors de sa mise en production.

**Verdict 2 : GO CONDITIONNEL** — modèle contractuel v2 clair, draft complet fourni dans `cgu-draft.md` v2. Action P1 : validation avocat conso sur garantie ROI 50 % et renonciation L.221-28 13° avant lancement sponsor Stripe.

---

## 3. Conformité EU AI Act — HORS SCOPE CONFIRMÉ v2 (2026-05-05)

### 3.1 Classification

| Critère | DevRefs v2 |
|---|---|
| DevRefs est-il un "système IA" au sens art. 3(1) AI Act ? | NON — fournisseur de données structurées + analyse heuristique statique. Aucun modèle d'apprentissage automatique, aucune inférence, aucune génération. |
| L'endpoint `/api/agent-audit` constitue-t-il un système IA ? | NON — 5 heuristiques statiques pure JS (if/then rules déterministes), zéro inférence statistique, zéro LLM, zéro ML. |
| DevRefs est-il un modèle GPAI ? | NON |
| DevRefs entraîne-t-il un modèle ? | NON — input audit non persisté, zéro entraînement |

**Verdict 3.1** : **HORS SCOPE EU AI Act** — aucune classification de risque applicable, aucune obligation de marquage, aucun enregistrement EU. Confirmation 2026-05-05.

### 3.2 Obligation de transparence aval (best practice non obligatoire)

Conservée v2 :
- Page `/about/data-sources` documentant la provenance des données pricing + SDK status.
- Champ `dateModified` JSON-LD machine-readable dans chaque payload.
- Champ `_audit_heuristics_version` dans l'output audit (documenter la version des heuristiques utilisées pour reproductibilité).

---

## 4. Fiscalité crypto FR — Régime BNC + TVA — inchangé v2

### 4.1 Qualification de l'activité

Inchangé v1. Régime micro-BNC auto-entrepreneur recommandé. Packs pré-payés : les montants encaissés en USDC sont enregistrés en CA BNC au moment de l'encaissement (pas au moment de la consommation des calls). Traitement prudent recommandé.

| Point spécifique v2 | Analyse |
|---|---|
| Packs pré-payés ($5/$10/$50) | Revenus encaissés en USDC à la date du settlement blockchain = CA BNC EUR au cours du jour. Les calls consommés ultérieurement ne génèrent pas de nouveau CA (déjà encaissé). |
| Audit $9.99 one-shot | Idem prestation instantanée = CA BNC à la date de settlement. |
| Refund 50 % audit (si déclenché) | Le refund réduit le CA de la période (note de crédit). Conservation du tx_hash refund comme pièce comptable. |
| Subscription Pro $29/mois [HYPOTHÈSE H7] | Si récurrente x402 V2 : CA mensuel récurrent. À traiter comme abonnement. Règles comptables à confirmer avec expert-comptable. |

### 4.2 TVA — inchangé v2

Sous seuil franchise art. 293 B CGI (cible 600 €/mois = 7 200 €/an) : mention "TVA non applicable, art. 293 B du CGI" sur toutes factures et CGU.

Stripe Tax : confirmé au 2026-05-05 — automatise le reverse charge B2B UE (validation n° TVA intracommunautaire) et l'OSS B2C UE. Note : depuis le 29 avril 2026, Stripe applique les paramètres de taxe Stripe Tax à toutes les transactions (source WebSearch).

Coinbase x402 : toujours sans gestion TVA automatique. Architecture sous-seuil recommandée jusqu'à scaling 18 mois.

---

## 5. Cookies & consentement — inchangé v2

**Verdict 5 : GO** — PAS DE BANNIÈRE COOKIES REQUISE en V1 + V2. JWT sponsor cookie strictement nécessaire (exempté). Pas d'analytics tiers.

---

## 6. Accessibilité (RGAA / WCAG) — inchangé v2

**Verdict 6 : GO** — AUCUNE OBLIGATION LÉGALE RGAA/EAA (auto-entreprise, CA < 250 M€, E-commerce < 2 M€). WCAG 2.2 AA recommandé non par obligation mais comme best practice agentique.

---

## 7. TOS scraping sources officielles — inchangé v2

**Verdict 7 : GO** — npm + GitHub + Anthropic + OpenAI + Google + Mistral. NO-GO Crunchbase + SimilarWeb (acté). Pas de nouveau scraping en v2 (heuristiques audit sont statiques, pas de source externe supplémentaire).

---

## 8. Anti-fraude — v2 enrichi avec audit

### 8.1 Mesures techniques v2

- **Watermark HMAC** : chaque payload et chaque output audit contient un champ `_signature` HMAC. Pour l'audit : `_audit_id` UUID unique + signature = référence pour le refund et la preuve d'origine.
- **Rate-limit par wallet (x402 calls)** : 1 000 req/jour par wallet (calls unitaires). Pack : quota KV décrémenté atomiquement.
- **Rate-limit audit** : 1 audit par wallet par jour (prévention spam refund). Pack Pro : 6 audits max sur la période du pack.
- **Signature HMAC traçable** sur chaque JWT sponsor.
- **Logs de traçabilité** conservés 30 jours.

### 8.2 Sanctions — v2

| Comportement | Sanction |
|---|---|
| Tentative de faux refund (audit_id falsifié ou savings_pct déclarés frauduleusement) | Blacklist wallet permanente + dépôt de plainte si préjudice > 50 € |
| Dépassement rate-limit fair-use sans réponse à un avertissement | Throttling progressif puis blacklist 24h |
| Redistribution payload ou output audit détectée (watermark cassé ou recoupé sur tiers) | Blacklist permanente du wallet, signalement `abuse@coinbase.com` |
| Tentative bypass paiement (replay attack, quota KV manipulé) | Blacklist permanente + dépôt de plainte si préjudice > 100 € |

---

## Vérifications infrastructure attendues (handoff descendant @infrastructure) — v2

Reprendre les vérifications INF-1 à INF-10 de v1 + ajouts v2 :

| # | Vérification v2 spécifique | Lien légal |
|---|---|---|
| INF-11 | **Non-persistance input audit** : auditer le code Worker `/api/agent-audit` pour confirmer zéro write KV/AE/D1/R2 sur `agent_config`/`sample_traces`. Désactivation logs `console.log` sur ces champs. | RGPD Q5 §1.6 — conformité traitement |
| INF-12 | **KV pack expiration TTL 12 mois** : configurer `expires_at` sur les clés pack KV. Émettre event `pack_expired` via cron. | Clause pack pré-payé §2.3 — conformité contractuelle |
| INF-13 | **KV audit_id TTL 31j** : stocker `audit_id` + `savings_pct` en KV avec TTL 31 jours (fenêtre refund). Purge auto après. | Garantie ROI §2.2 — conservation minimale |
| INF-14 | **Endpoint refund POST /api/audit/refund** : validation `audit_id` + signature wallet + `days_since_audit <= 30` + `savings_pct_actual < 15 %` + `tokens_month >= 5M` | Garantie ROI §2.2 — mise en œuvre technique |
| INF-15 | **Email notification expiration pack** : si Stripe customer_id renseigné → email Mailchannels à J-7 avant `expires_at` | Clause pack pré-payé §2.3 |

---

## Hypothèses à lever (mise à jour v2)

| # | Hypothèse | Qui doit lever | Quand | Impact si invalidée |
|---|---|---|---|---|
| H1 | Coinbase x402 facilitator dispose d'un DPA séparé ou applique son DPA global (à confirmer dpo@coinbase.com) | @legal (email DPO Coinbase) | **Avant 1ère transaction x402** | Si pas de DPA acceptable → fallback Stripe-only ou self-host facilitator |
| H2 | Traitement BNC d'une prestation IA-to-IA payée en stablecoin USDC | Avocat fiscaliste FR ou expert-comptable | Avant immatriculation | Si requalification → revoir modèle TVA |
| H3 | Cloudflare free tier : stockage EU forcé non disponible | @infrastructure | Phase 2 | Si non confirmé → mention SCC dans Privacy Policy obligatoire (déjà documentée) |
| H4 | Stripe Tax automatise reverse charge B2B UE et OSS B2C UE | @fullstack Phase 1 | Phase 1 | Confirmé WebSearch 2026-05-05 — Stripe Tax fonctionnel |
| H5 | Persona principal "agent IA" agissant pour opérateur professionnel = qualification B2B sécurisée | Avocat | Avant lancement commercial | Si requalification B2C → parcours rétractation requis |
| H6 | npm registry tolère DevRefs sous 1 req/s + 5M req/mois | Auto-vérification Phase 4 | Phase 4 | Si dépassement → CouchDB replication |
| H7 (NOUVEAU) | Subscription Pro $29/mois x402 V2 — conditionnée maturité SDKs Q3 2026 ET signal demande ≥ 5 agents V1 | @ia + @product-manager | Q3 2026 | Si SDKs immatures → report Q4 2026. Si signal demande absent → abandon au profit Pack Pro |

---

## Verdict global de l'audit v2

**GO CONDITIONNEL** — le projet DevRefs v2 est juridiquement viable sous réserve des 4 actions P0 suivantes AVANT 1ère transaction commerciale :

1. **P0** : immatriculation auto-entreprise BNC (Guichet unique INPI) — délai 7-14 jours.
2. **P0** : email à `dpo@coinbase.com` pour confirmer DPA x402 facilitator + RGPD compliance (HYPOTHÈSE H1 toujours active au 2026-05-05 — aucune réponse publique trouvée).
3. **P0** : confirmation par expert-comptable du traitement BNC stablecoin USDC + packs pré-payés (cours du jour, PUMP, enregistrement au settlement blockchain, note de crédit refund).
4. **P0** : activation Stripe Tax pour gestion automatique TVA (top-up sponsor Stripe si scaling au-dessus seuil franchise).

Actions P1 supplémentaires v2 :
- Validation avocat conso sur (a) garantie ROI 50 % refund qualification, (b) renonciation L.221-28 13° checkbox landing.
- Audit de code @qa Phase 3 sur non-persistance input audit `/api/agent-audit`.

---

## Handoff structuré v2

**Handoff → @qa (Phase 3)**
- Audit de code obligatoire sur Worker `/api/agent-audit` : vérifier (a) zéro write KV/AE/D1/R2 sur `agent_config`/`sample_traces`, (b) désactivation logs verbeux sur champs input, (c) scope variables locales (handler uniquement), (d) TTL 31j KV pour `audit_id` + `savings_pct`, (e) rate-limit 1 audit/wallet/jour.
- Audit checkbox renonciation L.221-28 13° sur landing : (a) checkbox présente et distincte des CGU, (b) libellé exact conforme §2.4, (c) gate bloquante avant paiement (impossible de payer sans cocher).

**Handoff → @copywriter (Phase 1)**
- Copy landing doit inclure checkbox renonciation L.221-28 13° avec libellé exact : "Je comprends et j'accepte que l'exécution immédiate du service entraîne la perte de mon droit de rétractation de 14 jours conformément à l'article L.221-28 13° du Code de la consommation."
- Copy doit inclure un résumé de la garantie ROI 50 % refund (conditions synthétiques : agent ≥ 5M tokens/mois, ≥ 80 % patches appliqués, mesure à 30j, refund sur même wallet USDC Base sous 7j).
- Aucune mention de "remboursement intégral" ni de "satisfait ou remboursé" — seulement "50 % refund si savings < 15 % à 30j sous conditions" (zéro fausse promesse).

**Handoff → @fullstack (Phase 2)**
- Implémentation watermark HMAC sur output audit : `_signature` + `_audit_id` UUID générés par le Worker.
- Signature wallet on-chain pour process refund : endpoint `POST /api/audit/refund` validant la signature cryptographique du wallet demandeur.
- KV pack quota validity : clé `expires_at` ISO 8601 + TTL KV 12 mois + cron purge + event `pack_expired`.
- KV audit_id TTL 31j : stocker `audit_id`, `savings_pct`, `wallet_hash`, `purchase_date` avec TTL 31 jours.
- Désactivation logs PII : jamais de `console.log(agent_config)` ni `console.log(sample_traces)` dans le Worker `/api/agent-audit`.
- Pas de stockage email sponsor sauf consentement explicite (Stripe customer_id uniquement).
- Cookie JWT sponsor : `Secure; HttpOnly; SameSite=Strict; Max-Age=86400` (INF-10).

**Handoff → @ux (Phase 1)**
- Parcours rétractation B2C sponsor : 3 étapes séquentielles obligatoires sur landing — (1) Affichage résumé de l'offre + conditions garantie ROI, (2) Checkbox renonciation L.221-28 13° (gate bloquante — bouton paiement désactivé si non coché), (3) Confirmation post-achat avec récap écrit (email ou page HTML) validant la renonciation.
- Pas de dark pattern : la checkbox doit être visible, libellé clair, non pré-cochée.

**Action P0 Thomas** : envoyer email à `dpo@coinbase.com` avec objet "DPA request — x402 facilitator — DevRefs FR GDPR compliance" AVANT toute première transaction. Copier `legal@devrefs.dev`. HYPOTHÈSE H1 toujours active au 2026-05-05 (aucune réponse publique trouvée lors du WebSearch).
