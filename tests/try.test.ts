import { describe, expect, it } from "vitest";
import { Result } from "../src";

const successResult = new Result<string, unknown>((ok, _) => {
	return ok("success");
});

const errResult = new Result<unknown, string>((_, err) => {
	return err("err");
});

const thrownResult = new Result((_, __) => {
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
});
