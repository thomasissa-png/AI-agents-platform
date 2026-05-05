<!-- Version: 2026-05-05T09:50 — @product-manager — Phase 0 wave 2 — Backlog allégé V1 DevRefs (template light) -->

# Backlog — DevRefs V1

## Résumé exécutif

- **Format** : template ALLÉGÉ acceptable en Phase 0 wave 2 (cf. prompt mission). Les specs complètes (5 états UI détaillés, payloads JSON exhaustifs) seront produites en Phase 1 par "Specs fonctionnelles détaillées" via @product-manager (`docs/product/functional-specs.md`).
- **15 user stories** couvrant les 17 features V1 (mapping § 6).
- **Personas** : agent IA autonome (US-01 à US-08) + dev humain superviseur (US-09 à US-15).
- **Critères Given/When/Then** : minimum 9 par story (3 happy + 2 erreur + 2 limites + 1 permission + 1 données existantes).
- **Dépendances aval** : `v1-scope.md` (consolidation finale), Phase 1 functional-specs (specs détaillées par @product-manager), @qa (tests E2E par story).

---

## Format des user stories (allégé Phase 0)

```
### US-NN : Titre — verbe action
- **Persona** : agent IA OU dev humain superviseur
- **JTBD** : job-to-be-done référencé depuis personas.md (ex : Job 1 vérifier fraîcheur)
- **Opportunité** : O1, O2, O3 ou O4 du discovery-map.md
- **Features liées** : F1 à F26 de roadmap.md
- **Dépendances** : US précédentes ou "Aucune"
- **Effort** : S (< 4 h IA), M (< 1 j IA), L (> 1 j IA)
- **Critères acceptance** : 9 minimum (3 happy + 2 erreur + 2 limites + 1 permission + 1 données existantes)
```

---

## Stories — Persona principal : Agent IA autonome

### US-01 : Découvrir les endpoints DevRefs via `llms.txt`

- **Persona** : Agent IA autonome (Claude Code, Cursor, AgentKit, MCP-host)
- **JTBD** : Job 1 personas.md — vérifier la fraîcheur d'un fait technique avant de générer
- **Opportunité** : O2 + O3
- **Features liées** : F15 (`llms.txt`)
- **Dépendances** : Aucune (entrée du parcours)
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent fetch `https://devrefs.dev/llms.txt` WHEN MIME type retourné THEN `text/plain; charset=utf-8`
  - Happy 2 : GIVEN agent parse `llms.txt` WHEN cherche endpoints WHEN trouve les 2 endpoints monétisés (`/api/llm-prices`, `/api/sdk-status`) avec tarif x402 et fallback Stripe
  - Happy 3 : GIVEN agent vérifie syntaxe llmstxt.org WHEN parse THEN aucune erreur de format markdown
  - Erreur 1 : GIVEN cron source down 12 h WHEN agent fetch `llms.txt` THEN reçoit 200 + warning explicite "stale data > 24 h" inclus
  - Erreur 2 : GIVEN Cloudflare edge erreur WHEN agent fetch `llms.txt` THEN reçoit 5xx + retry-after header
  - Limite 1 : GIVEN agent fetch `llms.txt` 1 000 fois/jour WHEN rate-limit non déclenché (read-only) THEN tous succèdent
  - Limite 2 : GIVEN agent fetch avec User-Agent inhabituel WHEN parse THEN aucune restriction (public read)
  - Permission 1 : GIVEN aucun JWT ni paiement x402 WHEN agent fetch `llms.txt` THEN 200 OK (page publique sans auth)
  - Données existantes 1 : GIVEN nouvelle version `llms.txt` déployée WHEN agent re-fetch THEN reçoit nouvelle version (cache CF max 5 min)

