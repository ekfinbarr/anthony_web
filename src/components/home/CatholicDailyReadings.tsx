import React from "react";
import { useJsonp } from "@/hooks/useJsonp";

/**
 * CatholicDailyReadings
 *
 * Fetches and displays Catholic daily readings
 * from the JSONP source at nugae.com / Universalis.
 */
export default function CatholicDailyReadings() {
  /**
   * NOTE:
   * - Use a unique callback function name for each request instance.
   * - The server at Universalis (via nugae.com) must support JSONP by
   *   wrapping its JSON in a callback named the same as our callbackName.
   *
   * Example:
   *   server responds with:
   *     handleUniversalis({"Date":"…","FirstReading":{…},…});
   */
  const { data, loading, error } = useJsonp(
    "http://www.nugae.com/jsonp.html",
    "callback",              // parameter name
    "handleUniversalis"      // callback function name
  );

  if (loading) return <p>Loading daily readings…</p>;
  if (error) return <p>Error loading readings: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Catholic Daily Readings</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
