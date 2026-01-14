import React, { useEffect, useState } from 'react';

const JsonpComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchJsonpData = (url: string) => {
      if (url) {
        fetch(url)
          .then(response => response.json())
          .then(data => setData(data))
          .catch(error => console.error('Error fetching JSONP data:', error));
      } else {
        console.error('No URL provided');
      }
    };

    fetchJsonpData('https://www.nugae.com/jsonp.html'); // Replace with the actual JSONP URL
  }, []);

  useEffect(() => {
    // Debug helper: log whenever data changes
    if (data) console.log('DATA:', data);
  }, [data]);

  return (
    <div>
      <h1>JSONP Data</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default JsonpComponent;
