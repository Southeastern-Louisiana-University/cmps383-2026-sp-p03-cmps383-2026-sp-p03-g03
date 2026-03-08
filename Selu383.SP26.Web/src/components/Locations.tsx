import { useState, useEffect } from 'react';
import type { LocationInterface } from '../Interfaces';

function Locations() {
  const [locations, setLocations] = useState<LocationInterface[]>([]);

  useEffect(() => {
    fetch('/api/locations')
      .then(response => response.json() as Promise<LocationInterface[]>)
      .then((data) => setLocations(data));
  }, []);

  return (
    <div>
      <h1>Locations</h1>
      {locations.map(loc => (
        <div key={loc.id}>
          <h2>{loc.name}</h2>
          <p>{loc.address}</p>
          <p>Tables: {loc.tableCount}</p>
        </div>
      ))}
    </div>
  );
}

export default Locations;