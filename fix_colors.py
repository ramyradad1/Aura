import os
import re

dir_path = r"c:/Users/Ramy/Downloads/aura-perfumes/src"

replacements = {
    r'bg-\[\#fbf9f5\]': 'bg-surface',
    r'text-\[\#fbf9f5\]': 'text-surface',
    r'from-\[\#fbf9f5\]': 'from-surface',
    r'bg-\[\#2e0052\]': 'bg-primary',
    r'text-\[\#2e0052\]': 'text-primary',
    r'border-\[\#2e0052\]': 'border-primary',
    r'ring-\[\#2e0052\]': 'ring-primary',
    r'shadow-\[\#2e0052\]': 'shadow-primary',
    r'from-\[\#2e0052\]': 'from-primary',
    r'via-\[\#2e0052\]': 'via-primary',
    r'to-\[\#2e0052\]': 'to-primary',
    r'bg-\[\#4b0082\]': 'bg-primary-container',
    r'to-\[\#4b0082\]': 'to-primary-container',
    r'text-\[\#4b0082\]': 'text-primary-container',
    r'bg-\[\#735c00\]': 'bg-tertiary',
    r'text-\[\#735c00\]': 'text-tertiary',
    r'bg-\[\#ffe088\]': 'bg-tertiary-fixed',
    r'text-\[\#ffe088\]': 'text-tertiary-fixed',
    r'bg-\[\#e9c349\]': 'bg-tertiary-gold',
    r'text-\[\#e9c349\]': 'text-tertiary-gold',
    r'ring-\[\#e9c349\]': 'ring-tertiary-gold',
    r'shadow-\[\#e9c349\]': 'shadow-tertiary-gold',
    r'fill-\[\#e9c349\]': 'fill-tertiary-gold',
    r'border-\[\#e9c349\]': 'border-tertiary-gold',
    r'border-l-\[\#e9c349\]': 'border-l-tertiary-gold',
    r'border-t-\[\#e9c349\]': 'border-t-tertiary-gold',
    r'text-\[\#1b1c1a\]': 'text-on-surface',
    r'bg-\[\#1b1c1a\]': 'bg-on-surface',
    r'text-\[\#cec3d3\]': 'text-outline-variant',
    r'border-\[\#cec3d3\]': 'border-outline-variant',
    r'bg-\[\#cec3d3\]': 'bg-outline-variant',
    r'bg-\[\#f6d9fa\]': 'bg-secondary-container',
    r'ring-\[\#f6d9fa\]': 'ring-secondary-container',
    r'text-\[\#4c4451\]': 'text-on-surface-variant',
    r'bg-\[\#4c4451\]': 'bg-on-surface-variant',
    r'text-\[\#ba1a1a\]': 'text-error',
    r'border-\[\#ba1a1a\]': 'border-error',
    r'bg-\[\#ba1a1a\]': 'bg-error',
    r'text-\[\#7d7483\]': 'text-outline',
    r'border-\[\#7d7483\]': 'border-outline',
    r'bg-\[\#e4e2de\]': 'bg-surface-variant',
    r'text-\[\#e4e2de\]': 'text-surface-variant',
    r'bg-\[\#f5f3ef\]': 'bg-surface-container-low',
    r'bg-gradient-to-l': 'bg-linear-to-l',
    r'bg-gradient-to-r': 'bg-linear-to-r',
    r'bg-gradient-to-t': 'bg-linear-to-t',
    r'bg-gradient-to-b': 'bg-linear-to-b',
    r'bg-gradient-to-tr': 'bg-linear-to-tr',
    r'bg-gradient-to-br': 'bg-linear-to-br',
    r'bg-gradient-to-tl': 'bg-linear-to-tl',
    r'bg-gradient-to-bl': 'bg-linear-to-bl',
    r'z-\[100\]': 'z-100',
    r'z-\[999\]': 'z-999',
    r'z-\[9999\]': 'z-9999',
    r'aspect-\[4/5\]': 'aspect-4/5'
}

for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            orig_content = content
            # Quick string replace where possible
            for pattern, replacement in replacements.items():
                content = re.sub(pattern, replacement, content)
            
            if content != orig_content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Updated {f}")

print("Done")
