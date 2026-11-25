import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class PeopleSearchApi implements ICredentialType {
	name = 'peopleSearchApi';

	displayName = 'PeopleSearch.im API';

	icon: Icon = { light: 'file:peoplesearch.svg', dark: 'file:peoplesearch.dark.svg' };

	documentationUrl = 'https://peoplesearch.im/developers';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your PeopleSearch.im API key (starts with sk_sift_). Create one on the Developers page of your account.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// The balance read: free, and answers 401 for a key that is not accepted.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://peoplesearch.im/api/v1',
			url: '/credits',
			method: 'GET',
		},
	};
}
