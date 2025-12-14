"""
US Phone Number Pattern
Detects US phone numbers in various formats.
"""
PATTERN = {
    'pattern': r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b',
    'name': 'US Phone Number',
    'description': 'US phone numbers'
}

