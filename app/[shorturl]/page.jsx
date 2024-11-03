import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";

export default async function Page({ params }) {
  try {
    const shorturl = params.shorturl;

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    // Attempt to find the URL document in the database
    const doc = await collection.findOne({ shorturl });

    if (doc) {
      // If found, redirect to the original URL
      redirect(doc.url);
    } else {
      // If not found, redirect to a 404 page or homepage
      redirect(`${process.env.NEXT_PUBLIC_HOST}/404`);
    }
  } catch (error) {
    console.error("Error fetching or redirecting:", error);

    // If an error occurs, redirect to the homepage or show a fallback
    redirect(`${process.env.NEXT_PUBLIC_HOST}`);
  }

  // Fallback content in case redirect fails
  return <div>Redirecting...</div>;
}
