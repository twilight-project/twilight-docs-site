---
sidebar_position: 1
slug: /
title: Proof of work for machines that already work
sidebar_label: Overview
description: Twilight is a proof-of-work blockchain that decouples the block reward from block production. Validators are Slot operators who pass their share of new coins on to the people whose agents did verified work.
---

# Overview

Twilight is a proof-of-work blockchain that decouples the block reward from block production. Its validators are **Slot** operators, and each one passes its share of new coins on to the people whose agents did verified work.

A Slot is an independent verifier with work it defines itself. Its operator runs a validator, which collects the Slot's share, and an authorization server, which verifies the work and pays it out. One Slot is open today: **web search**, run by [Jevlin](https://jevlin.ai). A coding agent's searches go through it, and each half hour in which the agent searched earns the person running it a share.

:::warning[Devnet preview]
Twilight is a public preview on a network called devnet-3. The coins it pays are devnet TWLT, which are for testing and have no price. The numbers on this site are the preview's and can change between versions. Nothing here is a promise about a future mainnet.
:::

## Who can mine

Coding agents. The work the open Slot pays for is the web search an agent already does for its user, so any agent that can run a command on your machine can take part. These are set up by one install of the Slot's client, with a skill and hooks for each:

<div className="cards">
  <a className="card" href="https://docs.jevlin.ai/integrations/claude-code"><strong>Claude Code</strong><span>A skill, hooks and allow rules in settings.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/cursor"><strong>Cursor</strong><span>A skill and hooks, one lineage file per conversation.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/codex"><strong>Codex</strong><span>A skill, hooks and a permission profile for the search hosts.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/opencode"><strong>opencode</strong><span>An in-process plugin and a rules block.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/pi"><strong>Pi</strong><span>A skill and an auto-discovered extension.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/hermes"><strong>Hermes</strong><span>A skill and one hook in its config.</span></a>
  <a className="card" href="https://docs.jevlin.ai/integrations/any-other-agent"><strong>Any other agent</strong><span>Anything that can run a command: what to paste so it uses the client.</span></a>
</div>

A person is behind every agent: the wallet, the payout address and the claim that ties an agent to an account are theirs. [Get started](/get-started) is the setup; [Agent authentication](/agent-auth) is how an agent signs in with no browser.

## How it fits together

Five parts, three of them the Slot operator's. The chain keeps the Slot register, mints coins and moves money. A **provider** does the work and keeps a one-line record per unit. An **authorization server**, one per Slot, enrolls participants, verifies their reports against the provider, and submits the settlements that pay them. A **validator** per Slot runs the chain. The **client** on a participant's machine does the work through the provider, reports it, and holds the keys.

| | Sees the work | Knows who you are | Moves money |
|---|---|---|---|
| Provider | yes | by provider account | no |
| Authorization server ([MINIS](/minis)) | no, metadata only | by enrollment | submits settlements |
| Chain | no | by payment address | pays, from escrow |
| Client, on your machine | yes | it is you | no, it only receives |

The chain credits each active Slot every block and, when the period closes, mints the period's new coins and writes each Slot's share as an entitlement addressed to the operator's payout address. Only the Slot's authorization server, signing with the settlement address on the Slot's record, can release part of it to participants. Whatever it does not release is paid to the operator. [Architecture](/architecture) has the diagram and the chain's three modules.

## Register a new Slot

A Slot is registered on the chain by the network authority, not by self-service. The operator prepares the pieces, the authority signs two transactions, and the operator runs everything else. [Register a new Slot](/register-a-slot) is the full procedure; in outline:

1. **Bring the record.** An operator address, a payout address, a dedicated settlement address your verifier pays from, a fresh consensus key from a validator you run, and a moniker.
2. **The authority registers it.** One transaction creates the Slot in the pending state with the next free id.
3. **Start your validator, then the authority activates it.** The Slot joins the validator set with voting power 1 and, from the next period, receives a share of the chain's emission. Up to 100 Slots can be active.
4. **Stand up the provider and the verifier.** The provider does the work and exposes a verification API. The authorization server, one per Slot, enrolls participants, checks their reports against the provider, and submits the settlements that pay them. Until it does, the Slot's share sits on chain as an entitlement.

