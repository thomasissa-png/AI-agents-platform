<!-- Version: 2026-05-05T13:50 — @ia — Phase 0 v2 — Spec 4 endpoint /api/agent-audit (Offre 2) -->

# Agent Audit Spec — DevRefs

## Résumé exécutif

- **Objectif** : spec exhaustive de l'endpoint `POST /api/agent-audit` (Offre 2) : input/output JSON, 5 heuristiques d'audit V1 chiffrables, faisabilité tech zéro IA runtime sur Cloudflare Worker.
- **Décisions clés** :
  1. **Audit 100% statique heuristique** — zéro IA runtime, pure analyse de config + sample traces sur Worker. Coût infra ~$0.0001/audit, marge ~99%.
  2. **5 heuristiques V1** : (a) model downgrade par task complexity, (b) prompt caching activation, (c) batch parallélisation, (d) tool description trimming, (e) effort level mismatch.
  3. **Output JSON structuré** : score 0-100 + monthly cost current/optimized + savings_pct + recommendations[] avec patch JSON Schema-validable + auto_applicable flag.
  4. **Limite input** : 100 KB max (évite abus + cohérence avec spec project-context.md ligne agent-audit pitch précédent).
- **Sources** : spec brand-platform + economics § B + ia.md règles agentic patterns + Anthropic prompt caching docs (mai 2026).

---

## 1. Endpoint

```
POST /api/agent-audit
Content-Type: application/json
Authorization: x402 (response 402) → retry avec X-PAYMENT
Max input size: 100 KB
```

**Pricing** : $9.99 USDC one-shot ou $49 Pack Pro (6 audits) ou $29/mois Subscription Pro V2 (cf. `agent-economics.md` § C).

---

## 2. Input JSON Schema

```json
{
  "agent_config": {
    "framework": "claude-code | cursor | agentkit | mastra | mcp-host | custom-py | custom-ts",
    "models_used": [
      {"name": "claude-opus-4-7", "share_pct": 40, "default_effort": "high"},
      {"name": "claude-sonnet-4-6", "share_pct": 40, "default_effort": "medium"},
      {"name": "claude-haiku-4-5", "share_pct": 20, "default_effort": "low"}
    ],
    "system_prompts": [
      {"id": "main_orchestrator", "tokens": 1850, "cached": false},
      {"id": "code_review_subagent", "tokens": 950, "cached": false}
    ],
    "tools": [
      {"name": "read_file", "description_tokens": 120},
      {"name": "edit_file", "description_tokens": 540},
      {"name": "search_web", "description_tokens": 720}
    ],
    "batch_eligible_workloads_pct": 30,
    "request_pattern": "interactive | batch | mixed"
  },
  "sample_traces": [
    {
      "task_complexity": "simple | medium | complex",
      "model_used": "claude-opus-4-7",
      "input_tokens": 1450,
      "output_tokens": 320,
      "effort_level": "high",
      "tool_calls_count": 2,
      "duration_ms": 4200
    }
  ],
  "monthly_volume_estimate": 10000000
}
```

### 2.1 Validation input (côté Worker, avant 402)

| Champ | Validation | Action si invalide |
|---|---|---|
| `agent_config.models_used[].share_pct` | Somme = 100 ± 1 | HTTP 400 `INVALID_MODEL_SHARE` |
| `monthly_volume_estimate` | Number > 0 | HTTP 400 `INVALID_VOLUME` |
| `monthly_volume_estimate < 5_000_000` | Si oui → message warning dans 402 body | HTTP 402 avec `roi_warning: "audit recommended for agents > 5M tokens/month"` |
| `sample_traces[].length` | Min 3, max 50 | HTTP 400 `SAMPLE_TRACES_OUT_OF_RANGE` |
| Total payload size | <= 100 KB | HTTP 413 `PAYLOAD_TOO_LARGE` |

---

## 3. Output JSON Schema

