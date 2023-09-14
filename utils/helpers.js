/* eslint-disable */
import wkx from 'wkx';
import buffer from 'buffer';
import { hostName } from './constants';
import {
	tabOrPhoneRegex,
	tabRegex,
	chromeOsRegex,
	androidRegex,
	ipadRegex,
	iphoneRegex,
} from './regex';

// import { ApolloClient } from 'apollo-client';
// import { InMemoryCache } from 'apollo-cache-inmemory';

export const geoJSONConversion = (data, type) => {
	let obj = {};
	if (data?.length > 0) {
		obj = {
			type: type,
			coordinates: [],
		};
		let coordinates = [];
		data?.forEach((element) => {
			let latlng = [element?.lng, element?.lat];
			coordinates.push(latlng);
		});
		if (coordinates?.length > 0) {
			obj.coordinates = [coordinates];
		}
	}
	return obj;
};

export const getUgdnFromLocalStorage = () => {
	let oktaString = localStorage.getItem('okta-token-storage');
	if (oktaString != null && typeof oktaString === 'string') {
		let oktaJson = JSON.parse(oktaString);
		let subString = oktaJson.accessToken.claims.sub;
		let index = subString.indexOf('@');
		let ugdnSubString = oktaJson.accessToken.claims.sub.slice(0, index);

		let ugdnLS = Number(ugdnSubString);
		if (isNaN(ugdnLS) || ugdnLS === null) {
			ugdnLS = 30012784;
		}
		return ugdnLS;
	}
};

export const getUIClient = () => {
	let userAgent = navigator.userAgent || navigator.vendor || window.opera;
	let uiClientType = 'DESKTOP_WEB_UI_CLIENT';

	if (tabOrPhoneRegex.test(userAgent)) {
		if (tabRegex.test(userAgent)) {
			if (androidRegex.test(userAgent)) {
				uiClientType = 'ANDROID_TAB_WEB_UI_CLIENT';
			}
		}

		if (ipadRegex.test(userAgent)) {
			uiClientType = 'IOS_TAB_UI_CLIENT';
		}

		if (iphoneRegex.test(userAgent) && !window.MSStream) {
			uiClientType = 'IOS_WEB_UI_CLIENT';
		}
	}
	// TODO: uncomment if separate data for mac available
	//if (navigator.platform.indexOf('Mac') > -1){
	//	return 'IOS_WEB_UI_CLIENT';
	// }

	if (chromeOsRegex.test(userAgent)) {
		uiClientType = 'DESKTOP_WEB_UI_CLIENT';
	}

	if (
		navigator.platform.indexOf('Win') > -1 ||
		navigator.platform.indexOf('Mac') > -1
	) {
		uiClientType = 'DESKTOP_WEB_UI_CLIENT';
	}

	return uiClientType;
	// if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
	// 	return true
	//   }
};

export const wkbBuf2hexConversion = (bufferValue) => {
	return [...new Uint8Array(bufferValue)]
		.map((x) => x.toString(16).padStart(2, '0'))
		.join('');
};

export const convertToGeometry = (geoJSON) => {
	return wkx.Geometry.parseGeoJSON(geoJSON);
};

export const geoJsonToWKT = (geoJSON) => {
	let geometry = convertToGeometry(geoJSON);
	return geometry.toWkt();
};

export const geoJsonToWKB = (geoJSON) => {
	let geometry = convertToGeometry(geoJSON);
	return geometry.toWkb();
};

export const wkbbufferFormat = (geoJSON) => {
	let wkb = geoJsonToWKB(geoJSON);
	return new Uint8Array(wkb).buffer;
};

export const getWKBFormat = (geoJSON) => {
	let buffer = wkbbufferFormat(geoJSON);
	return wkbBuf2hexConversion(buffer);
};

export const getWKBArrayFormat = (hex) => {
	let typedArray = new Uint8Array(
		hex.match(/[\da-f]{2}/gi).map(function (h) {
			return parseInt(h, 16);
		}),
	);
	return Object.keys(typedArray).map((data) => typedArray[`${data}`]);
};

export const getWKBToGeoJSON = (hex) => {
	let wkbArray = getWKBArrayFormat(hex);
	let geometry = wkx.Geometry.parse(buffer.Buffer(wkbArray));
	return geometry?.toGeoJSON();
};

export const latLngConversion = (hex) => {
	let geoJson = getWKBToGeoJSON(hex);
	let type = geoJson?.type;
	let payload = null;

	if (type === 'Point') {
		const [lng, lat] = geoJson?.coordinates;
		payload = { lat: lat, lng: lng };
	} else if (type === 'Polygon') {
		let array = [];
		let coordinates = geoJson?.coordinates?.[0];
		if (coordinates?.length > 0) {
			coordinates?.forEach((element) => {
				let latlngObj = { lat: element?.[1], lng: element?.[0] };
				array.push(latlngObj);
			});
		}
		payload = array;
	}
	return { type, geometry: payload };
};

export const addMultipleCacheData = async (cacheList) => {
	for (var i = 0; i < cacheList.length; i++) {
		// Coverting our respons into Actual Response form
		const data = new Response(JSON.stringify(cacheList[i].cacheData));

		if ('caches' in window) {
			// Opening given cache and putting our data into it
			let cache = await caches.open(cacheList[i].cacheName);
			cache.put(cacheList[i].url, data);
		}
	}
};

export const getAllCacheData = async () => {
	let url = hostName;
	let names = await caches.keys();
	let cacheDataArray = [];
	names.forEach(async (name) => {
		const cacheStorage = await caches.open(name);
		cacheStorage
			.match(url)
			.then((res) => {
				return res.json();
			})
			.then((cachedDataRes) => {
				cacheDataArray.push(cachedDataRes);
			});
	});
	return cacheDataArray;
};

export const getCacheDataByName = async (name) => {
	let url = hostName;
	let cacheDataArray = [];
	const cacheStorage = await caches.open(name);
	cacheStorage
		.match(url)
		.then((res) => {
			return res.json();
		})
		.then(async (cachedDataRes) => {
			let result = await cachedDataRes;
			cacheDataArray = result;
		});
	return cacheDataArray;
};

export const lat2tile = (lat, zoom) => {
	if (zoom === undefined) {
		zoom = 19;
	}
	return Math.floor(
		((1 -
			Math.log(
				Math.tan((lat * Math.PI) / 180) +
					1 / Math.cos((lat * Math.PI) / 180),
			) /
				Math.PI) /
			2) *
			Math.pow(2, zoom),
	);
};

export const lng2tile = (lon, zoom) => {
	if (zoom === undefined) {
		zoom = 19;
	}
	return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
};

export const saveToLocal = (key, data) => {
	localStorage.setItem(key, JSON.stringify(data));
};

export const getFromLocal = (key) => {
	const data = localStorage.getItem(key);
	return JSON.parse(data);
};

export const removeFromLocal = (key) => {
	localStorage.removeItem(key);
};

export const closeCurrentBrowserTab = () => {
	window.opener = null;
	window.open('', '_self');
	window.close();
};
