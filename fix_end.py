with open("src/app/internships/page.tsx", "r") as f:
    content = f.read()

import re
fixed_content = re.sub(
    r'\s+</div>\n\s+</div>\n\s+\)}\n\s+</div>\n\s+</div>\n\s+\);\n}',
    '\n                    </div>\n                )}\n            </div>\n        </div>\n    );\n}',
    content
)

with open("src/app/internships/page.tsx", "w") as f:
    f.write(fixed_content)
