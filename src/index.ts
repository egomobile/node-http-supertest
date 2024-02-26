/* eslint-disable spaced-comment */

// This file is part of the @egomobile/http-supertest distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/http-supertest is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/http-supertest is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { IHttpServer, ITestEventHandlerContext, ITestSession } from "@egomobile/http-server";
import assert, { AssertionError } from "node:assert";
import os from "node:os";
import ora from "ora";
import supertest from "supertest";
import { createDefaultTestEventHandlerPredicate } from "./filters";
import type { BodyValueValidator, TestEventHandlerPredicate, TestOutputStreamProvider } from "./types";
import type { Nilable } from "./types/internal";
import { asAsync, asString, binaryParser, isNil } from "./utils/internal";

interface ISessionInfo {
    group?: string;
    session: ITestSession;
}

/**
 * Options for `setupTestEventListener()` function.
 */
export interface ISetupTestEventListenerOptions {
    /**
     * Custom encoding for binary parser, which is used
     * to parse a `supertest` response.
     *
     * @default "binary"
     */
    binaryParserEncoding?: Nilable<BufferEncoding>;
    /**
     * Custom value for EOL.
     *
     * @default SYSTEM_EOL
     */
    eol?: any;
    /**
     * The custom test filter.
     */
    filter?: Nilable<TestEventHandlerPredicate>;
    /**
     * A custom function, which returns the stream for the output.
     */
    getStream?: Nilable<TestOutputStreamProvider>;
    /**
     * The prefix, when group name is printed.
     *
     * @default "🧪 "
     */
    groupPrefix?: any;
    /**
     * The custom indent for a test item.
     *
     * @default "\t"
     */
    itemPrefix?: any;
    /**
     * Optional callback, which is invoked, when status of a test is updated.
     *
     * @param {ITestStatusUpdateContext} context The execution context.
     */
    onStatusUpdate?: (context: ITestStatusUpdateContext) => any;
    /**
     * The underlying server to setup.
     */
    server: IHttpServer;
}

/**
 * Execution context for an `ISetupTestEventListenerOptions.onStatusUpdate()` callback.
 */
export interface ITestStatusUpdateContext {
    /**
     * The underlying event handler execution context with information about the test.
     */
    context: ITestEventHandlerContext;
    /**
     * The error information, if `status` is `failed`.
     */
    error?: any;
    /**
     * The current status.
     */
    status: TestStatus;
}

/**
 * List of test status values.
 */
export enum TestStatus {
    /**
     * Entered test event only, but did nothing else yet.
     */
    Entered = "entered",
    /**
     * This test has been failed.
     */
    Failed = "dailed",
    /**
     * The execution of the endpoint has been finished.
     */
    Finished = "finished",
    /**
     * This test has been passed successfully.
     */
    Passed = "passed",
    /**
     * The endpoint is running.
     */
    Running = "running",
    /**
     * Test has been skipped.
     */
    Skipped = "skipped",
}

/**
 * Sets of an `IHttpServer` instance for run tests
 * with `supertest` in a common and powerful way.
 *
 * @example
 * ```
 * import createServer from "@egomobile/http-server"
 * import { setupTestEventListener } from "@egomobile/http-supertest"
 *
 * const app = createServer()
 *
 * // s. https://github.com/egomobile/node-http-server/wiki/Testing
 * app.controllers()
 *
 * // register `test` event: https://egomobile.github.io/node-http-server/interfaces/IHttpServer.html#on
 * setupTestEventListener({
 *   "server": app
 * })
 *
 * await app.test()
 * ```
 *
 * @param {ISetupTestEventListenerOptions} options The options.
 */
