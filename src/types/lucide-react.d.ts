declare module 'lucide-react' {
  import * as React from 'react';
  type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

  export const ArrowLeft: React.FC<IconProps>;
  export const Leaf: React.FC<IconProps>;
  export const Send: React.FC<IconProps>;
  export const Mic: React.FC<IconProps>;
  export const Camera: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const StopCircle: React.FC<IconProps>;
  export const Loader2: React.FC<IconProps>;
  export const User: React.FC<IconProps>;
  export const Bot: React.FC<IconProps>;
  export const Upload: React.FC<IconProps>;
  export const AlertCircle: React.FC<IconProps>;
  export const CheckCircle: React.FC<IconProps>;
  export const Calendar: React.FC<IconProps>;
  export const MapPin: React.FC<IconProps>;
  export const Droplets: React.FC<IconProps>;
  export const DollarSign: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const TrendingDown: React.FC<IconProps>;
  export const Minus: React.FC<IconProps>;
  export const Filter: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const Bug: React.FC<IconProps>;
  export const Image: React.FC<IconProps>;
  export const CloudRain: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;

  const icons: Record<string, React.FC<IconProps>>;
  export default icons;
}
