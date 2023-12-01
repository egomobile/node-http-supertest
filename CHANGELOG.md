# Change Log (@egomobile/http-supertest)

## 0.5.0

- **BREAKING CHANGE**: modules requires at least [Node 18+](https://nodejs.org/en/blog/announcements/v18-release-announce) and [@egomobile/http-server](https://github.com/egomobile/node-http-server) `^0.64.2` now
- can define test filters via `EGO_TEST_FILTER` environment variable or `filter` property of [ISetupTestEventListenerOptions interface](https://egomobile.github.io/node-http-supertest/interfaces/ISetupTestEventListenerOptions.html)
- `npm update`s

## 0.4.4

- improve output of test progress
- add `getStream` and `groupPrefix` props to [ISetupTestEventListenerOptions interface](https://egomobile.github.io/node-http-supertest/interfaces/ISetupTestEventListenerOptions.html)
- update to [@egomobile/http-server](https://github.com/egomobile/node-http-server) `^0.58.0`
- (bug-)fixes

## 0.3.1

- update to [@egomobile/http-server](https://github.com/egomobile/node-http-server) `^0.57.0`
- (bug-)fixes

## 0.2.0

- add support for expected objects, by JSON

## 0.1.2

- initial release
