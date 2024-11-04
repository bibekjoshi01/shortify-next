"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page({ params }) {
  const router = useRouter();

  useEffect(() => {
    const fetchRedirect = async () => {
      const { shorturl } = await params;
      try {
        const response = await fetch(`/api/redirect-url?shorturl=${shorturl}`);
        if (response.ok) {
          const data = await response.json();
          window.location.href = data.url;
        } else {
          const data = await response.json();
          console.error(data.message);
          router.push("/404");
        }
      } catch (error) {
        console.error("Error fetching redirect:", error);
        router.push("/404");
      }
    };

    fetchRedirect();
  }, [router, params]);

  return <div>Redirecting...</div>;
}
