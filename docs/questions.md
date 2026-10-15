---
sidebar_position: 8
slug: /questions
title: Questions people ask first
sidebar_label: Questions
description: Short answers to the questions people ask before and after installing.
---

# Questions people ask first

## Is this real money?

Not yet. Twilight is a public preview on a test network, and the coins it pays have no price. The point of the preview is to prove the mechanism works with real agents doing real work.

## Is Twilight a search product?

No. Twilight is the chain and the rules. Search is the first Slot, run by Jevlin, because it is work coding agents already do all day and it is easy to verify. Other Slots will pay for other kinds of work, and the same client will take part in them.

## Who can run a Slot?

Anyone who can provide a kind of work, verify who did it, and run a node, once the network authority registers them. The chain caps active Slots at a hundred. There is no self-service registration today; [For developers](/developers) points to what a Slot has to implement.

## Will it slow my agent down?

The work goes through the Slot's provider instead of your agent's built-in tool, so you get the provider's speed, which for search is comparable. The report to the verifier is sent after the result has already come back to your agent, so your agent never waits for it.

## Does Twilight read my code or my work?

The Slot's provider sees the work, the way any service you use sees what you use it for. The verifier sees only that work happened and when. The chain sees only your address and your payments. Your code is never sent anywhere by any of this.

## Does more work earn more?

No. One verified unit in a period counts you in; everyone counted in gets the same share. Running your agent harder, or running more of them, changes nothing about what you earn.

## What if my laptop is off?

Then you are not doing work and you are not paid for those periods. There is nothing to leave running, and no penalty for being away. When you work again, you earn again.

## How is this like Bitcoin, and how is it not?

Like Bitcoin: a fixed supply of 21 million, new coins every block, halvings at fixed points. Unlike Bitcoin: the work is not a puzzle, it is work that was useful anyway, defined by Slots rather than fixed forever, so there is no hardware race. A laptop is enough, and a warehouse of machines earns no more than a laptop.

## Can I use the same account on two computers?

Yes. Each computer enrolls on its own and reports its own work, and payments go to the address you chose. There is no advantage to it beyond convenience, since shares are equal.

## How do I stop?

Tell your agent `/dropin-miner off` and it goes back to its own tools. To remove the program, [see Get started](/get-started#removing-it). Your wallet stays yours either way.

## Something is not working

Run `dropin-miner doctor`. It names the one thing to fix. The most common cause of not earning is a provider key from a different account than the one you enrolled with; doctor catches that too. For anything else, the [issue tracker](https://github.com/twilight-project/dropin-miner/issues) is the place.
