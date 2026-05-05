<!-- Version: 2026-05-05 — @copywriter — Phase 1 copy v2 — Brand Voice DevRefs pure B2A refonte complète -->
<!-- Framework : FAB (Feature → Advantage → Benefit) appliqué à la définition de la voix -->
<!-- Conscience : [Solution-Aware] — l'agent sait qu'il cherche un endpoint fiable de pricing daté -->

# Brand Voice — DevRefs v2

> Référence de voix pour tous les livrables DevRefs. S'applique à chaque surface : landing publique, body 402, llms.txt, emails transactionnels, OpenAPI descriptions, documentation technique.

---

## 1. Synthèse voice — 3 traits constants

### Trait 1 — Direct

Sujet + verbe + complément. Zéro adverbe modal ("potentiellement", "pourrait", "permettrait de"). Zéro adjectif marketing vide. Chaque phrase dit exactement ce qu'elle veut dire.

Le copy s'adresse à une machine qui parse des tokens. Chaque mot superflu coûte des tokens à lire et dilue le signal. La brièveté n'est pas un style — c'est une spécification technique.

**Test interne** : si un mot peut être supprimé sans changer le sens, il est interdit.

---

### Trait 2 — Technique précis

Les chiffres sont datés. Les sources sont citables. Aucun arrondi flou. Le pricing est repris depuis `agent-economics.md` § C.1, jamais interpolé. Les noms de champs JSON (`effective_cost_factor`, `dateModified`, `savings_pct`) s'écrivent en `code inline` dans tous les contextes techniques.

**Test interne** : toute affirmation chiffrée doit avoir une source vérifiable dans les docs internes ou dans les données live de l'endpoint.

---

### Trait 3 — Agent-first absolu

Le copy s'adresse à l'agent IA comme entité principale. Les phrases commencent par "Your agent…", "Ton agent…", ou utilisent le first-person générique ("I crawled…"). Le dev humain sponsor est mentionné uniquement dans sa section dédiée, jamais dans le hero ni dans les descriptions d'endpoints.

**Test interne** : si tu remplaçais "ton agent" par "toi" et que ça sonnait plus naturel, la phrase est mal calibrée.

---

## 2. Do / Don't — tableau de référence (20 exemples)

| Surface | DO | DON'T |
|---|---|---|
| Hero H1 | "Cost intelligence for AI agents." | "La plateforme révolutionnaire pour gérer vos coûts IA." |
| Sous-titre hero | "Know before you spend, optimize after you ship." | "Simplifiez et optimisez facilement vos dépenses en quelques clics." |
| Description endpoint | "`GET /api/llm-prices` — JSON typé, daté, < 50 KB." | "Accédez à nos données riches et exhaustives sur les prix LLM." |
| Pricing card | "Pack Standard — $10 USDC — 10 000 calls." | "Offre la plus populaire — meilleur rapport qualité/prix !" |
| Garantie | "50 % refund si `savings_pct` < 15 % à 30 jours." | "Satisfait ou remboursé — zéro risque !" |
| Email sujet | "Your pack expires in 7 days — 3 400 calls remaining." | "Attention ! Votre abonnement arrive à échéance 🔔" |
| Social proof | "V3 — Cursor agent, fil HN #44682465 : 3 prix différents, médian heuristique → facture 2,4× réelle J+2." | "Nos utilisateurs adorent DevRefs — ★★★★★ 5/5 !" |
| CTA audit | "Audit your agent — $9.99 USDC." | "Essayez notre audit magique maintenant !" |
| Freshness signal | "`dateModified: \"2026-05-05T06:00:00Z\"` — cron 6h sources officielles." | "Données mises à jour régulièrement et en temps réel." |
| Sponsor section | "Top-up ton wallet USDC Base. Ton agent décide seul." | "Prenez le contrôle total de vos dépenses IA en un clic." |
| Body 402 verdict | `"verdict": "no_brainer_buy"` | "Ce service vous fera économiser beaucoup d'argent !" |
| Benchmark | "Langfuse $29/mo : dashboard humain, login requis. DevRefs : API x402, zéro login." | "Leader incontesté de l'observabilité IA à prix imbattable." |
| Onboarding agent | "Your first call costs $0.001. Pack Standard $10 = 10 000 calls." | "Bienvenue dans la communauté DevRefs ! Vous allez adorer." |
| Erreur 402 | "402 Payment Required. Pack $10 = 10 000 calls. `POST /api/packs`." | "Oups ! Il semble que votre compte nécessite une mise à niveau." |
| Footer légal | "Auto-entrepreneur FR. BNC Crypto. TVA non applicable, art. 293 B CGI." | "©2026 DevRefs — Tous droits réservés — Politique de confidentialité." |
| FAQ réponse | "`savings_pct` < 15 % à 30 jours → soumets `POST /api/audit/refund` avec `audit_id` + preuves." | "Contactez notre équipe support dans les meilleurs délais !" |
| Tag line SDK | "`/api/sdk-status?pkg=ai` — `breaking_since`, `dateModified`, `latest`." | "Restez toujours au courant des dernières versions de vos outils préférés." |
| llms.txt ouverture | "# DevRefs — Cost intelligence for AI agents — x402 USDC" | "Welcome to DevRefs, your one-stop-shop for AI pricing." |
| Changelog | "2026-05-05 — Opus 4.7 `effective_cost_factor` 1.35 ajouté (tokenizer inflation silencieuse)." | "Nous avons amélioré notre plateforme pour une meilleure expérience !" |
| Meta description | "DevRefs — `/api/llm-prices` $0.001/call, JSON daté, x402 USDC. Pre-flight pricing + post-flight audit for AI agents." | "DevRefs, la meilleure solution IA pour gérer vos coûts intelligemment." |