### US-02 : Recevoir HTTP 402 conforme x402 spec sur appel non payé

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 — détecter le besoin de paiement avant accès donnée
- **Opportunité** : O3
- **Features liées** : F8 (middleware x402)
- **Dépendances** : US-01
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent appelle `GET /api/llm-prices?model=opus-4.7` sans `X-PAYMENT` header WHEN middleware x402 intercepte THEN renvoie HTTP 402 + body JSON `{"error":402,"x402":{"price":"0.49","currency":"EUR","facilitator":"coinbase","asset":"USDC","network":"base"}}`
  - Happy 2 : GIVEN body 402 reçu WHEN agent parse THEN tous les champs `x402` requis présents (price, currency, facilitator, asset, network)
  - Happy 3 : GIVEN body 402 reçu WHEN agent lit `fallback` THEN reçoit `https://buy.stripe.com/[link]` pour Stripe Link humain
  - Erreur 1 : GIVEN Coinbase facilitator down WHEN middleware appelé THEN renvoie 503 + retry-after 60s + log Cloudflare
  - Erreur 2 : GIVEN agent envoie payload x402 invalide (signature corrompue) WHEN middleware vérifie THEN 402 re-renvoyé + message "invalid payment signature"
  - Limite 1 : GIVEN agent appelle endpoint inexistant WHEN middleware THEN 404 (pas 402)
  - Limite 2 : GIVEN agent envoie X-PAYMENT pour mauvais endpoint WHEN middleware vérifie THEN 402 + warning "payment mismatch"
  - Permission 1 : GIVEN JWT 24 h actif présent WHEN middleware THEN bypass 402 (auth via JWT)
  - Données existantes 1 : GIVEN agent retry après paiement réussi WHEN re-fetch THEN 200 + payload (paiement déjà settled)

### US-03 : Payer un endpoint en x402 et recevoir le payload pricing

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 + Job 4 — payer pour ground truth
- **Opportunité** : O3
- **Features liées** : F1, F8
- **Dépendances** : US-02
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent signe payload x402 USDC Base WHEN re-appelle `GET /api/llm-prices?model=opus-4.7` avec X-PAYMENT THEN settle < 5 s + 200 + payload JSON
  - Happy 2 : GIVEN payload reçu WHEN agent parse THEN champs requis présents : `model`, `input_per_mtok`, `output_per_mtok`, `dateModified`, `effective_cost_factor`, `sameAs`, `fetched_at`
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie taille THEN < 50 KB (Content-Length header)
  - Erreur 1 : GIVEN signature x402 valide mais wallet insuffisant WHEN settle THEN 402 + body `{"error":"insufficient_funds"}` + retry-after
  - Erreur 2 : GIVEN settle blockchain timeout > 10 s WHEN middleware THEN 504 + retry-after + tx hash partial pour debug
  - Limite 1 : GIVEN agent demande modèle inexistant `?model=fakemodel` WHEN endpoint THEN 404 + body `{"error":"model_not_found","available":[...]}`
  - Limite 2 : GIVEN agent demande sans param `?model=` WHEN endpoint THEN 400 + body `{"error":"model_param_required"}`
  - Permission 1 : GIVEN agent paie 1 endpoint WHEN tente paiement même endpoint 1 sec après THEN 402 (paiement non re-utilisable, 1 tx = 1 payload)
  - Données existantes 1 : GIVEN cron source planté il y a 25 h WHEN agent paie THEN 200 + payload + warning `_warning: "data older than 24h, source unreachable since [timestamp]"`

### US-04 : Vérifier la fraîcheur d'un payload via `dateModified` JSON-LD

