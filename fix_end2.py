with open("src/app/internships/page.tsx", "r") as f:
    content = f.read()

import re
# Find the exact ending and replace it
fixed_content = re.sub(
    r'\s+\]\)\s*\)\s*:\s*\(\s*<div.*?No active internships found.*?</p>\s*</div>\s*</div>\s*\)\}\s*</div>\s*</div>\s*\);\s*\}',
    '\n                ))\n            ) : (\n                <div className="text-center py-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-4">\n                    <Briefcase className="h-12 w-12 text-muted-foreground" />\n                    <div className="space-y-1">\n                        <p className="text-xl font-bold">No active internships found</p>\n                        <p className="text-muted-foreground">Check back later for new opportunities.</p>\n                    </div>\n                </div>\n            )}\n            </div>\n        </div>\n    );\n}',
    content,
    flags=re.DOTALL
)

with open("src/app/internships/page.tsx", "w") as f:
    f.write(fixed_content)