export function setupTestEventListener(options: ISetupTestEventListenerOptions) {
    const { server } = options;
    const binaryParserEncoding = options.binaryParserEncoding || "binary";

    const eol = isNil(options.eol) ? os.EOL : options.eol;
    const groupPrefix = isNil(options.groupPrefix) ? "🧪 " : options.groupPrefix;
    const itemPrefix = isNil(options.itemPrefix) ? "\t" : options.itemPrefix;

    let getStream: TestOutputStreamProvider;
    if (isNil(options.getStream)) {
        getStream = async () => {
            return process.stderr;
        };
    }
    else {
        getStream = options.getStream;
    }

    let filter: TestEventHandlerPredicate;
    if (isNil(options.filter)) {
        // default, maybe by environment variable
        filter = createDefaultTestEventHandlerPredicate();
    }
    else {
        filter = options.filter;
    }

    if (typeof getStream === "function") {
        getStream = asAsync(getStream);
    }
    else {
        throw new TypeError("options.getStream must be of type function");
    }

    if (typeof filter === "function") {
        filter = asAsync(filter);
    }
    else {
        throw new TypeError("options.filter must be of type function");
    }

    const currentSessions: Record<string, ISessionInfo> = {};

    const onStatusUpdate = options.onStatusUpdate ?? (async () => {
        // noop
    });

    if (typeof onStatusUpdate !== "function") {
        throw new TypeError("options.onStatusUpdate must be of type function");
    }

    server.on("test", async (context) => {
        const now = new Date();

        const emitStatusUpdate = async (status: TestStatus, error?: any) => {
            await onStatusUpdate({
                context,
                error,
                status
            });
        };

        const {
            body,
            countFailure,
            description,
            escapedQuery,
            escapedRoute,
            expectations,
            group,
            headers,
            httpMethod,
            index,
            route,
            session,
            totalCount
        } = context;
        const {
            "body": expectedBody,
            "headers": expectedHeaders,
            "status": expectedStatus
        } = expectations;

        const stream = await getStream(context);
        const write = (val: any) => {
            stream.write(asString(val));
        };
        const writeLine = (val: any) => {
            write(`${asString(val)}${eol}`);
        };

        const isLast = index === totalCount - 1;
        const { "id": sessionId } = session;

        let sessionInfo: ISessionInfo = currentSessions[sessionId];
        if (!sessionInfo) {
            // initialize

            currentSessions[sessionId] = sessionInfo = {
                session
            };
        }

        const hasGroupChanged = group !== sessionInfo.group;

        const baseText = `[${httpMethod.toUpperCase()} ${route}]: 'it ${description.trim()}'`;

        if (hasGroupChanged) {
            sessionInfo.group = group;

            writeLine(`${groupPrefix}${group}`);
        }

        await emitStatusUpdate(TestStatus.Entered);

        const spinner = ora({
            "prefixText": `${itemPrefix}`,
            stream,
            "text": `${baseText} ...`
        });

        let start!: Date;
        let end!: Date;
        try {
            const shouldBeExecuted = await filter(context);
            if (!shouldBeExecuted) {
                spinner.info(`[SKIPPED] ${baseText}`);

                await emitStatusUpdate(TestStatus.Skipped);

                return;
            }

            let request = supertest(server)[httpMethod](escapedRoute + "?" + escapedQuery)
                .parse(binaryParser({
                    "encoding": binaryParserEncoding
                }));

            // set request headers
            for (const [headerName, headerValue] of Object.entries(headers)) {
                request = request.set(headerName, headerValue);
            }

            start = new Date();
            await emitStatusUpdate(TestStatus.Running);

            const response = await request.send(isNil(body) ? undefined : body);

            end = new Date();
            await emitStatusUpdate(TestStatus.Finished);

            // check status code
            assert.strictEqual(
                response.statusCode, expectedStatus,
                `Expected status code ${expectedStatus}, but got ${response.statusCode}`
            );

            // headers
            for (const [expectedHeaderName, expectedHeaderValue] of Object.entries<any>(expectedHeaders)) {
                const headerValue = response.headers[expectedHeaderName];
                const headerValueType = typeof headerValue;

                assert.strictEqual(
                    headerValueType, "string",
                    `Expected string value for header '${expectedHeaderName}', but got '${headerValueType}'`
                );

                if (typeof expectedHeaderValue === "string") {
                    assert.strictEqual(
                        headerValue, expectedHeaderValue,
                        `Expected value '${expectedHeaderValue}' for header '${expectedHeaderName}', but got '${headerValue}'`
                    );
                }
                else {
                    // RegExp

                    assert.strictEqual(
                        expectedHeaderValue.test(headerValue), true,
                        `Value '${headerValue}' of header '${expectedHeaderName}' does not match regex '${expectedHeaderValue.source}'`
                    );
                }
            }

            if (!isNil(expectedBody)) {
                // check for body

                const actualBody = response.body;

                if (expectedBody instanceof RegExp) {
                    // handle response body as string
                    // and check for pregulat expression

                    const actualBodyStr = asString(actualBody);

                    assert.strictEqual(
                        expectedBody.test(actualBodyStr), true,
                        `Value of body '${actualBodyStr}' does not match regex '${expectedBody.source}'`
                    );
                }
                else if (typeof expectedBody === "string") {
                    // compare data as strings

                    const actualBodyStr = asString(actualBody);

                    assert.strictEqual(
                        actualBodyStr, expectedBody,
                        `Expected body '${expectedBody}', but got '${actualBodyStr}'`
                    );
                }
                else if (Buffer.isBuffer(expectedBody)) {
                    // compare as buffers

                    const expectedStr = expectedBody.toString("hex");
                    const actualStr = actualBody.toString("hex");

                    assert.strictEqual(
                        Buffer.compare(expectedBody, actualBody) === 0, true,
                        `Expected body '${expectedStr}', but got '${actualStr}'`
                    );
                }
                else if (typeof expectedBody === "function") {
                    // use body as `BodyValueValidator` function

                    const validator = asAsync(expectedBody) as BodyValueValidator;

                    const result = await validator({
                        "body": actualBody
                    });
                    if (!isNil(result) && result !== true) {
                        const actualStr = asString(actualBody);

                        const operator = "expectedBody";

                        if (result === false) {
                            // unknown error

                            throw new AssertionError({
                                "actual": actualBody,
                                "message": `body value '${actualStr}' does not match criteria`,
                                operator
                            });
                        }
                        else {
                            // error with custom message

                            throw new AssertionError({
                                "actual": actualBody,
                                "message": `body value '${actualStr}' does not match criteria: ${asString(result)}`,
                                operator
                            });
                        }
                    }
                }
                else if (typeof expectedBody === "object") {
                    // JSON object

                    const actualObject = JSON.parse(
                        actualBody.toString("utf8")
                    );

                    assert.deepStrictEqual(
                        actualObject, expectedBody,
                        `Expected object '${JSON.stringify(expectedBody)}', but got '${JSON.stringify(actualObject)}'`
                    );
                }
                else {
                    throw new TypeError("Type of expected body is not supported");
                }
            }

            spinner.succeed(`${baseText} (${end.valueOf() - start.valueOf()}ms)`);

            await emitStatusUpdate(TestStatus.Passed);
        }
        catch (error) {
            start = start ?? now;
            end = new Date();

            spinner.fail(`[FAILED] ${baseText} (${end.valueOf() - start.valueOf()}ms): '${error}'`);

            await countFailure();

            await emitStatusUpdate(TestStatus.Failed, error);
        }
        finally {
            if (isLast) {
                // cleanups

                delete currentSessions[sessionId];
            }
        }
    });
}

export * from "./types";
