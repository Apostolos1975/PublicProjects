"""
PII Pattern Registry
Auto-loads all pattern modules from this directory.
Each pattern file should define either:
- A PATTERN dictionary (for single pattern files)
- A PATTERNS dictionary (for files with multiple patterns)
Each pattern dict should have 'pattern', 'name', and 'description' keys.
"""
import os
import importlib
from typing import Dict

def load_patterns() -> Dict:
    """
    Dynamically load all pattern modules and combine them into a single dictionary.
    Automatically discovers all .py files in this directory (except __init__.py and __pycache__).
    Files can export either a PATTERN dictionary (single pattern) or PATTERNS dictionary (multiple patterns).
    """
    patterns = {}
    current_dir = os.path.dirname(__file__)
    
    # Auto-discover pattern modules
    for filename in os.listdir(current_dir):
        if filename.endswith('.py') and filename != '__init__.py':
            module_name = filename[:-3]  # Remove .py extension
            try:
                module = importlib.import_module(f'pii_patterns.{module_name}')
                # Check for PATTERNS (plural) first - for files with multiple patterns
                if hasattr(module, 'PATTERNS'):
                    # Merge multiple patterns into the main patterns dict
                    patterns.update(module.PATTERNS)
                # Check for PATTERN (singular) - for files with single pattern
                elif hasattr(module, 'PATTERN'):
                    pattern_key = module_name
                    patterns[pattern_key] = module.PATTERN
                else:
                    print(f"Warning: Pattern module {module_name} does not define PATTERN or PATTERNS")
            except ImportError as e:
                print(f"Warning: Could not import pattern module {module_name}: {e}")
    
    return patterns

# Export the combined patterns
PII_PATTERNS = load_patterns()

