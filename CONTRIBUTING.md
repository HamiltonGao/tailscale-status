# Contributing to Tailscale Status

Thank you for your interest in contributing to Tailscale Status!

## Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Tailscale-Status.git
   cd Tailscale-Status
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run lint` before committing
- Follow the existing code patterns in the project

## Making Changes

1. Make your changes in your feature branch
2. Add tests if applicable
3. Ensure all tests pass: `npm test`
4. Run linting: `npm run lint`
5. Commit your changes with a clear commit message
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request on GitHub

## Pull Request Guidelines

- Fill out the PR template completely
- Describe what the change does and why
- Link any related issues
- Ensure CI passes
- Request review from a maintainer

## Reporting Bugs

Before submitting a bug report:
- Search existing issues to avoid duplicates
- Try to reproduce with the latest version
- Include:
  - Your environment (OS, Node version, etc.)
  - Steps to reproduce
  - Expected vs actual behavior
  - Relevant logs/screenshots

## Suggesting Features

Open an issue with:
- Clear description of the feature
- Use case / motivation
- Any mockups or examples if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
