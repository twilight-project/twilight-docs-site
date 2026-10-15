---
sidebar_position: 6
slug: /get-started
title: Get started
description: Install the client, choose where to be paid, and let your coding agent do the rest.
---

# Get started

<p className="lede">Ten minutes, one terminal. You need a computer that runs at least one supported coding agent. The client ships ready for the <a href="/slot-search">search Slot</a>, the one open today.</p>

## 1. Install

On macOS or Linux, paste this into a terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/twilight-project/dropin-miner/main/scripts/install.sh | sh
```

On Windows, in PowerShell:

```powershell
irm https://raw.githubusercontent.com/twilight-project/dropin-miner/main/scripts/install.ps1 | iex
```

If you would rather use npm, install it globally so your agents can always find it:

```bash
npm install -g dropin-miner
dropin-miner setup
```

The installer downloads a checked release for your computer, puts it in a folder in your home directory, and starts the setup. Setup asks its questions one at a time and shows you what it is about to write before it writes anything.

## 2. The questions, and what they mean

| Setup asks | What it means |
|---|---|
| **Use the previous installation?** | Only appears if you have installed before. Yes keeps your wallet and your history. |
| **Enable mining rewards?** | Yes means your work earns. No means you use the Slot's service without rewards. You can change your mind later. |
| **Payout address** | Where your coins go. Leave it empty and setup makes a wallet for you. It asks for a passphrase, then shows you 24 words once. Write them down on paper; they are the only way to recover the wallet. If you already have a Twilight address, paste it instead. |
| **Add this to your shell profile?** | Yes lets you type `dropin-miner` from anywhere. No just means longer commands. |
| **Set up the coding agents found here?** | Setup lists the agents it found and exactly what it would add to each. It only ever adds its own entries; removing it later removes exactly those. |

:::note
Nothing to copy or paste. Setup registers you with the Slot's provider and stores the key it is given. If it ever needs something from you, it says so and tells you where to get it.
:::

## 3. The first unit of work

Restart any coding agent that was already open, then work as you normally would. The first time it does the Slot's work, it goes through Twilight. To see it happen by hand, and to check your setup:

```bash
dropin-miner search -format model "what is proof of authority consensus"
dropin-miner doctor
```

Doctor is the health check. It tells you in plain words whether you are connected, enrolled, joined to the current period, and earning, and names the one thing to fix if something is not right.

```text
  authorization server  OK       slot 3 on twilight-devnet-3
  enrolled              OK       the AS accepted this installation's authorization
  joined this epoch     OK       epoch 180 — accepted
  payout address        OK       twilight1… is in force
  earning               OK       epoch 180 — 1 observation verified, which qualifies
```

## 4. Your first reward

It takes an hour or two. Periods are about 30 minutes long, you join one that starts two periods ahead, and coins are sent after it closes. After that, every period in which your agent did verified work pays you.

```bash
dropin-miner earnings
```

## Removing it

```bash
dropin-miner agents uninstall     # takes its entries out of every agent
rm ~/.tokendrop/bin/dropin-miner  # the program itself
```

Neither of those deletes your wallet. The folder in your home directory keeps your keys and your history, and the next setup offers to use it again. Delete it yourself only once you have the 24 words somewhere safe.
