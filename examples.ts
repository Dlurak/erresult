import { result } from "./src";

const numberStr = "42";

enum ConvError {
	NotANumber = 0,
	TooBig = 1,
	TooSmall = 2,
}

result<number, ConvError>((Ok, Err) => {
	const number = parseInt(numberStr);

	if (Number.isNaN(number)) return Err(ConvError.NotANumber);
	if (number > 1_000_000) return Err(ConvError.TooBig);
	if (number < 0) return Err(ConvError.TooSmall);

	return Ok(number);
}).match(
	(value) => console.log(`The parsed number is ${value}`),
	(err) => console.error(`The function returned an error: ${err}`),
	(msg) => console.log(`A error was thrown: ${msg}`),
);