- **Persona** : Agent IA autonome
- **JTBD** : Job 1 + Job 5 — citer source machine-vérifiable
- **Opportunité** : O1
- **Features liées** : F3, F4, F6
- **Dépendances** : US-03
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN payload reçu WHEN agent parse JSON-LD `@type: Dataset` THEN `dateModified` ISO 8601 présent
  - Happy 2 : GIVEN payload reçu WHEN agent vérifie diff timestamp (`dateModified` vs now) THEN < 24 h en cas normal (cron 6 h)
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie header HTTP `Last-Modified` THEN aligné avec JSON-LD `dateModified`
  - Erreur 1 : GIVEN cron source en panne 30 h WHEN payload servi THEN `dateModified` reflète panne + champ `_warning` explicite
  - Erreur 2 : GIVEN payload corrompu (parsing JSON-LD échec) WHEN agent vérifie THEN propose retry endpoint avec délai
  - Limite 1 : GIVEN cron exact timestamp WHEN agent vérifie `dateModified` < 1 sec d'écart vs cron log THEN OK
  - Limite 2 : GIVEN multi-payload dans 1 réponse (cas erreur batching) WHEN agent parse THEN détecte format invalide
  - Permission 1 : GIVEN agent veut re-vérifier source WHEN suit `sameAs` URL (ex anthropic.com/pricing) THEN 200 + page officielle
  - Données existantes 1 : GIVEN même endpoint payé 2× consécutif WHEN comparé THEN `dateModified` identique tant que cron pas re-tourné

### US-05 : Recevoir le champ `effective_cost_factor` pour Opus 4.7

- **Persona** : Agent IA autonome
- **JTBD** : Job 4 — estimer coût réel d'opération
- **Opportunité** : O1 (différenciation immédiate vs pricepertoken)
- **Features liées** : F5
- **Dépendances** : US-03
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN agent paie `?model=opus-4.7` WHEN reçoit payload THEN `effective_cost_factor: 1.35` présent (cf. project-context.md ligne 196)
  - Happy 2 : GIVEN agent paie `?model=opus-4.6` ou autre modèle sans inflation tokenizer connue WHEN reçoit payload THEN `effective_cost_factor: 1.0` (par défaut)
  - Happy 3 : GIVEN agent calcule coût réel (input × `input_per_mtok` × `effective_cost_factor`) WHEN génération THEN coût final aligné avec facture Anthropic réelle
  - Erreur 1 : GIVEN modèle absent du registre `effective_cost_factor` (cas nouveau modèle) WHEN endpoint THEN `effective_cost_factor: 1.0` + warning `_warning: "no inflation factor known, defaulting to 1.0"`
  - Erreur 2 : GIVEN champ absent (bug parser) WHEN agent parse THEN considéré 1.0 par défaut côté agent (compat)
  - Limite 1 : GIVEN modèle Opus 4.7 + `effective_cost_factor 1.35` WHEN agent affiche au superviseur THEN affichage explicite "tokenizer inflate +35 %"
  - Limite 2 : GIVEN futur modèle avec factor 0.9 (déflation tokenizer hypothétique) WHEN endpoint THEN servi correctement
  - Permission 1 : N/A (champ public dans payload)
  - Données existantes 1 : GIVEN factor change après update Anthropic WHEN cron met à jour THEN nouveau factor reflété en < 6 h

### US-06 : Consulter le statut d'un SDK npm via `/api/sdk-status`

- **Persona** : Agent IA autonome
- **JTBD** : Job 2 personas.md — détecter breaking change SDK
- **Opportunité** : O1 + O2
- **Features liées** : F2
- **Dépendances** : US-02 (réutilise middleware x402)
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent paie `GET /api/sdk-status?pkg=ai` WHEN endpoint THEN payload `{latest, breaking_since, dateModified, changelog_url, sameAs}`
  - Happy 2 : GIVEN payload `breaking_since` présent WHEN agent compare avec sa version utilisée THEN détecte si version utilisée pré-breaking
  - Happy 3 : GIVEN payload reçu WHEN agent vérifie `sameAs` THEN URL pointe vers GitHub releases ou npm registry officiel
  - Erreur 1 : GIVEN package npm inexistant `?pkg=fakepackage` WHEN endpoint THEN 404 + `{"error":"package_not_found"}`
  - Erreur 2 : GIVEN GitHub rate-limit 429 lors cron WHEN endpoint sert cache stale THEN warning explicite + suggestion retry
  - Limite 1 : GIVEN package monorepo `@scope/pkg` WHEN endpoint THEN URL-encoded correctement
  - Limite 2 : GIVEN package avec 0 release (jamais publié) WHEN endpoint THEN 200 + `{"latest":null,"breaking_since":null,"_note":"no releases yet"}`
  - Permission 1 : Idem US-02/US-03 (x402 ou JWT)
  - Données existantes 1 : GIVEN package mis à jour entre 2 cron WHEN agent paie THEN reçoit version cache (max 24 h stale, signalé)

