# Security Information

## Firebase API Keys

The Firebase API keys in this repository are **intentionally public** and are not security risks.

### Why Firebase Keys Are Safe to Expose

Firebase API keys for web apps are designed to be included in client-side code. They are not secret! Security is enforced through:

1. **Firebase Security Rules** - These control database access, not the API key
2. **Domain restrictions** - Firebase can be restricted to specific domains
3. **App Check** - Additional verification layer (optional)

### References

- [Is it safe to expose Firebase API keys?](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public)
- [Firebase Documentation](https://firebase.google.com/docs/projects/api-keys)

### Current Security Measures

- Database rules set to allow authenticated game room access only
- Test mode expires automatically after 30 days
- All writes are validated server-side by Firebase

If you have security concerns, please open an issue.
