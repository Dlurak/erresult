# Erresult

This library aims to provide Rust like error handling in typescript.

## Error handling

In many languages errors are Values, in rust this is implemented using the 
`Result` enum, sadly typescript doesn't provide enums that are powerful 
enough.  

Here is a real code example:

### Rust

```rust
fn main() {
    let number_str = "42";

    // convert the string to a number (i32 is a number)
    match number_str.parse::<i32>() {
        // Valid case
        Ok(num) => println!("Parsed number: {}", num),
        // Error case
        Err(err) => eprintln!("Error: {}", err),
    }
}
```
### JavaScript

In JavaScript you surely know the try catch control flow, but it has multiple 
flaws:

- It doesn't force you to address potential errors
- It doesn't even provide you with the info that an error could be thrown
- It creates a new scope
- As [anything can be 
thrown](https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescr
ipt) in JavaScript the cached error may not be an error at all
    - There is basically no Type safety

Using Erresult error management looks more like this:

```ts
import { result } from "erresult";

const numberStr = "42";

enum Error {
	NotANumber,
	TooBig,
	TooSmall,
}

result<number, Error>((Ok, Err) => {
	const number = parseInt(numberStr);

	if (isNaN(number)) return Err(Error.NotANumber)
	if (number > 1_000_000) return Err(Error.TooBig)
	if (number < 0) return Err(Error.TooSmall)

	return Ok(number)
}).match(
	(value) => console.log(`The parsed number is ${value}`),
	(err) => console.error(`The function returned an error: ${err}`),
	(msg) => console.log(`A error was thrown: ${msg}`)
)
```

See *example.ts* for the example above

## Documentation

Documentation is available [here](https://dlurak.github.io/erresult/).
