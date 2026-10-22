---
sidebar_position: 3
slug: /architecture
title: Architecture
description: The five parts of Twilight, what each one holds, what passes between them, and what the chain itself records.
---

# Architecture

<p className="lede">Twilight is a small chain with most of the work kept off it. The chain registers Slots, mints coins, and moves money. Everything about who did what happens between three parts the Slot operator runs and one program on each participant's machine.</p>

<div className="figure">
<svg viewBox="0 0 860 470" role="img" aria-label="Architecture: participant client, provider and authorization server, chain">
  <defs>
    <marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5 0 10z" fill="currentColor"/></marker>
  </defs>
  <g fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="20" y="20" width="820" height="110" rx="6" strokeDasharray="4 4" opacity=".45"/>
    <rect x="20" y="160" width="820" height="150" rx="6" strokeDasharray="4 4" opacity=".45"/>
    <rect x="20" y="340" width="820" height="110" rx="6" strokeDasharray="4 4" opacity=".45"/>
  </g>
  <g className="fig-eyebrow" fill="currentColor" opacity=".6">
    <text x="32" y="38">Participant's machine</text>
    <text x="32" y="178">Slot operator</text>
    <text x="32" y="358">Twilight chain</text>
  </g>
  <g fill="none" stroke="currentColor" strokeWidth="1.2">
    <rect x="290" y="50" width="280" height="64" rx="5"/>
    <rect x="60" y="200" width="300" height="90" rx="5"/>
    <rect x="500" y="200" width="300" height="90" rx="5"/>
    <rect x="60" y="372" width="220" height="60" rx="5"/>
    <rect x="320" y="372" width="220" height="60" rx="5"/>
    <rect x="580" y="372" width="220" height="60" rx="5"/>
  </g>
  <g className="fig-title" fill="currentColor">
    <text x="430" y="78" textAnchor="middle">Coding agent + client</text>
    <text x="210" y="230" textAnchor="middle">Provider</text>
    <text x="650" y="230" textAnchor="middle">Authorization server (MINIS)</text>
    <text x="170" y="397" textAnchor="middle">x/coreslot</text>
    <text x="430" y="397" textAnchor="middle">x/rewards</text>
    <text x="690" y="397" textAnchor="middle">x/mining</text>
  </g>
  <g className="fig-sub" fill="currentColor" opacity=".7">
    <text x="430" y="100" textAnchor="middle">does the work, reports each unit, holds the keys</text>
    <text x="210" y="254" textAnchor="middle">does the work, writes a one-line record</text>
    <text x="210" y="274" textAnchor="middle">exposes a verification API</text>
    <text x="650" y="254" textAnchor="middle">enrolls, runs epochs, verifies reports</text>
    <text x="650" y="274" textAnchor="middle">submits the settlements that pay</text>
    <text x="170" y="418" textAnchor="middle">Slot records, validator set</text>
    <text x="430" y="418" textAnchor="middle">emission, entitlements</text>
    <text x="690" y="418" textAnchor="middle">settlements, payments</text>
  </g>
  <g fill="none" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#ar)">
    <path d="M330 114 L230 200"/>
    <path d="M530 114 L630 200"/>
    <path d="M360 236 L500 236"/>
    <path d="M690 290 L690 372"/>
    <path d="M540 402 L580 402" markerEnd="url(#ar)"/>
    <path d="M280 402 L320 402" markerEnd="url(#ar)"/>
  </g>
  <g className="fig-label" fill="currentColor" opacity=".8">
    <text x="230" y="150">work, result</text>
    <text x="600" y="150" textAnchor="start">report: who, when, reference</text>
    <text x="430" y="228" textAnchor="middle">verify</text>
    <text x="700" y="335" textAnchor="start">settlement transactions</text>
    <text x="300" y="452" textAnchor="middle">active blocks → entitlement</text>
    <text x="560" y="452" textAnchor="middle">entitlement → payouts</text>
  </g>
</svg>
</div>

## The five parts

| Part | Who runs it | What it holds | What it never has |
|---|---|---|---|
| **The chain** | the Slot operators, as validators | the Slot records, how much each Slot is owed per period, and the payments made | anything about the work, or about who the participants are beyond a payment address |
| **A validator** | each Slot operator | one consensus key with voting power 1 | stake: there is none, and no slashing |
| **A provider** | the Slot operator | the work itself, and a one-line record per unit: account, time, reference | your wallet, your payment address |
| **An authorization server** | the Slot operator, one per Slot | enrollments, the period calendar, reports and their verification status, the settlement key | the content of any work, prompts or results |
| **The client** | you, on your machine | the keys, the payment address, and reports not yet sent | nothing that stays running; it exits after each unit |

