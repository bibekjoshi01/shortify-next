"use client";
import Link from "next/link";
import React, { useState } from "react";

const URLShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const generate = () => {
    setError(""); // Reset error on new generate attempt
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      url: url,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("/api/generate", requestOptions)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to generate URL");
        return response.json();
      })
      .then((result) => {
        const shortUrl = result.shorturl; // Assume API returns 'shorturl'
        setGenerated(`${process.env.NEXT_PUBLIC_HOST}/${shortUrl}`);
        setUrl("");
        setIsCopied(false);
      })
      .catch((error) => {
        setError("Error generating short URL. Please try again.");
        console.error(error);
      });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
    });
  };

  return (
    <div className="mx-auto max-w-lg bg-purple-100 my-16 p-8 rounded-lg flex flex-col gap-4">
      <h1 className="font-bold text-2xl text-center text-purple-700">
        Generate your short URLs
      </h1>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={url}
          className="px-4 py-2 focus:outline-purple-600 rounded-md border-2 border-purple-300"
          placeholder="Enter your URL"
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={generate}
          className="bg-purple-500 rounded-lg shadow-lg p-3 py-1 my-3 font-bold text-white transition-all hover:bg-purple-600"
          disabled={!url}
        >
          Generate
        </button>
        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </div>
      {generated && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-purple-200 flex flex-col items-start gap-2">
          <span className="font-semibold text-lg text-purple-700">
            Your Shortened URL
          </span>
          <div className="flex items-center gap-2">
            <code className="text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
              <Link target="_blank" href={generated}>
                {generated}
              </Link>
            </code>
            <button
              onClick={copyToClipboard}
              className={`p-1 px-2 rounded-md font-semibold ${
                isCopied
                  ? "bg-green-200 text-green-700"
                  : "bg-gray-200 text-gray-700"
              } transition-all`}
            >
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default URLShortenerForm;
