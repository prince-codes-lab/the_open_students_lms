declare module "lucide-react" {
  import * as React from "react";

  export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export const MapPin: React.ComponentType<IconProps>;
  export const Calendar: React.ComponentType<IconProps>;
  export const Users: React.ComponentType<IconProps>;
  export const Globe: React.ComponentType<IconProps>;
}