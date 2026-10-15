# Twilight mining — Twilight

The chain registers Slots and pays each a share of every block's emission; a Slot's authorization server (MINIS) verifies who did the work and pays them. This page is that mechanism, and the client coding agents run to take part.

## Twilight mining

Twilight pays people for verified work. The chain does not verify work itself: it registers a bounded set of **Slots**, each run by an operator who provides a workload and an **authorization server** that verifies participation in it, and it pays every active Slot a share of each block's emission. The Slot's authorization server then distributes that share, on chain, to the participants who did the verified work. No GPU, no daemon, no staking.

Participants are coding agents. The client, `dropin-miner`, is a small binary an agent calls the way it calls any shell tool. It does the Slot's work when the agent asks for it, reports each unit of work to the Slot's authorization server afterwards, and holds the identity and payout address the rewards go to. One Slot is open to participants today: the [search router](https://docs.twilight.org/search-router.md) (Slot 3), whose unit of work is a web search. This page is the mechanism common to every Slot, and the client. The router has its own page.

> **Devnet preview.** Everything here runs on `twilight-devnet-3`. Rewards are devnet tokens, the epoch and distribution parameters below are the devnet's, and some guarantees are stated as *declared, not proven* where the spec says so. Nothing on this page is a mainnet promise.

| What | Today (devnet) |
| --- | --- |
| Chain | `twilight-devnet-3`; addresses are `twilight1…`; token `TWLT` |
| Slots | three active at genesis; Slot 3 is the [search router](https://docs.twilight.org/search-router.md), the one participants can mine |
| Authorization server | MINIS; for Slot 3 at `https://minis.nyks.dev` (enrolls, verifies, draws, settles) |
| Client | `dropin-miner` v0.1.6 — no daemon, no proxy, no MCP server |
| Agents | Claude Code, Codex, Cursor, opencode (a skill + hooks each); any other agent via one rules line |
| Work unit | one *observation* of the Slot's workload, verified by the authorization server from metadata only; for Slot 3, one search |
| Epoch | about 32 minutes; you join two epochs ahead; one verified observation per epoch makes you eligible |
| Reward | an equal split of the Slot's share of the epoch's emission among everyone eligible |

> **Giving these docs to an agent?** Every page here is public. The Markdown versions are `https://docs.twilight.org/twilight.md` (this page) and `https://docs.twilight.org/search-router.md`; the agent skill the client installs is at `https://docs.twilight.org/skill.md`; a JSON index is at `https://docs.twilight.org/manifest.json`.

## How work becomes a reward

One loop, five steps. The participant is involved in the first and the last.

1. **The agent does the work through the Slot's provider.** For Slot 3 that is a search through the router, run by `dropin-miner search` because the installed skill tells the agent to.
2. **The provider writes a verification row.** Metadata only: which credential did the work, when, at what cost, under which request id. Never the content of the work.
3. **The client records an observation** on disk and starts a short, detached *flush*. The flush joins the target epoch if you are not in it yet, promotes intake records into observations, and submits them to the authorization server, which answers with a signed receipt per epoch. Nothing runs between units of work.
4. **The authorization server verifies.** It matches your observations against the provider's verification rows through the provider's verification API. A match is a *verified observation*. One per epoch makes you a candidate for that epoch.
5. **The epoch settles.** The chain records the Slot's *entitlement* for the epoch. The authorization server releases it by submitting settlement chunks on chain that pay the eligible participants' declared payout addresses directly.

| Where | What it holds about you | What it never sees |
| --- | --- | --- |
| The Slot's provider (for Slot 3, the router) | your provider credential's id, the work itself and its cost and latency; for the router, the query, the results and the trace envelope | your wallet key, your recovery phrase, your enrollment secrets |
| The authorization server | your installation's identity, epoch joins, receipts, verification metadata (credential id, time, cost, request id) | the content of the work: for the router, the query text, the results, the trace |
| The chain | your payout address and what it was paid | everything else |
| Your machine | everything: keys, wallet, intake, spool, receipts, a per-workspace lineage file | — |

## Slots

A **Slot** is Twilight's unit of proof of work. The chain registers a bounded set of them, each run by an operator who provides a workload and an authorization server that verifies participation in it, and pays each active Slot a share of every block's emission. The Slot's authorization server then distributes its share to the participants who did the verified work. A Slot is also a validator, with one unit of voting power on devnet.

### How a Slot is registered

Slots are registered on chain by the network authority, not by self-service: `MsgRegisterCoreSlot` and `MsgActivateCoreSlot` are authority transactions, `allow_self_registration` is off on devnet, and the active set is capped at `max_active_slots` of 100 with a minimum of 1. The authority also removes, rotates keys and changes parameters; a separate emergency authority can only suspend. A Slot record carries its operator address, a consensus key, a payout address, a settlement address the Slot pays participants from, a reward weight, and a selection policy. Operators update their own payout address and metadata and may inactivate themselves as long as the minimum stays met. Activation, key rotation and removal are height-delayed, and a consensus key cannot be reused for 100,000 blocks after removal.

What a Slot must run, beyond the validator: a *provider* that does the workload and exposes a verification API the authorization server can reconcile against, and an *authorization server* that enrolls participants, runs epochs, verifies observations and submits settlement. The chain sees only the Slot record, the entitlement and the settlement transactions; everything about who did what happens between the client, the provider and the authorization server, and is described in the [authorization server](#minis) and [protocol](#protocol) sections.

| Slot | Operator role | Status on devnet-3 |
| --- | --- | --- |
| 1 | the network authority | active, genesis |
| 2 | the emergency authority | active, genesis |
| 3 | the search router operator | active, genesis; the Slot participants mine today — see [Search router](https://docs.twilight.org/search-router.md) |

### Where the tokens come from

Emission is the chain's, not the Slot's. Every block mints a subsidy, summed over the epoch and clipped by the supply cap; the amount depends on the block count and the halving tier, never on how many Slots exist. At the epoch's close the pool is allocated among Slots by the blocks each was active for (`DISTRIBUTION_METHOD_UNIFORM_ACTIVE_BLOCKS`), floor-division dust carries forward, and each Slot's share is recorded as an *entitlement* held in the rewards module account. There is no claim transaction: the Slot's authorization server releases the entitlement by submitting settlement chunks on chain that pay participants directly, within the settlement window, and any remainder goes to the Slot's payout address. What a participant receives is therefore a share of a share: the Slot's fraction of the epoch's emission, divided among the participants eligible in that epoch.

Halving is by supply crossed, not by height. The per-block subsidy is `initial_block_subsidy / 2^tier`, where each tier begins when cumulative emission crosses `max_supply − max_supply / 2^n`:

| Tier | Begins at cumulative emission | Per-block subsidy |
| --- | --- | --- |
| 0 | 0 | 416,190 utwlt |
| 1 | 10,500,000 TWLT | 208,095 utwlt |
| 2 | 15,750,000 TWLT | 104,047 utwlt |
| 3 | 18,375,000 TWLT | 52,023 utwlt |
| … | each remaining half | halves again, floored; a small remainder below the cap is never minted |

| Parameter (devnet-3 genesis) | Value | Meaning |
| --- | --- | --- |
| Native token | `TWLT`, base unit `utwlt` | one TWLT is 1,000,000 utwlt |
| Maximum supply | 21,000,000 TWLT | a hard cap; emission halves on supply thresholds |
| Genesis supply | 2,000,000 TWLT | pre-existing balances at chain start |
| Block subsidy | 416,190 utwlt per block | about 0.416 TWLT, at a 5-second target block time |
| Epoch | 360 blocks | about 30 minutes at target; observed around 32 |
| Emission per epoch | ≈ 149.8 TWLT | 360 blocks × the subsidy, before halvings |
| Per active Slot per epoch | ≈ 49.9 TWLT with three Slots | equal weights today; weighted rewards are disabled |
| Settlement window | 2 epochs | a Slot's participants are paid within two epochs of the epoch's close |
| Minimum payout | 10,000 utwlt (0.01 TWLT) | a share below this is not paid out |
| Recipients per settlement | 32 per chunk, up to 4 chunks | large epochs settle in more than one transaction |
| Fees, treasury | disabled, 0% | no fee collection or treasury share on devnet |

### How a Slot's share reaches participants

The chain records one distribution mode per era. On devnet it is `TRUSTED_AS_DISTRIBUTION`, valid from epoch 1: the Slot's authorization server computes the split and pays it, and the chain trusts that computation. In this mode the split is equal among everyone eligible, eligibility is one verified observation in the epoch, and the on-chain selection machinery is not applied.

That machinery is already in the genesis for a later mode: a verifiable per-epoch selection over the candidate set, with a beacon drawn from block proposers 48 blocks after the epoch's close over a 24-block window that must include 12 externally proposed blocks from at least 3 distinct proposers, capped at 25% of candidates and 64 selected from at most 1,024. Each Slot also carries its own selection policy, 25% and 10 on devnet. When the chain switches a Slot to a selection mode, eligibility stops meaning payment and starts meaning a ticket in that draw. The docs will say so when it happens; do not plan on it now.

> Every number in this section is the devnet-3 genesis as deployed, produced by [twilight-core](https://github.com/usmanshahid86/twilight-core) (`twilightd` v0.3.0-rc1), which is the source of truth for the chain. They are parameters, versioned on chain with effective epochs, and the authority can schedule changes. Mainnet values are not decided here.

## The authorization server (MINIS)

Every Slot has one. It is the Slot's verifier and paymaster: it enrolls installations and binds each to an account, divides time into epochs, accepts observations, verifies them against the Slot's provider, runs the draw over the candidate set, and submits the settlement chunks that release the Slot's entitlement to participants. Participants never talk to the chain to be paid; they talk to the authorization server, and the authorization server talks to the chain. On devnet the Slot 3 authorization server is MINIS at `https://minis.nyks.dev`. The client does all of the following for you; the wire protocol is in the [reference](#protocol).

### Enrollment

An installation is bound to an account once, by redeeming an *enrollment token* from the platform: 15 minutes, single use, generated when setup asks for it. Enrollment gives the machine an installation identity (a DPoP key, a refresh token, a participation secret, all under `~/.tokendrop/state/`). Every later call to the authorization server is proof-of-possession bound to that key, so a stolen token is useless alone. By default enrollment is a device flow that a person approves in a browser; `enroll -assertion` redeems the token from stdin and needs no browser, which is what setup uses. The account the enrollment belongs to is the account the provider credential must belong to: the authorization server compares the user behind the verification row with the enrollment, and a mismatch verifies nothing.

### Epochs, eligibility, and getting paid

The authorization server divides time into epochs of about 32 minutes. Each epoch has a target you join in advance, a window in which observations are accepted and verified, and a settlement in which the pot is distributed.

| Term | On devnet today |
| --- | --- |
| Join | your flush joins the epoch two ahead of the current one; `dropin-miner join` does it by hand. Already in is a success, not an error. |
| Eligible | at least one *verified* observation in the epoch. More do not earn more. |
| Pot | the Slot's entitlement for the epoch, split equally among every eligible participant. No amount belongs to any single unit of work. |
| Distribution mode | `TRUSTED_AS_DISTRIBUTION`: the authorization server computes and pays the split. Payout binding to your identity is *declared, not proven* (ADR-0013); a wallet-signature binding is reserved for later. |
| Receipt | a signed JWS the authorization server returns per epoch join, verified against its published keys before it is stored under `~/.tokendrop/state/` |
| Draw | your draw id is derived from a secret that never leaves the machine; the authorization server's candidate set is a sorted list of draw ids whose digest, with the draw parameters, is anchored before the beacon window, so `drawverify` in twilight-minis can re-derive the result independently |
| Verification deadline | each epoch has an observation submission deadline; a machine idle for a long stretch can miss it. `dropin-miner flush` by hand submits whatever is pending |
| Settlement | within two epochs of the epoch's close, in chunks of up to 32 recipients; a share under 10,000 utwlt is not paid |

`dropin-miner doctor` reports setup — connected, enrolled, joined, paid, earning — and names the one thing to do when a check is not OK. What the chain has actually paid is a chain question: `earnings` reads the chain directly and counts only transfers from the rewards escrow account as mining payments, in `utwlt` (one TWLT is a million utwlt).

```
dropin-miner earnings            # -limit 0 for everything; totals are a floor if the walk truncates
```

> On devnet the operator of Slot 3 runs both the Slot's provider (the router) and its authorization server. Sybil resistance is economic and transparent rather than cryptographic: per-epoch aggregates are published, and attribution follows the credential you work with (ESC-023).

## Coding agents: the client

`dropin-miner` is the mining runtime for coding agents. It is not a daemon, a proxy or an MCP server: it installs a skill plus hooks into each agent, does the Slot's work when the agent asks for it, and talks to the authorization server afterwards in a detached flush. Everything in this section is independent of which Slot the work is for; the release ships configured for Slot 3, so the work it does today is a [search](https://docs.twilight.org/search-router.md#search).

### Install

Ten minutes, one terminal. You need an account on `https://platform.nyks.dev` (it issues the provider credential and the enrollment token) and a machine that runs at least one of the supported coding agents.

```
curl -fsSL https://raw.githubusercontent.com/twilight-project/dropin-miner/main/scripts/install.sh | sh
```

```
irm https://raw.githubusercontent.com/twilight-project/dropin-miner/main/scripts/install.ps1 | iex
```

```
npx dropin-miner version        # the npm wrapper downloads the same checksummed release
```

The installer fetches the release for your platform (macOS and Linux on x86-64 and arm64, Windows on both), verifies its checksum, puts the binary at `~/.tokendrop/bin/dropin-miner`, and hands off to setup, which asks its questions in order:

| Setup asks | What to know |
| --- | --- |
| **Use the previous installation?** | Only if one is found in `~/.tokendrop` or set aside beside it. Yes keeps your wallet, enrollment and key. |
| **An enrollment token** | Generate it when asked, not before: it lasts 15 minutes and works once. `https://platform.nyks.dev` → Mining → Slot 3 → Generate enrollment token. |
| **Wallet, or your own address?** | The wallet is made here and prints its 24 words once. Have paper ready. Or paste a `twilight1…` address you already control. |
| **Your sr- API key** | The router's credential, typed with echo off, checked against the router without spending, stored owner-only. Enter to skip and run `dropin-miner login` later. |
| **Add settings to your shell profile?** | Puts the binary on PATH and sets `TOKENDROP_CONFIG`. Saying no just means longer commands. |
| **Set up the coding agents found here?** | Writes a skill and, where the agent supports them, hook entries into its own config. Shown before anything is written. |

> Use a key from the **same account you enrolled with**. A key from a different account returns a clean 200 and earns nothing, with no error anywhere. That is the easiest mistake to make; `dropin-miner doctor` is how you catch it.

### First unit of work

```
dropin-miner search -format model "what is proof of authority consensus"
dropin-miner flush
dropin-miner doctor
```

```
  authorization server  OK       https://minis.nyks.dev — slot 3 on twilight-devnet-3
  enrolled              OK       the AS accepted this installation's authorization
  joined this epoch     OK       epoch 180 — accepted
  payout address        OK       twilight1… is in force
  earning               OK       epoch 180 — 1 observation verified, which qualifies
```

Then restart any coding agent that is already open and let it work as usual. Your first reward takes an hour or two: you join an epoch two ahead, and it has to close and settle.

### Your coding agents

`dropin-miner agents install` detects the agents on your PATH and gives each a skill that does the Slot's work through the client, plus the hooks the host supports. Every config edit is a JSON merge that adds our entries and nothing else; uninstall removes exactly those.

| Agent | Gets | Lineage |
| --- | --- | --- |
| Claude Code | a skill, five hook entries and an allow rule for the search command in `~/.claude/settings.json` | full: a hook on Bash threads each search into the current turn; window hooks track context compaction; Stop flushes |
| Cursor | a skill and six entries in `~/.cursor/hooks.json` | full, via a lineage file the hooks maintain; the shell hook allows our command so Cursor never prompts |
| Codex | a skill | per shell. Codex's sandbox blocks network for shell commands by default — allow it for this command or searches fail silently |
| opencode | an in-process plugin, and a line to paste into AGENTS.md | full: the plugin rewrites the bash command the way the Claude hook does |
| anything else | a rules line printed for you to paste | per shell |

Lineage is what lets the Slot's provider group one task's units of work; what it contains and how to turn it off is on the [router page](https://docs.twilight.org/search-router.md#trajectories). Mining never depends on it.

### On and off

Out of the box the skill tells your agent to prefer the Slot's search over its built-in one. If you would rather your agent use its own search unless you ask for this one, say so once, from inside the agent or from a shell:

```
/dropin-miner off        # in Claude Code, Codex or Cursor
/dropin-miner on
/dropin-miner status

dropin-miner agents prefer off|on|status
```

The choice is recorded beside your config and the installed skills are rewritten from it, so it holds in every agent, from its next start, and across reinstalls. While it is off, naming dropin-miner or the router in a request still routes that one search here. Work that does not go through the Slot earns nothing.

```
dropin-miner agents status
dropin-miner agents uninstall
```

## Wallet and payout address

Setup offers two ways to be paid. Either is a one-time *payout declaration* to the Slot's authorization server.

| Choice | What happens |
| --- | --- |
| Make a wallet here | `wallet init` creates a 24-word BIP39 phrase (path `m/44'/118'/0'/0/0`, the Cosmos coin type), prints it once and stores it nowhere, and seals the derived key in `~/.tokendrop/wallet/wallet.key` under your passphrase (AES-256-GCM, PBKDF2 600,000 rounds). `wallet register` declares its address. |
| Paste an address | `payout set twilight1…` declares an address you already control, in Keplr say. Nothing on this machine can spend from it. |

```
dropin-miner payout show      # ACTIVE, and the address as the chain renders it
dropin-miner wallet address
dropin-miner wallet balance
dropin-miner wallet send <to> <amount>   # asks for the passphrase; type yes to confirm
```

> Your first address is in force as soon as you set it. Setting a *different* one is a change, and a Slot operator has to approve it: you keep being paid at the old address until they do. Request a change at `https://platform.nyks.dev/contact-us`. Nobody needs your API key, your recovery phrase, or the contents of `~/.tokendrop/` to approve a payout address, and no operator will ask you for them.

## Identity and keys

Three credentials, three jobs. None of them is ever the same thing as another.

| Credential | Issued by | Lives | For |
| --- | --- | --- | --- |
| `sr-` API key | the platform, per project; shown once | `~/.tokendrop/credentials.json` (0600) or `TOKENDROP_API_KEY` | the Slot provider's credential: metering searches at the router; the verification row names its id |
| Enrollment token | the platform, 15 minutes, single use | nowhere — redeemed once by `enroll -assertion` | binding this installation to your account at the authorization server |
| Installation identity | the authorization server at enrollment | `~/.tokendrop/state/`: a DPoP key, a refresh token, a participation secret | every authorization-server call is proof-of-possession bound to the DPoP key; the participation secret derives your draw id |
| Wallet | you (or your existing wallet) | `~/.tokendrop/wallet/` or elsewhere | receiving payouts; never needed for anything else |

## Removing it, and coming back

```
dropin-miner agents uninstall     # the skills, hooks and plugin, nothing else
rm ~/.tokendrop/bin/dropin-miner  # the binary
```

Nothing shipped here deletes `~/.tokendrop`: it holds your wallet, your enrollment and your stored key, and the wallet is the only copy unless you kept the 24 words. Leave it, or set it aside as `~/.tokendrop.bak-<date>`. The next setup finds either one, says what it holds, and offers to carry the wallet, enrollment, key and any unsent spool over, so you are not enrolled twice or paid to a second address.

## Devnet status and known limitations

- **Devnet tokens only.** `twilight-devnet-3`. Parameters may change between epochs; the epoch length and split are the devnet's.
- **Payout binding is declared, not proven.** The authorization server trusts your declaration; a wallet-signature binding is specified but not enforced yet.
- **One Slot is open to participants**, the search router. The chain allows up to 100; registering one is an authority action, not self-service.
- **Windows** stores the key and wallet behind an owner-only directory ACL rather than file modes, and has no interactive setup: the installer prints the enroll, wallet, join, agents and login steps for you to run by hand, and there is no previous-installation adoption yet.
- **Hooks are fail-open.** Any hook error produces nothing and exits 0, so mining can never block or break an agent's tool call. The flip side is that a broken hook fails silently; `dropin-miner doctor` and `agents status` are how you notice.
- **Mainnet** timing is not promised here.

Limitations of the router itself, its free tier and its trajectories are on the [router page](https://docs.twilight.org/search-router.md#status).

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| doctor: earning NO, 0 observations verified | no unit of work reached the Slot's provider this epoch, or the provider credential belongs to another account | do one search, then `flush`; check `login -show` against the account you enrolled with |
| join: the AS reports this target is not joinable | enrollment for that epoch closed without you | every flush retries the next target; nothing to do |
| enrollment failed | the token expired (15 min) or was already used | generate a fresh one and re-run setup; enrollment is the only step that repeats |
| work earns, agent still uses its own search | the skill is off, or the agent was not restarted | `/dropin-miner status`; restart the agent |
| DPoP proof key does not match | a fresh key from an unfinished enrollment shadowed the enrolled one | setup's adoption sets the stray key aside; re-run setup |
| HTTP errors from the router | see the router page | [Search router → Troubleshooting](https://docs.twilight.org/search-router.md#troubleshooting) |

## Glossary

| Term | Meaning |
| --- | --- |
| Slot | Twilight's unit of proof of work: a chain-registered operator (also a validator) running a workload and an authorization server that verifies participation in it. The chain pays each active Slot a share of emission; the Slot pays its participants. The search router is Slot 3; devnet caps active Slots at 100. |
| Provider | the part of a Slot that does the workload and writes verification rows; for Slot 3, the router |
| Authorization server (AS), MINIS | the Slot's verifier and paymaster: enrollment, epochs, verification, the draw, settlement |
| Entitlement | a Slot's recorded share of one epoch's emission, released by settlement chunks to participants within the settlement window |
| Distribution mode | how a Slot's entitlement reaches participants: `TRUSTED_AS_DISTRIBUTION` today (the authorization server computes an equal split); a verifiable selection mode exists on chain for later |
| Epoch | the unit of time (about 32 minutes on devnet) over which work is counted and a pot is paid |
| Observation | one unit of work as the client records it; *verified* once the authorization server matches it to the provider's verification row |
| Verification row | what the provider writes per unit of work for the authorization server: credential id, time, cost, request id. Metadata only. |
| Intake, spool, flush | the on-disk queue: a unit of work writes intake; flush promotes it to spool and submits to the authorization server |
| Receipt | the authorization server's signed (JWS) acknowledgement of an epoch join |
| Draw, draw id | the per-epoch selection over the candidate set; your draw id derives from your participation secret |
| DPoP | proof-of-possession: every authorization-server call is signed with the installation's key so a stolen token is useless alone |
| Payout declaration | your statement of where to be paid; the first is in force on arrival, changes need operator approval |

## CLI: dropin-miner

Every command takes `-config <file>`, falling back to `TOKENDROP_CONFIG`, then `./tokendrop.toml`. `dropin-miner help` describes each.

| Command | What it does | Options |
| --- | --- | --- |
| `search <query>` | one search through the router ([details](https://docs.twilight.org/search-router.md#search)); records intake (request id, host, status, timing, chosen provider; never the query or results); starts a detached flush | `-tier fast, -format model\|json (default json), -no-flush` |
| `agents install\|status\|uninstall` | detect coding agents on PATH; give each the skill and hooks; report; remove exactly what install wrote | `-client <name>, -dry-run, -yes` |
| `agents prefer on\|off\|status` | whether this search or the agent's own is the default; rewrites the installed skills |  |
| `login` | store the sr- key: stdin (echo off on a terminal), verified with a zero-spend probe, written 0600 | `-key-env VAR, -show, -forget, -no-verify` |
| `flush` | one pass: join/capability, promote intake, submit; throttled by `miner.flush_interval` | `-force` |
| `enroll` | obtain an authorization grant; device flow by default (15-minute wait for approval) | `-assertion` (enrollment token on stdin, no browser); `-browser` (loopback code flow) |
| `join` | join the current target epoch; already in is success |  |
| `payout set <addr>\|show` | declare / show the payout address |  |
| `wallet init\|address\|register\|balance\|send` | a local wallet: 24-word phrase, encrypted keyfile, passphrase on every use | `-dir` |
| `status` | epoch status from the authorization server |  |
| `doctor` | connected, enrolled, joined, paid, earning — with the fix for each |  |
| `earnings` | what the chain has paid this address; only transfers from the rewards escrow count as mining | `-address, -node, -denom, -escrow, -limit (default 20; 0 = all)` |
| `hook` | internal: the hook runner the agents call | `lineage \| window <phase> \| cursor <event> \| flush` |
| `version` | build version |  |

### Exit codes

| Code | Meaning |
| --- | --- |
| 0 | 2xx |
| 1 | transport (could not reach, timeout, config) |
| 2 | usage |
| 3 | HTTP 4xx (401: no valid key) |
| 4 | HTTP 5xx |

### Environment

| Variable | Effect |
| --- | --- |
| `TOKENDROP_CONFIG` | config file when `-config` is not given |
| `TOKENDROP_API_KEY` | the sr- key; wins over the credentials file |
| `OPENAI_API_KEY` | last-resort key, so a personal key never shadows the tenant key |
| `TOKENDROP_TRACE=off` | send no trace envelope ([router page](https://docs.twilight.org/search-router.md#trajectories)) |
| `TOKENDROP_TRACE_BRIDGE` | internal: the hook hands the envelope to `search` through it |
| `TOKENDROP_HARNESS` | override the harness name in the envelope (default `claude-code`) |
| `TOKENDROP_HOME, TOKENDROP_BIN, TOKENDROP_SLOT, TOKENDROP_CHAIN, TOKENDROP_AS_URL, TOKENDROP_ROUTER_URL` | setup-time knobs, all optional |

## Config: ~/.tokendrop/tokendrop.toml

```
[[provider]]
name     = "search-router"
upstream = "https://router-api.nyks.dev"   # the gateway, not the verification API

[mining]
enabled   = true
as_url    = "https://minis.nyks.dev"
chain_id  = "twilight-devnet-3"
slot_id   = 3
# target_epoch deliberately unset — flush asks the AS which epoch to join.
state_dir = "/home/you/.tokendrop/state"
spool_dir = "/home/you/.tokendrop/spool"

[miner]
enabled      = true
intake_dir   = "/home/you/.tokendrop/intake"
sessions_dir = "/home/you/.tokendrop/sessions"
# router_url     = "https://router-api.nyks.dev"   # defaults to the first provider upstream
# flush_interval = "3m"         # how often a flush may ask the AS; -force overrides
```

`as_url` and the provider `upstream` must be https. `target_epoch` is deliberately unset: the flush asks the authorization server which epoch to join. `state_dir` is refused if it is a symlink or readable by others. `[mining]` names the Slot (chain, slot id, authorization server); `[[provider]]` names the Slot's provider.

### Files on disk

| Path | What |
| --- | --- |
| `~/.tokendrop/bin/dropin-miner` | the binary |
| `~/.tokendrop/tokendrop.toml` | config (0600) |
| `~/.tokendrop/credentials.json` | the sr- key, 0600, written by `login` |
| `~/.tokendrop/search-default` | `router` or `builtin`: the `prefer` choice |
| `~/.tokendrop/state/` | installation identity: `dpop.key` (ES256, generated once), `refresh.token`, `participation.secret`, `enrollment.json` (last joined epoch), receipts `receipt-<slot>-<epoch>.jws` |
| `~/.tokendrop/spool/, intake/` | observations waiting to be submitted, and what units of work wrote |
| `~/.tokendrop/sessions/` | per-workspace lineage files the hooks maintain |
| `~/.tokendrop/wallet/` | `wallet.key` (encrypted), `wallet.pub`; the recovery file, until you delete it |
| `~/.tokendrop/flush.json, flush.lock` | the flush stamp and lock |

## Agent hosts: what install writes

| Host | Files | Hooks |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/dropin-miner/SKILL.md`; entries in `~/.claude/settings.json` | `PreToolUse[Bash]` lineage (rewrites the search command with the bridge), `SessionStart` / `PreCompact` / `PostCompact` window, `Stop` flush; `permissions.allow` rule for the search command |
| Cursor | `~/.cursor/skills/dropin-miner/SKILL.md`; entries in `~/.cursor/hooks.json` | `sessionStart, beforeShellExecution, afterAgentThought, afterAgentResponse, preCompact, stop` |
| Codex | `~/.codex/skills/dropin-miner/SKILL.md` | none |
| opencode | `~/.config/opencode/plugins/dropin-miner.js` | in-process: rewrites our bash command |

The skill file is rendered from a template at install and again by `agents prefer`. Its current text is at `https://docs.twilight.org/skill.md`.

## The mining protocol (participant side)

What the flush speaks to the authorization server, for people reading the client source or the frozen contract (`TWILIGHT_MINING_PROXY_AS_V1_9`). Everything here is done for you by `flush`. The protocol is the same for any Slot; only the source profile of an observation names the provider.

| Step | What happens on the wire |
| --- | --- |
| Discovery | the authorization server publishes `/.well-known/twilight-mining`: chain id, slot id, endpoint templates, size limits. The client refuses an authorization server whose chain or slot differs from its config. OAuth endpoints come from `/.well-known/oauth-authorization-server`. |
| Enrollment | OAuth with public client id `tokendrop-proxy` and scopes `mining:join mining:read provider-verification:manage`. Device flow by default; `-assertion` redeems the enrollment token with the JWT-bearer grant. Every call is DPoP-bound to the installation's ES256 key; access tokens live 15 minutes, the refresh token is stored on disk and refreshed under a cross-process lock. |
| Draw id | `HMAC-SHA256(participation_secret, "TWILIGHT/TOKENDROP/DRAW-ID/V1" ‖ chain ‖ slot ‖ epoch)`: a per-epoch identity derived from a 32-byte secret that never leaves the machine. The authorization server's candidate set is a sorted list of these, hashed and anchored before the draw. |
| Join | `POST …/slots/{slot}/epochs/{epoch}/join` with `{chain_id, draw_id}`; the authorization server answers with a receipt, an Ed25519 JWS of type `twilight-enrollment-receipt+jwt`, verified against its JWKS before it is stored. `ACCEPTED` and `ALREADY_ACCEPTED` both mean you hold a place. |
| Capability | an RFC 8693 token exchange for a short-lived (≤ 15 min) submission credential scoped `mining:observation.submit` to one slot and epoch. Never carries the receipt, draw id, secret or payout address. |
| Observation | one `provider-observation-v1` record per unit of work: a UUIDv7 client record id, the source profile (`SEARCH_ROUTER_V1` for Slot 3), the provider's request id as the provider event id, timing, status code, outcome. No content, no tokens counted locally. |
| Submission | `POST …/observations` with the capability; a spooled record is removed only on `ACCEPTED` or `ALREADY_ACCEPTED`. 409 quarantines it; 401 renews the capability; everything else retries with backoff and `Retry-After`. |
| Verification | the authorization server reconciles each observation against the provider's verification API: `PENDING` → `VERIFIED`, `DUPLICATE` or `REJECTED`. The activity endpoint reports verified, pending and rejected counts per epoch; one verified is the eligibility threshold. The Slot 3 verification API is described on the [router page](https://docs.twilight.org/search-router.md#api-verif). |
| Payout | `PUT /v1/payout/declaration` with `{address}`: 200 means in force, 202 means held for an operator (`REPLACES_ACTIVE`, or `ADDRESS_IN_USE` which never activates by waiting). The authorization server echoes the canonical address; comparing it is the only transcription check until a wallet-signature binding ships. |
| Settlement | not a participant step: after the epoch closes the authorization server submits `MsgSubmitSettlementChunk` transactions on chain, up to 4 chunks of 32 recipients, then `MsgFinalizeSettlement`; the chain pays each recipient from the rewards module account. |

Fail-open is an invariant across the client: a mining failure never blocks a unit of work or a tool call. The other invariant is content-blindness: nothing content-bearing has a field in any record sent to the authorization server.

## Chain parameters (devnet-3 genesis)

Three application modules carry the mechanism. Values are the genesis as deployed; all are versioned on chain with effective epochs or heights.

| Module | Parameter | Value |
| --- | --- | --- |
| `coreslot` | `max_active_slots` / `min_active_slots` | 100 / 1 |
|  | `allow_self_registration` | false: the authority registers Slots |
|  | `slot_voting_power` | 1 (a Slot is a validator) |
|  | `activation_delay_blocks`, `key_rotation_delay_blocks`, `removal_delay_blocks` | 0, 1, 0 |
|  | `consensus_key_reuse_lockout` | 100,000 blocks |
|  | `selection_policy_update_cooldown_blocks` | 720 |
|  | per-Slot selection policy | `selection_rate_bps` 2500, `max_selected_participants` 10 |
|  | per-Slot reward weight | base, uptime, performance, each 1.0; stake and external unset; final 1.0 |
| `mining` | distribution mode v1 | `MINING_DISTRIBUTION_MODE_TRUSTED_AS_DISTRIBUTION` from epoch 1, open-ended |
|  | selection params v1 | `max_selection_rate_bps` 2500, `max_selected_participants_per_selection` 64, `max_candidates_per_selection` 1024, `beacon_start_offset_blocks` 48, `beacon_window_blocks` 24, `min_external_beacon_blocks` 12, `min_distinct_external_proposers` 3 |
|  | settlement params v1 | `settlement_window_epochs` 2, `max_recipients_per_chunk` 32, `max_chunks_per_settlement` 4, `min_recipient_payout_amount` 10000 |
| `rewards` | `native_denom` | `utwlt` (display `twlt`, exponent 6, symbol TWLT) |
|  | `max_supply` | 21,000,000,000,000 utwlt |
|  | `initial_block_subsidy` | 416,190 utwlt |
|  | `target_block_time_seconds` | 5 |
|  | `epoch_length_blocks` | 360 |
|  | `halving_mode` | `HALVING_MODE_SUPPLY_THRESHOLD` |
|  | `distribution_method` | `DISTRIBUTION_METHOD_UNIFORM_ACTIVE_BLOCKS` |
|  | `remainder_policy` | `REMAINDER_POLICY_CARRY_FORWARD` |
|  | `claims_enabled`, `max_claim_epochs_per_tx` | true, 100 |
|  | fees, treasury, weighted rewards | all disabled; treasury shares 0 bps |
|  | genesis supply | 2,000,000,000,000 utwlt |

Transactions, by module: `coreslot` — `MsgRegisterCoreSlot`, `MsgActivateCoreSlot`, `MsgInactivateCoreSlot`, `MsgSuspendCoreSlot`, `MsgRemoveCoreSlot`, `MsgRotateConsensusKey`, `MsgUpdatePayoutAddress`, `MsgUpdateSettlementAddress`, `MsgUpdateOperatorMetadata`, `MsgUpdateSelectionPolicy`, `MsgNominateAuthority` / `MsgAcceptAuthority`; `mining` — `MsgSubmitSettlementChunk`, `MsgFinalizeSettlement` (the only messages it owns; modes and parameters change through the authority's update messages); `rewards` — `MsgUpdateRewardsParams`, `MsgPauseRewards`, `MsgResumeRewards`. Source: `github.com/usmanshahid86/twilight-core`.

Queries the chain exposes for these, by name: `QueryEpochInfo`, `QueryEpochBoundaries`, `QueryEpochReward`, `QueryNextHalving`, `QuerySupplySchedule`, `QueryCumulativeEmitted`, `QueryCurrentEpochActiveBlocks`, `QuerySlotEntitlement`, `QuerySlotEntitlementsByEpoch`, `QueryModuleBalances`. The authorization server reads epoch length from `QueryEpochBoundaries` per epoch, never from a cached parameter.

## Hosts and networks (devnet)

| What | Where |
| --- | --- |
| Chain | `twilight-devnet-3`; token `TWLT`, base denomination `utwlt` (one millionth); mining payments come from the chain's rewards escrow account |
| Chain node the client reads | `http://54.179.101.3:26657` (CometBFT RPC; override with `TOKENDROP_WALLET_NODE`) |
| Chain source | `https://github.com/usmanshahid86/twilight-core` |
| Authorization server (Slot 3) | `https://minis.nyks.dev` |
| Platform: account, API keys, enrollment tokens, usage, traces | `https://platform.nyks.dev` |
| Slot 3 provider (the router) | `https://router-api.nyks.dev` — see [Search router](https://docs.twilight.org/search-router.md) |
| Client source, releases | `https://github.com/twilight-project/dropin-miner` |
| npm | `dropin-miner` (a wrapper that downloads the matching checksummed release) |

## Client versions

| Version | What |
| --- | --- |
| 0.1.6 | `agents prefer on\|off`: the search default is per machine; `join` treats already-in as success |
| 0.1.5 | setup finds and reuses a previous installation |
| 0.1.4 | install adds a Claude Code allow rule for the search command |
| 0.1.3 | `login`: a stored, verified API key |
| 0.1.1–0.1.2 | Windows-correct binaries; npm wrapper |
| 0.1.0 | first release: search, flush, hooks, agents install, enroll/join/payout/wallet/doctor/earnings |
