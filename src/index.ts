import { getErrorMessage } from "./getMsg";

/**
 * This type is suppossed to be used in the constructor
 * of the `Result` class. It represents a positive value
 * @template T the type of the value
 */
export type Ok<T> = {
	status: "ok";
	value: T;
};

/**
 * This function is suppossed to be used in the constructor
 * of the `Result` class.
 * @param val the (positive) result
 * @returns a Positive result for the `Result` class
 * @template T the type of the positive result
 */
export const ok = <T>(val: T): Ok<T> => ({
	status: "ok",
	value: val,
});

/**
 * This function is suppossed to be used in the constructor
 * of the `Result` class.
 * @param val the (negative) result
 * @returns an error for the `Result` class
 * @template E the type of the error
 */
export const err = <E>(err: E): Err<E> => ({
	status: "err",
	err,
});

/**
 * This type is suppossed to be used in the constructor
 * of the `Result` class. It represents an error value
 * @template E the type of the error
 */
export type Err<E> = {
	status: "err";
	err: E;
};

/**
 * The Callback for the `Result` class
 * It is recommended that the callback simply returns function calls of `ok`/`err`
 * Those functions are automatically parsed to the callback in the constructor or can be imported manually
 * @template T The type of a positive result
 * @template E The type of a negative result
 */
export type Callback<T, E> = (
	Ok: (val: T) => Ok<T>,
	Err: (err: E) => Err<E>,
) => Ok<T> | Err<E>;

export type CallbackPromise<T, E> = (
	Ok: (val: T) => Ok<T>,
	Err: (err: E) => Err<E>,
) => Promise<Ok<T> | Err<E>>;

class Result<T, E> {
	private value: T | null;
	private err: E | null;
	private thrownMsg: null | string;

	constructor(value: T | null, err: E | null, thrownMsg: string | null) {
		this.value = value;
		this.err = err;
		this.thrownMsg = thrownMsg;
	}

	/**
	 * @returns a boolean indicating if the callback was successfull
	 */
	isOk() {
		return this.value !== null;
	}

	/**
	 * @returns a boolean indicating if the callback threw an error or if an error was returned
	 */
	isErr() {
		return this.value === null;
	}

	/**
	 * Retrieve the entire result in one object, differntly to go this is fully typesave
	 * @returns An Object either for the value or error
	 */
	get() {
		if (this.isOk()) {
			return {
				status: "ok",
				isSuccess: true,
				isError: false,
				value: this.value as T,
			} as const;
		}
		const error = {
			err: this.err,
			msg: this.thrownMsg,
		} as { err: E; msg: null } | { err: null; msg: string };

		return {
			status: "err",
			isSuccess: false,
			isError: true,
			err: error,
		} as const;
	}

	/**
	 * Simulate rusts match statement on results
	 * @param valCallback The callback which will be executed for a successfull result
	 * The parameter to this function will be the value
	 * @param errCallback The callback which will be executed for an error
	 * The parameter to this function will be the error value
	 * @param msgCallback The callback which will be executed when the callback threw an exception
	 * The parameter to this function will be the message of the error.
	 * @returns The return value of the executed callback/match arm
	 * @template S the return type of the successfull match arm
	 * @template Ev the return type of the match arm for errors
	 * @template M the return type of the match arm
	 */
	match<S, Ev, M>(
		valCallback: (val: T) => S,
		errCallback: (err: E) => Ev,
		msgCallback: (msg: string) => M,
	): S | Ev | M {
		if (this.value) return valCallback(this.value);
		if (this.err) return errCallback(this.err);
		if (this.thrownMsg) return msgCallback(this.thrownMsg);

		// This line is just for typescript and will never execute
		return "erresult failed" as S;
	}

	/**
	 * Return a value or the specified fallback
	 * @param fallback the fallback will be used if the callback returned an error, else the *real* value be used
	 * @returns Ideally the value (positive return of the callback) but if the callback threw or errored the fallback
	 * will be returned
	 */
	or(fallback: T) {
		return this.value ?? fallback;
	}

	map<R>(callback: (val: T) => R) {
		return this.value
			? new Result<R, E>(callback(this.value), null, null)
			: this;
	}
}

/**
 * A function to create a class with rust like error handling
 * @template T The type of a positive result
 * @template E The type of a negative result
 */
export function result<T, E>(callback: Callback<T, E>) {
	try {
		const result = callback(ok, err);

		if (result.status === "ok")
			return new Result<T, E>(result.value, null, null);
		if (result.status === "err")
			return new Result<T, E>(null, result.err, null);

		throw new Error(
			"This is a bug in erresult, if this happens, please open a github issue",
		);
	} catch (e) {
		return new Result<T, E>(null, null, getErrorMessage(e));
	}
}

export async function asyncResult<T, E>(callback: CallbackPromise<T, E>) {
	return callback(ok, err)
		.then((result) => {
			if (result.status === "ok")
				return new Result<T, E>(result.value, null, null);
			if (result.status === "err")
				return new Result<T, E>(null, result.err, null);

			throw new Error(
				"This is a bug in erresult, if this happens, please open a github issue",
			);
		})
		.catch((e) => {
			return new Result<T, E>(null, null, getErrorMessage(e));
		});
}
