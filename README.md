# astro-securitytxt

An [Astro](https://astro.build) integration that automatically generates an [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) compliant `security.txt` file during your site build.

## Installation

```bash
npm install astro-securitytxt
```

## Usage

Add the integration to your `astro.config.mjs`:

```ts
import { defineConfig } from "astro/config";
import securityTxt from "astro-securitytxt";

export default defineConfig({
  integrations: [
    securityTxt({
      contact: "mailto:security@example.com",
      expires: "2026-12-31T23:59:59.000Z",
    }),
  ],
});
```

After running `astro build`, the file will be placed at `.well-known/security.txt` in your build output by default.

## Configuration

### Required Fields

| Option    | Type                 | Description                                                                                          |
| --------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| `contact` | `string \| string[]` | One or more contact URIs (e.g. `mailto:` or `https://` links) for reporting security issues.         |
| `expires` | `Date \| string`     | When the security.txt should be considered stale. ISO 8601 string or `Date`. Should be < 1 year out. |

### Optional Fields

| Option               | Type                                | Description                                                      |
| -------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `encryption`         | `string \| string[]`                | URI(s) to encryption key(s) for secure communication.            |
| `acknowledgments`    | `string \| string[]`                | URI(s) to pages recognizing security researchers.                |
| `preferredLanguages` | `string`                            | Comma-separated language tags (e.g. `"en, es, de"`).             |
| `canonical`          | `string \| string[]`                | Canonical URI(s) where the `security.txt` is hosted.             |
| `policy`             | `string \| string[]`                | URI(s) to vulnerability disclosure policy.                       |
| `hiring`             | `string \| string[]`                | URI(s) to security-related job positions.                        |
| `placement`          | `".well-known" \| "root" \| "both"` | Where to place the file. Defaults to `".well-known"`. See below. |

### Placement

RFC 9116 [Section 3](https://www.rfc-editor.org/rfc/rfc9116#name-web-based-services) recommends placing the file at `/.well-known/security.txt`. Some sites also serve it at `/security.txt` for convenience.

| Value           | Output path(s)                                      |
| --------------- | --------------------------------------------------- |
| `".well-known"` | `/.well-known/security.txt` **(default)**           |
| `"root"`        | `/security.txt`                                     |
| `"both"`        | `/.well-known/security.txt` **and** `/security.txt` |

## Full Example

```ts
import { defineConfig } from "astro/config";
import securityTxt from "astro-securitytxt";

export default defineConfig({
  integrations: [
    securityTxt({
      contact: [
        "mailto:security@example.com",
        "https://example.com/security-contact",
      ],
      expires: new Date("2026-12-31T23:59:59Z"),
      encryption: "https://example.com/.well-known/pgp-key.txt",
      acknowledgments: "https://example.com/hall-of-fame",
      preferredLanguages: "en, de",
      canonical: "https://example.com/.well-known/security.txt",
      policy: "https://example.com/security-policy",
      hiring: "https://example.com/jobs",
      placement: "both",
    }),
  ],
});
```

This produces a `security.txt` like:

```plaintext
Contact: mailto:security@example.com
Contact: https://example.com/security-contact
Expires: 2026-12-31T23:59:59.000Z
Encryption: https://example.com/.well-known/pgp-key.txt
Acknowledgments: https://example.com/hall-of-fame
Preferred-Languages: en, de
Canonical: https://example.com/.well-known/security.txt
Policy: https://example.com/security-policy
Hiring: https://example.com/jobs
```

## RFC 9116 Reference

- [RFC 9116 — A File Format to Aid in Security Vulnerability Disclosure](https://www.rfc-editor.org/rfc/rfc9116)
- [securitytxt.org](https://securitytxt.org/)

## License

MIT
