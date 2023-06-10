import { NextRequest, NextResponse } from "next/server";

// Regex to check whether something has an extension, e.g. .jpg
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  // Cookie locale
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;

  // Client country, defaults to us
  const country = req.geo?.country?.toLowerCase() || "us";

  // Client language, defaults to en
  const language =
    req.headers
      .get("accept-language")
      ?.split(",")?.[0]
      .split("-")?.[0]
      .toLowerCase() || "en";

  console.log({
    country: country,
    language: language,
    cookieLocale: cookieLocale,
  });

  try {
    // Early return if we do not need to or want to run middleware
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.includes("/api/") ||
      PUBLIC_FILE.test(req.nextUrl.pathname)
    ) {
      return;
    }

    // Early return if we are on a locale other than default
    if (req.nextUrl.locale !== "default") {
      return;
    }

    // Early return if there is a cookie present and on default locale
    // We can redirect right away to the value of the cookie
    // Still falls back to en just in case
    if (cookieLocale && req.nextUrl.locale === "default") {
      return NextResponse.redirect(
        new URL(
          `/${cookieLocale}${req.nextUrl.pathname}${req.nextUrl.search}`,
          req.url
        )
      );
    }

    // We now know:
    // No cookie that we need to deal with
    // User has to be on default locale

    // Redirect All France
    if (country === "fr") {
      return NextResponse.redirect(
        new URL(`/fr-fr${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Redirect All Belgium
    if (country === "be") {
      return NextResponse.redirect(
        new URL(`/fr-be${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Redirect all Great Britain
    if (country === "gb") {
      return NextResponse.redirect(
        new URL(`/en-gb${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Redirect French-Canada
    if (country === "ca" && language === "fr") {
      return NextResponse.redirect(
        new URL(`/fr-ca${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Redirect all other Canadian requests
    if (country === "ca") {
      return NextResponse.redirect(
        new URL(`/en-ca${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Handle French language fallback
    if (language === "fr") {
      return NextResponse.redirect(
        new URL(`/fr${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }

    // Handle the default locale fallback to english
    if (req.nextUrl.locale === "default") {
      return NextResponse.redirect(
        new URL(`/en${req.nextUrl.pathname}${req.nextUrl.search}`, req.url)
      );
    }
  } catch (error) {
    console.log(error);
  }
}
