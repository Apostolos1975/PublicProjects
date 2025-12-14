"""
IP Address Pattern
Detects IPv4 addresses.
"""
PATTERN = {
    'pattern': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
    'name': 'IP Address',
    'description': 'IP addresses'
}

