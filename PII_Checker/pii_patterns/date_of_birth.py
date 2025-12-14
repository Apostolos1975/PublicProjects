"""
Date of Birth Pattern
Detects dates that might be dates of birth.
"""
PATTERN = {
    'pattern': r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b',
    'name': 'Date of Birth',
    'description': 'Dates that might be DOB'
}

