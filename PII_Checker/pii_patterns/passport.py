"""
Passport Number Pattern
Detects passport numbers in common formats.
"""
PATTERN = {
    'pattern': r'\b[A-Z]{1,2}\d{6,9}\b',
    'name': 'Passport Number',
    'description': 'Passport numbers'
}