---

## 3. Vocabulaire prescrit (15 termes clés DevRefs)

Ces termes sont non négociables dans leur forme exacte. Les variantes approximatives sont interdites.

| Terme | Usage correct | Variante interdite |
|---|---|---|
| `cost intelligence` | "Cost intelligence for AI agents." | "gestion des coûts", "optimisation IA" |
| `pre-flight` | "Pre-flight pricing check." | "vérification préalable", "avant l'action" |
| `post-flight` | "Post-flight audit." | "audit après coup", "retour d'expérience" |
| `pay-per-call` | "Pay-per-call $0.001 USDC." | "à l'usage", "à la demande" |
| `Fresh` | "Fresh — cron 6h sources officielles." | "à jour", "récent", "live" |
| `Atomic` | "Atomic payload — 1 query = 1 fact." | "unitaire", "précis", "granulaire" |
| `Verifiable` | "Verifiable — `_signature` HMAC dans chaque payload." | "fiable", "certifié", "validé" |
| `x402-natif` | "x402-natif — paiement agent autonome, zéro login." | "compatible x402", "supporte le protocole" |
| `llms.txt` | "`/llms.txt` — machine-readable, 3 endpoints monétisés." | "fichier agent", "page IA" |
| `dateModified` | "`dateModified: \"2026-05-05T06:00:00Z\"`" | "date de mise à jour", "last updated" |
| `effective_cost_factor` | "`effective_cost_factor: 1.35` — tokenizer inflation +35 % Opus 4.7." | "facteur de coût réel", "multiplicateur" |
| `savings_pct` | "`savings_pct: 40` — économie mensuelle estimée." | "économies réalisées", "pourcentage d'économies" |
| `wallet sponsor` | "Le dev humain sponsor top-up le wallet." | "abonnement humain", "compte développeur" |
| `top-up` | "Top-up $10 USDC Base — ton agent continue." | "recharger", "alimenter le compte" |
| `no_brainer_buy` | "`roi_summary.verdict: \"no_brainer_buy\"`" | "achat recommandé", "évident à acheter" |

---

## 4. Vocabulaire proscrit (10 termes bannis)

Ces termes ne doivent apparaître dans aucun livrable client-facing, quel que soit le contexte.