```json
{
  "audit_id": "aud_2026-05-05_a3f8b2",
  "score": 62,
  "scoring_breakdown": {
    "model_efficiency": 18,
    "caching_usage": 5,
    "batching_usage": 12,
    "tool_overhead": 14,
    "effort_calibration": 13
  },
  "monthly_cost_current_usd": 90.20,
  "monthly_cost_optimized_usd": 53.80,
  "savings_pct": 40.4,
  "savings_usd_per_month": 36.40,
  "annualized_savings_usd": 436.80,
  "recommendations": [
    {
      "id": "MODEL_DOWNGRADE_SIMPLE_TASKS",
      "severity": "high",
      "delta_usd_month": 18.40,
      "confidence": 0.85,
      "auto_applicable": true,
      "summary": "32% of your sample tasks classified 'simple' use Opus 4.7. Recommend Haiku 4.5 for these.",
      "evidence": {
        "matched_traces_count": 8,
        "complexity_distribution": {"simple": 32, "medium": 41, "complex": 27}
      },
      "patch": {
        "op": "modify_routing_rule",
        "rule_id": "default_model",
        "from": {"task_complexity": "simple", "model": "claude-opus-4-7"},
        "to": {"task_complexity": "simple", "model": "claude-haiku-4-5"}
      }
    },
    {
      "id": "ENABLE_PROMPT_CACHING_SYSTEM_PROMPTS",
      "severity": "high",
      "delta_usd_month": 12.50,
      "confidence": 0.95,
      "auto_applicable": true,
      "summary": "2 system prompts > 1024 tokens are not cached. Anthropic prompt caching reduces cached input cost 90%.",
      "evidence": {
        "uncached_prompts": [{"id": "main_orchestrator", "tokens": 1850}, {"id": "code_review_subagent", "tokens": 950}],
        "estimated_cache_hit_rate": 0.78
      },
      "patch": {
        "op": "enable_caching",
        "targets": ["main_orchestrator", "code_review_subagent"],
        "snippet_typescript": "anthropic.messages.create({ system: [{type:'text', text: SYSTEM_PROMPT, cache_control: {type:'ephemeral'}}], ... })"
      }
    },
    {
      "id": "BATCH_PARALLELIZATION_ASYNC_WORKLOAD",
      "severity": "medium",
      "delta_usd_month": 4.20,
      "confidence": 0.70,
      "auto_applicable": false,
      "summary": "30% of workload tagged batch_eligible but uses interactive API. Anthropic Batch API = 50% off.",
      "evidence": {"batch_eligible_pct": 30, "current_using_batch_pct": 0},
      "patch": {
        "op": "migrate_to_batch_api",
        "endpoint": "POST /v1/messages/batches",
        "manual_review_required": true,
        "doc": "https://docs.anthropic.com/en/api/creating-message-batches"
      }
    },
    {
      "id": "TOOL_DESCRIPTION_TRIMMING",
      "severity": "low",
      "delta_usd_month": 0.80,
      "confidence": 0.60,
      "auto_applicable": true,
      "summary": "Tool 'search_web' has 720 tokens of description. Recommend trim to <250 tokens.",
      "evidence": {"tool": "search_web", "current_tokens": 720, "recommended_max": 250, "input_token_overhead_per_call": 720},
      "patch": {
        "op": "trim_tool_description",
        "tool": "search_web",
        "current_length": 720,
        "target_length": 250,
        "trimming_strategy": "remove_examples_keep_signature"
      }
    },
    {
      "id": "EFFORT_LEVEL_MISMATCH",
      "severity": "medium",
      "delta_usd_month": 0.50,
      "confidence": 0.65,
      "auto_applicable": true,
      "summary": "Opus 4.7 used with effort=high on 47% of simple tasks. Recommend effort=low for simple tasks.",
      "evidence": {"opus_high_on_simple_pct": 47, "estimated_token_inflation_pct": 18},
      "patch": {
        "op": "set_effort_by_complexity",
        "rules": [{"complexity": "simple", "effort": "low"}, {"complexity": "complex", "effort": "high"}]
      }
    }
  ],
  "audit_metadata": {
    "engine_version": "1.0",
    "heuristics_applied": 5,
    "audit_duration_ms": 320,
    "date_modified": "2026-05-05T13:50:00Z"
  },
  "_signature": "[HMAC anti-redistribution F13]",
  "guarantee": "If your post-implementation savings_pct < 15% within 30 days, request 50% refund per CGV."
}
```