### US-07 : Suivre `sameAs` pour vérifier la source officielle

- **Persona** : Agent IA autonome
- **JTBD** : Job 5 — citer source machine-vérifiable
- **Opportunité** : O1 (Verifiable)
- **Features liées** : F3 (champ `sameAs` JSON-LD)
- **Dépendances** : US-03 ou US-06
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN payload pricing reçu WHEN agent suit `sameAs` URL (ex `https://www.anthropic.com/pricing`) THEN 200 + page officielle
  - Happy 2 : GIVEN payload SDK reçu WHEN agent suit `sameAs` (npm registry ou GitHub) THEN 200 + données cohérentes avec payload
  - Happy 3 : GIVEN agent compare prix payload DevRefs vs prix page officielle WHEN match THEN confiance haute
  - Erreur 1 : GIVEN page source officielle 404 (ex Anthropic restructure URL) WHEN agent suit `sameAs` THEN détecte 404, signale via support
  - Erreur 2 : GIVEN page source TOS-blocked l'agent WHEN suit `sameAs` THEN agent peut citer URL sans la fetcher (preuve textuelle suffit)
  - Limite 1 : GIVEN `sameAs` pointe vers page modifiée (différent du moment cron) WHEN comparé THEN diff signalé via `_warning` côté DevRefs au cron suivant
  - Limite 2 : GIVEN multi-source pour 1 payload (rare) WHEN payload THEN `sameAs` array avec 2 URLs
  - Permission 1 : GIVEN agent fetch `sameAs` directement WHEN page publique THEN OK (pas de DevRefs auth)
  - Données existantes 1 : GIVEN URL `sameAs` change (Anthropic refait pricing page) WHEN cron suivant THEN nouveau `sameAs` reflété

### US-08 : Découvrir et appeler DevRefs via OpenAPI 3.1 spec

- **Persona** : Agent IA autonome (notamment MCP-host avancé)
- **JTBD** : Job 1 + 2 — discovery automatique des capacités
- **Opportunité** : O2 + O3
- **Features liées** : F18 (OpenAPI 3.1 + extension `x-x402`)
- **Dépendances** : US-01
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN agent fetch `https://devrefs.dev/openapi.json` WHEN parse THEN spec OpenAPI 3.1 valide
  - Happy 2 : GIVEN spec parsée WHEN agent lit `info.x-x402` THEN champs présents `enabled: true, facilitator: coinbase, asset: USDC, network: base`
  - Happy 3 : GIVEN spec parsée WHEN agent lit `paths` THEN 2 paths documentés (`/api/llm-prices`, `/api/sdk-status`) avec exemples `curl`
  - Erreur 1 : GIVEN spec corrompue WHEN agent parse THEN détecte invalid OpenAPI + suggère `llms.txt` fallback
  - Erreur 2 : GIVEN spec retourne 404 (déploiement raté) WHEN agent fetch THEN signal d'erreur explicite + retry
  - Limite 1 : GIVEN spec >= 5 KB (rare) WHEN agent fetch THEN OK (pas de limite stricte)
  - Limite 2 : GIVEN agent supporte uniquement OpenAPI 3.0 (pas 3.1) WHEN parse THEN compat partielle (champs essentiels OK)
  - Permission 1 : GIVEN spec publique WHEN agent fetch THEN 200 sans auth
  - Données existantes 1 : GIVEN nouvelle version OpenAPI déployée WHEN agent re-fetch THEN nouvelle spec avec versioning explicite

---

## Stories — Persona secondaire : Dev humain superviseur

### US-09 : Découvrir DevRefs via la landing publique `/llm-prices`

