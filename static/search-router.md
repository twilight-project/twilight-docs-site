# Twilight mining — Search router

Slot 3. One API that fans a query across nine web indexes and returns every candidate with the winner marked; every verified search, with the trajectory that led to it, earns a share of the Slot's epoch reward.

## The search router (Slot 3)

The search router is one API that fans a query out across nine web indexes at once, scores and ranks the candidates, and returns all of them with the winner marked. Agents get better search than any single index gives; the router gets the *trajectories* it learns to route from; the person running the agent gets paid. It is Slot 3 on the Twilight chain, and the first Slot open to participants.

This page is the Slot: what a search does, what travels with it, how the Slot verifies searches and turns its share of each epoch's emission into payouts, and the router's API. Installing the client, enrolling, epochs, wallets and the chain itself are common to every Slot and live on the [Twilight page](https://docs.twilight.org/twilight.md).

> **Devnet preview.** The router runs on `twilight-devnet-3` as Slot 3. Rewards are devnet tokens, tiers and limits are the devnet's, and some guarantees are stated as *declared, not proven* where the spec says so. Nothing on this page is a mainnet promise.

| What | Today (devnet) |
| --- | --- |
| Slot | 3, registered at genesis; operator: the search router operator |
| Provider | the router at `https://router-api.nyks.dev`; accounts, keys and traces on `https://platform.nyks.dev` |
| Authorization server | MINIS at `https://minis.nyks.dev` |
| Work unit | one search through the router with an `sr-` key, verified by the authorization server from metadata only |
| Trajectory | the trace envelope a search carries: hashed lineage ids and the assistant text before the search. Optional; see [Trajectories](#trajectories) |
| Fan-out | nine indexes behind eight arms on the balanced tier; every candidate returned, one chosen |
| Reward | an equal split of Slot 3's share of the epoch's emission among everyone with at least one verified search in the epoch |

> **Giving these docs to an agent?** The Markdown version of this page is `https://docs.twilight.org/search-router.md`; the Twilight page is `https://docs.twilight.org/twilight.md`; the agent skill is `https://docs.twilight.org/skill.md`; a JSON index is at `https://docs.twilight.org/manifest.json`.

## How a search becomes a reward

Six things happen around one search. Only the first and last involve you.

1. **Your agent searches.** It runs `dropin-miner search "<query>"` because the installed skill tells it to. The command sends the query to the router with your `sr-` API key and a small *trace*: hashed session ids and the assistant text that led to the search.
2. **The router fans out.** Slot 3 sends the query to every index in its default set, scores the answers (citations, agreement between indexes, recency), ranks them, and returns all candidates with one chosen. It stores the request as a trace and writes a metadata-only *verification row* for the authorization server: which key searched, when, what it cost. Never the query text.
3. **The miner records it.** `search` writes an intake record on disk and starts a short, detached *flush*. Nothing runs between searches.
4. **The flush talks to the AS.** It joins the target epoch if you are not in it yet, promotes intake records into observations, and submits them. The AS answers with a signed receipt per epoch.
5. **The AS verifies.** It matches your observations against the router's verification rows. A match is a *verified observation*. One per epoch makes you a candidate for that epoch's draw.
6. **The epoch settles.** When the epoch closes, the AS runs the draw over the candidate set and pays the pot to the eligible participants' declared payout addresses on the chain.

| Where | What it holds about you | What it never sees |
| --- | --- | --- |
| The router (Slot 3) | your API key's id, the query, the results, the trace envelope, cost and latency | your wallet key, your recovery phrase, your enrollment secrets |
| The authorization server | your installation's identity, epoch joins, receipts, verification metadata (key id, time, cost, request id) | the query text, the results, the trace |
| The chain | your payout address and what it was paid | everything else |
| Your machine | everything: keys, wallet, intake, spool, receipts, a per-workspace lineage file | — |

Steps 3 to 6 are the client and the authorization server, the same for any Slot: [how work becomes a reward](./#how), [the authorization server](./#minis), [the protocol](./#protocol). The rest of this page is steps 1 and 2, and what the Slot does with them.

## Searching

The exact command the skill teaches, with the config path filled in at install:

```
"/…/.tokendrop/bin/dropin-miner" search -config "/…/.tokendrop/tokendrop.toml" -format model "<query>"
```

`-format model` prints one block per index, the chosen one first: an answer when an index gave one, then numbered results with URL, title and snippet. `-format json` prints the router's full response. `-tier fast` asks for the cheap tier; leave it off for the balanced default. The command is part of the client; installing it and connecting your agents is on the [Twilight page](./#agents).

```
search 01a07aa6-…  8 candidates

[you] (chosen) retrieval
  1. https://apla.readthedocs.io/…/consensus.html — Proof-of-Authority consensus
     This section describes Proof-of-Authority consensus and its implementation…
  2. https://ethereum.org/developers/docs/consensus-mechanisms/poa — Proof-of-authority (PoA)
     …

[exa] retrieval
  1. https://ethereum.org/developers/docs/consensus-mechanisms/poa — Proof-of-authority (PoA)
  …
```

### What a search fans out to

The default set on devnet is nine indexes behind eight arms, all reached through one upstream aggregator so the Slot pays one bill at pass-through rates: Exa, Tavily, Linkup, Brave, You.com, Parallel, SerpAPI (Google), and a pinned pair the Slot has no other adapter for, Ceramic and Seltz. SerpAPI rides the *slow lane*: it is dispatched with every search but not waited for, and its results land on the stored trace afterwards, so the response is bounded by the fast arms at roughly three seconds.

The response carries the router's reasoning, not just results: a per-index *referee* score (citations, distinct domains, dead links, recency), a *consensus* block (how many domains the indexes agreed on), the ranking, and a *decision* block recording which set was chosen and why. See the [API reference](#api) for every field.

### Your API key

The `sr-` key is the router's credential: the platform issues one per project, the router meters every search against it, and the verification row names its id. A search takes its key from `TOKENDROP_API_KEY` if set, else from the file `login` wrote, else from `OPENAI_API_KEY`. `login` reads the key from the terminal (never an argument), verifies it with a zero-spend probe, and writes `~/.tokendrop/credentials.json` owner-only; it is refused if it is a symlink or readable by others.

```
dropin-miner login            # paste the key; echo is off
dropin-miner login -show      # where a search would get its key, masked
dropin-miner login -forget
```

> Use a key from the **same account you enrolled with**. The verification row carries the user who created the key, and the authorization server compares that user with your enrollment. A key from a different account returns a clean 200 and earns nothing, with no error anywhere; `dropin-miner doctor` is how you catch it.

## Trajectories: what travels with a search

A trajectory is a search plus the context that produced it: which task it belongs to, which searches came before it, and what the agent was thinking when it decided to search. That is what the router learns to route from. Which arm wins for which kind of query, when a follow-up is a reformulation, what gets fetched and cited afterwards: none of it is visible in a lone query string, all of it is visible in a trajectory. The router stores each search as a trace; the trajectory is the part of the trace the client contributes.

Each search carries a small `trace` beside the query so the router can group one task's searches: hashed session and turn identifiers (your agent's real ids never leave the machine), a call counter, a context-window generation, and the assistant text just before the search, capped at 32 KB. That text is conversation content leaving your machine; it goes only inside the search request, to the router, and the miner stores none of it beyond a per-workspace lineage file under `~/.tokendrop/sessions` that the hooks maintain. The exact shape is the [trace envelope](#envelope).

```
export TOKENDROP_TRACE=off      # send no trace at all; searches earn exactly the same
```

- The query itself rides in the command's arguments, so it is visible in `ps` and your shell history on your own machine. It is not a credential.
- The API key never goes on a command line, into an agent's config, or into the trace. It lives in the environment or the owner-only credentials file.
- The assistant text is sent as it is today. Redaction of secret shapes (API keys, bearer tokens, private keys) before it leaves the machine is in review and will ship in the next client release.
- Turning the trace off stops the wire; the hooks still maintain the on-disk lineage file under `~/.tokendrop/sessions`, which never leaves the machine.
- If the router ever rejects a trace, the search is retried once without it. A trace never costs a search.
- The trace is never sent to a provider. It is stored with the request as `client_trace` and shown back to you, and only you, at `GET /v1/traces/{id}`.
- The router keeps traces for 30 days by default; a tenant on zero-retention keeps no response content.

Two more signals close the loop after a search. `session_id` on the request threads queries, and a similar follow-up within five minutes is recorded as a reformulation. `POST /v1/feedback` records what the agent did with the results: fetched, cited, rejected, accepted. Neither is required, and neither earns; they are how the ranker improves.

> **Devnet limitation.** The hook that captures the assistant text runs before your agent has written the current turn to its transcript, so the text immediately preceding a search is often missing and the envelope carries only the ids. Capturing it after the call is being built.

## How the Slot distributes tokens

The chain pays Slot 3 a share of every epoch's emission, on devnet-3 about 49.9 TWLT per epoch with three active Slots at equal weight, as an *entitlement* that the Slot's authorization server releases to participants. The Slot decides nothing about that amount. What it decides is who did verified work, and for the router, verified work is a search. The [Twilight page](./#slots-emission) has the emission schedule and the distribution mode; this section is what the router contributes to it.

### What counts as a verified search

1. **The router serves a request** made with an `sr-` key and writes a verification row to a ledger that has no content-bearing field: the key's id, the user who created the key, the time, the cost, the tier, per-arm statuses, and the request id.
2. **The client records an observation** naming that request id, and the flush submits it to the authorization server. No query, no results, no trace go with it.
3. **The authorization server asks the router's verification API** for a batch of request ids and gets one verdict per id. `SERVED` verifies the observation. `FAILED` and `NOT_FOUND` reject it. `NOT_YET_DURABLE`, `EXPIRED` and `UNAVAILABLE` mean ask again later.
4. **The user on the row must match the enrollment.** That is the whole of the attribution check today: attribution follows the credential you search with (ESC-023).

| A search… | Verified? |
| --- | --- |
| through the router with a key from the account you enrolled with | yes |
| the same, with `TOKENDROP_TRACE=off` | yes; searches earn exactly the same without a trace |
| the same, on the fast tier | yes; the tier changes the fan-out and the cost, not the verification |
| with a key from a different account | no; the row names another user, and nothing tells you |
| against provider keys your project brought itself (BYOK) | no; that spend is not charged and not counted for mining |
| that is a `feedback` or `judge` call, or a read of `/v1/traces` | not a search; nothing is written for the authorization server |
| run by the same key, again and again in one epoch | each verifies, and none of them earns more than the first: eligibility is one per epoch |

### How the share is split

Eligibility is one verified search in the epoch, and the Slot's entitlement is split equally among everyone eligible, under the chain's `TRUSTED_AS_DISTRIBUTION` mode: the authorization server computes the split and submits the settlement chunks that pay it, within two epochs of the epoch's close, skipping any share under 0.01 TWLT. Today the router pays for eligibility, not volume: more searches in an epoch, or richer trajectories, do not earn more, and no amount belongs to any single search. The key's rate limit and daily spend ceiling bound what one participant can do; one verified search is all an epoch needs.

The on-chain selection machinery, a verifiable draw that would turn eligibility into a ticket rather than a payment, exists in the genesis and is not applied to Slot 3. The candidate set is still built and anchored every epoch, so the switch, when it comes, changes what a place in the set is worth, not how you earn one.

### Why trajectories, then

Because the Slot is a trade, not a per-trace price. The router gives an agent search that is better than any single index, free on the fast lane; in return it collects the trajectories that let it learn which arm to send which query to, which is the ranker's training signal. The chain's emission pays participants for showing up with verified searches. The trace is what makes the search worth serving, and it is optional on devnet: turning it off costs nothing, and the router says so in the same breath as it asks for it. Research-grade arms, which cost dollars per query, stay paid, and zero-retention is a paid-tier feature.

> On devnet the operator runs both the Slot's provider (the router) and its authorization server. Sybil resistance is economic and transparent rather than cryptographic: per-epoch aggregates are published, and attribution follows the credential you search with (ESC-023). Payout binding is *declared, not proven* (ADR-0013).

## Devnet status and known limitations

- **Devnet tokens only.** `twilight-devnet-3`, Slot 3. Tiers, limits and the fan-out set may change between epochs.
- **Trajectory text is often missing** from the trace on Claude Code (see [Trajectories](#trajectories)). The ids are always there.
- **Codex** needs a sandbox network exception for the search command. **Cursor** hooks were verified against Cursor's documentation, not yet at scale.
- **Free tier is the fast lane.** Research-grade arms stay paid; zero-retention is a paid-tier feature. The pricing page will say what.
- **Ranking is a heuristic today.** `decision.ranker_version` reports `fallback-heuristic-v1` and `router_version` reports `none`; the learned router the trajectories are for is not serving yet.
- **Mainnet** timing is not promised here.

Limitations of the client, payout binding and the chain are on the [Twilight page](./#status).

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| HTTP 401, or `no API key` | no valid sr- key on this machine | `dropin-miner login` |
| doctor: earning NO, 0 observations verified | no search reached the router this epoch, or the key belongs to another account | run one search, then `flush`; check `login -show` against the account you enrolled with |
| HTTP 402 | credits exhausted, the daily ceiling reached, or no arm fits the per-query ceiling | top up on the platform, or wait for the daily ceiling to reset at midnight UTC |
| HTTP 429 | rate or concurrency limit on the key | wait `Retry-After`; 60 requests a minute, 4 concurrent |
| HTTP 400 on a search from the client | a rejected trace shape | the client retries once without the trace; if it persists, `TOKENDROP_TRACE=off` and report the client version |
| `chosen` is -1 | every arm failed, timed out or hit the deadline | the search still verified; look at `candidates[].status` and retry |
| searches earn, agent still uses its own search | the skill is off, or the agent was not restarted | `/dropin-miner status`; restart the agent |

## Glossary

| Term | Meaning |
| --- | --- |
| Router, Slot 3 | the provider of Slot 3: one API fanning a query across nine indexes; its operator holds the Slot on chain |
| Tier | the router's fast, balanced or max: how wide the fan-out is and its per-query cost ceiling |
| Arm, candidate | one provider in the fan-out, and what it returned |
| Slow lane | an arm dispatched with the request but not waited for; its result is amended into the trace later |
| Referee, consensus, decision | the router's per-arm score, its cross-arm agreement measure, and its record of which set was chosen and why |
| Trace | what the router stores per request: the query, every candidate, the decision, and the client trace envelope |
| Trace envelope | the small JSON a search carries: hashed session/turn/call ids, window, and the assistant text before the search |
| Trajectory | a search with its lineage and the context that produced it; the router's training signal |
| Verification row | what the router writes per request for the authorization server: key id, user, time, cost, tier, request id. Metadata only. |
| Verification API | the router endpoint the authorization server batches request ids to; participants never call it |
| Reformulation | a similar follow-up query within five minutes of the last, on the same `session_id` |
| Feedback | an event the agent reports after a search: fetched, cited, rejected, reformulated, accepted; shapes the ranker, does not earn |

## Router API

Base `https://router-api.nyks.dev`. Bearer auth with an sr- key. Bodies are JSON; unknown fields are rejected with 400; the body is capped at 64 KiB.

### POST /v1/search

```
curl https://router-api.nyks.dev/v1/search \
  -H "Authorization: Bearer $TOKENDROP_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"what is proof of authority consensus","tier":"balanced"}'
```

| Field | Type | Meaning |
| --- | --- | --- |
| `query` | string, required, ≤ 4096 bytes | the search |
| `tier` | `fast\|balanced\|max` | how wide the fan-out is and the per-query cost ceiling; default is the tenant's tier (balanced) |
| `providers` | string[] | name the arms yourself; extended-tier arms fire only when named; marks the decision as yours rather than the policy's |
| `max_results` | int, 1–25 | results per arm; default 8 |
| `recency` | `day\|week\|month\|year` | freshness hint passed to arms that support it |
| `domain_filter` | string[] ≤ 16 | restrict to these domains where arms support it |
| `session_id` | string | threads queries; a similar follow-up within five minutes is recorded as a reformulation |
| `trace` | JSON object ≤ 64 KiB | the opaque client trace envelope ([below](#envelope)); stored as `client_trace`, never sent to a provider |

Any other field is a 400: the body is decoded strictly. The selection mode is not a request field; it follows from the tier.

Response:

```
{
  "request_id": "01a07aa6-81ed-714f-8ec8-964f63dd64dd",
  "query": "…",
  "chosen": 7,                                  // index into candidates; -1 when nothing was usable
  "candidates": [ { "provider": "exa", "model": "exa", "kind": "retrieval", "tier": "core",
                    "citations": [ { "url": "…", "domain": "…", "title": "…", "snippet": "…", "published": "…" } ],
                    "agent": { "run_id": "…", "effort": "telem/extended", "status": "succeeded", "steps": 2,
                               "plan": [ { "at_ms": 0, "kind": "objective", "text": "…" } ], "sources": [ … ], "tool_calls": { "exa": 1 } },
                    "usage": { "search_calls": 1, "reported_cost_micros": 7000, "cost_reported": true },
                    "cost_micros": 7000, "cost_source": "reported",
                    "latency": { "ttfb_ms": 1617, "total_ms": 1617 }, "status": "ok" }, … ],
  "signals": {
    "referee":   [ { "provider": "exa", "status": "ok", "has_answer": false, "citation_count": 8, "distinct_domains": 7,
                     "dead_citations": 0, "recency_ok": true, "dated_citations": 4, "latency_ms": 1617, "cost_micros": 7000, "score": 1 }, … ],
    "consensus": { "per_candidate": [ … ], "union_domains": 30, "shared_domains": 7, "agreement_ratio": 0.23, "contested": false },
    "ranking":   [ { "index": 7, "provider": "you", "score": 2.9, "base_score": 2.9 }, … ]
  },
  "decision": { "mode": "rank", "tier": "balanced",
                "provider_set": "brave+exa+linkup+parallel-search+serpapi+tavily+telem+you",
                "providers": [ … ], "propensity": 1, "router_version": "none", "ranker_version": "fallback-heuristic-v1",
                "trimmed": null },
  "usage": { "cost_micros": 54000, "latency_ms": 4234, "cache_hit": false, "deadline_hit": false, "byok": false, "pending": 1 }
}
```

| Candidate status | Meaning |
| --- | --- |
| `ok` | answered: an answer or at least one citation |
| `error` | the arm failed; `error` says how, redacted |
| `timeout` | the arm's own timeout passed |
| `deadline` | the shared fan-out deadline passed first (30 s on devnet); does not count against the arm's circuit breaker |
| `pending` | slow-lane arm still running; billed and amended into the stored trace when it lands |
| `skipped` | not dispatched: no credential, breaker open, slow lane saturated, or served from cache |

A request returns 200 even when every arm failed; `chosen` is then -1. Every response carries the request id in `X-Request-Id`. `POST /v1/search/stream` serves the same request as NDJSON: a `start` event, then `agent` narration and `candidate` events as arms land, a `done` event holding the exact `/v1/search` document, and late slow-lane candidates after it.

### Tiers and cost

| Tier | Fan-out | Mode | Per-query ceiling (devnet) |
| --- | --- | --- | --- |
| `fast` | the answer engines plus the single cheapest retrieval arm | rank | 35,000 micros |
| `balanced` | the whole core set (nine indexes today) | rank | 80,000 micros |
| `max` | the whole core set | fuse when available, else rank | 150,000 micros |

Costs are in *micros*, millionths of a dollar; the nine-index default set estimates at about 50,000. A set over the ceiling is trimmed rather than refused, slow lane first, then most expensive; `decision.trimmed` names what went. Under via-Telem there are no answer engines, so the fast tier is one retrieval arm. Responses are cached for 15 minutes; a cache hit is still metered at the stored cost. The fan-out deadline is 30 s; slow-lane arms get up to 5 minutes.

| Tenant limits (devnet defaults) |  |
| --- | --- |
| Rate | 60 requests per minute, 4 concurrent, per key |
| Daily spend | 5,000,000 micros ($5) unless the project sets otherwise; resets at midnight UTC |
| Credits | a new account starts with a $20 grant that expires in 30 days; top up on the platform |
| Bring your own keys | a project may seal its own provider keys; that spend is not charged and not counted for mining |

### Status codes

| Code | When |
| --- | --- |
| 200 | served, even if every arm failed |
| 400 | malformed body, unknown field, bad `providers` name, or a rejected trace shape |
| 401 | no, unknown, or revoked key; one message for all three |
| 402 | credits exhausted, the daily ceiling reached, or no arm fits the per-query ceiling |
| 415 | body is not JSON |
| 429 | rate or concurrency limit; `Retry-After` is set |
| 503 | the gateway is at its in-flight cap; retry after a second |

### GET /v1/traces, /v1/traces/{id}

Your tenant's stored traces, newest first, and one trace by request id: the exact response document plus stored and expiry times, the client trace, slow-lane amendments, and `live_thinking` narration while an arm is still pending. Other tenants' ids, expired ids, and unknown ids all answer one 404. Traces are kept for 30 days; the platform shows the same pages.

### POST /v1/feedback, POST /v1/judge

`feedback` records what happened after a search, for the ranker: `result.fetched`, `result.cited`, `result.rejected`, `query.reformulated`, `answer.accepted` and the like, by trace id. `judge` asks a blinded language-model grader to rank a trace's candidates on demand; the grader never sees provider names. Neither call is a search: nothing is written for the authorization server.

### The verification API (for the authorization server)

Participants never call this. The Slot's authorization server, holding its own OAuth client, posts batches of request ids to `https://platform.nyks.dev/v1/verifications` and gets one result per id: `SERVED`, `FAILED` or `NOT_FOUND` as verdicts, or `NOT_YET_DURABLE`, `EXPIRED`, `UNAVAILABLE` as retry-later. A served result carries the user id of the person who created the API key, the time, the cost, the tier, and per-arm statuses. No query text, no results, no trace: the ledger it reads from has no content-bearing field. That user id is what the authorization server compares with the enrollment, which is why a key from a different account earns nothing. The authorization server's side of this exchange is the Verification step of the [mining protocol](./#protocol).

## The client trace envelope (v1)

```
{ "v": 1,
  "harness": "claude-code",
  "session_id": "7bfd5245…",          // hashed
  "turn_id":    "9b6ffd19…",          // hashed (session | prompt id)
  "call_id":    "1b56bdec…",          // hashed (session | tool-use id)
  "window":     "none",               // context-window generation, or "none"
  "seq":        12,                   // per-workspace call counter
  "history":  [ { "role": "assistant", "text": "…the text before the search, ≤ 32 KiB…" } ]
}
```

Ids are `hex(sha256("tokendrop-trace-v1|" + raw))[:16]`: deterministic, irreversible, never the host's real id. A subagent hashes as `session|agent`. Each history text keeps its last 32 KiB; an envelope over 48 KiB drops the history, and over that is dropped entirely. Rides in `trace` on `POST /v1/search`, handed to `search` by the hooks through `TOKENDROP_TRACE_BRIDGE`, else read from the lineage file (fresh within 12 hours, found by walking up from the working directory), else a per-shell fallback with harness `cli`. `TOKENDROP_TRACE=off` sends none. Which hooks feed it, per agent, is on the [Twilight page](./#agents-ref).

## Hosts (devnet)

| What | Where |
| --- | --- |
| Router (Slot 3) | `https://router-api.nyks.dev` |
| Platform: account, API keys, enrollment tokens, usage, traces | `https://platform.nyks.dev` |
| Verification API (authorization server only) | `https://platform.nyks.dev/v1/verifications` |
| Authorization server (Slot 3) | `https://minis.nyks.dev` |
| Client source, releases | `https://github.com/twilight-project/dropin-miner` |
| Chain, node, chain source | on the [Twilight page](./#hosts) |
