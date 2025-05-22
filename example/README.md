# PolyVal - Usage Example Project

This example project demonstrates the basic usage scenarios of the PolyVal validation library.

## Contents

This example showcases:
- Creating a simple user registration validation schema
- Using multilingual support for error messages (English and Turkish)
- Defining custom validation rules
- Customizing error messages

## Running the Example

Follow these steps to run the example project:

1. Install and build the main PolyVal project (in the root directory):
```bash
npm install
npm run build
```

2. Prepare and run the example project:
```bash
cd example
npm install
npm run dev
```

## Output

When running the program, you will see:

1. Error messages with Turkish language support
2. Customized English error messages
3. Validation result with valid data

## Code Structure

In `src/index.ts` you'll find:

1. User registration schema definition
2. Validation with invalid data examples
3. Custom error message definitions
4. Validation with valid data example

## Learning Points

This example provides insights into:
- How to use the SimpleValidationSchema API to define schemas
- How to combine different validation rules
- How to customize error messages by language and field
- How to add custom validation logic 