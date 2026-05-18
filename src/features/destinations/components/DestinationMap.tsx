'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons (leaflet webpack issue)
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

const markerIcon = L.icon({ iconUrl, iconRetinaUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] })

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
    <div className="rounded-2xl overflow-hidden border border-brand-steel/10" style={{ height: 300 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>
            <strong>{name}</strong><br />{country}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