---

## 4. Score 0-100 — formule

```
score = 100 - (
  model_efficiency_loss   // 0-30 points
  + caching_loss          // 0-15 points
  + batching_loss         // 0-15 points
  + tool_overhead_loss    // 0-20 points
  + effort_calibration_loss  // 0-20 points
)
```

| Composante | Détection | Pénalité max |
|---|---|---|
| `model_efficiency_loss` | % tâches simples sur Opus + % tâches complexes sur Haiku | 30 |
| `caching_loss` | system prompts > 1024 tokens non cachés × hit rate estimé | 15 |
| `batching_loss` | `batch_eligible_pct` non utilisé via Batch API | 15 |
| `tool_overhead_loss` | somme `description_tokens` > 1500 cumulés | 20 |
| `effort_calibration_loss` | mismatch effort vs complexité (xhigh sur simple, low sur complex) | 20 |

**Interprétation score** :
- 90-100 : agent quasi-optimal, audit peu rentable (refund 50% probable)
- 70-89 : marges 10-20% possibles
- 50-69 : marges 30-40% (zone target persona DevRefs)
- 0-49 : marges 50%+ (gros gain potentiel)

---

## 5. 5 Heuristiques d'audit V1 — algo de détection

### 5.1 Model downgrade par task complexity

**Algo** :
```
1. Pour chaque sample_trace, calculer complexity_score :
   - Heuristique : duration_ms < 2000 ET output_tokens < 500 ET tool_calls_count <= 2 → "simple"
   - duration_ms > 5000 OR output_tokens > 1500 OR tool_calls_count > 4 → "complex"
   - sinon "medium"
2. Calculer share : nb traces simple sur Opus / total sur Opus
3. Si share > 25% → recommend Haiku/Sonnet pour ces tâches
4. Économie = share × monthly_volume × ($0.00475 par 1K tokens diff Opus → Haiku)
```

**Économie typique** : **25-40%** sur la part Opus mal calibrée.

### 5.2 Prompt caching activation

**Algo** :
```
1. Pour chaque system_prompt :
   - Si tokens > 1024 ET cached == false → candidate
2. Estimer hit_rate basé sur request_pattern :
   - "interactive" → 0.6 (sessions répétées)
   - "batch" → 0.3 (one-shot souvent)
   - "mixed" → 0.5
3. Économie = tokens × hit_rate × 0.9 × cost_per_token
```

**Économie typique** : **10-25%** sur le sous-set cacheable. Source : Anthropic docs prompt caching (90% off cached input cost).

### 5.3 Batch parallélisation

**Algo** :
```
1. Lire agent_config.batch_eligible_workloads_pct
2. Si > 0 ET request_pattern != "batch" → opportunity
3. Économie = batch_eligible_pct × monthly_cost_total × 0.5 (Batch API = 50% off)
```

**Économie typique** : **50%** sur le sous-set batchable. Source : Anthropic Batch API doc.

### 5.4 Tool description trimming

**Algo** :
```
1. Pour chaque tool dans agent_config.tools :
   - Si description_tokens > 250 → candidate
2. Calculer overhead total = somme tokens > 250 par tool × call_frequency_estimate
3. Trim recommendation : signature only, retirer exemples (cf. règle ia.md mood sentence + technique)
4. Économie = overhead × cost_per_token input
```

**Économie typique** : **5-10%** sur tools verbose. Critique pour agents avec 10+ tools.

### 5.5 Effort level mismatch

**Algo** :
```
1. Pour chaque sample_trace :
   - Calculer complexity (cf. 5.1)
   - Comparer effort_level utilisé
   - Mismatch : effort=xhigh sur simple, effort=low sur complex
2. Token inflation estimate : effort=xhigh inflate ~30% tokens reasoning vs medium
3. Économie = % mismatch × inflation × cost_per_token
```

**Économie typique** : **10-20%** sur agents qui utilisent xhigh par défaut. Source : ia.md règle effort levels API Claude (Opus 4.7+).

