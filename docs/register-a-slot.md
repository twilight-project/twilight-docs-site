---
sidebar_position: 2
slug: /register-a-slot
title: Register a new Slot
description: What a Slot operator brings, how the authority registers and activates a Slot on chain, and what has to run off chain before anyone can take part.
---

# Register a new Slot

<p className="lede">A Slot is an independent verifier with work it defines itself. Registering one puts an operator on the chain as a validator with a share of every period's new coins, and makes that operator responsible for defining the work, verifying it, and paying the people who did it.</p>

Registration is an authority action. On devnet-3 `allow_self_registration` is off, so an operator does not register themselves: they prepare what is below, hand it to the network authority, and the authority signs two transactions. Everything after that, from running the verifier to paying participants, is the operator's.

:::tip[Want to run a Slot?]
Tell us about it through the [Slot operator form](https://docs.google.com/forms/d/e/1FAIpQLSdapI-Rg5pco4XEo4eqV-PMae8TjfJlOe_difIUG7kTzTyovw/viewform). We will come back to you about registering it on the network.
:::

## What you bring

| What | Why it is needed |
|---|---|
| **An operator address** | A `twilight1…` account that owns the Slot. One Slot per operator address. It signs your own later changes, such as metadata or a new payout address. |
| **A payout address** | Where the chain sends whatever is left of your Slot's share after participants are paid. May be the operator address. |
| **A settlement address** | A dedicated account your verifier pays participants from. Mandatory. It should hold nothing else and nobody should transact with it by hand, because settlement recovery assumes every transaction on it is the verifier's. It needs funds for fees before the first settlement. |
| **A fresh consensus key** | An ed25519 public key, base64, from a validator node you run. It must not be in use by another Slot or inside the reuse lockout of a removed one, which is 100,000 blocks. |
| **Metadata** | A moniker, and optionally an identity, a website, a security contact and details. Each field is at most 512 bytes. |
| **A selection policy** | Two numbers recorded at registration: a selection rate in basis points and a cap on selected participants. The defaults are 2500 and 10. They are operator configuration and can be changed later; they are not applied under today's distribution mode, see [Rewards](/rewards). |

Beyond the chain record, a Slot has to run three things. They can be split across teams or machines, but each belongs to exactly one Slot.

| Part | What it does |
|---|---|
| **A validator** | The node that signs blocks with the consensus key above. A Slot is a validator with voting power 1. It is not jailed or slashed for going offline; the authority inactivates it deliberately if it stays down. The same node should be archival, because the verifier reads settlement history from it. |
| **A provider** | The service that does the work and exposes a verification API: given a reference number, it says whether that unit of work happened, for which account, and when. Never the content. For the search Slot this is Jevlin's router. |
| **An authorization server** | The verifier and paymaster, one instance per Slot with its own database and keys. It enrolls participants, divides time into periods, checks each report against the provider, and submits the settlement transactions that pay participants. The reference implementation is [MINIS](/minis). |

## Step 1. Register

The authority signs one transaction with your operator, payout and settlement addresses, your consensus key and your moniker. The chain assigns the next Slot id and creates the record in the **pending** state: it exists, it has no voting power, and it earns nothing yet.

```bash
twilightd coreslot register <operator> <payout> <settlement> <consensus-pubkey-base64> <moniker> \
  --selection-rate-bps 2500 --max-selected-participants 10 \
  --from <authority> --chain-id twilight-devnet-3 --node <rpc> --fees 0utwlt -y
```

The transaction is rejected if the operator address already has a Slot, the consensus key is taken or locked, an address is malformed, or a metadata field is over its limit.

## Step 2. Start the validator

Bring the node up with the consensus key you registered before the Slot is activated, so it is signing from the first block in which it counts. A node that is not running when its Slot becomes active costs the network a validator and earns you a share you did nothing for.

## Step 3. Activate

A second authority transaction turns the record on.

```bash
twilightd coreslot activate <slot-id> --from <authority> ...
```

The Slot becomes **active** in the same block: it enters the validator set with voting power 1, and from the next period it receives a share of the chain's emission alongside every other active Slot. The active set is capped by `max_active_slots`, which is 100 and can never go higher. There is no activation delay in the current chain; the parameter exists but is required to be zero.

## Step 4. Stand up the verifier and the provider

The chain now owes your Slot a share every period, and holds it as an entitlement. Nothing reaches a participant until your authorization server submits settlement chunks that pay them. Before enrolling anyone:

1. Deploy the authorization server for this Slot, pointed at your own archival node and at the settlement account, with the provider seam configured. [MINIS](/minis#how-it-is-bound-to-a-slot) explains how the server is bound to the Slot through the settlement address.
2. Prove the provider seam by hand. The server starts healthy whether or not the provider's verification API answers; a seam that fails silently verifies nothing, and a period with nothing verified pays nobody.
3. Open enrollment, and publish the server's discovery URL so a client can be configured for your Slot.

The [MINIS deployment runbook](https://github.com/twilight-project/twilight-minis/blob/main/docs/runbooks/slot-as-deployment.md) is the complete procedure, written from a deployment that reached on-chain payout on devnet, including the configuration mistakes that look healthy and are not. [How mining works](/how-it-works) is the plain-language account of what the server does each period.

## After registration

| Change | Who signs | Takes effect |
|---|---|---|
| Payout address, settlement address, metadata, selection policy | the operator | the block that includes it |
| Inactivate | the operator or the authority | the block that includes it; refused if it would take the network below `min_active_slots` |
| Activate again, rotate the consensus key, remove | the authority | activation and removal in the block that includes them; key rotation one block later, old and new key swapped atomically |
| Suspend | the emergency authority only, with an evidence reference | the block that includes it |

A Slot moves between five states: **pending** after registration, **active**, **inactive**, **suspended**, and **removed**, which is final. An active Slot cannot be removed directly; it is inactivated or suspended first. A removed Slot's consensus key stays locked for 100,000 blocks.

:::note[Devnet preview]
On devnet-3 the three Slots were written into the genesis rather than registered by transaction, and the network authority is the Twilight team. Registering a fourth is the procedure above. On a fresh chain, the first Slots are added to the genesis file with `twilightd coreslot-genesis add` instead, because a genesis with no active Slot is invalid.
:::

## Next steps

<div className="cards">
  <a className="card" href="/slots"><strong>Slots</strong><span>What a Slot is, what it has to run, and the Slots today.</span></a>
  <a className="card" href="/rewards"><strong>Rewards</strong><span>How much a Slot is owed each period, and how it is split.</span></a>
  <a className="card" href="/developers"><strong>For developers</strong><span>The chain source, the protocol, and the search Slot as a worked example.</span></a>
</div>
