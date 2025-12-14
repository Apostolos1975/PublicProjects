"""
Passport Number Patterns
Detects passport numbers for various countries.
"""
PATTERNS = {
    'passport_us': {
        'pattern': r'\b([A-Z]\d{8}|\d{9})\b',
        'name': 'US Passport Number',
        'description': 'US passport numbers (Next Gen: letter + 8 digits, or 9 digits for older passports)'
    },
    'passport_uk': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'UK Passport Number',
        'description': 'UK passport numbers - pattern to be defined'
    },
    'passport_canada': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Canada Passport Number',
        'description': 'Canada passport numbers - pattern to be defined'
    },
    'passport_australia': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Australia Passport Number',
        'description': 'Australia passport numbers - pattern to be defined'
    },
    'passport_germany': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Germany Passport Number',
        'description': 'Germany passport numbers - pattern to be defined'
    },
    'passport_france': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'France Passport Number',
        'description': 'France passport numbers - pattern to be defined'
    },
    'passport_italy': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Italy Passport Number',
        'description': 'Italy passport numbers - pattern to be defined'
    },
    'passport_spain': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Spain Passport Number',
        'description': 'Spain passport numbers - pattern to be defined'
    },
    'passport_netherlands': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Netherlands Passport Number',
        'description': 'Netherlands passport numbers - pattern to be defined'
    },
    'passport_sweden': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Sweden Passport Number',
        'description': 'Sweden passport numbers - pattern to be defined'
    },
    'passport_norway': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Norway Passport Number',
        'description': 'Norway passport numbers - pattern to be defined'
    },
    'passport_denmark': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Denmark Passport Number',
        'description': 'Denmark passport numbers - pattern to be defined'
    },
    'passport_finland': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Finland Passport Number',
        'description': 'Finland passport numbers - pattern to be defined'
    },
    'passport_poland': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Poland Passport Number',
        'description': 'Poland passport numbers - pattern to be defined'
    },
    'passport_china': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'China Passport Number',
        'description': 'China passport numbers - pattern to be defined'
    },
    'passport_japan': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Japan Passport Number',
        'description': 'Japan passport numbers - pattern to be defined'
    },
    'passport_india': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'India Passport Number',
        'description': 'India passport numbers - pattern to be defined'
    },
    'passport_russia': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Russia Passport Number',
        'description': 'Russia passport numbers - pattern to be defined'
    },
    'passport_brazil': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Brazil Passport Number',
        'description': 'Brazil passport numbers - pattern to be defined'
    },
    'passport_mexico': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Mexico Passport Number',
        'description': 'Mexico passport numbers - pattern to be defined'
    },
    'passport_south_africa': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'South Africa Passport Number',
        'description': 'South Africa passport numbers - pattern to be defined'
    },
    'passport_new_zealand': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'New Zealand Passport Number',
        'description': 'New Zealand passport numbers - pattern to be defined'
    },
    'passport_turkey': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Turkey Passport Number',
        'description': 'Turkey passport numbers - pattern to be defined'
    },
    'passport_saudi_arabia': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Saudi Arabia Passport Number',
        'description': 'Saudi Arabia passport numbers - pattern to be defined'
    },
    'passport_uae': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'UAE Passport Number',
        'description': 'UAE passport numbers - pattern to be defined'
    },
    'passport_singapore': {
        'pattern': r'\bPLACEHOLDER\b',
        'name': 'Singapore Passport Number',
        'description': 'Singapore passport numbers - pattern to be defined'
    }
}

