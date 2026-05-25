'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const svgMarker = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
  <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 14 26 16 26s16-15.5 16-26C32 7.163 24.837 0 16 0z" fill="#622347"/>
  <circle cx="16" cy="16" r="7" fill="#fff" opacity="0.95"/>
  <circle cx="16" cy="16" r="4" fill="#622347"/>
</svg>
`

const markerIcon = L.divIcon({
  html: svgMarker,
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
})

interface Props {
  name: string
  country: string
  latitude?: number | null
  longitude?: number | null
}

export function DestinationMap({ name, country, latitude, longitude }: Props) {
  const lat = latitude ?? null
  const lng = longitude ?? null

  if (!lat || !lng) return null

  return (
    <div className="rounded-2xl overflow-hidden border border-brand-steel/10 shadow-lg" style={{ height: 380 }}>
      <MapContainer
        center={[Number(lat), Number(lng)]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <Marker position={[Number(lat), Number(lng)]} icon={markerIcon}>
          <Popup className="leaflet-popup-dark">
            <div style={{ fontFamily: 'inherit', minWidth: 120 }}>
              <p style={{ fontWeight: 700, margin: '0 0 2px', fontSize: 14, color: '#fff' }}>{name}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>{country}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