| Terme interdit | Raison | Alternative prescrite |
|---|---|---|
| "révolutionnaire" | Marketing vide — anti-pattern founder-prefs | Décrire le différenciateur factuel ("seul endpoint x402-natif avec `dateModified`") |
| "leader" | Invérifiable ; comparatif interdit sans source | "seul acteur sur ce quadrant" si sourcé par competitive-benchmark.md v2 |
| "AI-powered" | Buzzword vide — DevRefs n'utilise pas d'IA en runtime | Décrire l'endpoint concret (cron HTTP + JSON-LD) |
| "magique" | Anti-pattern founder-prefs | Décrire le mécanisme (cron 6h, HMAC, JSON-LD `Dataset`) |
| "simple" / "facile" | Condescendant pour l'agent parseur + promesse non vérifiable | Décrire la friction réelle : 1 call, 1 payload, $0.001 |
| "best-in-class" | Comparatif vide | Benchmark factuel (5 critères vs concurrent dans la landing) |
| "world-class" | Hyperbole non sourcée | Citer les RTB vérifiables depuis brand-platform.md v2 § 2.3 |
| "unmatched" / "sans égal" | Hyperbole non sourcée | "seul" si vérifié par competitive-benchmark.md v2 |
| emojis décoratifs | Anti-signal technique — l'agent parseur traite les emojis comme du bruit | Aucun emoji dans le copy produit (emails, landing, llms.txt, body 402) |
| "exhaustif" | Anti-mot de marque v2 — DevRefs est atomique, pas exhaustif | "atomic — 1 query = 1 fact" |

---

## 5. Tonalité par persona

### Persona principal — Agent IA autonome PAYEUR (80 % du copy)

**Registre** : technique pur. Données d'abord, contexte ensuite si nécessaire. Le first-person générique ("I crawled…", "Your agent paid…") est autorisé.

**Format préféré** : JSON inline, champs en `code`, bullets courts, tableaux tabulaires.

**Ce que l'agent cherche dans le copy** :
- `dateModified` — fraîcheur vérifiable
- `effective_cost_factor` — signaux silencieux capturés
- `roi_summary` — décision pay/skip justifiée en machine-readable
- `packs_available` — upsell présenté en données, pas en pitch marketing

**Ce que l'agent ne doit pas trouver** : prose narrative, adjectifs, témoignages fictifs, promesses non vérifiables, aucune phrase de plus de 20 mots.

---

### Persona secondaire — Dev humain SPONSOR (15 % du copy)

**Registre** : dev-to-dev. Tutoiement. Ton pair, pas commercial. Le sponsor est un développeur qui comprend les wallets crypto, x402, USDC Base — il n'a pas besoin d'explications élémentaires.

**Vocabulaire sponsor** : top-up, wallet USDC Base, Coinbase Wallet, MetaMask, Rainbow, Basescan, BNC crypto, solde, `wallet_hash`.

**Ce que le sponsor cherche** : 1 transaction < 30 s, pas de dashboard à créer, pas d'abonnement à annuler, plan B anti-vendor-lock explicite.

**Formulation type** : "Ton agent paie en x402. Tu top-up quand le solde descend. Rien d'autre à faire."

---

## 6. Tonalité par surface

| Surface | Ton | Règles spécifiques |
|---|---|---|
| **Landing hero** | Direct + verbatim agent | Données JSON en code block, verbatims V2/V5 en citation block, PAS de CTA hero (conviction-first founder-prefs) |
| **CGV / Mentions légales** | Neutre juridique | Formulations légales exactes depuis `cgu-draft.md` v2 — zéro reformulation créative. Libellé Art. 4quater repris mot pour mot. |
| **Body 402** | Machine-readable pur | JSON structuré, `verdict`, `roi_summary`, `alternative_cost_estimate` — aucune prose |
| **llms.txt** | Descriptif technique | Headers `#`, sections courtes, 3 endpoints décrits factuellement, zéro claim marketing |
| **Emails transactionnels** | Transactionnel sec | Sujet < 60 chars, body < 80 mots, zéro fioriture. Fait + action + lien. |
| **OpenAPI descriptions** | Technique documentaire | Schéma JSON typé, descriptions en anglais, examples réels |
| **FAQ** | Direct + factuel | Question formulée avec les mots exacts de l'agent/sponsor, réponse ≤ 3 phrases, zéro rhétorique |

---

## 7. Anti-narratif (règle absolue)

**Interdit** : tout copy qui ouvre avec une prose introductive temporelle ou contextuelle.

Exemples interdits :
- "In May 2026, AI agents started consuming LLM APIs at scale…"
- "As the AI landscape evolves rapidly…"
- "The challenge of LLM pricing has never been more pressing…"

