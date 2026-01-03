export async function onRequestGet({ params }) {
  const id = params.id;

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>Article ${id}</title>
      </head>
      <body>
        <h1>Article ID: ${id}</h1>
        <p>If you see this, Pages Functions are working 🎉</p>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
