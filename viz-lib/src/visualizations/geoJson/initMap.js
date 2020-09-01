import { isFunction, each, map, toString, clone } from "lodash";
import chroma from "chroma-js";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "beautifymarker";
import "beautifymarker/leaflet-beautify-marker-icon.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import { formatSimpleTemplate } from "@/lib/value-format";
import sanitize from "@/services/sanitize";
import resizeObserver from "@/services/resizeObserver";
import chooseTextColorForBackground from "@/lib/chooseTextColorForBackground";

// This is a workaround for an issue with giving Leaflet load the icon on its own.
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
});

delete L.Icon.Default.prototype._getIconUrl;

function createGeoJsonLayer(options, { color, rows }) {
  const { classify } = options;

  const result = L.featureGroup();

  var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
  };

  each(rows, (row) => {

  // json array'ify string for features
  var geoJsonData = row
  //geoJsonData.features = JSON.parse(row.features);

  var geoJsonLayer = L.geoJSON(JSON.parse(row.features), { });

  result.addLayer(geoJsonLayer);

  });

  return result;
}

export default function initMap(container) {
  const _map = L.map(container, {
    center: [0.0, 0.0],
    zoom: 1,
    scrollWheelZoom: false,
    fullscreenControl: true,
  });
  const _tileLayer = L.tileLayer("//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(_map);
  const _markerLayers = L.featureGroup().addTo(_map);
  const _layersControls = L.control.layers().addTo(_map);

  let onBoundsChange = () => {};

  let boundsChangedFromMap = false;
  const onMapMoveEnd = () => {
    onBoundsChange(_map.getBounds());
  };
  _map.on("focus", () => {
    boundsChangedFromMap = true;
    _map.on("moveend", onMapMoveEnd);
  });
  _map.on("blur", () => {
    _map.off("moveend", onMapMoveEnd);
    boundsChangedFromMap = false;
  });

  function updateLayers(groups, options) {

    _tileLayer.setUrl(options.mapTileUrl);

    _markerLayers.eachLayer(layer => {
      _markerLayers.removeLayer(layer);
      _layersControls.removeLayer(layer);
    });

    each(groups, group => {
      const layer = createGeoJsonLayer(options, group);
      _markerLayers.addLayer(layer);
      _layersControls.addOverlay(layer, group.name);
    });

    // hide layers control if it is empty
    if (groups.length > 0) {
      _layersControls.addTo(_map);
    } else {
      _layersControls.remove();
    }
  }

  function updateBounds(bounds) {
    if (!boundsChangedFromMap) {
      bounds = bounds
        ? L.latLngBounds([bounds._southWest.lat, bounds._southWest.lng], [bounds._northEast.lat, bounds._northEast.lng])
        : _markerLayers.getBounds();
      if (bounds.isValid()) {
        _map.fitBounds(bounds, { animate: false, duration: 0 });
      }
    }
  }

  const unwatchResize = resizeObserver(container, () => {
    _map.invalidateSize(false);
  });

  return {
    get onBoundsChange() {
      return onBoundsChange;
    },
    set onBoundsChange(value) {
      onBoundsChange = isFunction(value) ? value : () => {};
    },
    updateLayers,
    updateBounds,
    destroy() {
      unwatchResize();
      _map.remove();
    },
  };
}
