interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, color, size = 28, className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.max(9, Math.round(size * 0.42)),
      }}
    >
      {name.slice(0, 1)}
    </span>
  );
}
