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

import type { BinaryParser } from "../types/internal";

export interface IBinaryParserOptions {
    encoding: BufferEncoding;
}

export function asAsync<TFunc extends Function = Function>(func: Function): TFunc {
    if (func.constructor.name === "AsyncFunction") {
        return func as TFunc;
    }

    return (async function (...args: any[]) {
        return func(...args);
    }) as any;
}

export function asBuffer(val: any): Buffer {
    if (Buffer.isBuffer(val)) {
        return val;
    }

    return Buffer.from(asString(val), "utf8");
}

export function asString(val: any): string {
    if (typeof val === "string") {
        return val;
    }

    if (Buffer.isBuffer(val)) {
        return val.toString("utf8");
    }

    if (Array.isArray(val)) {
        return JSON.stringify(
            val.map((item) => {
                return asString(item);
            })
        );
    }

    if (typeof val["toString"] === "function") {
        return String(val.toString());
    }

    if (typeof val === "object") {
        return JSON.stringify(val);
    }

    if (typeof val === "function") {
        return asString(val());
    }

    return isNil(val) ? "" : String(val);
}

export function binaryParser(options: IBinaryParserOptions): BinaryParser {
    const { encoding } = options;

    return (response, done) => {
        response.setEncoding(encoding);

        let data = "";

        response.once("error", (error: any) => {
            done(error);
        });

        response.on("data", (chunk: string) => {
            data += chunk;
        });

        response.once("end", () => {
            done(null, Buffer.from(data, encoding));
        });
    };
}

export function isNil(val: unknown): val is (null | undefined) {
    return typeof val === "undefined" ||
        val === null;
}

export function toSearchString(val: any): string {
    val = toStringSafe(val)
        .toLowerCase()
        .split("ä").join("ae")
        .split("ö").join("oe")
        .split("ü").join("ue")
        .split("ß").join("ss")
        .split("\t").join("  ")
        .split("\n").join(" ")
        .split("\r").join("")
        .trim();

    return val;
}

export function toStringSafe(val: any): string {
    if (isNil(val)) {
        return "";
    }

    if (typeof val === "string") {
        return val;
    }

    if (typeof val.toString === "function") {
        return String(val.toString());
    }

    if (typeof val === "object") {
        return JSON.stringify(val);
    }

    return String(val);
}
