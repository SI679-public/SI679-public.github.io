export class ValidationError extends Error {}

// 409: the request clashes with something that already exists.
export class ConflictError extends Error {}

// 401: we don't know who you are -- no credentials, or bad ones.
export class AuthenticationError extends Error {}

// 403: we know who you are, and you're not allowed to do this.
export class AuthorizationError extends Error {}
