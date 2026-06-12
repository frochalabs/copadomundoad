"use client";

import { useState } from "react";

interface UserAvatarProps {
  username: string;
  className?: string; 
}

export function UserAvatar({ username, className = "" }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const baseUrl = "https://res.cloudinary.com/dhj0lwxgq/image/upload/";
  const transformations = "w_300,h_300,c_scale,f_auto,q_auto/";
  const avatarUrl = `${baseUrl}${transformations}${encodeURIComponent(
    username.trim().toLowerCase().replace(/\s+/g, ".")
  )}.jpg`;

  return (
    <div className={`rounded-full overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center ${className}`}>
      {!imageError ? (
        <img
          src={avatarUrl}
          alt={`Avatar de ${username}`}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="font-black text-slate-400 uppercase text-opacity-80">
          {username.charAt(0)}
        </span>
      )}
    </div>
  );
}
