"""
Credit Card Number Pattern
Detects credit card numbers in standard formats.
"""
PATTERN = {
    'pattern': r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
    'name': 'Credit Card Number',
    'description': 'Credit card numbers'
}

