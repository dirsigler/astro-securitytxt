/**
 * Configuration options for the astro-securitytxt integration.
 *
 * Generates an RFC 9116 (https://www.rfc-editor.org/rfc/rfc9116) compliant
 * security.txt file during the Astro build process.
 */
export interface SecurityTextOptions {
  /**
   * **REQUIRED** — One or more methods for security researchers to contact you.
   *
   * Each entry must be a URI (e.g. `mailto:security@example.com` or
   * `https://example.com/security-contact`).
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-contact
   */
  contact: string | string[];

  /**
   * **REQUIRED** — The date and time after which the content of the
   * security.txt file should be considered stale.
   *
   * Accepts a `Date` object or an ISO 8601 date-time string.
   * It is RECOMMENDED that this value be less than a year into the future.
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-expires
   */
  expires: Date | string;

  /**
   * One or more links to encryption keys that security researchers can use
   * for encrypted communication.
   *
   * Each entry must be a URI (e.g. `https://example.com/.well-known/pgp-key.txt`
   * or `openpgp4fpr:...`).
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-encryption
   */
  encryption?: string | string[];

  /**
   * One or more links to pages where security researchers are recognized.
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-acknowledgments
   */
  acknowledgments?: string | string[];

  /**
   * A comma-separated list of preferred natural language tags
   * (RFC 5646 language tags), in order of preference.
   *
   * @example "en, es, de"
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-preferred-languages
   */
  preferredLanguages?: string;

  /**
   * One or more URIs of the security.txt being produced.
   * Used to indicate the canonical URI(s) where this file is located.
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-canonical
   */
  canonical?: string | string[];

  /**
   * One or more links to a policy document describing the vulnerability
   * disclosure practices.
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-policy
   */
  policy?: string | string[];

  /**
   * One or more links to the security-related job positions.
   *
   * @see https://www.rfc-editor.org/rfc/rfc9116#name-hiring
   */
  hiring?: string | string[];

  /**
   * Where to write the generated security.txt file.
   *
   * - `".well-known"` — only `/.well-known/security.txt` (default)
   * - `"root"` — only `/security.txt`
   * - `"both"` — both locations
   *
   * @default ".well-known"
   */
  placement?: ".well-known" | "root" | "both";
}
