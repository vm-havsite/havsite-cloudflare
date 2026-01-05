export async function onRequest(context) {
  return Response.redirect(
    new URL("/articles/articles", context.request.url),
    301
  );
}
