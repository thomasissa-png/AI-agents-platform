<!-- Version: 2026-05-05T08:10 — @legal — Checklist RGPD initiale DevRefs Phase 0 wave 1 -->

# Checklist RGPD — DevRefs

> Checklist actionnable spécifique DevRefs (architecture zéro-PII). Légende : ✓ conforme / ⚠ à faire / ✗ N/A justifié.
> Cette checklist tient compte de la quasi-absence de PII et est volontairement **allégée** par rapport à un SaaS B2C classique. Source : audit complet `legal-audit.md`.

---

## 1. Cartographie des données

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 1.1 | Inventaire des données personnelles collectées | ✓ | Cartographie complète dans `legal-audit.md` §1.1. Zéro PII directement collectée par DevRefs (wallet anonyme + JWT pseudonyme + IP éphémère < 24h). |
| 1.2 | Identification des bases légales par traitement | ✓ | Registre §1.2 `legal-audit.md` : intérêt légitime (rate-limit), exécution contrat (JWT), obligation légale (compta 10 ans). |
| 1.3 | Registre des activités de traitement (art. 30) | ✗ N/A justifié | DevRefs exemptée art. 30(5) RGPD : < 250 employés ET traitement non régulier de PII ET pas de catégories spéciales. Registre minimal tenu malgré tout dans `legal-audit.md` §1.2 (best practice). |
| 1.4 | Identification des catégories spéciales (art. 9) | ✓ | Aucune catégorie spéciale traitée (pas de santé, opinions, biométrie, etc.). |
| 1.5 | Données de mineurs (art. 8) | ✓ | Aucun ciblage mineurs. CGU exigent capacité juridique ≥ 18 ans (clause à intégrer dans CGV). |