```bash
twilightd coreslot register <operator> <payout> <settlement> <consensus-pubkey-base64> <moniker> --from <authority> ...
twilightd coreslot activate <slot-id> --from <authority> ...
```

If you want to run a Slot, tell us about it through the [Slot operator form](https://docs.google.com/forms/d/e/1FAIpQLSdapI-Rg5pco4XEo4eqV-PMae8TjfJlOe_difIUG7kTzTyovw/viewform). To take part in a Slot that already exists rather than run one, see [Get started](/get-started).

## What you can do

Here are some of the ways people use Twilight today:

<div className="features">

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>Earn for the searches your agent already makes</summary>

Through the search Slot, each web search your coding agent makes is a unit of work, confirmed by the router that served it. It works from Claude Code, Cursor, Codex, opencode, Pi and Hermes, and any other agent that can run a command. One verified search in a half-hour period counts you in for that period's payment. More searches do not earn more, and nothing about your agent's work changes.

See [How mining works](/how-it-works) and [Jevlin](https://jevlin.ai).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M16 15h2"/></svg>Choose where you are paid</summary>

Setup makes a wallet for you, protected by a passphrase, and shows you 24 recovery words once. Or paste a `twilight1…` address you already have. Payments go straight to that address every period, with no claiming step. Nothing on your machine can spend from an address you brought.

```bash
jevlin wallet address
jevlin wallet balance
```

See [Your wallet](/wallet).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>Check that you are earning</summary>

Doctor is the health check. It says in plain words whether you are connected, enrolled, joined to the current period, and earning, and names the one thing to fix if something is not right. Earnings lists what the chain has paid to your address.

```bash
jevlin doctor
jevlin earnings
```

See [Get started](/get-started#3-the-first-unit-of-work).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Get paid every half hour</summary>

The chain splits each period's new coins between the active Slots. Each Slot then splits its share equally among everyone who did verified work in that period. You join a period two ahead, and coins are sent after it closes.

See [Rewards](/rewards).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3"/></svg>Turn it on and off from your agent</summary>

Out of the box your agent prefers the Slot's search over its own. Tell it once if you would rather it used its own search unless you ask. Searches that do not go through the Slot simply earn nothing.

```text
/jevlin off
/jevlin on
/jevlin status
```

See [docs.jevlin.ai](https://docs.jevlin.ai).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Keep your code and keys private</summary>

The part that sees your work does not pay you, and the part that pays you does not see your work. The provider sees your searches the way any search engine does. The verifier sees only that a search happened and when. The chain sees only your payment address. Your code, your recovery words and your passphrase never leave your machine.

See [Who sees what](/how-it-works#who-sees-what).

</details>

<details>
<summary><svg className="fi" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M4 10h16"/><path d="M10 10v10"/></svg>Run a Slot of your own</summary>

A Slot is an independent verifier, and it defines its own work: a test run, a review, a translation, anything an agent does through a service that can confirm it. The chain registers up to 100 Slots and pays each active one a share of every block. Operators run a validator, a provider and a verifier, and the protocol between them is specified.

See [Register a new Slot](/register-a-slot) and [Slots](/slots).

</details>

</div>

## What exists today

<dl className="figs">
  <div><dt>Slots active</dt><dd>3, up to 100</dd></div>
  <div><dt>Open to the public</dt><dd>1, web search</dd></div>
  <div><dt>Paid every</dt><dd>about 30 minutes</dd></div>
  <div><dt>Total supply</dt><dd>21,000,000 TWLT</dd></div>
  <div><dt>Client</dt><dd>one small program, no daemon</dd></div>
</dl>

The preview network runs three Slots. Two belong to the network itself. The third is open to anyone: web search, run by Jevlin. Everything else on this site is about Twilight itself, and applies to every Slot.

## Next steps

<div className="cards">
  <a className="card" href="/get-started"><strong>Get started</strong><span>Every setup question, the first unit of work, and the first reward.</span></a>
  <a className="card" href="/how-it-works"><strong>How mining works</strong><span>From a unit of work to a payment, for any Slot.</span></a>
  <a className="card" href="/slots"><strong>Slots</strong><span>The unit of proof of work, and who runs one.</span></a>
</div>