[Slots](/slots) covers what makes a Slot and who runs one. [MINIS](/minis) is the authorization server in detail. The client for the open Slot is Jevlin's, and its own docs describe it.

## Where the code lives

| Part | Repository | What is in it |
|---|---|---|
| **The chain** | [twilight-project/twilight-core](https://github.com/twilight-project/twilight-core) | `twilightd`, the Cosmos SDK app with the `coreslot`, `rewards` and `mining` modules, the protobuf definitions, and the operator guide |
| **The authorization server** | [twilight-project/twilight-minis](https://github.com/twilight-project/twilight-minis) | `minis-server`, the `minis-scheduler` that drives each period, `drawverify`, the deployment runbooks and the ADRs |

The provider and the client belong to each Slot's operator. For the open Slot they are Jevlin's; see [Slots](/slots#jevlin-the-search-slots-operator).

## What passes between them

1. **Work.** The agent calls the client; the client does the unit through the provider and hands the result back. For the search Slot this is one web search through the router.
2. **A record, in two places.** The provider keeps one line about the unit: which account, when, a reference. The client keeps the same line as a report, and sends it to the authorization server right afterwards.
3. **Verification.** The authorization server asks the provider's verification API whether that reference really happened for that account. If so, the report is verified and the participant is counted in for the period.
4. **Entitlement.** Separately, every block the chain credits each active Slot one block of participation. At the period's close it mints the period's new coins into escrow and writes each Slot's share as an entitlement addressed to the operator's payout address.
5. **Settlement.** The authorization server submits transactions that release the entitlement to participants in chunks, then finalizes. What is not paid to participants goes to the Slot's payout address. [Rewards](/rewards) has the rules.

Nothing in steps 1 to 3 touches the chain, and nothing in 4 or 5 touches the work. That separation is the design: the part that sees your work cannot pay you, and the part that pays you cannot see your work. [How mining works](/how-it-works#who-sees-what) lays out who sees what.

## What the chain records

The chain is a Cosmos SDK Proof-of-Authority chain with the staking, slashing, governance and distribution modules left out. Three modules carry the mechanism.

| Module | Plain words | What it stores |
|---|---|---|
| **coreslot** | the register of Slots, and the validator set | one record per Slot: operator, consensus key, payout and settlement addresses, status, metadata. The only module that changes the validator set. |
| **rewards** | the mint | the block subsidy, the halving schedule, the supply cap, and one entitlement per Slot per period |
| **mining** | the payment desk | one settlement per Slot per period, its chunk cursor, and whether it is finalized. It owns only two transactions: submit a chunk, finalize. |

Everything the chain decides is deterministic and integer-only, and a period's close either fully succeeds or changes nothing. The chain never decides who did work. It decides how much a Slot is owed and enforces that the money can go only to the addresses in a chunk or to the Slot's recorded payout address.

## What stays off the chain

- **Which account did what.** Enrollment binds an installation to a provider account; that binding lives in the authorization server, not on the chain.
- **The period calendar as participants see it.** Join windows, submission deadlines and verification happen in the authorization server. The chain knows only epochs by block height.
- **The split among participants.** Under today's distribution mode the authorization server computes it and the chain trusts the chunk it submits, within the chain's caps. A verifiable draw, anchored on chain before the randomness is known, is built and can be checked by anyone; see [MINIS](/minis#the-draw).
- **Discovery.** A client finds a Slot's authorization server by a URL the operator publishes; the server's discovery document names the chain and Slot it serves, and the client refuses one that does not match.

## Trust, in one paragraph

A participant trusts the operator for two things: that the provider records work honestly, and that the authorization server pays the eligible set as it says. They do not trust the operator with their keys, their wallet, or their code. The chain limits what a dishonest operator can do with the money: it cannot redirect the remainder, cannot pay anyone outside a submitted chunk, cannot pay more than the entitlement, and leaves a record of every chunk. An operator who stops settling simply forfeits nothing to participants and keeps the entitlement at their payout address, which is visible to everyone.

## Next steps

<div className="cards">
  <a className="card" href="/minis"><strong>MINIS</strong><span>The authorization server: what it does each period, and how it is bound to a Slot.</span></a>
  <a className="card" href="/rewards"><strong>Rewards</strong><span>Emission, entitlements, settlement, and the operator's share.</span></a>
  <a className="card" href="/register-a-slot"><strong>Register a new Slot</strong><span>The chain record, the two authority transactions, and what to run.</span></a>
</div>
