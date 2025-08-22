# Essential Development Commands

## Daily Development
```bash
npm run dev              # Start development with hot reload (tsx watch)
npm run deploy-commands  # Deploy Discord slash commands
npm run check:all        # Full quality check (required before commits)
```

## Building & Running
```bash
npm run build      # Compile TypeScript to dist/
npm run start      # Run compiled production build
npm run type-check # Validate TypeScript without building
npm run clean      # Remove dist/ directory
```

## Testing
```bash
npm test           # Run all vitest unit tests
npm run test:watch # Continuous testing during development  
npm run test:ui    # Visual test interface
```

## Code Quality
```bash
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Format with Prettier
npm run format:check    # Check Prettier formatting
npm run knip            # Detect unused code
npm run knip:fix        # Auto-remove unused exports
npm run knip:production # Production-only unused code check
```

## Security & Auditing
```bash
npm run audit:security # Security vulnerability check
npm run audit:better   # Enhanced security audit
npm run check:security # Run all security checks
```

## Darwin (macOS) System Commands
```bash
ls -la           # List files with permissions
find . -name     # Find files by name
grep -r          # Search in files (prefer rg/ripgrep)
cd               # Change directory
pwd              # Show current path
which            # Locate command
```

## Git Workflow
```bash
git status       # Check working tree
git diff         # Show changes
git add .        # Stage all changes
git commit -m    # Commit with message
git push         # Push to remote
```

## Environment Setup
1. Copy `.env.example` to `.env`
2. Configure required environment variables
3. Run `npm install`
4. Run `npm run deploy-commands`
5. Run `npm run dev`

## Important Notes
- **Always run `npm run check:all` before committing**
- Use `npm run dev` for development (not `node`)
- TypeScript strict mode is enabled
- Prettier and ESLint must pass for clean builds
- Tests should be written using Vitest framework