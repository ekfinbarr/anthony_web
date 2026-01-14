import React, { useEffect, useState } from "react";
import dailyReadingService, { DailyReading } from "@/services/dailyReading.service";

/**
 * CatholicDailyReadings
 *
 * Fetches and displays Catholic daily readings
 * from the JSONP source at nugae.com / Universalis.
 */
export default function CatholicDailyReadings() {
  const [data, setData] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Decision:
   * We now load daily readings from our own backend cache (`/api/daily-readings/today`)
   * instead of relying on third-party JSONP endpoints.
   */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const reading = await dailyReadingService.getToday();
        setData(reading);
      } catch (e: unknown) {
        setError(e instanceof Error ? e : new Error("Failed to load daily readings"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Loading daily readings…</p>;
  if (error) return <p>Error loading readings: {error.message}</p>;
  if (!data) return null;

  return (
    <div>
      <h2>Catholic Daily Readings</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data.payload, null, 2)}
      </pre>
    </div>
  );
}
