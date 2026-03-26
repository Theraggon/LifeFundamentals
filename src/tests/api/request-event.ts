import type { RequestEvent } from '@sveltejs/kit';

export function createRequestEvent(init: {
	url: URL;
	request: Request;
	params?: Record<string, string>;
}): RequestEvent {
	const { url, request, params = {} } = init;
	return {
		cookies: {
			get: () => undefined,
			getAll: () => [],
			set: () => {},
			delete: () => {},
			serialize: () => ''
		},
		fetch,
		getClientAddress: () => '127.0.0.1',
		locals: {},
		params: params as RequestEvent['params'],
		platform: undefined,
		request,
		route: { id: '/api' as RequestEvent['route']['id'] },
		setHeaders: () => {},
		url: url as RequestEvent['url'],
		isDataRequest: false,
		isSubRequest: false
	} as RequestEvent;
}

export function httpRequest(
	method: string,
	pathnameAndSearch: string,
	init?: { body?: unknown; params?: Record<string, string> }
): RequestEvent {
	const url = new URL(`https://example.com${pathnameAndSearch}`);
	const headers = new Headers();
	if (init?.body !== undefined) headers.set('Content-Type', 'application/json');
	const request = new Request(url, {
		method,
		headers,
		body: init?.body !== undefined ? JSON.stringify(init.body) : undefined
	});
	return createRequestEvent({ url, request, params: init?.params });
}
