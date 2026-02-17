import './style.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

const protocol = new Protocol({ metadata: true });

maplibregl.addProtocol('mapterhorn', async (params, abortController) => {
    const [z, x, y] = params.url.replace('mapterhorn://', '').split('/').map(Number);
    const name = z <= 12 ? 'planet' : `6-${x >> (z - 6)}-${y >> (z - 6)}`;
    const url = `pmtiles://https://download.mapterhorn.com/${name}.pmtiles/${z}/${x}/${y}.webp`;
    const response = await protocol.tile({ ...params, url }, abortController);
    if (response['data'] === null) throw new Error(`Tile z=${z} x=${x} y=${y} not found.`);
    return response;
});

const map = new maplibregl.Map({
    container: 'map',
    hash: 'map',
    style: {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            terrainSource: {
                type: 'raster-dem',
                tiles: ['mapterhorn://{z}/{x}/{y}'],
                encoding: 'terrarium',
                tileSize: 512,
                attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>'
            },
            hillshadeSource: {
                type: 'raster-dem',
                tiles: ['mapterhorn://{z}/{x}/{y}'],
                encoding: 'terrarium',
                tileSize: 512
            }
        },
        terrain: {
            source: 'terrainSource',
            exaggeration: 1.5
        },
        layers: [
            {
                id: 'basemap',
                type: 'raster',
                source: 'osm'
            },
            {
                id: 'hillshade',
                type: 'hillshade',
                source: 'hillshadeSource',
                paint: {
                    'hillshade-shadow-color': '#473B24',
                    'hillshade-illumination-anchor': 'map',
                    'hillshade-exaggeration': 0.5
                }
            }
        ]
    },
    center: [90.5, 28.5],
    zoom: 6,
    pitch: 60,
    bearing: -20
});

map.addControl(
    new maplibregl.NavigationControl({
        visualizePitch: true
    })
);

map.on('load', () => {
    // Add GeoJSON sources
    map.addSource('border_arunachal_bhutan', {
        type: 'geojson',
        data: '/border_villages_ArunachalBhutan.geojson'
    });
    map.addSource('border_others', {
        type: 'geojson',
        data: '/border_villages_others.geojson'
    });
    map.addSource('inside_arunachal', {
        type: 'geojson',
        data: '/inside_Arunachal.geojson'
    });
    map.addSource('inside_bhutan', {
        type: 'geojson',
        data: '/inside_bhutan.geojson'
    });

    // Add layers with different colors
    map.addLayer({
        id: 'border_arunachal_bhutan_layer',
        type: 'circle',
        source: 'border_arunachal_bhutan',
        paint: {
            'circle-radius': 6,
            'circle-color': '#e74c3c',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    map.addLayer({
        id: 'border_others_layer',
        type: 'circle',
        source: 'border_others',
        paint: {
            'circle-radius': 6,
            'circle-color': '#f39c12',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    map.addLayer({
        id: 'inside_arunachal_layer',
        type: 'circle',
        source: 'inside_arunachal',
        paint: {
            'circle-radius': 6,
            'circle-color': '#3498db',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    map.addLayer({
        id: 'inside_bhutan_layer',
        type: 'circle',
        source: 'inside_bhutan',
        paint: {
            'circle-radius': 6,
            'circle-color': '#2ecc71',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });
});
