---
sidebar_position: 4
slug: /rewards
title: Rewards
description: How coins are created, how they are split between Slots, and how a Slot pays its people.
---

# Rewards

<p className="lede">Two splits happen every half hour. The chain splits the period's new coins between the Slots. Then each Slot splits its share among the people who did its work.</p>

## Periods of about 30 minutes

Time is divided into periods the network calls epochs: 360 blocks of five seconds, so about half an hour. Every block creates new coins; at the end of the period they are added up and divided.

## The chain's split, between Slots

The period's coins go to the Slots in proportion to how long each was active during it. With three Slots active for the whole period, each is owed a third. That number is recorded on the chain as the Slot's **entitlement**, and the Slot's verifier has two periods to release it.

## The Slot's split, among people

How a Slot divides its entitlement is part of the Slot's definition. On the preview network every Slot uses the same rule:

- If you had at least one verified unit of work in the period, you are counted in.
- Everyone counted in gets an **equal share**. A thousand units earn the same as one.
- Payments go to the address you chose, within two periods, with no claiming step.
- Very small shares, under one hundredth of a coin, are not sent.

Equal shares make flooding pointless. There is nothing to gain from more machines, more accounts or more traffic than you actually produce, so a Slot stays about people doing its work rather than about who can generate the most of it. A Slot could choose a different rule in future; the chain records which rule is in force and from which period.

## Where the coins come from

Twilight follows Bitcoin's shape. There will only ever be 21 million TWLT. Every block creates a fixed number of new coins, and that number halves at fixed points as the supply fills up, so the first half of all coins is produced in roughly the first four years, the next quarter in the four after that, and so on.

<dl className="figs">
  <div><dt>Total that will ever exist</dt><dd>21,000,000 TWLT</dd></div>
  <div><dt>New coins per block</dt><dd>0.41619 TWLT</dd></div>
  <div><dt>Block time</dt><dd>5 seconds</dd></div>
  <div><dt>Per period, at the start</dt><dd>about 150 TWLT</dd></div>
  <div><dt>Halving</dt><dd>when the supply crosses 10.5M, 15.75M, 18.375M and so on</dd></div>
</dl>

## Devnet coins

:::warning[Devnet preview]
Everything above is the preview network as it runs now. Devnet TWLT is for testing and has no price. Period length, the split rules and the supply numbers are the preview's and may change between versions. There is nothing here to invest in.
:::

## Checking what you have earned

```bash
dropin-miner earnings
dropin-miner wallet balance
```

Earnings reads the chain and lists only payments from the rewards account, so it is the number to trust. Balance shows what the wallet holds now.
