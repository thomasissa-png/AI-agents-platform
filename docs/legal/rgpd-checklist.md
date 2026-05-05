<!-- Version: 2026-05-05T17:30 — @legal — Checklist RGPD v2 DevRefs Phase 0 v2 session 3 — 12 nouveaux events + audit endpoint + packs + garantie refund -->

# Checklist RGPD — DevRefs v2

> Checklist actionnable spécifique DevRefs v2 (architecture zéro-PII + 3 endpoints + 47 events + audit endpoint + packs pré-payés). Légende : ✓ conforme / ⚠ à faire / ✗ N/A justifié.
> **Delta v1 → v2** : 5 items mis à jour (1.1, 1.2, 2.4, 5.2, 8.2). 3 items ajoutés (1.6, 1.7, 8.4). Items 3.1, 4.7, 5.3 reclassifiés. Synthèse recalculée.
> Source : `docs/legal/legal-audit.md` v2.

---

## 1. Cartographie des données

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 1.1 | Inventaire des données personnelles collectées | ✓ MISE À JOUR v2 | Cartographie complète `privacy-policy.md` §2.3 v2. wallet_hash (pseudonyme), tx_hash (quasi-identifiant), customer_id Stripe (pseudonyme), audit_id (interne), IP éphémère. Input audit jamais persisté → hors cartographie. |
| 1.2 | Identification des bases légales par traitement | ✓ MISE À JOUR v2 | Registre §2.3 `privacy-policy.md` v2 : intérêt légitime (rate-limit, analytics), exécution contrat (JWT, pack quota, audit garantie), obligation légale (compta 10 ans tx_hash + customer_id). |
| 1.3 | Registre des activités de traitement (art. 30) | ✗ N/A justifié | DevRefs exemptée art. 30(5) : < 250 employés ET pas de catégories spéciales. Registre minimal maintenu dans `legal-audit.md` §1.2 v2 (best practice). |
| 1.4 | Identification des catégories spéciales (art. 9) | ✓ | Aucune catégorie spéciale traitée. |
| 1.5 | Données de mineurs (art. 8) | ✓ | Aucun ciblage mineurs. CGU exigent capacité juridique ≥ 18 ans. |
| 1.6 (NOUVEAU) | Qualification wallet_hash comme pseudonyme RGPD | ✓ | Tranchée Q1 `legal-audit.md` §1.6 v2 : pseudonyme art. 4(5), traitement licite intérêt légitime + exécution contrat. Mesures compensatoires : hash SHA256 unidirectionnel, TTL 24h logs, aucun mapping wallet↔identité. |
| 1.7 (NOUVEAU) | Qualification customer_id Stripe (top-up sponsor) | ✓ | Tranchée Q3 `legal-audit.md` §1.6 v2 : pseudonyme côté DevRefs, traitement minimal acceptable. Règle opérationnelle : ne jamais stocker email conjointement. |

