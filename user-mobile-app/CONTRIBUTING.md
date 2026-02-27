# Contributing Guidelines

## Code of Conduct

Be respectful and professional in all interactions.

## Development Process

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/feature-name
   ```

2. Make your changes following coding standards

3. Write tests for new features

4. Commit with clear messages
   ```bash
   git commit -m "feat: add new feature"
   ```

5. Push to your branch
   ```bash
   git push origin feature/feature-name
   ```

6. Create a Pull Request with description

## Code Style

### JavaScript/Node.js
- Use ES6+ syntax
- 2-space indentation
- Use eslint configuration
- Run `npm run lint:fix` before committing

### PHP/Laravel
- Follow PSR-12 coding standard
- Run `php artisan pint` for formatting
- Document code with PHPDoc

### Flutter/Dart
- Follow Dart style guide
- Run `flutter format lib/` before committing
- Use meaningful variable names

## Testing

- Write unit tests for business logic
- Write integration tests for APIs
- Maintain >80% code coverage
- Test locally before submitting PR

### Run Tests

**Backend:**
```bash
npm test
```

**Admin Panel:**
```bash
php artisan test
```

**Flutter Apps:**
```bash
flutter test
```

## Database Migrations

For schema changes:
1. Create migration file
2. Add up/down logic
3. Test locally
4. Document changes

**Node.js:**
```bash
npm run migrate
```

**Laravel:**
```bash
php artisan make:migration migration_name
```

## Pull Request Checklist

- [ ] Code follows style guide
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Branch is up-to-date with main
- [ ] Meaningful commit messages

## Issue Reporting

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable
- Environment details

## Documentation

- Update README.md for user-facing changes
- Add code comments for complex logic
- Keep API documentation current
- Document new environment variables

## Performance

- Avoid N+1 queries
- Use caching appropriately
- Optimize images
- Monitor API response times

## Security

- Don't commit secrets/credentials
- Validate all inputs
- Use prepared statements
- Follow OWASP guidelines
- Report security issues privately

## Branching Strategy

- `main` - production ready
- `develop` - staging
- `feature/*` - new features
- `bugfix/*` - bug fixes
- `hotfix/*` - urgent production fixes

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(auth): add JWT token refresh endpoint

- Implement refresh token validation
- Add token refresh to auth controller
- Update API documentation

Closes #123
```

## Release Process

1. Update version in package.json/composer.json
2. Update CHANGELOG.md
3. Create git tag
4. Create GitHub release
5. Deploy to production

## Questions?

- Check documentation
- Search existing issues
- Ask in discussions
- Contact maintainers

Thank you for contributing!
