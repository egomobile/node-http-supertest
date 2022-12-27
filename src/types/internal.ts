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

import type supertest from "supertest";

export type BinaryParser = (response: supertest.Response, done: (ex: any, data?: Buffer) => any) => any;

export type Nilable<T extends any = any> = Nullable<T> | Optional<T>;

export type Nullable<T extends any = any> = T | null;

export type Optional<T extends any = any> = T | undefined;
