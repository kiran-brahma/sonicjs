import { defineMiddleware } from "astro:middleware";
import {
  validateSessionToken,
  createSession,
  invalidateSession,
} from "@services/sessions";
import { sequence } from "astro:middleware";

async function cache(context, next) {
	console.log("cache middleware");

	const { request } = context;
    const { url } = request;

    const cache = context.locals.runtime.caches.default;

    const cacheResponse = await cache.match(url);
    if (cacheResponse) {
        console.log("---> Cache hit");
        return cacheResponse;
    }

    const response = await next();

    response.headers.set("cache-control", "public, max-age=60");
    response.headers.set("content-type", "application/json");

    await cache.put(url, new Response(response.body, response));

    return response;
		// return next();

}

async function auth(context, next) {
  // const config = initializeConfig(
  // 	context.locals.runtime.env.D1,
  // 	context.locals.runtime.env
  //   );
  //   context.locals.auth = new Auth(config);

  // Get session token from cookie
  const sessionId = context.cookies.get("session")?.value;

  // Check if we're already on the login or register page
  const isAuthPage = context.url.pathname.match(/^\/admin\/(login|register)/);

  try {
    if (sessionId) {
      // Validate the session
      const { user } = await validateSessionToken(
        context.locals.runtime.env.D1,
        sessionId
      );
      //   const { user } = await context.locals.auth.validateSession(sessionId);
      if (user) {
        context.locals.user = user;

        // If user is logged in and tries to access login/register, redirect to admin
        if (isAuthPage) {
          return context.redirect("/admin");
        }

        return next();
      }
    }

    // Don't redirect if already on auth pages
    if (isAuthPage) {
      return next();
    }

    // If no valid session and trying to access protected routes, redirect to login
    if (context.url.pathname.startsWith("/admin")) {
      return context.redirect("/admin/login");
    }
  } catch (error) {
    // Handle session validation errors (expired, invalid, etc)
    console.error("Session validation error:", error);

    // Clear invalid session cookie
    context.cookies.delete("session", { path: "/" });

    // Don't redirect if already on auth pages
    if (isAuthPage) {
      return next();
    }

    // Redirect to login for protected routes
    if (context.url.pathname.startsWith("/admin")) {
      return context.redirect("/admin/login");
    }
  }

  return next();
}

export const onRequest = sequence(cache, auth);
