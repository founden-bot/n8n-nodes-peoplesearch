import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

/**
 * PeopleSearch.im for n8n: find professionals from a plain-English description or exact filters, unlock their
 * profiles, find and verify work emails, and search companies, through the PeopleSearch.im REST API
 * (https://peoplesearch.im/api/v1). Declarative: every operation is one HTTP request, so the node has no runtime
 * dependencies. Searching is free; unlocking a person costs 1 credit, a verified work email 1 more (refunded when none
 * is found), the lookups their stated credits (refunded when nothing is found).
 */
export class PeopleSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PeopleSearch.im',
		name: 'peopleSearch',
		icon: { light: 'file:peoplesearch.svg', dark: 'file:peoplesearch.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Find people and verified work emails from a plain-English description',
		defaults: { name: 'PeopleSearch.im' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'peopleSearchApi', required: true }],
		requestDefaults: {
			baseURL: 'https://peoplesearch.im/api/v1',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Company', value: 'company' },
					{ name: 'Email', value: 'email' },
					{ name: 'Person', value: 'person' },
				],
				default: 'person',
			},

			// ---- Person ----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['person'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						action: 'Search people',
						description: 'Count the people who match a description and preview a few of them. Free.',
						routing: {
							request: { method: 'POST', url: '/search', body: { query: '={{$parameter.query}}', limit: '={{$parameter.previewCount}}' } },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'results' } }] },
						},
					},
					{
						name: 'Unlock Many',
						value: 'deliver',
						action: 'Unlock people matching a description',
						description: 'Unlock full profiles of people who match a description (1 credit each)',
						routing: {
							request: {
								method: 'POST',
								url: '/deliver',
								body: { query: '={{$parameter.query}}', count: '={{$parameter.count}}', withEmail: '={{$parameter.withEmail}}' },
							},
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'profiles' } }] },
						},
					},
					{
						name: 'Get Work Email',
						value: 'getEmail',
						action: 'Get the work email of an unlocked person',
						description: 'Look up the verified work email of a person unlocked before (1 credit, refunded when none is found)',
						routing: { request: { method: 'POST', url: '/email', body: { id: '={{$parameter.personId}}' } } },
					},
				],
				default: 'search',
			},
			{
				displayName: 'Description',
				name: 'query',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. Heads of Talent at fintech companies in London',
				description: 'Who to find, in plain English: a role, an industry, a company or website, a place, a company size',
				displayOptions: { show: { resource: ['person'], operation: ['search', 'deliver'] } },
			},
			{
				displayName: 'Number of Previews',
				name: 'previewCount',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 25 },
				default: 10,
				description: 'How many masked previews to return (up to 25); the total number of matches always comes back',
				displayOptions: { show: { resource: ['person'], operation: ['search'] } },
			},
			{
				displayName: 'Number of People',
				name: 'count',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 5,
				description: 'How many people to unlock. Each one new to your account costs 1 credit.',
				displayOptions: { show: { resource: ['person'], operation: ['deliver'] } },
			},
			{
				displayName: 'With Verified Work Emails',
				name: 'withEmail',
				type: 'boolean',
				default: false,
				description: 'Whether to also look up each unlocked person\'s verified work email (1 more credit each, refunded when none is found)',
				displayOptions: { show: { resource: ['person'], operation: ['deliver'] } },
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				required: true,
				default: '',
				description: 'The ID of a person unlocked before (the "ID" of an Unlock Many result)',
				displayOptions: { show: { resource: ['person'], operation: ['getEmail'] } },
			},

			// ---- Email ----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['email'] } },
				options: [
					{
						name: 'Find by Name',
						value: 'findByName',
						action: 'Find a work email by name and company',
						description: 'Find a person\'s verified work email from their name and company (2 credits, refunded when none is found)',
						routing: {
							request: {
								method: 'POST',
								url: '/tools',
								body: {
									tool: 'work-email-finder',
									input: { firstname: '={{$parameter.firstName}}', lastname: '={{$parameter.lastName}}', domainOrCompany: '={{$parameter.company}}' },
								},
							},
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'result' } }] },
						},
					},
					{
						name: 'Verify',
						value: 'verify',
						action: 'Verify an email address',
						description: 'Check whether an email address will deliver (1 credit, free checks first)',
						routing: {
							request: { method: 'POST', url: '/tools', body: { tool: 'email-verifier', input: { email: '={{$parameter.email}}' } } },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'result' } }] },
						},
					},
				],
				default: 'findByName',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['findByName'] } },
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['findByName'] } },
			},
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. stripe.com',
				description: 'The company\'s website (most exact) or its name',
				displayOptions: { show: { resource: ['email'], operation: ['findByName'] } },
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['email'], operation: ['verify'] } },
			},

			// ---- Company ----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['company'] } },
				options: [
					{
						name: 'Search',
						value: 'search',
						action: 'Search companies',
						description: 'Find companies from a description: industry, place, size, keywords. Free.',
						routing: {
							request: { method: 'POST', url: '/search', body: { entity: 'company', query: '={{$parameter.companyQuery}}', limit: '={{$parameter.companyLimit}}' } },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'companies' } }] },
						},
					},
				],
				default: 'search',
			},
			{
				displayName: 'Description',
				name: 'companyQuery',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'e.g. Series B fintech companies in London',
				displayOptions: { show: { resource: ['company'], operation: ['search'] } },
			},
			{
				displayName: 'Limit',
				name: 'companyLimit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 25,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['company'], operation: ['search'] } },
			},
		],
	};
}
