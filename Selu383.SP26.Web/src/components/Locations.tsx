import { useState, useEffect } from "react";
import type { LocationInterface } from "../Interfaces";

function Locations() {
  const [locations, setLocations] = useState<LocationInterface[]>([]);

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => response.json() as Promise<LocationInterface[]>)
      .then((data) => setLocations(data));
  }, []);

  const copyLocationToClipboard = (loc: LocationInterface) => {
    const fullInfo = `${loc.name}\n${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}\nPhone: ${loc.phone}\nHours: ${loc.openingTime ?? "7:00am"} - ${
      loc.closingTime ?? "7:00pm"
    }\nStatus: ${loc.isActive ? "Open" : "Coming Soon"}`;
    navigator.clipboard.writeText(fullInfo);
  };

  const copyAddressToClipboard = (loc: LocationInterface) => {
    const fullAddress = `${loc.address}, ${loc.city}, ${loc.state} ${loc.zip}`;
    navigator.clipboard.writeText(fullAddress);
  };

  const copyPhoneToClipboard = (loc: LocationInterface) => {
    navigator.clipboard.writeText(loc.phone ?? "");
  };

  const copyHoursToClipboard = (loc: LocationInterface) => {
    const hours = `${loc.openingTime ?? "7:00am"} - ${
      loc.closingTime ?? "7:00pm"
    }`;
    navigator.clipboard.writeText(hours);
  };

  return (
    <div>
      <h1>Locations</h1>
      <div className="location-grid">
        {locations.map((loc) => (
          <div key={loc.id} className="card">
            <div className="location-card-container">
              <h2>{loc.name}</h2>
              <button
                className="copy-button"
                onClick={() => copyLocationToClipboard(loc)}
                title="Copy Location Info"
              >
                {clipBoardSvg()}
              </button>
            </div>

            <div className="location-card-container">
              {loc.address}, {loc.city}, {loc.state} {loc.zip}
              <button
                className="copy-button"
                onClick={() => copyAddressToClipboard(loc)}
                title="Copy Address"
              >
                {clipBoardSvg()}
              </button>
            </div>
            <div className="location-card-container">
              <span>
                <u>Phone</u>: {loc.phone}
              </span>
              <button
                className="copy-button"
                onClick={() => copyPhoneToClipboard(loc)}
                title="Copy Phone Number"
              >
                {clipBoardSvg()}
              </button>
            </div>
            <div className="location-card-container">
              <span>
                <u>Hours</u>: {loc.openingTime ?? "7:00am"} -{" "}
                {loc.closingTime ?? "7:00pm"}
              </span>
              <button
                className="copy-button"
                onClick={() => copyHoursToClipboard(loc)}
                title="Copy Hours"
              >
                {clipBoardSvg()}
              </button>
            </div>
            {loc.isActive ? <p>Status: Open</p> : <p>Status: Coming Soon</p>}
          </div>
        ))}
      </div>
    </div>
  );

  function clipBoardSvg() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    );
  }
}

export default Locations;
