const fs = require('fs');
const path = require('path');

const files = [
    'generated/prisma/internal/prismaNamespaceBrowser.ts',
    'generated/prisma/internal/prismaNamespace.ts'
];

let totalFixed = 0;

files.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);

    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Đếm số lượng trước khi fix
        const matches = content.match(/export const \w+ = runtime\.\w+/g) || [];

        // Fix: export const X = runtime.X -> export const X: any = runtime.X
        content = content.replace(
            /export const (\w+) = runtime\.(\w+)/g,
            'export const $1: any = runtime.$2'
        );

        fs.writeFileSync(fullPath, content, 'utf8');

        if (matches.length > 0) {
            console.log(`✅ Fixed ${matches.length} exports in ${filePath}`);
            totalFixed += matches.length;
        }
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
});

console.log(`\n🎉 Total fixed: ${totalFixed} exports`);