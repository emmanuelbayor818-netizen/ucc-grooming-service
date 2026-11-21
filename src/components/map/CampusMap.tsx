"use client";

import React, { useEffect, useRef } from "react";
import { Vendor } from "@/types";
import { calculateDistanceKm, UCC_COORDINATES } from "@/lib/constants/ucc";
import { MapPin, Navigation, ExternalLink, Users, Star } from "lucide-react";

interface CampusMapProps {
  vendors: Vendor[];
  userLocation: { lat: number; lng: number } | null;
  selectedVendorId?: string | null;
  onSelectVendor?: (vendorId: string) => void;
}

export function CampusMap({
  vendors,
  userLocation,
  selectedVendorId,
  onSelectVendor,
}: CampusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically import Leaflet to avoid Next.js SSR window errors
    let isMounted = true;
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // If map is already initialized, don't re-init
      if (mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [UCC_COORDINATES.lat, UCC_COORDINATES.lng],
        zoom: 14.5,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Create custom vendor pin icons
      const createVendorIcon = (name: string, isSelected: boolean) => {
        return L.divIcon({
          className: "custom-vendor-pin",
          html: `
            <div style="
              background-color: ${isSelected ? '#1c1b18' : '#c59b27'};
              color: white;
              padding: 5px 9px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              border: 2px solid white;
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -100%);
              cursor: pointer;
            ">
              <span>✂️</span>
              <span>${name}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
      };

      // Add markers for all vendors
      vendors.forEach((v) => {
        if (!v.latitude || !v.longitude) return;

        const distance = userLocation
          ? `${calculateDistanceKm(userLocation.lat, userLocation.lng, v.latitude, v.longitude)} km from you`
          : "";

        const marker = L.marker([v.latitude, v.longitude], {
          icon: createVendorIcon(v.shopName, v.vendorId === selectedVendorId),
        }).addTo(map);

        const popupContent = `
          <div style="padding: 4px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; min-width: 200px;">
            <div style="font-size: 10px; font-weight: 700; color: #c59b27; text-transform: uppercase;">${v.area}</div>
            <div style="font-size: 14px; font-weight: 800; color: #1c1b18; margin-top: 2px;">${v.shopName}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">${v.businessAddress}</div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee; font-size: 11px;">
              <span style="font-weight: 600;">⭐ ${v.rating || 5.0} (${v.reviewCount || 0})</span>
              <span style="color: ${v.currentQueueCount && v.currentQueueCount > 2 ? '#b45309' : '#059669'}; font-weight: 600;">
                👥 ${v.currentQueueCount || 0} in queue
              </span>
            </div>

            ${distance ? `<div style="font-size: 10px; font-weight: 700; color: #2563eb; margin-top: 4px;">📍 ${distance}</div>` : ""}

            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <a href="/vendor/${v.vendorId}" style="
                flex: 1;
                background: #1c1b18;
                color: white;
                text-align: center;
                padding: 6px 10px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
                display: block;
              ">Book Slot</a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}" target="_blank" rel="noopener noreferrer" style="
                background: #f4efe8;
                color: #1c1b18;
                padding: 6px 8px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
                display: flex;
                align-items: center;
              " title="Directions via Google Maps">🗺️</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => {
          if (onSelectVendor) onSelectVendor(v.vendorId);
        });

        markersRef.current[v.vendorId] = marker;
      });

      // Add user's location pin if available
      if (userLocation) {
        const userIcon = L.divIcon({
          className: "user-gps-pulse",
          html: `
            <div style="position: relative; width: 20px; height: 20px;">
              <div style="
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #3b82f6;
                opacity: 0.4;
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>
              <div style="
                position: absolute;
                top: 4px;
                left: 4px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #2563eb;
                border: 2px solid white;
                box-shadow: 0 0 8px rgba(37,99,235,0.8);
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
        }).addTo(map);

        userMarkerRef.current.bindPopup(`
          <div style="font-size: 12px; font-weight: 700; color: #1c1b18; padding: 2px;">
            📍 Your Current Location (UCC Campus)
          </div>
        `);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [vendors]);

  // Update user marker when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    import("leaflet").then((L) => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1.2,
      });
    });
  }, [userLocation]);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-[#ede8e1] shadow-xs">
      <div ref={mapContainerRef} className="w-full h-[450px] sm:h-[520px] z-0" />
      
      {/* Map overlay controls */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#ede8e1] shadow-sm text-[11px] font-semibold text-[#1c1b18] flex items-center space-x-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>UCC Grooming Services GPS Active</span>
      </div>
    </div>
  );
}
