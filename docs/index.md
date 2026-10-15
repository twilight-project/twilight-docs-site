---
sidebar_position: 1
slug: /
title: Twilight, explained
description: A proof-of-work chain where the work is useful, and where each kind of work is defined by a Slot.
---

# Twilight, explained

<p className="lede">Twilight is a blockchain that pays people for verified work. The chain does not decide what the work is. That is left to <b>Slots</b>: each Slot is a kind of work, run by an operator who defines it, verifies it, and pays the people who did it from the Slot's share of new coins.</p>

That one design choice is the whole point. Bitcoin fixed its work forever as a puzzle, and the puzzle is now done in warehouses. Twilight fixes only the rules around the work: how much is minted, how it is split among Slots, and how a Slot has to prove who took part. What counts as work can be anything a Slot can verify, and it can grow as new Slots open.

<div className="cards">
  <a className="card" href="/slots"><span className="eyebrow">01</span><strong>Slots</strong><span>The unit of proof of work, and who runs one.</span></a>
  <a className="card" href="/how-it-works"><span className="eyebrow">02</span><strong>How mining works</strong><span>From a unit of work to a payment, for any Slot.</span></a>
  <a className="card" href="/rewards"><span className="eyebrow">03</span><strong>Rewards</strong><span>Epochs, the split between Slots, and where coins come from.</span></a>
  <a className="card" href="/get-started"><span className="eyebrow">04</span><strong>Get started</strong><span>Install the client, choose where to be paid, let your agent work.</span></a>
  <a className="card" href="/wallet"><span className="eyebrow">05</span><strong>Your wallet</strong><span>The keys are yours. What each one does.</span></a>
  <a className="card" href="/questions"><span className="eyebrow">06</span><strong>Questions</strong><span>The ones everybody asks first.</span></a>
</div>

## What exists today

The preview network runs three Slots. Two belong to the network itself. The third is open to anyone: **web search**, run by Jevlin. If you use a coding agent, its searches can go through that Slot and earn you a share of every half hour in which it searched. [The search Slot](/slot-search) has the details; everything else on this site is about Twilight itself, and applies to every Slot.

:::warning[Devnet preview]
Twilight is a public preview on a network called devnet-3. The coins it pays are devnet TWLT, which are for testing and have no price. The numbers on this site are the preview's and can change between versions. Nothing here is a promise about a future mainnet.
:::

<dl className="figs">
  <div><dt>Slots active</dt><dd>3, up to 100</dd></div>
  <div><dt>Open to the public</dt><dd>1, web search</dd></div>
  <div><dt>Paid every</dt><dd>about 30 minutes</dd></div>
  <div><dt>Total supply</dt><dd>21,000,000 TWLT</dd></div>
  <div><dt>Client</dt><dd>one small program, no daemon</dd></div>
</dl>