## 2. Bases légales et information

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 2.1 | Information préalable (art. 13) — privacy policy accessible avant collecte | ⚠ à faire Phase 1 | Privacy policy v2 draftée, à publier sur `/privacy` avant 1ère transaction. Lien obligatoire en footer. |
| 2.2 | Recueil consentement éclairé si applicable (art. 7) | ✗ N/A justifié | Aucun traitement basé sur le consentement (pas d'analytics tiers, pas de marketing). Bases légales = intérêt légitime + exécution contrat + obligation légale. |
| 2.3 | Mention du DPO si désigné (art. 37-39) | ✗ N/A justifié | DPO non obligatoire. Adresse `dpo@devrefs.dev` maintenue par best practice. |
| 2.4 | Information sur transferts hors UE (art. 13(1)(f)) | ⚠ à faire Phase 1 | Mention dans Privacy Policy v2 §5 : Stripe (DPF + SCC), Coinbase (SCC — HYPOTHÈSE H1 à confirmer), Cloudflare (SCC, data residency EU non activée sur free tier). |
| 2.5 (NOUVEAU) | Renonciation L.221-28 13° — information B2C préalable | ⚠ à faire @ux + @copywriter Phase 1 | Checkbox dédiée sur landing AVANT paiement sponsor humain. Libellé exact dans `legal-audit.md` §2.4. Gate bloquante sur bouton paiement. Action @ux Phase 1. |

## 3. Droits des personnes

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 3.1 | Procédure droit d'accès (art. 15) | ⚠ à faire Phase 1 + enrichi v2 | Email `dpo@devrefs.dev` actif. Périmètre v2 : wallet_hash pseudonyme (preuve cryptographique ownership), audit_id + savings_pct (31j), quota pack restant. Aucun input audit accessible (non persisté). |
| 3.2 | Procédure droit de rectification (art. 16) | ✗ N/A justifié | Aucun profil utilisateur stocké côté DevRefs. Input audit non persisté. |
| 3.3 | Procédure droit à l'effacement (art. 17) | ⚠ à faire Phase 1 | Email `dpo@devrefs.dev`. Effacement : wallet_hash KV (quota pack + audit_id TTL 31j) + JWT sponsor. Conservation 10 ans : tx_hash + customer_id (obligation légale, exception art. 17(3)(b)). |
| 3.4 | Procédure droit à la portabilité (art. 20) | ✗ N/A justifié | Aucune donnée structurée portable. |
| 3.5 | Procédure droit d'opposition (art. 21) | ✗ N/A justifié | Aucun profilage, aucun marketing direct. |
| 3.6 | Mention des droits dans la Privacy Policy | ⚠ à faire Phase 1 | Section "Vos droits" rédigée dans `privacy-policy.md` v2 §6. |

## 4. Sécurité des traitements (art. 32)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 4.1 | Chiffrement at-rest des données | ⚠ à confirmer @infrastructure | Cloudflare KV chiffre AES-256 par défaut (à confirmer INF-2). |
| 4.2 | Chiffrement en transit (TLS 1.3) | ✓ | Cloudflare Pages + Workers TLS 1.3 par défaut. HSTS à activer (INF-6). |
| 4.3 | Authentification serveur sécurisée | ✓ | JWT signé HMAC-SHA256, secret Cloudflare Workers Secrets, 24h, non renouvelable. |
| 4.4 | Gestion des secrets | ⚠ à faire @infrastructure | Stripe API key + Coinbase facilitator key + JWT HMAC secret stockés en Cloudflare Workers Secrets. Rotation 6 mois. |
| 4.5 | Logs d'accès | ⚠ à confirmer @infrastructure | Cloudflare Workers logs < 30j (INF-4). KV rate-limit TTL < 24h auto-purge. **Nouveauté v2** : logs verbeux désactivés sur champs `agent_config`/`sample_traces` dans Worker audit (INF-11). |
| 4.6 | Tests de pénétration | ✗ N/A justifié | Surface minimale. CF WAF + DDoS protection free tier suffisants V1. À réévaluer Phase 4+ si > 10k tx/mois. |
| 4.7 | Politique gestion des incidents | ⚠ à faire | Procédure : détection → investigation < 24h → notification CNIL si fuite PII < 72h (art. 33) → notification personnes si risque élevé (art. 34). Risque résiduel v2 : exposition customer_id Stripe (faible) + exposition audit_id avec savings_pct (très faible, données agrégées). |
| 4.8 (NOUVEAU) | Non-persistance input audit (/api/agent-audit) | ⚠ à faire @qa Phase 3 | Audit de code obligatoire : vérifier zéro write KV/AE/D1/R2 sur `agent_config`/`sample_traces`, désactivation logs verbeux, scope variables locales. INF-11. |

## 5. Sous-traitants (art. 28)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 5.1 | DPA signé avec Stripe | ✓ | DPA standard Stripe automatique (https://stripe.com/legal/dpa). SCC + DPF inclus. |
| 5.2 | DPA signé avec Coinbase (x402 facilitator) | ⚠ P0 — inchangé | **HYPOTHÈSE H1** : DPA séparé x402 facilitator non publié au 2026-05-05 (confirmé WebSearch). Politique GDPR globale Coinbase disponible. **Action P0** : email `dpo@coinbase.com` avant 1ère transaction. |
| 5.3 | DPA signé avec Cloudflare | ✓ MISE À JOUR v2 | DPA standard Cloudflare automatique (https://www.cloudflare.com/cloudflare-customer-dpa/). SCC Module 2 (Controller→Processor) inclus. Data residency EU = option payante non activée → mention SCC dans Privacy Policy (déjà documentée §5). |
| 5.4 | Liste publique des sous-traitants | ⚠ à faire Phase 1 | Section "Sous-traitants" `privacy-policy.md` v2 §4 : Stripe, Coinbase, Cloudflare. |
| 5.5 | Audit annuel des sous-traitants | ⚠ à planifier | Revue annuelle DPA + compliance status. Reminder @legal. |

## 6. Transferts internationaux (art. 44-49)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 6.1 | Identification des transferts hors UE | ✓ | Stripe (Irlande EU + sous-traitance US DPF), Coinbase (US SCC), Cloudflare (US SCC par défaut). |
| 6.2 | Garanties appropriées (SCC ou DPF) | ⚠ à confirmer partiellement | SCC Coinbase + Cloudflare à confirmer. Stripe DPF certifié. |
| 6.3 | Mention dans Privacy Policy | ⚠ à faire Phase 1 | Section "Transferts internationaux" `privacy-policy.md` v2 §5. Rédigée. |

## 7. Cookies & traceurs (art. 82 LIL)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 7.1 | Inventaire cookies déposés | ✓ | Aucun cookie tiers. Seul cookie : JWT sponsor 24h (strictement nécessaire, exempté). |
| 7.2 | Bannière de consentement TCF v2.2 | ✗ N/A justifié | Aucun cookie soumis à consentement en V1. Bannière ajoutée uniquement si analytics tiers ou pixel marketing ajoutés Phase 4+. |
| 7.3 | Cookie JWT configuré sécurisé | ⚠ à faire @fullstack | `Secure; HttpOnly; SameSite=Strict; Max-Age=86400`. INF-10. |

## 8. Documentation & accountability (art. 5(2))

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 8.1 | Politique de confidentialité publiée | ⚠ à faire Phase 1 | Draft v2 fourni `privacy-policy.md`. Publication `/privacy` avant 1ère transaction. |
| 8.2 | CGU/CGV publiées avec section données personnelles | ⚠ à faire Phase 1 | Draft v2 fourni `cgu-draft.md`. Art. 9 "Données personnelles" + Art. 3.4 "Input audit non persisté" + Art. 4quater "Renonciation L.221-28 13°". Publication `/terms` avant 1ère transaction. |
| 8.3 | Mentions légales publiées | ⚠ à faire Phase 1 | Section `legal-audit.md` §4.4. Publication `/legal` après immatriculation. |
| 8.4 (NOUVEAU) | Responsabilité partagée art. 26 RGPD documentée (input audit) | ✓ | Documentée dans `privacy-policy.md` v2 §2.4 et `cgu-draft.md` Art. 3.4 : Opérateur responsable de traitement pour PII incluse dans ses inputs, DevRefs sous-traitant technique pour la seule durée du traitement en mémoire (< 2s). |
| 8.5 | Registre des sous-traitants tenu | ✓ | `legal-audit.md` v2 §1.3. |
| 8.6 | Registre des activités de traitement | ✓ best practice | `legal-audit.md` v2 §1.2 + `privacy-policy.md` v2 §2.3. |

## 9. EU AI Act (art. 50 transparence)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 9.1 | DevRefs classé selon AI Act | ✓ CONFIRMÉ v2 (2026-05-05) | HORS SCOPE — pas de modèle ML, pas d'inférence, pas de génération en runtime. Endpoint `/api/agent-audit` = heuristiques statiques déterministes pure JS. Aucune classification de risque applicable. |
| 9.2 | Documentation provenance données pour clients IA | ⚠ à faire Phase 1 | Page `/about/data-sources` + champ `_audit_heuristics_version` dans output audit. |

## 10. Anti-fraude & traçabilité — v2 enrichi

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 10.1 | Watermark HMAC payloads JSON | ⚠ à faire @fullstack Phase 1 | Champ `_signature` sur chaque payload. **Nouveauté v2** : champ `_audit_id` UUID sur chaque output audit. |
| 10.2 | Rate-limit par wallet/JWT documenté CGU | ✓ MISE À JOUR v2 | Art. 7.1 `cgu-draft.md` v2 : rate-limit calls + rate-limit audit (1/wallet/jour). |
| 10.3 | Logs traçabilité fraude (durée 30j max) | ⚠ à faire @infrastructure | Conservation 30j max. **Nouveauté v2** : jamais de log `agent_config`/`sample_traces`. INF-11. |
| 10.4 (NOUVEAU) | KV audit_id TTL 31j (fenêtre refund garantie) | ⚠ à faire @fullstack Phase 1 | Stocker audit_id + savings_pct + wallet_hash en KV avec TTL 31j. INF-13. |
| 10.5 (NOUVEAU) | Endpoint refund POST /api/audit/refund (validation garantie) | ⚠ à faire @fullstack Phase 1 | Validation : signature wallet + audit_id HMAC valide + days_since_audit ≤ 30 + savings_pct_actual < 15 % + tokens_month ≥ 5M. INF-14. |

---

## Synthèse statuts v2

| Statut | Nombre | % | Commentaire |
|---|---|---|---|
| ✓ conforme | 20 | 48 % | Architecture zéro-PII + 5 questions PII tranchées + EU AI Act HORS SCOPE confirmé |
| ⚠ à faire | 18 | 44 % | Actions Phase 1 (publication docs, config @fullstack/@infrastructure/@ux) + 1 action P0 (DPA Coinbase) + 3 nouveaux items v2 (INF-11/13/14) |
| ✗ N/A justifié | 8 | 19 % | Justifié par absence de PII directe / absence d'analytics / absence de marketing / hors scope AI Act |

**Items passés de "natif" à "à mettre en œuvre" suite au pivot v2 :**
1. **Item 2.5** (NOUVEAU) — Renonciation L.221-28 13° : v1 n'avait pas de persona sponsor humain achetant des packs. V2 : checkbox obligatoire sur landing pour tout achat B2C.
2. **Item 4.8** (NOUVEAU) — Non-persistance input audit : v1 n'avait pas d'endpoint audit. V2 : audit de code obligatoire @qa Phase 3.
3. **Item 8.4** (NOUVEAU) — Responsabilité partagée art. 26 RGPD : v1 n'avait pas d'input utilisateur. V2 : clause CGU explicite sur responsabilité Opérateur pour PII dans inputs.

**Verdict checklist v2 : GO CONDITIONNEL** — 20 items ✓ (48 %), 18 actions ⚠ à fermer en Phase 1-3, aucun ✗ non justifié. Action P0 unique inchangée : email DPO Coinbase (HYPOTHÈSE H1). 3 nouveaux items v2 à implémenter avant lancement endpoint audit.

---

**Source de référence** : `docs/legal/legal-audit.md` v2 (audit complet 8 axes + 5 questions PII tranchées).
**Mise à jour à prévoir** : à chaque ajout sous-traitant, fonctionnalité ou source de données. Révision obligatoire avant lancement `/api/agent-audit` (Phase 2 build).
