import React, { useState, useRef, useCallback, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { useLocation, useHistory } from "react-router-dom";

import { GoogleMap, useLoadScript } from "@react-google-maps/api";

import TileUnit from "../TileUnit";
import Loader from "../../../../sharedComponents/Loader";

import {
	constants,
	libraries,
	center,
	MapTypesID,
} from "../../../../../utils/constants";
import debounce from "../../../../../utils/debounce";
import { latLngConversion } from "../../../../../utils/helpers";
import { ALL_LAYERS } from "../../constants";

const dataLayers = [
	"FARMS-USER_FARM-VILLAGE_FARM",
	"FARMS-INSIDE_BUND_SRC-DSR_PROGRAM_TYPE",
	"FARMS-INSIDE_BUND_SRC-CRM_PROGRAM_TYPE",
	"FARMS-INSIDE_BUND_SRC-AWD_PROGRAM_TYPE",
	"FARMS-PIPE_INSTALLATION_SRC-AWD_PROGRAM_TYPE",
];

const mapOptions = {
	disableDefaultUI: false,
	zoomControl: true,
	rotateControl: true,
	streetViewControl: false,
	fullscreenControl: false,
	keyboardShortcuts: false,
	mapTypeControl: false,
	disableDoubleClickZoom: true,
	mapTypeId: "hybrid",
	mapTypeIds: [...MapTypesID],
	maxZoom: 19,
	minZoom: 15,
};

const GoogleMapView = ({ updateGoogleRef }) => {
	const mapsRef = useRef(null);
	const centerRef = useRef({ ...center });
	const tilesPlaceIdsRef = useRef({});

	const { search } = useLocation();
	const history = useHistory();

	const lat = ["", null].includes(search.get("lat"))
		? center.lat
		: Number(search.get("lat"));
	const lng = ["", null].includes(search.get("lng"))
		? center.lng
		: Number(search.get("lng"));

	const [zoom, setZoom] = useState(19);

	const { isLoaded } = useLoadScript({
		googleMapsApiKey: `${constants("GOOGLE_MAPS_API_KEY")}`,
		libraries: libraries,
	});

	const handleZoomChange = useCallback(() => {
		if (mapsRef.current === null) return;
		const currentZoom = mapsRef.current?.getZoom();
		setZoom(currentZoom);
	}, []);

	const updateUrlParams = useCallback(
		(params) => {
			search.set("lat", params.lat);
			search.set("lng", params.lng);
			// if (params.farmId !== undefined) {
			// 	search.set('farmId', params.farmId);
			// }
			// if (params.eventId !== undefined) {
			// 	search.set('eventId', params.eventId);
			// }
			// if (params.contentId !== undefined) {
			// 	search.set('contentId', params.contentId);
			// }
			// if (params.seasonId !== undefined) {
			// 	search.set('seasonId', params.seasonId);
			// }
			history.replace({ search: search.toString() });
		},
		[history, search]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const updateCenterRef = useCallback(
		debounce(() => {
			if (mapsRef && centerRef && mapsRef.current && centerRef.current) {
				const newCenter = mapsRef.current.getCenter();
				const newLat = newCenter.lat();
				const newLng = newCenter.lng();
				centerRef.current.lat = newLat;
				centerRef.current.lng = newLng;
				let newParams = { lat: newLat, lng: newLng };
				// if (!['', null].includes(farmId)) newParams.farmId = farmId;
				// if (!['', null].includes(eventId)) newParams.eventId = eventId;
				// if (!['', null].includes(contentId))
				// 	newParams.contentId = contentId;
				// if (!['', null].includes(seasonId))
				// 	newParams.seasonId = seasonId;
				updateUrlParams(newParams);
			}
		}, 1000),
		[]
	);

	// TODO: function to clear tile data from state when tile unmounts
	const pruneTilesData = useCallback((tile, selectedLayer) => {}, []);

	const checkForDuplicateKeysAndUpdatePayload = useCallback(
		(payload, placeData, coord, selectedLayer) => {
			// if (
			// 	polygonPlaceIdsOfFarmIdRef.current.has(placeData.placeId) ||
			// 	pointPlaceIdsOfFarmIdRef.current.has(placeData.placeId)
			// ) {
			// 	return;
			// }
			const { type, geometry } = latLngConversion(placeData.geometry);
			const key = `${placeData.placeId}-${selectedLayer.PlaceNamespace}-${selectedLayer.PlaceSourceType}-${selectedLayer.PlaceVisibleType}`;
			let temp;
			if (payload[key]) {
				temp = {
					...payload[key],
					parentTiles: new Set(payload[key].parentTiles),
				};
			} else {
				temp = {
					placeId: placeData.placeId,
					selectedLayer,
					placeGeometryResult: {
						geometryType: type,
						geometry: geometry,
					},
					placeTags: placeData.tags,
					parentTiles: new Set(),
				};
			}
			temp.parentTiles?.add(`${coord.x}-${coord.y}`);
			payload[key] = temp;
		},
		[]
	);

	const updateMapTilesData = useCallback(
		(mapResults, selectedLayer, coord) => {
			let placesResult = mapResults[0]?.places;
			if (placesResult === undefined || placesResult?.length < 1) return;

			const layerKey = `${selectedLayer.PlaceNamespace}-${selectedLayer.PlaceSourceType}-${selectedLayer.PlaceVisibleType}`;
			let payload = {};

			tilesPlaceIdsRef.current[`${coord.x}-${coord.y}`] = new Set();

			placesResult.forEach((placeData) => {
				const key = `${placeData.placeId}-${selectedLayer.PlaceNamespace}-${selectedLayer.PlaceSourceType}-${selectedLayer.PlaceVisibleType}`;
				tilesPlaceIdsRef.current[`${coord.x}-${coord.y}`].add(key);
				checkForDuplicateKeysAndUpdatePayload(
					payload,
					placeData,
					coord,
					selectedLayer
				);
			});

			// if (suggestionLayers.includes(layerKey)) {
			// 	suggestionGeometriesRef.current = {
			// 		...suggestionGeometriesRef.current,
			// 		...payload,
			// 	};
			// 	return;
			// }

			// deriveSelectedLayerGeometryType(selectedLayer) === "POINT"
			// 	? dispatch(setPointMapTiles(payload))
			// 	: dispatch(setPolygonMapTiles(payload));
		},
		[checkForDuplicateKeysAndUpdatePayload]
	);

	const onTileLoadCallCompleted = useCallback(
		(data, selectedLayer, coord) => {
			const mapResults = data?.getPlacesByTiles?.tileResponse;
			if (mapResults?.length) {
				updateMapTilesData(mapResults, selectedLayer, coord);
			}
		},
		[updateMapTilesData]
	);

	const onLoad = useCallback(
		(mapInstance) => {
			mapsRef.current = mapInstance;
			[...dataLayers].forEach((layer) => {
				mapsRef.current?.overlayMapTypes?.push(
					new CoordMapType(
						onTileLoadCallCompleted,
						pruneTilesData,
						ALL_LAYERS[layer],
						new google.maps.Size(256, 256)
					)
				);
			});
		},
		[onTileLoadCallCompleted, pruneTilesData]
	);

	// const resetAndReinitializeOnSeasonUpdate = () => {
	// 	// refetch();
	// 	if (
	// 		mapsRef.current !== null &&
	// 		mapsRef.current.overlayMapTypes?.length > 0
	// 	) {
	// 		mapsRef.current.overlayMapTypes.clear();
	// 		[...dataLayers].forEach((layer) => {
	// 			mapsRef.current.overlayMapTypes
	// 				?.push
	// 				// new CoordMapType(
	// 				// 	onTileLoadCallCompleted,
	// 				// 	pruneTilesData,
	// 				// 	ALL_LAYERS[layer],
	// 				// 	new google.maps.Size(256, 256)
	// 				// )
	// 				();
	// 		});
	// 		mapsRef.current.overlayMapTypes.clear();
	// 	}
	// };

	useEffect(() => {
		if (isLoaded) {
			updateGoogleRef(google.maps);
		}
	}, [isLoaded, updateGoogleRef]);

	useEffect(() => {
		tilesPlaceIdsRef.current = {};
	}, [zoom]);

	// useEffect(() => {
	// 	resetAndReinitializeOnSeasonUpdate();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [seasonId]);

	return (
		<div style={{ width: "100%", height: "100%" }}>
			{!isLoaded ? (
				<Loader loading />
			) : (
				<>
					<GoogleMap
						id="map"
						mapContainerStyle={{
							height: "100%",
							width: "100%",
						}}
						zoom={zoom || 19}
						center={centerRef.current}
						options={mapOptions}
						// onClick={
						// 	polygonDrawingStage === 'PRE_START'
						// 		? undefined
						// 		: handleClick
						// }
						// onDblClick={
						// 	polygonDrawingStage === 'PRE_START'
						// 		? undefined
						// 		: handleDblClick
						// }
						onLoad={onLoad}
						mapTypeId={google.maps.MapTypeId.HYBRID}
						onZoomChanged={handleZoomChange}
						onCenterChanged={updateCenterRef}
					>
						{/* <DrawingContainer /> */}
						{/* TODO: move Polygon and Marker inside another component to minimize states on GoogleMapView */}
						{/* TODO: pass this as children from parent */}
						{/* {Object.values(polygonMapTiles)?.length > 0 &&
					Object.values(polygonMapTiles).map(
						(polygonData: PolygonData, idx: number) => (
							<PolygonUnit
								borderStoke="#FADDFF"
								colorIndex={idx}
								fillColor=""
								isCursorOverPoint={isCursorOverPoint}
								key={`${polygonData.placeId}-${polygonData.selectedLayer?.PlaceNamespace}-${polygonData.selectedLayer?.PlaceSourceType}-${polygonData.selectedLayer?.PlaceVisibleType}`}
								paths={
									polygonData?.placeGeometryResult
										?.geometry
								}
								placeId={polygonData.placeId}
								polygonIndex={idx}
								polygonMetaData={polygonData?.placeTags}
							/>
						),
					)}
				{Object.values(pointMapTiles)?.length > 0 &&
					Object.values(pointMapTiles).map(
						(pointData: PointData, index: number) => (
							<MarkerUnit
								approvalStatus={
									pointsOfFarmId?.[
										`${pointData.placeId}-${pointData.selectedLayer?.PlaceNamespace}-${pointData.selectedLayer?.PlaceSourceType}-${pointData.selectedLayer?.PlaceVisibleType}`
									]?.imageApprovalStatus
								}
								isInteractive
								key={`${pointData.placeId}-${pointData.selectedLayer?.PlaceNamespace}-${pointData.selectedLayer?.PlaceSourceType}-${pointData.selectedLayer?.PlaceVisibleType}`}
								markerMetaData={pointData?.placeTags}
								markerIndex={index}
								markerType="SECONDARY"
								placeId={pointData.placeId}
								position={
									pointData?.placeGeometryResult
										?.geometry
								}
								selectedLayer={pointData.selectedLayer}
								updateIsCursorOverPoint={
									updateIsCursorOverPoint
								}
								zoom={zoom}
							/>
						),
					)}
				{Object.values(pointsOfFarmId)?.length > 0 &&
					Object.values(pointsOfFarmId).map(
						(pointData: PointMetaData, index: number) => (
							<MarkerUnit
								approvalStatus={
									pointData.imageApprovalStatus
								}
								isInteractive
								key={`${pointData.placeId}-${pointData.selectedLayer.PlaceNamespace}-${pointData.selectedLayer.PlaceSourceType}-${pointData.selectedLayer.PlaceVisibleType}`}
								markerIndex={index}
								placeId={pointData.placeId}
								position={pointData.geometry}
								selectedLayer={pointData.selectedLayer}
								zoom={zoom}
							/>
						),
					)} */}
					</GoogleMap>
					{/* <AlertModal
				heading="Farm Data unavailable"
				subHeading="The Farm you are trying to access is either INACTIVE or DELETED. Please try again!"
				buttons={[
					{
						buttonText: 'Ok, close tab',
						onClick: () => {
							setIsDeletedFarmAlertVisible(false);
							closeCurrentBrowserTab();
						},
						type: 'contained',
					},
				]}
				open={isDeletedFarmAlertVisible}
				handleClose={() => {
					setIsDeletedFarmAlertVisible(false);
				}}
			/> */}
				</>
			)}
		</div>
	);
};

export default GoogleMapView;

class CoordMapType {
	onTileLoadCallCompleted;
	pruneTilesData;
	selectedLayer;
	tileSize;
	constructor(
		onTileLoadCallCompleted,
		pruneTilesData,
		selectedLayer,
		tileSize
	) {
		this.tileSize = tileSize;
		this.selectedLayer = selectedLayer;
		this.onTileLoadCallCompleted = onTileLoadCallCompleted;
		this.pruneTilesData = pruneTilesData;
	}

	getTile(coord, zoom, ownerDocument) {
		const div = ownerDocument.createElement("div");
		ReactDOM.render(
			// <ApolloProvider client={client}>
			// 	<Provider store={store}>
			// 		<TileUnit
			// 			coord={coord}
			// 			getVariables={this.getVariables}
			// 			height={this.tileSize.height}
			// 			onLoadCall={GET_PLACES_BY_TILES}
			// 			onLoadCallCompleted={this.onTileLoadCallCompleted}
			// 			pruneTilesData={this.pruneTilesData}
			// 			selectedLayer={this.selectedLayer}
			// 			width={this.tileSize.width}
			// 			zoom={zoom}
			// 		/>
			// 	</Provider>
			// </ApolloProvider>,
			<TileUnit
				coord={coord}
				getVariables={this.getVariables}
				height={this.tileSize.height}
				onLoadCall={""}
				onLoadCallCompleted={this.onTileLoadCallCompleted}
				pruneTilesData={this.pruneTilesData}
				selectedLayer={this.selectedLayer}
				width={this.tileSize.width}
				zoom={zoom}
			/>,
			div
		);
		return div;
	}

	releaseTile(tile) {
		ReactDOM.unmountComponentAtNode(tile);
	}
}
