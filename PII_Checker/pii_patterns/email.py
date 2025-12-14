"""
Email Address Pattern
Detects standard email addresses.
"""
PATTERN = {
    'pattern': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'name': 'Email Address',
    'description': 'Email addresses'
}

