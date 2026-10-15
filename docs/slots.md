---
sidebar_position: 2
slug: /slots
title: Slots
description: A Slot is one kind of work the chain pays for, run by an operator who defines it and verifies it.
---

# Slots

<p className="lede">A Slot is Twilight's unit of proof of work. The chain registers a bounded set of them, pays each active Slot a share of every block's new coins, and leaves the rest to the Slot: what the work is, how it is verified, and who gets paid.</p>

## What a Slot is

Think of a Slot as a job the network has agreed to pay for. Someone operates it. The operator provides the work, keeps a record of who did it, runs a verifier that checks those records, and pays the people who did verified work out of the Slot's share. The chain sees only three things: that the Slot exists, how much it is owed for each half-hour period, and the payments it makes.

Because the chain stays out of the work itself, a Slot can be almost anything, as long as the operator can verify that a unit of it really happened. The first Slot open to the public is web search: a search by a coding agent is a unit of work, and the router that served it can confirm it. Other Slots will define other units.

## What a Slot has to run

| Part | What it does | For the search Slot |
|---|---|---|
| **The provider** | does the work and writes a one-line record for each unit: who, when, a reference. Never the content. | Jevlin's search router |
| **The verifier** | enrolls participants, divides time into periods, checks reports against the provider's records, and sends the payments | Jevlin's verifier |
| **A validator** | the operator also helps run the chain itself | the operator's node |

The operator can run all three themselves or split them. What they cannot do is change how much their Slot is owed, which the chain decides, or pay without verifying, which the chain can audit.

## How a Slot comes to exist

Slots are registered on the chain by the network authority. There is no form to fill in and no self-service; an operator proposes a kind of work, the way it will be verified, and the way its share will be split, and the authority registers it. The active set is capped at a hundred. The authority can also remove a Slot, rotate its keys or change its parameters, and every change takes effect at a stated period rather than immediately.

## The Slots today

| Slot | Run by | Work |
|---|---|---|
| 1 | the network authority | network operation; not open to participants |
| 2 | the emergency authority | network operation; not open to participants |
| 3 | Jevlin | web search by coding agents. [Open to anyone.](/slot-search) |

## One client for every Slot

The program you install on your machine is not tied to search. It does whatever work a Slot asks for when your agent calls it, reports each unit to that Slot's verifier, and holds the identity and the payment address the rewards go to. When a new Slot opens, the same program takes part in it. [How mining works](/how-it-works) walks through what it does.
