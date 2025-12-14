# PII Patterns Directory

This directory contains individual pattern files for detecting different types of Personally Identifiable Information (PII).

## Structure

Each pattern is defined in its own Python file. A file can export either:

1. A single `PATTERN` dictionary (for files with one pattern)
2. A `PATTERNS` dictionary (for files with multiple patterns)

Single pattern structure:
```python
PATTERN = {
    'pattern': r'regex_pattern_here',
    'name': 'Display Name',
    'description': 'Description of what this pattern detects'
}
```

Multiple patterns structure:
```python
PATTERNS = {
    'pattern_key_1': {
        'pattern': r'regex_pattern_here',
        'name': 'Display Name 1',
        'description': 'Description of pattern 1'
    },
    'pattern_key_2': {
        'pattern': r'regex_pattern_here',
        'name': 'Display Name 2',
        'description': 'Description of pattern 2'
    }
}
```

## Adding a New Pattern

To add a new PII detection pattern:

1. Create a new Python file in this directory (e.g., `new_pattern.py`)
2. Define a `PATTERN` dictionary with the required keys:
   - `pattern`: A regex pattern string
   - `name`: A human-readable name for this pattern
   - `description`: A description of what this pattern detects

Example:

```python
# pii_patterns/new_pattern.py
"""
New Pattern Description
Brief explanation of what this pattern detects.
"""
PATTERN = {
    'pattern': r'\b\d{10}\b',
    'name': 'New Pattern Name',
    'description': 'Description of the new pattern'
}
```

3. The pattern will be automatically loaded by `__init__.py` - no additional configuration needed!

## Current Patterns

- `email.py` - Email addresses
- `national_id.py` - National ID numbers (US SSN, Swedish personnummer)
- `credit_card.py` - Credit card numbers
- `phone.py` - US phone numbers
- `ip_address.py` - IP addresses
- `date_of_birth.py` - Dates of birth
- `passport.py` - Passport numbers
- `driver_license.py` - Driver license numbers

## Pattern Naming Convention

- Use lowercase with underscores for file names (snake_case)
- File names should be descriptive and match the pattern type
- The pattern key in the combined dictionary will be the filename (without .py)

