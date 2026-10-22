---
sidebar_position: 2
slug: /slots
title: Slots
description: A Slot is an independent verifier with work it defines itself, run by an operator the chain pays a share of every block.
---

# Slots

<p className="lede">A Slot is Twilight's unit of proof of work. The chain registers a bounded set of them, pays each active Slot a share of every block's new coins, and leaves the rest to the Slot: what the work is, how it is verified, and who gets paid.</p>

## What a Slot is

A Slot is an independent verifier. It defines its own work, and the network pays it a share of every block for verifying who did that work. Someone operates it. The operator provides the work, keeps a record of who did it, runs a verifier that checks those records, and pays the people who did verified work out of the Slot's share. The chain sees only three things: that the Slot exists, how much it is owed for each half-hour period, and the payments it makes.

Because the chain stays out of the work itself, a Slot can be almost anything, as long as the operator can verify that a unit of it really happened. The first Slot open to the public is web search: a search by a coding agent is a unit of work, and the router that served it can confirm it. Other Slots will define other units.

## What a Slot has to run

| Part | What it does | For the search Slot |
|---|---|---|
| **The provider** | does the work and writes a one-line record for each unit: who, when, a reference. Never the content. | Jevlin's search router |
| **The verifier** | enrolls participants, divides time into periods, checks reports against the provider's records, and sends the payments | Jevlin's verifier |
| **A validator** | the operator also helps run the chain itself | the operator's node |

The operator can run all three themselves or split them. What they cannot do is change how much their Slot is owed, which the chain decides, or pay without verifying, which the chain can audit.

## How a Slot comes to exist

Slots are registered on the chain by the network authority. There is no form to fill in and no self-service; an operator brings an operator address, a payout address, a settlement address, a fresh consensus key and a name, and the authority registers the Slot and then activates it. The active set is capped at a hundred. The authority can also remove a Slot, rotate its key or change its parameters; a separate emergency authority can only suspend one. Registration, activation and removal take effect in the block that includes them, and a key rotation one block later. [Register a new Slot](/register-a-slot) is the full procedure.

## The Slots today

| Slot | Run by | Work |
|---|---|---|
| 1 | the network authority | network operation; not open to participants |
| 2 | the emergency authority | network operation; not open to participants |
| 3 | Jevlin | web search by coding agents: Claude Code, Cursor, Codex, opencode, Pi, Hermes and others. Open to anyone: [jevlin.ai](https://jevlin.ai) |

## Jevlin, the search Slot's operator

[Jevlin](https://jevlin.ai) runs Slot 3 and everything a Slot has to run, from its own validator to the client on your machine.

| Part | What Jevlin runs |
|---|---|
| **Provider** | Jevlin's search router, the service your agent's searches go through. It records each search and answers the verifier's questions about it. |
| **Verifier** | A [MINIS](/minis) instance for Slot 3, with its own settlement account on the chain. |
| **Client** | `jevlin`, one binary with no daemon: the agent skill and hooks, the wallet, and the mining plane that reports each search. Source at [jevlinai/jevlin-go](https://github.com/jevlinai/jevlin-go); install and use at [docs.jevlin.ai](https://docs.jevlin.ai). |
| **Sign-in** | The browserless path in [Agent authentication](/agent-auth): the agent gets its key from Jevlin's agents API, and a person claims it later. |

## A client per Slot

The client is the Slot's: it does the work the Slot defines, reports each unit to that Slot's verifier, and holds the identity and the payment address the rewards go to. A new Slot brings its own, written against the protocol in the MINIS repository. [How mining works](/how-it-works) walks through what a client does.
