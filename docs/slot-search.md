---
sidebar_position: 5
slug: /slot-search
title: "Slot 3: web search"
sidebar_label: The search Slot
description: The first Slot open to the public, run by Jevlin. What a unit of work is here, and how to take part.
---

# Slot 3: web search

<p className="lede">Web search is the first kind of work Twilight pays for. A coding agent searches the web many times a day; through this Slot, each search is a unit of work, confirmed by the router that served it.</p>

## Who runs it

[Jevlin](https://jevlin.ai) operates the Slot. Its search router is the provider: it fans a query across several web indexes and returns the results to your agent. Its verifier confirms each search and pays the Slot's share. Jevlin's router works like any search service; Twilight is what makes using it count as work.

## What a unit is

One search made through the router by your installation. The router records which account searched, when, and a reference number; it does not pass the text of the search or the results to the verifier. One verified search in a period counts you in for that period, and more do not earn more.

## Which agents

| Agent | What setup adds |
|---|---|
| Claude Code | a skill and a few hook entries in its settings, so searches go through the Slot without prompts |
| Cursor | a skill and hook entries in its hooks file |
| Codex | a skill. Codex blocks network for shell commands by default; allow it for this one command or searches fail quietly |
| opencode, Pi | a small plugin and one line for its instructions file |
| Hermes, anything else | one rules line, printed for you to paste |

## On and off

Out of the box your agent is told to prefer the Slot's search over its own. If you would rather it used its own search unless you ask, say so once:

```bash
/dropin-miner off        # in Claude Code, Codex or Cursor
/dropin-miner on
/dropin-miner status
```

Searches that do not go through the Slot earn nothing, which is the only consequence.

## What the router sees

Your searches and their results, the way any search engine does, plus the time each took. It never sees your wallet, your recovery words or your payment address, and your code is never sent anywhere. The verifier sees only that a search happened and when.

:::note
Taking part is the same as for any Slot: [install the client](/get-started), enable mining, choose where to be paid. The client ships ready for this Slot.
:::
