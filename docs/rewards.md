---
sidebar_position: 4
slug: /rewards
title: Rewards
description: How coins are created, how they are split between Slots, and how a Slot pays its people.
---

# Rewards

<p className="lede">Two splits happen every half hour. The chain splits the period's new coins between the Slots. Then each Slot splits its share among the people who did its work.</p>

## Periods of about 30 minutes

Time is divided into periods the network calls epochs: 360 blocks of five seconds, so about half an hour. Every block earns a fixed subsidy and credits each active Slot one block of participation. The chain does not mint block by block: when the period closes it adds up the subsidies, mints them in one go into an escrow account it controls, and divides them.

## The chain's split, between Slots

The period's coins go to the Slots in proportion to how many blocks each was active for. With three Slots active for the whole period, each is owed a third. That number is recorded on the chain as the Slot's **entitlement**, addressed to the operator's payout address as it stood when the period closed. The coins stay in escrow until the Slot's authorization server releases them, and it has two periods to do so; whatever it does not release to participants is paid to the operator. If the chain's reward configuration sets a treasury share, that cut is paid to the treasury address before the split. A Slot active for only part of a period is owed proportionally less; the configured reward weight is recorded but not used today.

## The Slot's split, among people

How a Slot divides its entitlement is part of the Slot's definition. On the preview network every Slot uses the same rule:

- If you had at least one verified unit of work in the period, you are counted in.
- Everyone counted in gets an **equal share**. A thousand units earn the same as one.
- Payments go to the address you chose, within two periods, with no claiming step.
- Very small shares, under one hundredth of a coin, are not sent.

Equal shares make flooding pointless. There is nothing to gain from more machines, more accounts or more traffic than you actually produce, so a Slot stays about people doing its work rather than about who can generate the most of it. A Slot could choose a different rule in future; the chain records which rule is in force and from which period.

## From entitlement to payment

The chain and the Slot's authorization server each do half of the paying. The chain never decides who did work; the server never touches the money directly.

<ol className="steps">
  <li><span className="steps__n">01</span><div><b>The period closes.</b> The chain adds up the blocks each Slot was active for, mints the period's coins into an escrow account, and writes one <b>entitlement</b> per active Slot: the amount, and the Slot's payout address as it stood at that moment. The address is frozen there; nothing can change where the remainder goes afterwards.</div></li>
  <li><span className="steps__n">02</span><div><b>A settlement opens.</b> The chain itself opens one settlement per entitlement. No one asks for it and no one can open one that the chain did not. It carries a deadline: the settlement window, two periods on the preview network.</div></li>
  <li><span className="steps__n">03</span><div><b>The server pays in chunks.</b> The Slot's <a href="/minis">authorization server</a>, signing with the Slot's settlement address, submits chunks of up to 32 recipients and amounts, at most four per settlement. The chain checks each: the signer is the Slot's settlement address, the chunk index is the next one, the total stays within what participants may receive, and no amount is below the minimum payout of 0.01 TWLT. Each recipient is paid from escrow as the chunk lands.</div></li>
  <li><span className="steps__n">04</span><div><b>Finalization.</b> The server finalizes, and whatever is left of the entitlement goes to the frozen payout address. Inside the window only the settlement address may finalize. After the deadline anyone may, so a Slot that goes silent cannot leave coins stranded in escrow.</div></li>
</ol>

Two consequences follow from the shape. A Slot can pay at most 128 participants in a period under the preview's parameters, four chunks of 32, which is why the equal split matters more than the count of units. And a transaction never carries a destination for the remainder or a total to approve: a dishonest server can only choose whom to put in a chunk, within the entitlement, and every chunk is public.

## The operator's share

The entitlement is the operator's. The chain writes it against the operator's payout address, and participants receive only what the operator's authorization server chooses to release from it before finalization. In practice the operator is paid in two ways, both from the same entitlement.

| What | How it reaches the operator |
|---|---|
| **The remainder** | Whatever the settlement does not release to participants goes to the Slot's payout address at finalization. That includes shares below the minimum payout, rounding, anything above the cap the chain puts on participant releases, and the whole entitlement when nobody was eligible or the server did not settle in time. |
| **Operator-only periods** | A period in which the Slot had no eligible participants produces a settlement that admits no participant chunks. Anyone may finalize it, and the full entitlement goes to the payout address. |

How much the operator keeps in an ordinary period is therefore a matter of the Slot's allocation policy, which the operator runs and the chain, under today's distribution mode, trusts within its caps. The policy in force on the preview network divides the participant amount equally among everyone eligible, is sealed per period with its identity, and is never rewritten. The chain records which distribution mode is in force and from which period; a change is scheduled by the authority and applies only from a future period.

Beyond the Slot's share, there is nothing else to earn from running one. The chain charges no fees, there is no stake to earn on, and validators are not paid for blocks as such: a Slot is paid for being active, by the block, whether it proposed or not.

## The supply

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
jevlin earnings
jevlin wallet balance
```

Earnings reads the chain and lists only payments from the rewards account, so it is the number to trust. Balance shows what the wallet holds now.