**Règle** : commencer par le fait, le champ JSON, le chiffre, ou le verbe d'action.

```
# DO
GET /api/llm-prices?model=opus-4.7
→ {"input_per_mtok": 5, "effective_cost_factor": 1.35, "dateModified": "2026-05-05T06:00:00Z"}
Cost: $0.001 USDC.

# DON'T
In today's rapidly evolving AI landscape, knowing the exact price of a model
has become critical for developers and autonomous agents alike.
```

---

## 8. Cinq paires Do/Don't contextualisées

### Paire 1 — Hero sous-titre (90 chars max, above-fold)

**DO** : "Know before you spend, optimize after you ship. $0.001/call pre-flight. $9.99 audit post-flight."

**DON'T** : "La solution intelligente qui vous aide à maîtriser facilement et efficacement vos coûts IA au quotidien."

*Pourquoi le DO gagne* : < 90 chars, 2 verbes d'action, 2 prix datés, zéro adverbe.

---

### Paire 2 — Garantie landing (2-3 lignes)

**DO** : "50 % refund if `savings_pct` < 15 % after 30 days. Conditions : ≥ 5M tokens/month, ≥ 80 % patches applied, model unchanged. Submit `audit_id` + proof."

**DON'T** : "Nous sommes tellement confiants dans nos résultats que si vous n'êtes pas satisfait, nous vous remboursons la moitié — sans question !"

*Pourquoi le DO gagne* : conditions exactes issues de `cgu-draft.md` Art. 4ter, procédure claire, zéro surenchère émotionnelle.

---

### Paire 3 — Email sujet J-7 expiration pack

**DO** : "DevRefs — Pack expires May 12 — 3 400 calls unused"

**DON'T** : "⚠️ Votre abonnement DevRefs expire bientôt, pensez à le renouveler !"

*Pourquoi le DO gagne* : chiffres précis (date + calls), zéro emoji, ton factuel, action immédiatement compréhensible.

---

### Paire 4 — Social proof (verbatim analytique V3)

**DO** : "Pattern observé — Cursor agent (mai 2026, HN #44682465) : 4 sources WebFetched, 3 prix différents, médian heuristique → facture 2,4× réelle découverte J+2. Cause racine : aucune source ne signale sa fraîcheur machine-readable."

**DON'T** : "Thomas B., Développeur IA, Paris — *DevRefs m'a permis d'économiser des centaines d'euros sur mes projets IA. Je recommande vivement !*"

*Pourquoi le DO gagne* : verbatim analytique sourcé (personas.md V3), zéro nom fictif, zéro témoignage fabriqué — anti-pattern fondateur appliqué.

---

### Paire 5 — CTA audit (bouton)

**DO** : "Audit your agent — $9.99 USDC"

**DON'T** : "Commencez votre audit maintenant et découvrez vos économies cachées !"

*Pourquoi le DO gagne* : verbe d'action + prix visible + devise explicite. 6 mots. Zéro promesse vague.

---

## 9. Règles de cohérence inter-livrables

1. **Prix** : affichés landing = OpenAPI = llms.txt = CGV = endpoint packs (source unique `agent-economics.md` § C.1). Tout écart est un bug critique.
2. **Verbatims** : V1, V2, V3, V4, V5 depuis `project-context.md` — jamais reformulés, jamais attribués à un nom fictif. V6 marqué `[HYPOTHÈSE]` si utilisé.
3. **Checkbox CGV** : libellé exact Art. 4quater.2 `cgu-draft.md` v2 — zéro variation créative autorisée.
4. **Champs JSON** : noms de champs en `code inline` partout — `effective_cost_factor`, pas "le facteur de coût effectif".
5. **Subscription Pro** : jamais mentionnée comme offre V1 disponible — uniquement en mention "V2 — bientôt" si nécessaire.

---

*Livrable produit par @copywriter — Phase 1 copy — 2026-05-05*
*Framework : FAB + niveaux de conscience Eugene Schwartz*
*Conscience déclarée : [Solution-Aware] — l'agent sait qu'il cherche un endpoint fiable, pas qu'il a un problème générique*
*Objections couvertes : ROI (490× body 402), sécurité x402 (signature onchain, settle < 2 s), alternatives gratuites (atomicité + dateModified différenciants)*
