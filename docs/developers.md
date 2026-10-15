---
sidebar_position: 9
slug: /developers
title: For developers and Slot operators
sidebar_label: For developers
description: The technical documents, the protocol, the chain parameters, what a Slot implements, and the search Slot's API.
---

# For developers and Slot operators

<p className="lede">Everything on this site is a plain-language account of a mechanism that is fully specified elsewhere. If you want the parameters, the message types, the verifier protocol and the API, these are the documents.</p>

<div className="cards">
  <a className="card" href="/reference.html"><span className="eyebrow">Twilight</span><strong>The mechanism and the client</strong><span>Slots and registration, emission and halving, the verifier (MINIS), epochs and settlement, the CLI and config.</span></a>
  <a className="card" href="/search-router.html"><span className="eyebrow">Search Slot</span><strong>Slot 3, as an implementation</strong><span>How a search becomes a reward, trajectories, the router API, the verification API a Slot exposes.</span></a>
  <a className="card" href="/skill.md"><span className="eyebrow">Agent skill</span><strong>What the client installs</strong><span>The skill text a coding agent is given.</span></a>
  <a className="card" href="/llms.txt"><span className="eyebrow">For agents</span><strong>Markdown and JSON</strong><span>twilight.md, search-router.md, llms.txt and a manifest with checksums.</span></a>
</div>

## Running a Slot

A Slot operator provides three things: a provider that does the work and exposes a verification API the Slot's verifier can reconcile against; a verifier that enrolls participants, runs epochs, checks reports and submits settlement; and a validator. Registration is an authority action on the chain. The Twilight document above describes the chain side; the search Slot document is a complete worked example of the provider and verifier side.

## Source

- [dropin-miner, the client](https://github.com/twilight-project/dropin-miner): one binary, no daemon, no proxy, no MCP server.
- [twilight-core, the chain](https://github.com/usmanshahid86/twilight-core): the only chain library these documents cite.
- [Jevlin](https://jevlin.ai): the operator of the search Slot.

Give the Markdown to an agent and it can answer most questions about the protocol on its own:

```bash
curl -s https://docs.twilight.org/twilight.md
```
