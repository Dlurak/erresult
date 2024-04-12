import { describe, expect, it } from "vitest";
import { asyncResult, result } from "../src";

const successResult = result<string, unknown>((ok, _) => {
	return ok("success");
});

const errResult = result<unknown, string>((_, err) => {
	return err("err");
});

const thrownResult = result((_, __) => {
	throw new Error("thrown");
});

describe("result", () => {
	it("is ok", () => {
		expect(successResult.isOk()).toBe(true);
		expect(errResult.isOk()).toBe(false);
		expect(thrownResult.isOk()).toBe(false);

		expect(successResult.isErr()).toBe(false);
		expect(errResult.isErr()).toBe(true);
		expect(thrownResult.isErr()).toBe(true);
	});

	it("matches", () => {
		expect(
			successResult.match(
				(val) => [val, "Success"] as const,
				(err) => [err, "err"] as const,
				(thrown) => [thrown, "thrown"] as const,
			),
		).toStrictEqual(["success", "Success"]);
		expect(
			errResult.match(
				(val) => [val, "Success"] as const,
				(err) => [err, "err"] as const,
				(thrown) => [thrown, "thrown"] as const,
			),
		).toStrictEqual(["err", "err"]);
		expect(
			thrownResult.match(
				(val) => [val, "Success"] as const,
				(err) => [err, "err"] as const,
				(thrown) => [thrown, "thrown"] as const,
			),
		).toStrictEqual(["thrown", "thrown"]);
	});

	it("get", () => {
		expect(successResult.get()).toStrictEqual({
			status: "ok",
			isSuccess: true,
			isError: false,
			value: "success",
		});
		expect(errResult.get()).toStrictEqual({
			status: "err",
			isSuccess: false,
			isError: true,
			err: {
				err: "err",
				msg: null,
			},
		});
		expect(thrownResult.get()).toStrictEqual({
			status: "err",
			isSuccess: false,
			isError: true,
			err: {
				err: null,
				msg: "thrown",
			},
		});
	});

	it("or", () => {
		expect(successResult.or("default")).toBe("success");
		expect(errResult.or("default")).toBe("default");
		expect(thrownResult.or("default")).toBe("default");
	});

	it("map", () => {
		expect(successResult.map((val) => `Success: ${val}`).get().value).toBe(
			"Success: success",
		);
		expect(errResult.map((val) => `Success: ${val}`).get().value).toBe(
			undefined,
		);
		expect(thrownResult.map((val) => `Success: ${val}`).get().value).toBe(
			undefined,
		);
	});

	it("and then", () => {
		expect(
			successResult
				.andThen((val, _, err) => {
					expect(val).toBe("success");
					return err("err");
				})
				.get().err?.err,
		).toBe("err");

		expect(
			errResult
				.andThen((_, __, err) => {
					// this shouldn't be called as the callback will
					// only be called for positive results
					expect(true).toBe(false);
					return err("and then");
				})
				.get().err?.err,
		).toBe("err");

		expect(
			thrownResult
				.andThen((_, __, err) => {
					expect(true).toBe(false);
					return err("thrown and then");
				})
				.get().err?.msg,
		).toBe("thrown");
	});
});

describe("async", () => {
	// The methods are all on the same class
	// So we only test that this class gets constructed,
	// The memthods are tested in the test above
	it("works", async () => {
		const success = await asyncResult<"success", unknown>(
			(ok, err) =>
				new Promise((resolve) => {
					resolve(ok("success"));
				}),
		);
		const error = await asyncResult<unknown, "err">(
			(ok, err) =>
				new Promise((resolve) => {
					resolve(err("err"));
				}),
		);
		const thrown = await asyncResult(
			(_, __) =>
				new Promise(() => {
					throw new Error("thrown");
				}),
		);
		const rejected = await asyncResult(
			(_, __) =>
				new Promise((_, reject) => {
					return reject("rejected");
				}),
		);

		expect(success.get()).toStrictEqual({
			status: "ok",
			isSuccess: true,
			isError: false,
			value: "success",
		});
		expect(error.get()).toStrictEqual({
			status: "err",
			isSuccess: false,
			isError: true,
			err: {
				err: "err",
				msg: null,
			},
		});
		expect(thrown.get()).toStrictEqual({
			status: "err",
			isSuccess: false,
			isError: true,
			err: {
				err: null,
				msg: "thrown",
			},
		});
		expect(rejected.get()).toStrictEqual({
			status: "err",
			isSuccess: false,
			isError: true,
			err: {
				err: null,
				msg: "rejected",
			},
		});
	});
});
