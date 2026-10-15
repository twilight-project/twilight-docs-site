---
sidebar_position: 7
slug: /wallet
title: Your wallet and keys
sidebar_label: Your wallet
description: The keys are yours. What each one does, where it lives, and what to keep safe.
---

# Your wallet and keys

<p className="lede">Nothing in Twilight can spend your coins but you. Slots send payments to an address you chose; nobody holds a key to it but you.</p>

## Two ways to be paid

| Choice | What happens |
|---|---|
| **Let setup make a wallet** | It creates a wallet on your machine, protected by a passphrase you choose, and shows you 24 recovery words exactly once. Those words are the wallet. Write them on paper and keep them safe; anyone with them can spend your coins, and without them a lost laptop means a lost wallet. |
| **Use an address you already have** | Paste a `twilight1…` address, from Keplr say. Payments go there. Nothing on your machine can spend from it. |

```bash
dropin-miner wallet address
dropin-miner wallet balance
dropin-miner wallet send <to> <amount>   # asks for your passphrase, then for a yes
```

## Changing the address

Your first address takes effect as soon as you set it. Changing it later is different: a change has to be approved by the Slot's operator, and you keep being paid at the old address until it is. This is deliberate, so that nobody who gets hold of your machine for a moment can quietly redirect your payments.

:::note
Nobody from Twilight or from any Slot operator will ever ask for your recovery words, your passphrase or the contents of your Twilight folder, for any reason, including to approve an address change.
:::

## The three keys, in plain words

| What | Where it comes from | What it is for |
|---|---|---|
| **Provider key** | created by setup when it registers you with the Slot's provider | lets your work through the provider and ties it to your account |
| **Installation identity** | given to your machine when it enrolls with the Slot's verifier | signs every report, so a copied report from somewhere else is worthless |
| **Wallet** | you, or your existing wallet | receives payments, and nothing else |

They are separate on purpose. Losing the provider key means registering again; losing the installation identity means enrolling again; neither touches your coins. Only the wallet is money.

## The folder on your machine

Everything lives in a folder called `.tokendrop` in your home directory: the program, your settings, the keys above, your wallet if setup made one, and any reports not yet sent. It is readable only by your user. Back it up like anything you care about, and remember that the 24 words are the one thing that can rebuild the wallet without it.
