"use client";
import Link from "next/link";
import React, { useState } from "react";

const URLShortenerForm = () => {
  const [url, setUrl] = useState("");
  const [generated, setGenerated] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const closeGeneratedUrl = () => {
    setGenerated(false);
  };

  const handleGenerateUrl = async () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url }),
      };

      const response = await fetch("/api/generate", requestOptions);

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.message || "Failed to generate URL.";
        throw new Error(message);
      }

      const result = await response.json();
      const shortUrl = result.shorturl;

      setGenerated(`${process.env.NEXT_PUBLIC_HOST}/${shortUrl}`);
      setUrl("");
      setIsCopied(false);
    } catch (error) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generated).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
          required={true}
        />
        <button
          onClick={handleGenerateUrl}
          className="bg-purple-500 rounded-lg shadow-lg p-3 py-1 my-3 font-bold text-white transition-all hover:bg-purple-600"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
        {error && <p className="text-red-600 font-semibold">{error}</p>}
      </div>
      {generated && (
        <div className="relative mt-4 p-4 bg-white rounded-lg shadow-sm border border-purple-200 flex flex-col items-start gap-2">
          <button
            onClick={closeGeneratedUrl}
            className="absolute top-0 right-2 text-gray-600 hover:text-gray-900 transition-all text-lg"
            aria-label="Close"
          >
            &times;
          </button>
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
              className={`p-1 px-2 rounded-md font-semibold w-full sm:w-auto ${
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
