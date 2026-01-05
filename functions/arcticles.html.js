export async function onRequest() {
  return new Response("REDIRECT FUNCTION HIT", { status: 200 });
}