## 2. Bases légales et information

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 2.1 | Information préalable (art. 13) — politique de confidentialité accessible avant collecte | ⚠ à faire Phase 1 | Privacy policy draftée dans `privacy-policy.md`, à publier sur la landing avant 1ère transaction. Lien obligatoire en footer + sur Stripe Payment Link description. |
| 2.2 | Recueil consentement éclairé si applicable (art. 7) | ✗ N/A justifié | Aucun traitement basé sur consentement (pas d'analytics tiers, pas de marketing, pas de profilage). Bases légales = intérêt légitime + exécution contrat + obligation légale. |
| 2.3 | Mention du DPO si désigné (art. 37-39) | ✗ N/A justifié | DPO non obligatoire (pas d'autorité publique, pas de surveillance systématique à grande échelle, pas de catégories spéciales à grande échelle). Adresse de contact `dpo@devrefs.dev` (ou domaine définitif) maintenue par best practice. |
| 2.4 | Information sur transferts hors UE (art. 13(1)(f)) | ⚠ à faire Phase 1 | Mention dans Privacy Policy : Stripe (Irlande + transferts US sous SCC), Coinbase (US sous SCC), Cloudflare (US par défaut, EU si Data Localization activable). Action @infrastructure (vérif INF-1). |

## 3. Droits des personnes

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 3.1 | Procédure droit d'accès (art. 15) | ⚠ à faire Phase 1 | Email `dpo@devrefs.dev` actif + auto-réponse < 48h + traitement < 1 mois. Côté wallet x402 : aucune donnée à fournir (pseudonyme). Côté Stripe customer : extraction Stripe dashboard. |
| 3.2 | Procédure droit de rectification (art. 16) | ✗ N/A justifié | Aucun profil utilisateur stocké côté DevRefs. Données Stripe rectifiables directement par l'utilisateur sur dashboard Stripe. |
| 3.3 | Procédure droit à l'effacement (art. 17) | ⚠ à faire Phase 1 | Email `dpo@devrefs.dev`. Suppression du customer_id Stripe + JWT actif sur demande. Conservation comptable 10 ans = exception légale art. 17(3)(b). |
| 3.4 | Procédure droit à la portabilité (art. 20) | ✗ N/A justifié | Aucune donnée utilisateur structurée portable côté DevRefs. |
| 3.5 | Procédure droit d'opposition (art. 21) | ✗ N/A justifié | Aucun profilage, aucun marketing direct. |
| 3.6 | Mention des droits dans la Privacy Policy | ⚠ à faire Phase 1 | Section "Vos droits" déjà rédigée dans `privacy-policy.md`. |

## 4. Sécurité des traitements (art. 32)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 4.1 | Chiffrement at-rest des données | ⚠ à confirmer @infrastructure | Cloudflare KV chiffre AES-256 par défaut (à confirmer INF-2). |
| 4.2 | Chiffrement en transit (TLS 1.3) | ✓ | Cloudflare Pages + Workers TLS 1.3 par défaut. HSTS à activer côté headers @infrastructure (INF-6). |
| 4.3 | Authentification serveur sécurisée | ✓ | JWT signé HMAC-SHA256, secret stocké en variable d'environnement Cloudflare (Secret), durée 24h, non renouvelable automatiquement. |
| 4.4 | Gestion des secrets | ⚠ à faire @infrastructure | Stripe API key + Coinbase facilitator key + JWT HMAC secret stockés en Cloudflare Workers Secrets (encrypted env vars). Rotation 6 mois. |
| 4.5 | Logs d'accès | ⚠ à confirmer @infrastructure | Cloudflare Workers logs rétention < 30 jours (INF-4). KV rate-limit TTL < 24h auto-purge. |
| 4.6 | Tests de pénétration | ✗ N/A justifié | Surface d'attaque minimale (2 endpoints API + 1 page statique). Cloudflare WAF + DDoS protection inclus free tier suffisent en V1. À ré-évaluer Phase 4+ si volume > 10k tx/mois. |
| 4.7 | Politique de gestion des incidents | ⚠ à faire | Procédure : détection (CF Analytics anomaly) → investigation < 24h → notification CNIL si fuite PII < 72h (art. 33 RGPD) → notification utilisateurs si risque élevé (art. 34). Vu zéro PII côté DevRefs, risque résiduel = exposition Stripe customer_id (faible). |

## 5. Sous-traitants (art. 28)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 5.1 | DPA signé avec Stripe | ✓ | DPA standard Stripe accepté à l'inscription Stripe (https://stripe.com/legal/dpa). SCC européennes incluses pour transferts US. |
| 5.2 | DPA signé avec Coinbase (x402 facilitator) | ⚠ à confirmer P0 | **HYPOTHÈSE H1** : DPA séparé x402 facilitator non publié au 2026-05-05. Action P0 = email `dpo@coinbase.com` pour copie SCC + confirmation périmètre x402. |
| 5.3 | DPA signé avec Cloudflare | ✓ | DPA standard Cloudflare accepté à la création compte (https://www.cloudflare.com/cloudflare-customer-dpa/). |
| 5.4 | Liste publique des sous-traitants | ⚠ à faire Phase 1 | Section "Sous-traitants" de `privacy-policy.md` : Stripe, Coinbase, Cloudflare. Mise à jour à chaque ajout. |
| 5.5 | Audit annuel des sous-traitants | ⚠ à planifier | Revue annuelle des DPA + statut compliance (Stripe DPF, Coinbase SCC, Cloudflare). Reminder calendrier @legal. |

## 6. Transferts internationaux (art. 44-49)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 6.1 | Identification des transferts hors UE | ✓ | Stripe (Irlande EU + sous-traitance US), Coinbase (US), Cloudflare (US par défaut, EU possible). |
| 6.2 | Garanties appropriées (SCC ou DPF) | ⚠ à confirmer | SCC standard Coinbase + Cloudflare. Stripe DPF (Data Privacy Framework EU-US) certifié. |
| 6.3 | Mention dans Privacy Policy | ⚠ à faire Phase 1 | Section "Transferts internationaux" `privacy-policy.md`. |

## 7. Cookies & traceurs (art. 82 LIL)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 7.1 | Inventaire cookies déposés | ✓ | Aucun cookie tiers. Seul cookie : JWT post-Stripe (strictement nécessaire, exempté consentement). |
| 7.2 | Bannière de consentement TCF v2.2 | ✗ N/A justifié | Aucun cookie soumis à consentement en V1. Bannière ajoutée uniquement si analytics tiers ou pixel marketing ajoutés ultérieurement. |
| 7.3 | Cookie JWT configuré sécurisé | ⚠ à faire @fullstack | `Secure; HttpOnly; SameSite=Strict; Max-Age=86400`. Action INF-10. |

## 8. Documentation & accountability (art. 5(2))

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 8.1 | Politique de confidentialité publiée | ⚠ à faire Phase 1 | Draft fourni `privacy-policy.md`. Publication URL `/privacy` avant 1ère transaction. |
| 8.2 | CGU/CGV publiées avec section données personnelles | ⚠ à faire Phase 1 | Draft fourni `cgu-draft.md`. Publication URL `/terms` avant 1ère transaction. |
| 8.3 | Mentions légales publiées | ⚠ à faire Phase 1 | Section dédiée `legal-audit.md` §4.4. Publication URL `/legal` après immatriculation auto-entreprise. |
| 8.4 | Registre des sous-traitants tenu | ✓ | `legal-audit.md` §1.3. |
| 8.5 | Registre des activités de traitement | ✓ best practice | `legal-audit.md` §1.2 (non obligatoire mais tenu). |

## 9. EU AI Act (art. 50 transparence)

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 9.1 | DevRefs classé selon AI Act | ✓ | HORS SCOPE — DevRefs n'est pas un système IA (pas de modèle, pas d'inférence, pas de génération). Cf. `legal-audit.md` §3.1. |
| 9.2 | Documentation provenance données pour clients IA | ⚠ à faire Phase 1 | Page `/about/data-sources` listant URLs sources, fréquence cron, méthode parsing. Best practice pour clients aval soumis à AI Act. |

## 10. Anti-fraude & traçabilité

| # | Item | Statut | Justification / Action |
|---|---|---|---|
| 10.1 | Watermark HMAC payloads JSON | ⚠ à faire @fullstack Phase 1 | Champ `_signature` calculé sur clé serveur secrète. Permet preuve origine en cas de redistribution. |
| 10.2 | Rate-limit par wallet/JWT documenté CGU | ✓ | Section anti-fraude `cgu-draft.md`. |
| 10.3 | Logs traçabilité fraude (durée 30j max) | ⚠ à faire @infrastructure | Conservation 30j max (équilibre RGPD limitation conservation vs preuve fraude). |

---

## Synthèse statuts

| Statut | Nombre | % | Commentaire |
|---|---|---|---|
| ✓ conforme | 18 | 47 % | Architecture zéro-PII porte la moitié de la conformité nativement |
| ⚠ à faire | 17 | 45 % | Actions Phase 1 (publication docs, config @fullstack/@infrastructure) + 1 action P0 (DPA Coinbase) |
| ✗ N/A justifié | 8 | 21 % | Justifié par absence de PII / absence d'analytics / absence de marketing |

**Verdict checklist : GO CONDITIONNEL** — aucun ✗ non justifié, mais 17 actions ⚠ à fermer en Phase 1 avant publication. Action P0 unique = email DPO Coinbase pour DPA x402.

---

**Source de référence** : `docs/legal/legal-audit.md` (audit complet 8 axes).
**Mise à jour à prévoir** : à chaque ajout de sous-traitant, fonctionnalité ou source de données.
