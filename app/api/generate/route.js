import clientPromise from "@/lib/mongodb";

// Helper function to generate a unique short URL
const generateUniqueShortUrl = async (collection) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shorturl;

  // Keep generating until a unique one is found
  while (true) {
    shorturl = Array.from({ length: 6 })
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .join("");

    // Check if this shorturl already exists in the database
    const existing = await collection.findOne({ shorturl });
    if (!existing) break; // Exit loop if unique
  }

  return shorturl;
};

// Main handler function for POST request
export async function POST(request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    if (!body.url || !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(body.url)) {
      return Response.json({
        success: false,
        error: true,
        message: "Invalid URL provided.",
      });
    }

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    // Generate or use provided short URL
    let { shorturl } = body;
    if (shorturl) {
      // Check if the provided short URL already exists
      const existing = await collection.findOne({ shorturl });
      if (existing) {
        return Response.json({
          success: false,
          error: true,
          message:
            "Short URL already exists. Please choose another one or leave it blank for auto-generation.",
        });
      }
    } else {
      // Auto-generate a unique short URL if none is provided
      shorturl = await generateUniqueShortUrl(collection);
    }

    // Insert the new URL and its short URL into the database
    await collection.insertOne({
      url: body.url,
      shorturl: shorturl,
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      error: false,
      message: "URL generated successfully",
      shorturl,
    });
  } catch (error) {
    console.error("Error generating short URL:", error);
    return Response.json({
      success: false,
      error: true,
      message: "An error occurred while processing your request.",
    });
  }
}
