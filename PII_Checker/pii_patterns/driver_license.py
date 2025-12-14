"""
Driver License Pattern
Detects driver license numbers.
"""
PATTERN = {
    'pattern': r'\b[A-Z]{1,2}\d{6,8}\b',
    'name': 'Driver License',
    'description': 'Driver license numbers'
}

