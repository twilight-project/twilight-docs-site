---
sidebar_position: 3
slug: /how-it-works
title: How mining works
description: From a unit of work to a payment, for any Slot.
---

# How mining works

<p className="lede">One loop, six steps, the same for every Slot. You are involved in the first and the last, and nothing runs on your machine in between.</p>

<ol className="steps">
  <li><span className="steps__n">01</span><div><b>Your agent does the Slot's work.</b> Claude Code, Cursor, Codex, opencode, Pi, Hermes or any other coding agent calls the Slot's small program on your machine, which does the work through the Slot's provider and hands the result back. To your agent this is just a tool.</div></li>
  <li><span className="steps__n">02</span><div><b>The provider makes a record.</b> Not of what the work was, just that it happened: which account, when, and a reference number. A timestamp, not a transcript.</div></li>
  <li><span className="steps__n">03</span><div><b>Your machine reports it.</b> Right afterwards, the program sends a short report to the Slot's verifier and exits. No background process, nothing polling, nothing on your battery while you work.</div></li>
  <li><span className="steps__n">04</span><div><b>The verifier checks.</b> It matches your report against the provider's record. If they agree, that is a verified unit of work, and you are counted in for the current period.</div></li>
  <li><span className="steps__n">05</span><div><b>The chain mints the Slot's share.</b> Every block, the chain credits each active Slot one block of participation. When the period closes it mints the period's new coins into an escrow account and writes each Slot's share as an <b>entitlement</b> addressed to the operator's payout address. The coins are the operator's; nothing has reached a participant yet.</div></li>
  <li><span className="steps__n">06</span><div><b>The operator pays it out.</b> The Slot's verifier releases part of the entitlement, split among everyone who was counted in, straight to the addresses they chose, then finalizes. Whatever it did not release goes to the operator's payout address. There is no claiming step, and the chain never pays on a timer: every release is a transaction the operator's server signs.</div></li>
</ol>

## Who sees what

The pieces are separated on purpose. The part that sees your work does not pay you, and the part that pays you does not see your work.

| | Knows | Never sees |
|---|---|---|
| **The Slot's provider** | the work itself, the way any service you use sees what you use it for, plus the time and cost | your wallet, your recovery words, your payment address |
| **The Slot's verifier** | that your installation did work, and when | what the work was |
| **The chain** | your payment address and what it was paid | everything else |
| **Your machine** | everything, because it is yours | — |

## What counts as a unit

Each Slot defines its own unit of work and how it is checked. The chain does not care what it is; it cares that the Slot's verifier can tell a real unit from a made-up one. For the search Slot a unit is one search, confirmed by the router that served it. A future Slot might define a unit as a test run, a review, a translation, or anything else an agent does that can be confirmed by the service it did it through.

## Nothing runs in the background

The program is not a service, a daemon, a proxy or a plugin that stays open. It runs when your agent calls it, does its work, sends its report, and stops. If your agent is idle, Twilight is idle. Close your laptop and nothing is left behind.

:::note
The only thing that persists is a small folder in your home directory with your keys, your settings and any reports not yet sent. [Your wallet](/wallet) explains what is in it.
:::
