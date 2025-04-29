import url from "url";
import { StringifiableRecord } from "query-string";

// TODO: remove this and use built-in `Url` object in JS?

type UrlObj = {
  protocol?: string;
  auth?: string;
  hostname?: string;
  port?: string;
  host?: string;
  pathname?: string;
  search?: string;
  query?: StringifiableRecord;
  hash?: string;
};

// Typescript thinks `url` is coming from NodeJS, so the types are all messed up.
// The type definitions below are according to https://github.com/defunctzombie/node-url

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * `toString()` method or the `href` property.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/toString
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
export const formatUrl: (url: UrlObj) => string = url.format as unknown as any;

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * constructor `new Url(urlString, baseURL)`. Note that this will throw an exception if it fails to
 * parse an argument as a URL.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL#usage_notes
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
export const resolveUrl: (from: string, to: string) => string = url.resolve as unknown as any;

/**
 * @deprecated Please use the JavaScript built-in `URL` object instead. In particular, the
 * constructor `new Url(urlString)`. Note that this will throw an exception if it fails to parse the
 * string as a URL.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const parseUrl: (
  url: string,
  parseQueryString?: boolean,
  slashesDenoteHost?: boolean,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
) => UrlObj & { href: string; path?: string } = url.parse as unknown as any;
