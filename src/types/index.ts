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

import type { ITestEventHandlerContext } from "@egomobile/http-server";

/**
 * A function to validate body.
 *
 * @param {IBodyValueValidatorContext} context The context.
 *
 * @returns {BodyValueValidatorResult|PromiseLike<BodyValueValidatorResult>} The result or a promise with it.
 */
export type BodyValueValidator =
    (context: IBodyValueValidatorContext) => BodyValueValidatorResult | PromiseLike<BodyValueValidatorResult>;

/**
 * A possible value for a `BodyValueValidator` function.
 *
 * - `void`, `undefined`, `true` => no error
 * - `false` => error, gut unknown
 * - `string` => error message
 */
export type BodyValueValidatorResult = void | undefined | boolean | string;

/**
 * Context for a `BodyValueValidator` function. */
export interface IBodyValueValidatorContext {
    /**
     * The body to validate.
     */
    body: Buffer;
}

/**
 * A function, which returns the stream for a stream event.
 *
 * @param {ITestEventHandlerContext} context The event context.
 *
 * @returns {NodeJS.WriteStream|PromiseLike<NodeJS.WriteStream>} The stream to use or the promise with it.
 */
export type TestOutputStreamProvider =
    (context: ITestEventHandlerContext) => NodeJS.WriteStream | PromiseLike<NodeJS.WriteStream>;