- **Persona** : Dev humain superviseur
- **JTBD** : Comprendre en 5 secondes l'angle "facture x402 explosive de l'agent"
- **Opportunité** : O4
- **Features liées** : F16 (landing publique)
- **Dépendances** : Aucune (entrée du parcours humain)
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev arrive sur `https://devrefs.dev/llm-prices` WHEN landing rendu THEN < 50 KB total + < 200 ms LCP
  - Happy 2 : GIVEN dev scroll WHEN voit hero THEN bloc démo JSON V1 (anonymisé) visible avec contraste avant/après
  - Happy 3 : GIVEN dev scroll en bas WHEN voit CTAs THEN 2 CTAs visibles (`curl` exemple + Stripe Link)
  - Erreur 1 : GIVEN Cloudflare Pages down WHEN dev fetch THEN page erreur 503 + lien support email
  - Erreur 2 : GIVEN dev sur navigateur sans JS WHEN fetch THEN HTML statique fonctionnel (no-JS friendly)
  - Limite 1 : GIVEN dev sur mobile (375px) WHEN landing rendu THEN responsive sans overflow horizontal
  - Limite 2 : GIVEN dev sur écran 4K WHEN landing rendu THEN max-width respectée (lecture confortable)
  - Permission 1 : GIVEN dev sans cookie ni JWT WHEN visite landing THEN 200 (page publique)
  - Données existantes 1 : GIVEN dev déjà JWT actif WHEN visite landing THEN bouton dashboard apparaît en plus

### US-10 : Cliquer Stripe Payment Link et payer 4,99 €/jour

