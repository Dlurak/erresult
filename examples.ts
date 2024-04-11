import { Result } from "./src";

const numberStr = "42";

enum Error {
	NotANumber,
	TooBig,
	TooSmall,
}

new Result<number, Error>((Ok, Err) => {
	const number = parseInt(numberStr);

	if (isNaN(number)) return Err(Error.NotANumber);
	if (number > 1_000_000) return Err(Error.TooBig);
	if (number < 0) return Err(Error.TooSmall);

	return Ok(number);
}).match(
	(value) => console.log(`The parsed number is ${value}`),
	(err) => console.error(`The function returned an error: ${err}`),
	(msg) => console.log(`A error was thrown: ${msg}`),
);
