import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { AstroIntegration } from "astro";
import type { SecurityTextOptions } from "./types.js";

export type { SecurityTextOptions } from "./types.js";

/**
 * Ensure a value is always an array.
 */
function toArray(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Format a Date or ISO string into an RFC 3339 / ISO 8601 date-time string,
 * as required by RFC 9116 for the Expires field.
 */
function formatExpires(expires: Date | string): string {
  const date = expires instanceof Date ? expires : new Date(expires);
  if (isNaN(date.getTime())) {
    throw new Error(
      `[astro-securitytxt] Invalid "expires" value: "${String(expires)}". ` +
        `Must be a valid Date or ISO 8601 date-time string.`,
    );
  }
  return date.toISOString();
}

/**
 * Validate that required RFC 9116 fields are present and make sense.
 */
function validateOptions(options: SecurityTextOptions): void {
  if (!options.contact || toArray(options.contact).length === 0) {
    throw new Error(
      `[astro-securitytxt] "contact" is required by RFC 9116. ` +
        `Provide at least one contact URI (e.g. "mailto:security@example.com").`,
    );
  }

  if (!options.expires) {
    throw new Error(
      `[astro-securitytxt] "expires" is required by RFC 9116. ` +
        `Provide a Date object or ISO 8601 date-time string.`,
    );
  }

  // Warn if Expires is more than 1 year in the future
  const expiresDate =
    options.expires instanceof Date
      ? options.expires
      : new Date(options.expires);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  if (expiresDate > oneYearFromNow) {
    // We only warn, not throw — it's a SHOULD, not a MUST in the RFC
    console.warn(
      `[astro-securitytxt] Warning: RFC 9116 recommends that "expires" be ` +
        `less than one year in the future. Current value: ${expiresDate.toISOString()}`,
    );
  }

  if (expiresDate < new Date()) {
    console.warn(
      `[astro-securitytxt] Warning: "expires" is set in the past ` +
        `(${expiresDate.toISOString()}). The security.txt will be ` +
        `considered stale immediately.`,
    );
  }
}

/**
 * Build the security.txt file contents according to RFC 9116.
 *
 * Field ordering follows the RFC convention:
 * Contact, Expires, Encryption, Acknowledgments, Preferred-Languages,
 * Canonical, Policy, Hiring.
 */
function buildSecurityTxt(options: SecurityTextOptions): string {
  const lines: string[] = [];

  // Contact (REQUIRED, may appear multiple times)
  for (const contact of toArray(options.contact)) {
    lines.push(`Contact: ${contact}`);
  }

  // Expires (REQUIRED, exactly once)
  lines.push(`Expires: ${formatExpires(options.expires)}`);

  // Encryption (OPTIONAL, may appear multiple times)
  if (options.encryption) {
    for (const enc of toArray(options.encryption)) {
      lines.push(`Encryption: ${enc}`);
    }
  }

  // Acknowledgments (OPTIONAL, may appear multiple times)
  if (options.acknowledgments) {
    for (const ack of toArray(options.acknowledgments)) {
      lines.push(`Acknowledgments: ${ack}`);
    }
  }

  // Preferred-Languages (OPTIONAL, exactly once)
  if (options.preferredLanguages) {
    lines.push(`Preferred-Languages: ${options.preferredLanguages}`);
  }

  // Canonical (OPTIONAL, may appear multiple times)
  if (options.canonical) {
    for (const canon of toArray(options.canonical)) {
      lines.push(`Canonical: ${canon}`);
    }
  }

  // Policy (OPTIONAL, may appear multiple times)
  if (options.policy) {
    for (const pol of toArray(options.policy)) {
      lines.push(`Policy: ${pol}`);
    }
  }

  // Hiring (OPTIONAL, may appear multiple times)
  if (options.hiring) {
    for (const hire of toArray(options.hiring)) {
      lines.push(`Hiring: ${hire}`);
    }
  }

  // Ensure trailing newline (standard text file convention)
  return lines.join("\n") + "\n";
}

/**
 * Astro integration that generates an RFC 9116 compliant `security.txt`
 * file in the build output.
 *
 * @example
 * ```ts
 * // astro.config.mjs
 * import { defineConfig } from "astro/config";
 * import securityTxt from "astro-securitytxt";
 *
 * export default defineConfig({
 *   integrations: [
 *     securityTxt({
 *       contact: "mailto:security@example.com",
 *       expires: "2026-12-31T23:59:59.000Z",
 *     }),
 *   ],
 * });
 * ```
 */
export default function securityTxt(
  options: SecurityTextOptions,
): AstroIntegration {
  let publicDir: string | undefined;
  return {
    name: "astro-securitytxt",
    hooks: {
      "astro:config:setup": ({ config }) => {
        // Capture the public directory path from Astro config
        publicDir = config.publicDir
          ? fileURLToPath(config.publicDir)
          : undefined;
      },
      "astro:config:done": ({ logger }) => {
        // Validate early so users get immediate feedback
        try {
          validateOptions(options);
        } catch (err) {
          logger.error((err as Error).message);
          throw err;
        }
      },
      "astro:build:done": async ({ logger }) => {
        validateOptions(options);
        if (!publicDir) {
          throw new Error(
            "[astro-securitytxt] Could not determine Astro public/ directory.",
          );
        }
        const content = buildSecurityTxt(options);
        const placement = options.placement ?? ".well-known";
        const targets: string[] = [];
        if (placement === ".well-known" || placement === "both") {
          targets.push(path.join(publicDir, ".well-known", "security.txt"));
        }
        if (placement === "root" || placement === "both") {
          targets.push(path.join(publicDir, "security.txt"));
        }
        for (const target of targets) {
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, content, "utf-8");
          logger.info(`Created ${path.relative(publicDir, target)}`);
        }
      },
    },
  };
}
