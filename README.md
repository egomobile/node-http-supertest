[![npm](https://img.shields.io/npm/v/@egomobile/http-supertest.svg)](https://www.npmjs.com/package/@egomobile/http-supertest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-http-supertest/pulls)

# @egomobile/http-supertest

> Sets up common and powerful test event listener for @egomobile/http-server with supertest under the hood.

<a name="toc"></a>

## Table of contents

- [Install](#install)
- [Usage](#usage)
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

<a name="credits"></a>

## Credits [<a href="#toc">↑</a>]

The module makes use of:

- [supertest](https://github.com/ladjs/supertest) by [Lad](https://github.com/ladjs)

<a name="documentation"></a>

## Documentation [<a href="#toc">↑</a>]

The API documentation can be found
[here](https://egomobile.github.io/node-http-supertest/).
