import type { SVGProps } from "react";
import { faUssunnah } from "@fortawesome/free-brands-svg-icons/faUssunnah";

const [width, height, , , pathData] = faUssunnah.icon;

export function UssunnahIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {Array.isArray(pathData) ? (
        pathData.map((path, index) => <path key={index} d={path} />)
      ) : (
        <path d={pathData} />
      )}
    </svg>
  );
}
