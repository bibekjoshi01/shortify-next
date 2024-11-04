import clientPromise from "@/lib/mongodb";

const generateUniqueShortUrl = async (collection) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shorturl;

  // Keep generating until a unique one is found
  while (true) {
    shorturl = Array.from({ length: 6 })
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join("");

    const existing = await collection.findOne({ shorturl });
    if (!existing) break; // Exit loop if unique
  }

  return shorturl;
};

// Validation function
const validateRequestBody = (body) => {
  if (!body.url || !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(body.url)) {
    return {
      success: false,
      error: true,
      message:
        "Invalid URL provided. Please ensure it is a valid HTTP/HTTPS URL.",
    };
  }
  return null;
};

// Main handler function for POST request
export async function POST(request) {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Method Not Allowed",
        }),
        { status: 405 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validationError = validateRequestBody(body);
    if (validationError) {
      return new Response(JSON.stringify(validationError), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    // Check if the URL already exists in the database
    const existingUrl = await collection.findOne({ url: body.url });
    if (existingUrl) {
      return new Response(
        JSON.stringify({
          success: true,
          error: false,
          message: "URL already exists",
          shorturl: existingUrl.shorturl, 
        }),
        { status: 200 }
      );
    }

    // Generate a unique short URL
    const shorturl = await generateUniqueShortUrl(collection);

    // Insert the new URL and its short URL into the database
    await collection.insertOne({
      url: body.url,
      shorturl: shorturl,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        message: "URL generated successfully",
        shorturl,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating short URL:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: true,
        message: "An error occurred while processing your request. Try Again!",
      }),
      { status: 500 }
    );
  }
}
