# n8n-nodes-peoplesearch

This is an n8n community node. It lets you use [PeopleSearch.im](https://peoplesearch.im) in your n8n workflows.

PeopleSearch.im finds professionals from a plain-English description ("Heads of Talent at fintech companies in London"), unlocks their profiles (name, current title, company, location, LinkedIn URL) and finds their verified work emails, from a licensed B2B people database. It also finds a person's work email from their name and company, verifies email addresses, and searches companies.

[Installation](#installation) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Usage](#usage) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation, and install the package `n8n-nodes-peoplesearch`.

## Operations

**Person**
- **Search**: count the people who match a description and preview a few of them. Free.
- **Unlock Many**: unlock the full profiles of up to 100 people who match a description, optionally with their verified work emails. 1 credit a person new to your account, 1 more for each email found.
- **Get Work Email**: look up the verified work email of a person unlocked before. 1 credit, refunded when none is found.

**Email**
- **Find by Name**: a person's verified work email from their first name, last name and company (website or name). 2 credits, refunded when none is found.
- **Verify**: check whether an email address will deliver. 1 credit.

**Company**
- **Search**: companies that fit a description (industry, place, size, keywords). Free.

## Credentials

You need a PeopleSearch.im account and an API key:

1. Sign up at [peoplesearch.im](https://peoplesearch.im). New accounts get free credits; your first search is free.
2. Open the [Developers page](https://peoplesearch.im/developers) and create an API key.
3. In n8n, add a **PeopleSearch.im API** credential and paste the key. n8n checks it against your credit balance.

## Compatibility

Built and tested with n8n 1.x (n8n nodes API version 1). The node is declarative and has no runtime dependencies.

## Usage

- **Lead list in a sheet:** Manual Trigger, then PeopleSearch.im (Person, Unlock Many, "VPs of Sales at SaaS companies in Germany", 25 people, with emails), then Google Sheets (Append Row).
- **Enrich new CRM contacts:** your CRM's trigger, then PeopleSearch.im (Email, Find by Name) with the contact's first name, last name and company website, then update the contact with `email`.
- **Clean a list before sending:** a list of addresses, then PeopleSearch.im (Email, Verify), then an IF node on `verdict` equal to `deliverable`.

Searching is free; credits are spent only on people unlocked and emails found. Anyone can ask to be left out at peoplesearch.im/opt-out.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [PeopleSearch.im API reference](https://peoplesearch.im/developers)
- [Pricing](https://peoplesearch.im/pricing)
