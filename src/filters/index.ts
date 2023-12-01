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

import { compileExpression } from "filtrex";
import type { TestEventHandlerPredicate } from "../types";
import { toSearchString, toStringSafe } from "../utils/internal";

export function createExtraFilterFunctions(): Record<string, (...args: any[]) => any> {
    return {
        "all": (val: any, ...subStrs: any[]): boolean => {
            const expr = toSearchString(val);

            return subStrs.map((s) => {
                return toSearchString(s);
            }).every((s) => {
                return expr.includes(s);
            });
        },
        "any": (val: any, ...subStrs: any[]): boolean => {
            const expr = toSearchString(val);

            return subStrs.map((s) => {
                return toSearchString(s);
            }).some((s) => {
                return expr.includes(s);
            });
        },
        "endsWith": (val: any, suffix: any): boolean => {
            return toStringSafe(val)
                .endsWith(toStringSafe(suffix));
        },
        "float": (val: any): number | false => {
            const num = parseFloat(toSearchString(val));

            return Number.isNaN(num) ? num : false;
        },
        "indexOf": (value: any, search: any): number => {
            return toStringSafe(value)
                .indexOf(toStringSafe(search));
        },
        "int": (val: any): number | false => {
            const num = parseInt(toSearchString(val));

            return Number.isNaN(num) ? num : false;
        },
        "isNaN"(val: any, float = true): boolean {
            if (float) {
                return this.float(val) === false;
            }

            return this.int(val) === false;
        },
        "join": (val: any, ...args: any[]) => {
            const sep = toStringSafe(val);

            return args.map((a) => {
                return toStringSafe(a);
            }).join(sep);
        },
        "log": (val: any, returnValue = true): any => {
            // eslint-disable-next-line no-console
            console.log(val);

            return returnValue;
        },
        "lower": (val: any) => {
            return toStringSafe(val).toLowerCase();
        },
        "norm": (value: any): string => {
            let str = toSearchString(value);

            // replace duplicate spaces
            // with single one
            while (str.includes("  ")) {
                str = str.replace("  ", " ");
            }

            return str.trim();
        },
        "regex": (val: any, expr: any, flags = "i") => {
            try {
                return new RegExp(toStringSafe(expr), toStringSafe(flags)).test(
                    toStringSafe(val),
                );
            }
            catch {
                return false;
            }
        },
        "startsWith": (val: any, prefix: any): boolean => {
            return toStringSafe(val)
                .startsWith(toStringSafe(prefix));
        },
        "str": (value: any) => {
            return toStringSafe(value);
        },
        "trim": (val: any) => {
            return toStringSafe(val).trim();
        },
        "trimEnd": (val: any) => {
            return toStringSafe(val).trimEnd();
        },
        "trimStart": (val: any) => {
            return toStringSafe(val).trimStart();
        },
        "upper": (val: any) => {
            return toStringSafe(val).toUpperCase();
        }
    };
}

export function createDefaultTestEventHandlerPredicate(): TestEventHandlerPredicate {
    const filterExpression = process.env.EGO_TEST_FILTER?.trim();
    if (filterExpression) {
        const filterPredicate = compileExpression(filterExpression, {
            "extraFunctions": createExtraFilterFunctions()
        });

        return (context) => {
            const {
                countFailure,
                description,
                escapedQuery,
                escapedRoute,
                file,
                group,
                httpMethod,
                methodName,
                parameters,
                query,
                route
            } = context;

            return !!filterPredicate({
                "context": context.context,
                countFailure,
                description,
                escapedQuery,
                escapedRoute,
                file,
                group,
                httpMethod,
                methodName,
                "parameters": JSON.stringify(parameters),
                "query": JSON.stringify(query),
                route
            });
        };
    }

    return () => {
        return true;
    };
}