- **Persona** : Dev humain superviseur
- **JTBD** : Job 1 personas.md — reprendre la main sur la facture x402
- **Opportunité** : O4
- **Features liées** : F9 (Stripe Payment Link), F12 (Stripe Tax)
- **Dépendances** : US-09
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN dev clique CTA Stripe sur landing WHEN redirect THEN page Stripe Checkout `checkout.stripe.com` chargée
  - Happy 2 : GIVEN dev paie 4,99 € carte ou Apple Pay WHEN succès THEN redirect `https://devrefs.dev/dashboard?token=JWT`
  - Happy 3 : GIVEN dev en UE B2C WHEN paie THEN Stripe Tax applique TVA française (OSS) automatiquement (cf. @legal H4)
  - Erreur 1 : GIVEN paiement carte refusé WHEN Stripe THEN reste sur Stripe page + message clair + retry
  - Erreur 2 : GIVEN webhook Stripe ne reach pas DevRefs Worker WHEN dev redirect THEN page erreur "JWT generation failed, contact support" + email
  - Limite 1 : GIVEN dev déjà JWT actif valide 12 h restantes WHEN paie nouveau Stripe THEN nouveau JWT remplace l'ancien (24 h fresh)
  - Limite 2 : GIVEN dev 100+ paiements Stripe consécutifs WHEN webhook THEN OK (pas de rate-limit Stripe)
  - Permission 1 : GIVEN dev refuse cookie consent Stripe WHEN page Stripe THEN Stripe gère son propre flow
  - Données existantes 1 : GIVEN dev a déjà customer_id Stripe (ancien paiement) WHEN re-paie THEN même customer_id réutilisé (Stripe garde l'historique)

### US-11 : Récupérer JWT 24 h post-Stripe et le configurer dans son agent

- **Persona** : Dev humain superviseur
- **JTBD** : Configurer agent pour utiliser JWT au lieu de x402
- **Opportunité** : O4
- **Features liées** : F10 (JWT HMAC 24 h), F11 (cookie Secure)
- **Dépendances** : US-10
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev redirect post-Stripe sur `/dashboard?token=JWT` WHEN page rendu THEN JWT visible + bouton "copier"
  - Happy 2 : GIVEN dev copie JWT WHEN colle dans agent config (`Authorization: Bearer JWT`) THEN agent skip x402 et reçoit 200 directement
  - Happy 3 : GIVEN JWT décodable WHEN dev inspect (jwt.io) THEN claims `exp` à +24 h, `aud: devrefs.dev`, signature HMAC vérifiable
  - Erreur 1 : GIVEN JWT expiré (24 h passées) WHEN agent tente call avec JWT THEN 401 + body explicite "JWT expired, re-pay Stripe Link"
  - Erreur 2 : GIVEN JWT forgé manuellement WHEN agent tente THEN 401 + log Cloudflare suspicieux + alerte interne
  - Limite 1 : GIVEN dev clique copy JWT 100 fois WHEN copy buffer THEN OK (juste copy)
  - Limite 2 : GIVEN dev sur navigateur sans Clipboard API WHEN copy THEN fallback select + Cmd+C manuel
  - Permission 1 : GIVEN cookie `Secure;HttpOnly;SameSite=Strict` posé WHEN dev re-visite `/dashboard` même session THEN reconnu sans re-saisie
  - Données existantes 1 : GIVEN dev avait JWT précédent expiré WHEN nouveau JWT généré THEN ancien définitivement invalide (pas de prolongation)

### US-12 : Consulter le dashboard interne (queries 24 h, coût total)

- **Persona** : Dev humain superviseur
- **JTBD** : Job 2 personas.md — auditer les coûts cumulés
- **Opportunité** : O4
- **Features liées** : F26 (page `/dashboard?token=JWT`)
- **Dépendances** : US-11
- **Effort** : M
- **Critères acceptance** :
  - Happy 1 : GIVEN dev avec JWT actif visite `/dashboard?token=JWT` WHEN page rendu THEN affiche : nb queries 24 h, coût total, JWT expiry countdown
  - Happy 2 : GIVEN dev consulte sur mobile WHEN page rendu THEN responsive sans overflow
  - Happy 3 : GIVEN dev refresh page WHEN re-fetch THEN données < 1 min de fraîcheur (cache CF court)
  - Erreur 1 : GIVEN JWT expiré WHEN visite `/dashboard?token=JWT` THEN 401 + redirect landing avec message "JWT expired"
  - Erreur 2 : GIVEN JWT invalide (typo) WHEN visite THEN 401 + suggestion paiement Stripe
  - Limite 1 : GIVEN dev avec 0 queries effectuées WHEN page rendu THEN affiche "0 queries — `curl ...` pour commencer"
  - Limite 2 : GIVEN dev avec 10 000 queries (rate-limit max) WHEN affiche THEN compteur exact + warning rate-limit fair-use
  - Permission 1 : GIVEN visiteur sans token WHEN visite `/dashboard` THEN 401 + redirect landing
  - Données existantes 1 : GIVEN dev avait dashboard ouvert et JWT expire pendant session WHEN refresh THEN 401 immédiat (pas de page périmée)

### US-13 : Consulter les CGV / Privacy / Mentions légales

- **Persona** : Dev humain superviseur (et agent IA pour conformité aval)
- **JTBD** : Vérifier conformité juridique avant abonnement
- **Opportunité** : Conformité (cf. @legal)
- **Features liées** : F21, F22, F23
- **Dépendances** : Aucune
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN dev clique footer link "/legal/cgv" WHEN page rendu THEN intégration draft @legal cgu-draft.md complète
  - Happy 2 : GIVEN dev clique "/legal/privacy" WHEN page rendu THEN intégration draft @legal privacy-policy.md complète
  - Happy 3 : GIVEN dev clique "/legal/mentions-legales" WHEN page rendu THEN identification éditeur + SIREN + APE + hébergeur Cloudflare visibles
  - Erreur 1 : GIVEN page legal 404 WHEN visite THEN page erreur custom + lien retour landing
  - Erreur 2 : GIVEN page legal corrompue (renderer down) WHEN visite THEN fallback texte brut
  - Limite 1 : GIVEN dev imprime page CGV WHEN print stylesheet THEN lisible (pas de couleur foncée fond clair)
  - Limite 2 : GIVEN page legal > 50 KB (acceptable, pas hero) WHEN rendu THEN load OK
  - Permission 1 : GIVEN visiteur sans cookie WHEN visite pages legal THEN 200 sans auth
  - Données existantes 1 : GIVEN page legal mise à jour (changement CGV) WHEN dev re-visite THEN nouvelle version + date dernière modif visible

### US-14 : Consulter `/about/data-sources` pour vérifier la provenance

- **Persona** : Dev humain superviseur (et agent IA pour conformité)
- **JTBD** : Vérifier transparence provenance avant achat
- **Opportunité** : O1 (Verifiable) + Conformité aval EU AI Act (cf. @legal § 3.2)
- **Features liées** : F19
- **Dépendances** : Aucune
- **Effort** : S
- **Critères acceptance** :
  - Happy 1 : GIVEN dev clique footer "/about/data-sources" WHEN page rendu THEN liste sources : anthropic.com/pricing, openai.com/api/pricing, google ai pricing, mistral.ai/pricing, npm registry, GitHub releases
  - Happy 2 : GIVEN page rendue WHEN dev lit méthode vérification THEN explication cron 6 h LLM / 24 h SDK + parser regex stable
  - Happy 3 : GIVEN page rendue WHEN dev cherche User-Agent bot WHEN trouve `DevRefs-Bot/1.0 (+https://devrefs.dev/bot)` mentionné
  - Erreur 1 : GIVEN page 404 WHEN visite THEN 404 custom
  - Erreur 2 : GIVEN page corrompue WHEN visite THEN fallback texte brut
  - Limite 1 : GIVEN page < 50 KB WHEN rendu THEN OK
  - Limite 2 : GIVEN page imprimable WHEN print THEN lisible
  - Permission 1 : GIVEN visiteur public WHEN visite THEN 200 sans auth
  - Données existantes 1 : GIVEN nouvelle source ajoutée (V2) WHEN page mise à jour THEN sources reflètent

### US-15 : Consulter le dashboard interne consolidé (Thomas only)

- **Persona** : Dev humain superviseur — Thomas (admin owner)
- **JTBD** : Pilotage KPI North Star + diagnostic Phase 4
- **Opportunité** : O4 (mesure pilotage)
- **Features liées** : F25 (dashboard interne consolidé CF Analytics + Coinbase + Stripe)
- **Dépendances** : Aucune (admin only)
- **Effort** : L
- **Critères acceptance** :
  - Happy 1 : GIVEN Thomas avec admin JWT (long-lived ou IP whitelist) visite `/admin/dashboard` WHEN page rendu THEN affiche : revenu net mensuel, paiements x402 24h, JWT actifs, latence p95, sources cron status
  - Happy 2 : GIVEN Thomas consulte WHEN page agrège CF Analytics + Coinbase + Stripe THEN données < 5 min fresh
  - Happy 3 : GIVEN Thomas mobile WHEN page rendu THEN responsive
  - Erreur 1 : GIVEN admin JWT expiré WHEN visite THEN 401 + IP whitelist fallback ou re-auth
  - Erreur 2 : GIVEN une des 3 sources data (CF, Coinbase, Stripe) down WHEN page THEN les 2 autres affichées + warning explicite source down
  - Limite 1 : GIVEN volume données 30 jours WHEN aggregation THEN OK perfo (Worker CPU < 50 ms)
  - Limite 2 : GIVEN volume 6 mois WHEN aggregation THEN OK ou pagination explicite
  - Permission 1 : GIVEN visiteur non-admin WHEN visite `/admin/dashboard` THEN 403 (pas 401 — masquer existence)
  - Données existantes 1 : GIVEN cron source planté il y a 2 h WHEN Thomas dashboard THEN warning rouge visible

---

## 6. Mapping stories ↔ features V1 (vérification couverture)

| Feature V1 | User stories couvrant |
|---|---|
| F1 — `/api/llm-prices` | US-03, US-04, US-05, US-07 |
| F2 — `/api/sdk-status` | US-06 |
| F3 — JSON-LD `Dataset` + `dateModified` + `sameAs` | US-04, US-07 |
| F4 — Header `Last-Modified` | US-04 |
| F5 — `effective_cost_factor` | US-05 |
| F6 — Cron sources | US-04 (indirect via fraîcheur), backend |
| F7 — IndexNow Bing | Backend (pas de story user direct) |
| F8 — Middleware x402 | US-02, US-03, US-06 |
| F9 — Stripe Payment Link | US-10 |
| F10 — JWT HMAC 24 h | US-11 |
| F11 — Cookie Secure JWT | US-11 |
| F12 — Stripe Tax | US-10 |
| F13 — Watermark HMAC `_signature` | Backend (vérifié US-03 via présence dans payload) |
| F14 — Rate-limit | US-12 limites (compteur visible) |
| F15 — `llms.txt` | US-01 |
| F16 — Landing publique | US-09 |
| F17 — Sitemap.xml + robots.txt | Backend SEO/GEO |
| F18 — OpenAPI 3.1 | US-08 |
| F19 — `/about/data-sources` | US-14 |
| F20 — `/about/data-schema` | (Backend doc, pas de story user direct — couvert dans Phase 1 functional-specs) |
| F21 — `/legal/cgv` | US-13 |
| F22 — `/legal/privacy` | US-13 |
| F23 — `/legal/mentions-legales` | US-13 |
| F24 — `/bot` | US-14 (mentionné dans data-sources) |
| F25 — Dashboard interne consolidé | US-15 |
| F26 — `/dashboard?token=JWT` | US-12 |

**Couverture** : 100 % des features ayant un parcours user direct sont couvertes par >= 1 user story. F7, F13, F17, F20 sont des features backend/SEO sans story user directe — couvertes en Phase 1 functional-specs comme stories techniques.

---

## 7. Stories Phase 4 (post-launch — flags pour @sales-enablement et @growth)

À expanser en Phase 4. Format ultra-allégé ici car ce sont des prompts pour ces agents :

| ID | Owner | Titre | Effort |
|---|---|---|---|
| US-16 (Phase 4) | @sales-enablement | Playbook commercial post-launch (relance prospects ayant cliqué Stripe sans conclure) | M |
| US-17 (Phase 4) | @sales-enablement | ROI calculator humain superviseur (break-even x402 → Stripe Link) | M |
| US-18 (Phase 4) | @growth | Data story earned media : "Opus 4.7 +35 % tokenizer" | M |
| US-19 (Phase 4) | @growth | Data story earned media : "Top 10 SDKs avec breaking changes Q1-Q2 2026" | M |

---

## 8. Synthèse pour v1-scope.md (handoff)

| Élément | Décision |
|---|---|
| **Nb user stories V1** | 15 (US-01 à US-15) + 4 stories Phase 4 (US-16 à US-19) |
| **Personas couverts** | Agent IA (US-01 à US-08) + Dev humain superviseur (US-09 à US-15) |
| **Critères Given/When/Then** | 9 minimum par story (3 happy + 2 erreur + 2 limites + 1 permission + 1 données existantes) |
| **Couverture features V1** | 100 % features avec parcours user direct couvertes |
| **Specs détaillées** | Format allégé Phase 0 — specs complètes (5 états UI, payloads JSON exhaustifs) en Phase 1 functional-specs |
| **Specs Phase 4** | 4 stories taggées owner @sales-enablement et @growth |

---

## Handoff → @product-manager (étape suivante : v1-scope.md)

- **Fichier produit** : `/home/user/AI-agents-platform/docs/product/backlog.md`
- **Décisions prises** : 15 user stories V1 + 4 stories Phase 4 + mapping 100 % features.
- **Points d'attention** :
  - Format allégé Phase 0 — Phase 1 produira les specs complètes (5 états UI, payloads JSON, scénarios persona).
  - Stories Phase 4 (US-16 à US-19) sont des flags explicites pour @sales-enablement et @growth (cf. prompt mission).
  - F7, F13, F17, F20 = features backend sans story user directe, à transformer en stories techniques Phase 1.
- **Aucune action Replit requise**.
