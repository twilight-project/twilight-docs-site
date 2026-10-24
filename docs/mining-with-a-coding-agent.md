---
sidebar_position: 7
slug: /mining-with-a-coding-agent
title: Mining with Claude Code, Cursor or Codex
sidebar_label: Mining with a coding agent
description: What a coding agent actually does when it mines on Twilight, how the chain verifies it, what it earns on the preview network, and what this is not.
---

# Mining with Claude Code, Cursor or Codex

<p className="lede">A coding agent mines on Twilight by doing work it was going to do anyway. Today that work is one web search, made through the open search Slot, and the chain pays a share of the block reward for each period in which the search was verified. Nothing hashes, no GPU is used, and nothing runs while the agent is idle. Rewards are devnet TWLT, which has no price.</p>

## What the agent actually does

When Claude Code, Cursor, Codex, opencode, Pi, Hermes or another coding agent needs the web, it calls a small program on your machine instead of its built-in search tool. The program sends the search to the Slot's provider, returns the result to the agent, and then sends a short report to the Slot's verifier saying that a search happened: which account, when, and a reference number. Then it exits.

That report is the whole of what "AI agent mining" means here. The agent does not run a second workload, and the search is not slower for being counted. The result has already come back before the report is sent. [How mining works](/how-it-works) follows one unit of work from the agent to the payment.

## How the chain verifies it

The Slot's verifier matches your machine's report against the provider's own record of the search. If the two agree, that is one verified unit of work, and your installation is counted in for the current period. The chain never sees the search, and the provider never sees your wallet. [Who sees what](/how-it-works#who-sees-what) lays out the separation.

A made-up report fails the match, because there is no provider record for it. Repeating a search does nothing useful either, since one verified unit in a period already counts you in.

## What it earns, and the devnet caveat

Every period of about thirty minutes, the chain mints that period's coins and gives each active Slot its share. The Slot then splits its share equally among everyone who had at least one verified unit in the period. A thousand searches earn the same as one. Payment goes to the address you chose, within two periods, with no claiming step. [Rewards](/rewards) has the numbers and the rules.

Twilight is a public preview on a test network. The coins it pays are devnet TWLT, which cannot be bought, sold or exchanged. The preview exists to show that the mechanism works with real agents doing real work, not to pay anyone yet.

## Which agents can mine

Any agent that can run a command on your machine. The search Slot's client sets itself up in Claude Code, Cursor, Codex, opencode, Pi and Hermes, and gives any other agent a short rules block to paste. The agent does not need to know about Twilight. It only needs to search the way it already does.

You can mine from more than one computer. Each one enrolls on its own and reports its own work, with no advantage beyond convenience, since shares are equal.

## What this is not

- **Not a miner running on your machine.** There is no service, daemon or background process. The program runs when the agent calls it and stops when the report is sent. If the agent is idle, Twilight is idle.
- **Not a GPU or CPU workload.** The work is a search request. It uses no more of your computer than the search would have anyway.
- **Not something that reads your code.** The provider sees the search, the way any search service does. The verifier sees that a search happened. The chain sees your address and what it was paid.
- **Not income.** The preview network pays coins with no price. If you are looking for a way to earn money with a coding agent, this is not that.

## Turning it on

Mining is a question the search Slot's client asks during its setup. Say yes, give a payout address or let it make a wallet for you, and work as you normally would. [Get started](/get-started) walks through the questions. The client itself, and how to install it, is documented at [docs.jevlin.ai](https://docs.jevlin.ai/quickstart). To stop, tell the agent `/jevlin off`; it goes back to its own tools and your wallet stays yours.
