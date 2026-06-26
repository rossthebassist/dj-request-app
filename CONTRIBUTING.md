# Contributing

Contributions are welcome! Here's how to get started:

## Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

4. Create `.env` file in backend with test credentials
5. Start development servers:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Code Style

- Use ES6+ syntax
- Format code with consistent indentation
- Add comments for complex logic
- Keep components small and focused

## Testing

Run tests:
```bash
cd backend && npm test
cd ../frontend && npm test
```

## Submitting Changes

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to fork: `git push origin feature/amazing-feature`
4. Open a Pull Request

## Reporting Bugs

Use GitHub Issues with:
- Clear title
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

Open an issue with:
- Use case description
- Why it's needed
- Potential implementation approach

## License

MIT - feel free to use this project however you like!