---

## 6. Faisabilité technique sur Cloudflare Worker

### 6.1 Architecture

```
POST /api/agent-audit
  ↓
Worker handler:
  1. Parse + validate input (max 100 KB)
  2. x402 middleware (HTTP 402 si pas paiement)
  3. Si payé → run 5 heuristics in-memory (zéro IA runtime, pure JS)
  4. Compose output JSON
  5. Sign HMAC + return 200
```

**Zéro dépendance externe runtime** :
- Pas de LLM call
- Pas de DB query (sauf KV pour validation paiement x402)
- Pure analyse de l'input fourni par l'agent

### 6.2 Coût infra par audit

| Ressource | Coût |
|---|---|
| CF Worker request (10 ms compute) | $0.000005 |
| CF Workers Analytics Engine event | $0 (free tier 100K/jour) |
| KV read (validation x402) | $0 (free tier) |
| Coinbase facilitator x402 fee | $0.00001 |
| **Total infra par audit** | **~$0.00002** |

### 6.3 Marge

| Pricing | Coût | Marge brute |
|---|---|---|
| One-shot $9.99 | $0.00002 | **99.99998%** |
| Pack Pro $49 / 6 audits = $8.17/audit | $0.00002 | 99.99975% |
| Subscription $29/mois (illimité, cap 100/mois) | $0.002 | 99.99% |

### 6.4 Latence cible

- p50 : 150 ms (parsing + 5 heuristics + sign)
- p95 : 320 ms
- p99 : 600 ms (cas input proche limite 100 KB)

Cohérent avec contrainte project-context.md "Latence endpoint cible < 200 ms p95" — l'audit étant un endpoint plus complexe, dérogation à 320 ms p95 acceptable, à confirmer @data-analyst.

---

## 7. Évolutions V2 (out-of-scope V1)

| Feature V2 | Raison report |
|---|---|
| 10+ heuristiques additionnelles (ex: PII detection in prompts, jailbreak risk) | Hypothèse non testée — V1 mesure si 5 heuristiques chiffrables suffisent |
| Audit dynamique avec LLM-as-judge (audit IA utilisant un LLM) | Coûte ~$0.10-$0.50 par audit en tokens IA → casse la marge 99% |
| Auto-apply patches via webhook agent | Hypothèse non testée — risque sécurité (l'agent doit valider ses patches manuellement) |
| Comparaison historique (audit T+1 vs T) | Dépend retour utilisateur V1 (besoin de mémorisation cross-audit avec auth wallet) |
| Multi-language support output (JA/ZH/ES) | Pas de signal demande V1 |

---

## Hypothèses faites

- [HYPOTHÈSE H12] : seuil "task simple" duration < 2000 ms ET output < 500 tokens — heuristique calibrée sur sample dev community 2026, à raffiner via dataset audit réel post-V1.
- [HYPOTHÈSE H13] : Anthropic Batch API maintient 50% off mai 2026 (confirmé WebSearch finout.io 2026).
- [HYPOTHÈSE H14] : `effort=xhigh` inflate ~30% tokens reasoning. Estimation à raffiner via WebSearch ou benchmark Anthropic — pas de doc publique exacte 2026.
- [HYPOTHÈSE H15] : input JSON 100 KB max suffit pour décrire un agent (config + 50 sample traces). À monitor : si users demandent 200+ traces, augmenter cap V2.

---

## Handoff @ia → @orchestrator (Spec 4)

- Statut : COMPLETE
- Endpoint `POST /api/agent-audit` spec exhaustive : input JSON, output JSON, 5 heuristiques chiffrables, faisabilité Worker $0.00002/audit
- Marge brute 99%+ sur all pricing tiers
- Zéro IA runtime — heuristiques pures JS
- Recommendations avec `patch` JSON Schema-validable + `auto_applicable` flag pour future intégration agent
- Garantie ROI dans output : "if savings_pct < 15% within 30 days → 50% refund per CGV"
- 5 features V2 reportées avec raison
- À valider par @qa : test 3 inputs réalistes (agent solo dev, agent prod scale, agent mal calibré) avant Phase 1 build
