"""
National ID Number Patterns
Detects various national identity numbers including US SSN and Swedish personnummer.
"""
PATTERNS = {
    'ssn': {
        'pattern': r'\b\d{3}-?\d{2}-?\d{4}\b',
        'name': 'Social Security Number',
        'description': 'SSN (XXX-XX-XXXX or XXXXXXXXX)'
    },
    'swedish_personal_number': {
        'pattern': r'\b(?:\d{6}[-+]?\d{4}|\d{8}[-+]?\d{4})\b',
        'name': 'Swedish Personal Number',
        'description': 'Swedish personnummer (YYMMDD-XXXX or YYYYMMDD-XXXX)'
    }
}

