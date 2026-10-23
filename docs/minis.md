---
sidebar_position: 6
slug: /minis
title: "MINIS: the authorization server"
sidebar_label: MINIS
description: What a Slot's authorization server is, what it does in every period, how it is bound to its Slot on the chain, and how it is deployed and found.
---

# MINIS: the authorization server

<p className="lede">Every Slot has one authorization server. It is the Slot's verifier and paymaster: it enrolls participants, divides time into periods, checks each report against the provider, works out who is owed what, and submits the transactions that pay them. MINIS is the reference implementation.</p>

The name is short for Miner Incentive and Network Integration Service. Older documents call it the AS, because it plays the OAuth authorization-server role toward the client. It is published at [twilight-project/twilight-minis](https://github.com/twilight-project/twilight-minis).

**One Slot, one MINIS.** It is not a shared service. Each instance has its own database, its own settlement key and its own chain account, and serves exactly one Slot on exactly one chain. Two Slots may run identical software against the same provider; they still get separate servers.

**It never does the work and never sees it.** No endpoint accepts, stores, logs or returns a prompt, a query or a result. The evidence it handles is metadata by schema: an account, a time, a reference number, an outcome.

## What it does in a period

<ol className="steps">
  <li><span className="steps__n">01</span><div><b>Enrolls.</b> An installation is bound to a provider account once, with no browser in the way; see <a href="/agent-auth">agent authentication</a>. Enrollment gives the machine an identity key; every later call is proof-of-possession bound to it, so a stolen token alone is useless.</div></li>
  <li><span className="steps__n">02</span><div><b>Opens periods.</b> It divides time into epochs that follow the chain's, and publishes which one a client may join. A client joins two periods ahead and receives a signed receipt for its place.</div></li>
  <li><span className="steps__n">03</span><div><b>Accepts reports.</b> One record per unit of work, submitted with a short-lived credential scoped to one Slot and one period. Duplicates are recognised, and a report that arrives after the period's submission deadline is late and does not count.</div></li>
  <li><span className="steps__n">04</span><div><b>Verifies.</b> It asks the provider's verification API about each reference. A report becomes verified, duplicate or rejected. One verified report in a period is the eligibility threshold; more do not earn more.</div></li>
  <li><span className="steps__n">05</span><div><b>Allocates.</b> Under today's policy it divides the amount available for participants equally among everyone eligible. The result is sealed with the policy that produced it and never rewritten.</div></li>
  <li><span className="steps__n">06</span><div><b>Settles.</b> Once the chain has written the Slot's entitlement for the period, it submits settlement chunks that pay the eligible addresses, then finalizes. Whatever it did not pay out goes to the Slot's payout address. <a href="/rewards#from-entitlement-to-payment">Rewards</a> has the chain's rules.</div></li>
</ol>

A separate scheduler process drives this cycle on a timer; the server itself only answers requests and writes transactions.

## Agent authentication

Enrollment needs no browser: the agent gets a key from the provider with no credential, a person claims it later, and the provider's signed assertion is what MINIS redeems. [Agent authentication](/agent-auth) has the whole path and the rules MINIS holds to.

## How it is bound to a Slot

There is no transaction that registers an authorization server by name. The chain knows a Slot's server by one thing: the **settlement address** on the Slot's record. Binding a server to a Slot is therefore four steps, two on chain and two off.

| Step | Where | What it does |
|---|---|---|
| **1. A dedicated settlement account** | you provision it | A fresh `twilight1…` account whose key will live only on the server. Nothing else is ever done with it: the server watches the account's transaction sequence and halts its own writes if anything it did not send appears, which is how a stolen key is noticed. It needs a small balance once; the chain charges no fees, but an account must exist to sign. |
| **2. The address on the Slot record** | chain, `coreslot` | Given at [registration](/register-a-slot) or set later by the operator with `twilightd coreslot update-settlement-address`. From then on the chain accepts a settlement chunk for this Slot only when it is signed by this address. That is the whole authorization: whoever holds the settlement key is the Slot's paymaster. |
| **3. The server's configuration** | the server | The chain id, the Slot id, the settlement address and key path, and a gRPC endpoint on an archival node, which should be the operator's own validator. Under the production profile the server refuses a fake chain adapter and refuses to start against a chain release older than it needs. |
| **4. Discovery** | the server, published by you | The server serves a document at `/.well-known/twilight-mining` naming the chain id, the Slot id, its endpoints and size limits. You publish the server's base URL; a client configured for your Slot reads that document and refuses a server whose chain or Slot does not match. |

If the Slot also runs the draw, a fifth account is needed: an **anchor** account, distinct from the settlement account, whose address you publish before the first anchored period. See [the draw](#the-draw).

Changing the settlement address later is an operator transaction and takes effect in the block that includes it. The server has to be moved to the new key at the same time, because a chunk signed by the old address is rejected from then on.

## Requirements

| Requirement | Why |
|---|---|
| **Linux server with PostgreSQL** | the database holds enrollments, receipts, reports, verification results, sealed allocations and every transaction intent |
| **An archival chain node, yours** | the server reads entitlements, settlement parameters and past settlements; a pruning node breaks settlement recovery. Pointing it at someone else's node makes their outage your missed period. |
| **The settlement key, on disk, mode 0600** | signs every chunk and finalization. There is a written handling instruction that travels with the key; see the MINIS runbooks. |
| **A provider account with the verification API** | the seam the server verifies through. The server starts healthy whether or not the seam works, so it is proved by hand before anyone enrolls. |
| **TLS in front of the public listener** | the participant-facing surface; the operator surface binds to loopback only |
| **The cycle scheduler** | runs the economic cycle each period |

The [deployment runbook](https://github.com/twilight-project/twilight-minis/blob/main/docs/runbooks/slot-as-deployment.md) is the complete procedure and is written from a deployment that reached on-chain payout on devnet, including the configuration mistakes that look healthy and are not. Deploy the chain release before the server release, never the other way round.

## What the operator can and cannot do

The server is operated through an admin surface on loopback, with credentials that are minted and revoked by name. Through it the operator approves a participant's change of payout address, reads halts and clears the ones that are theirs to clear, and inspects any period.

What the operator cannot do, by construction:

- **Pay an address that did not earn.** A chunk may only name addresses the chain will accept, within the entitlement, and the chain caps how much of an entitlement chunks may release in total.
- **Redirect the remainder.** It goes to the payout address the chain snapshotted when the period closed, and no transaction carries a destination for it.
- **Rewrite a sealed period.** An allocation, once sealed, is final; a late report cannot be added to it. Nothing sealed is ever deleted.
- **Read anyone's work.** There is no field for it.

An optional, unauthenticated **operator status** surface explains each period publicly: the clock, the deadlines, and what happened to a given period. It is off by default; an operator may serve it and must then keep at least ninety periods of history.

## The draw

Equal division among the eligible is what runs today, and the chain's distribution mode trusts the server's arithmetic. MINIS also contains a **verifiable draw**: a lottery over the eligible set whose candidates and rules are committed to the chain before the randomness that decides it exists.

The commitment is an ordinary transaction from the anchor account whose memo carries two digests: one over the sorted candidate list, one over every parameter of the draw. A window of block hashes opens a fixed number of blocks after the anchor confirms and is the randomness. Because the anchor is on chain first, the operator cannot see the outcome and then choose the candidates or the rules. An independent program, `drawverify`, reproduces the result from a node and the published record, without trusting the operator or the repository. [Verifying a draw](https://github.com/twilight-project/twilight-minis/blob/main/docs/verifying-a-draw.md) is the procedure.

The draw is built, proven on a devnet, and not what drives periods today: the chain's distribution mode would have to change, and the network needs enough Slots proposing blocks for a beacon to exist, since a Slot's own blocks are excluded from its own draw.

## Next steps

<div className="cards">
  <a className="card" href="/architecture"><strong>Architecture</strong><span>Where the authorization server sits among the chain, the provider and the client.</span></a>
  <a className="card" href="/rewards"><strong>Rewards</strong><span>Entitlements, chunks, finalization, and what the operator keeps.</span></a>
  <a className="card" href="/register-a-slot"><strong>Register a new Slot</strong><span>The record the authority signs, including the settlement address.</span></a>
</div>
