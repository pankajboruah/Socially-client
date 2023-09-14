/* eslint-disable */

const constants = (key) => process.env[`REACT_APP_${key}`];

const AREA_CONVERSION_FACTOR = 0.0002471054;

const libraries = ["places", "geometry", "visualization", "drawing"];

const MapTypesID = ["satellite", "roadmap", "hybrid", "terrain"];

const hostName =
	window.location.hostname === "localhost"
		? "http://localhost:4000"
		: `http://${window.location.hostname}`;

const isLocalEnv = constants("env") === "local";

const center = {
	lat: 17.1623717,
	lng: 79.9196817,
};

export {
	AREA_CONVERSION_FACTOR,
	constants,
	libraries,
	MapTypesID,
	hostName,
	isLocalEnv,
	center,
};
