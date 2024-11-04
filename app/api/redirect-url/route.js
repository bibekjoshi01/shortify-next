import clientPromise from "@/lib/mongodb";

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    const url = new URL(request.url);

    // Extract the shorturl from the query parameters
    const shorturl = url.searchParams.get("shorturl");

    const doc = await collection.findOne({ shorturl });

    if (doc) {
      return new Response(
        JSON.stringify({
          success: true,
          error: false,
          url: doc?.url,
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "URL not found",
        }),
        { status: 404 }
      );
    }
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
