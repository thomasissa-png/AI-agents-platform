# Mémoire organisationnelle — Lessons Learned (DevRefs)

Mémoire du projet DevRefs. Capitalise les apprentissages au fil des sessions.

**Cap actif** : 80 lignes max (commandement n°8 CLAUDE.md). **TTL** : 5 sessions OU 90 jours (le plus court). **Format v2 (11 colonnes)** : Session | Date | Catégorie | Sévérité | Description | Correction appliquée | Recommandation framework | Cible propagation | Fichiers impactés | Statut correction | Statut propagation.

**Archive** : sessions plus anciennes que 5 sessions seront déplacées vers `docs/lessons-learned-archive.md` (P0 jamais archivés automatiquement, mais archivés ici si déjà couverts par règle permanente).

**Héritage framework** : les learnings cross-projets (Sarani, Versiroom, ImmoCrew, Gradient framework lui-même) sont déjà bakés dans les prompts d'agents copiés depuis `Agent-Team@master`. Ce fichier capture uniquement les learnings **spécifiques à DevRefs**.

---

## Session 2026-05-05 — Setup initial DevRefs (autopilot launch)

| Session | Date | Catégorie | Sévérité | Description | Correction appliquée | Recommandation framework | Cible propagation | Fichiers impactés | Statut correction | Statut propagation |
|---|---|---|---|---|---|---|---|---|---|---|
| 2026-05-05 | 2026-05-05 | pattern | P1 | Coinbase x402 facilitator ne publie pas (au 2026-05-05) de DPA séparé pour le périmètre x402 — seules la Privacy Policy globale Coinbase et les SCC standard sont accessibles. De plus, les 3 champs metadata x402 (`resource_url`, `description`, `reason`) sont transmis EN CLAIR au facilitator avant settlement, ce qui crée un risque PII si un implémenteur y inclut des données identifiantes. | Documenté HYPOTHÈSE H1 dans legal-audit.md + engagement explicite zéro-PII dans Privacy Policy + action P0 = email dpo@coinbase.com avant 1ère transaction. | Tout futur projet utilisant x402 doit (a) tenter d'obtenir un DPA spécifique x402 par email DPO Coinbase, (b) ne JAMAIS inclure de PII dans les métadonnées x402, (c) le documenter dans la Privacy Policy. À promouvoir en règle agent @legal si pattern se répète sur 2+ projets x402. | agent-spécifique (@legal) | docs/legal/legal-audit.md (§1.3, H1), docs/legal/privacy-policy.md (§4) | fait | non-propagé |
| 2026-05-05 | 2026-05-05 | pattern | P1 | Stripe Tax automatise complètement la TVA internationale (reverse charge B2B UE via VAT ID, OSS B2C UE) MAIS Coinbase x402 facilitator ne gère AUCUNE TVA — la transaction blockchain ne porte aucune info qualifiante (B2B/B2C, localisation). Conséquence : pour un revenu mixte x402+Stripe au-dessus du seuil franchise art. 293 B CGI, deux régimes coexistent et la TVA x402 doit être gérée manuellement (ou TVA française par défaut, perte de marge sur reverse charge). | Documenté §4.3 legal-audit.md. Recommandation V1 : rester sous franchise (cible 600 €/mois bien sous 37 500 €) pour neutraliser le problème. | Pour tout projet hybride crypto-fiat international, anticiper la divergence des régimes TVA et viser explicitement le maintien sous seuil franchise tant que possible. | agent-spécifique (@legal) | docs/legal/legal-audit.md (§4.3), docs/legal/cgu-draft.md (art. 4.4) | fait | non-propagé |
