[![npm](https://img.shields.io/npm/v/@egomobile/http-supertest.svg)](https://www.npmjs.com/package/@egomobile/http-supertest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-http-supertest/pulls)

# @egomobile/http-supertest

> Sets up common and powerful test event listener for [@egomobile/http-server](https://github.com/egomobile/node-http-server) with [supertest](https://github.com/ladjs/supertest) under the hood.

<a name="toc"></a>

## Table of contents

- [Install](#install)
- [Usage](#usage)
  - [Filters](#filters)
- [Credits](#credits)
- [Documentation](#documentation)
- [See also](#see-also)

<a name="install"></a>

## Install [<a href="#toc">↑</a>]

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/http-supertest
```

<a name="usage"></a>

## Usage [<a href="#toc">↑</a>]

<a name="quick-example"></a>

### Quick example [<a href="#usage">↑</a>]

```typescript
import createServer from "@egomobile/http-server";
import { setupTestEventListener } from "@egomobile/http-supertest";

const app = createServer();

// s. https://github.com/egomobile/node-http-server/wiki/Testing
app.controllers();

// register `test` event: https://egomobile.github.io/node-http-server/interfaces/IHttpServer.html#on
setupTestEventListener({
  server: app,
});

await app.test();
```

<a name="filters"></a>

## Filters [<a href="#usage">↑</a>]

If you defined a lot of tests and want to skip some of them, you can use `EGO_TEST_FILTER` environment variable.

It can hold a non-empty value, that is a [Filtrex expression](https://www.npmjs.com/package/filtrex).

If it returns a [truthy value](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), the underlying test will be executed.

Beside shipped-in functions and constants, the module also provides the following enhancements:

Functions:

| Signature                                     | Description                                                                                                                               | Example                                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `all(value, ...subStrings): bool`             | Checks if all substrings are part of `value`.                                                                                             | `all("foo bar buzz", "bar", "buzz")`                                                                  |
| `any(value, ...subStrings): bool`             | Checks if at least one substring is part of `value`.                                                                                      | `any("foo bar buzz", "test", "bar")`                                                                  |
| `endsWith(value, suffix): bool`               | Checks if a string ends with a suffix.                                                                                                    | `endsWith("Test string", " string")`                                                                  |
| `float(value): number\|false`                 | Converts a string to a [float](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat).              | `float("12.3") == 12.3`                                                                               |
| `indexOf(value): number`                      | Returns the zero-based index of a substring inside a string, and `-1` if it is not found.                                                 | `indexOf("666.0", ".") == 3`                                                                          |
| `int(value): number\|false`                   | Converts a string to an [integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt).             | `int("10.0") == 10`                                                                                   |
| `isNaN(value, float = true): bool`            | Checks if a value cannot be parsed as number.                                                                                             | `isNaN("is not a really number")`                                                                     |
| `join(sep, ...values[]): bool`                | Handles values as strings an join them with a separator.                                                                                  | `join("+", "a", "b", " c") == "a+b+ c"`                                                               |
| `norm(value): string`                         | Normalizes a string for better comparison: creates lower case version, trims it and replace special characters like umlauts or whitespace | `norm("&nbsp;&nbsp;A tesT String: Ä&nbsp;&nbsp;&nbsp;&nbsp;ö Ü ß  ") == "a test string: ae oe ue ss"` |
| `log(value [, returnValue = false]): any`     | Logs a value.                                                                                                                             | `log(methodName) or methodName == "getAllUsers"`                                                      |
| `lower(value): string`                        | Converts string to lower case chars.                                                                                                      | `lower("ThIs Is A tEsTsTrInG") == "this is a test string"`                                            |
| `regex(value, pattern [, flags = "i"]): bool` | Tests a string for a [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).       | `not regex(methodName, "^(ZZZ)(\\s)(-)")`                                                             |
| `str(value): string`                          | Converts a value to a safe string.                                                                                                        | `str(1) == "1"`                                                                                       |
| `startsWith(value, prefix): bool`             | Checks if a string starts with a prefix.                                                                                                  | `startsWith("Test string", "Test ")`                                                                  |
| `trim(value): string`                         | Removes leading and ending whitespace characters from a string.                                                                           | `trim(" Test String   ") === "Test String"`                                                           |
| `trimEnd(value): string`                      | Removes ending whitespace characters from a string.                                                                                       | `trimEnd(" Test String   ") === " Test String"`                                                       |
| `trimStart(value): string`                    | Removes leading whitespace characters from a string.                                                                                      | `trimStart(" Test String   ") === "Test String   "`                                                   |
| `upper(value): string`                        | Converts string to upper case chars.                                                                                                      | `upper("ThIs Is A tEsTsTrInG") == "THIS IS A TEST STRING"`                                            |

Constants:

| Name: type             | Description                                                                                                                                                  | Example                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `context: string`      | The context in what the test is executed.                                                                                                                    | `context == "controller"`                          |
| `countFailure: number` | The current number of failed tests.                                                                                                                          | `countFailure > 0`                                 |
| `description: string`  | The description of the test.                                                                                                                                 | `any(description, "foo")`                          |
| `escapedQuery: string` | The escaped query string.                                                                                                                                    | `a=foo%20bar&b=buzz`                               |
| `escapedRoute: string` | The escaped route of the endpoint.                                                                                                                           | `escapedRoute == "/foo%20bar/buzz"`                |
| `file: string`         | The full path of the file.                                                                                                                                   | `file == "/path/to/endpoints/file/index.ts"`       |
| `group: string`        | The name of the current test group, which is usually the name of the controller class.                                                                       | `group == "MyControllerClass`                      |
| `httpMethod: string`   | Upper case HTTP method.                                                                                                                                      | `httpMethod in ("POST", "GET", "PATCH", "DELETE")` |
| `methodName: string`   | The name of the controller method, that is executed by the test.                                                                                             | `methodName == "getAllUsers`                       |
| `parameters: string`   | The [JSON string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) of the object, with all URL parameters.   | `parameters == "{\"user_id\":\"foo\"}"`            |
| `query: string`        | The [JSON string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) of the object, with all query parameters. | `query == "{\"a\":\"foo\"}"`                       |
| `route: string`        | The unescaped route of the endpoint.                                                                                                                         | `route == "/foo bar/buzz"`                         |

<a name="credits"></a>

## Credits [<a href="#toc">↑</a>]

The module makes use of:

- [supertest](https://github.com/ladjs/supertest) by [Lad](https://github.com/ladjs)

<a name="documentation"></a>

## Documentation [<a href="#toc">↑</a>]

The API documentation can be found
[here](https://egomobile.github.io/node-http-supertest/).
