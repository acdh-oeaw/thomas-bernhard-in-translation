/* eslint-disable no-restricted-imports */
/* eslint-disable @next/next/no-img-element */

import { getImageProps, type ImageProps as NextImageProps } from "next/image";
import type { ReactNode } from "react";

import { getImageDimensions } from "@/lib/get-image-dimensions";

interface StaticImageProps extends Omit<NextImageProps, "blurDataURL" | "loader" | "placeholder"> {}

export async function StaticImage(props: StaticImageProps): Promise<ReactNode> {
	const { alt = "", decoding = "async", fill, height, loading = "lazy", src, width } = props;

	const dimensions =
		typeof src === "object" || fill === true || (width != null && height != null)
			? { width, height }
			: await getImageDimensions(src);

	if (dimensions == null) {
		return <img {...props} alt={alt} decoding={decoding} loading={loading} src={src as string} />;
	}

	return (
		<img
			{...getImageProps({
				...props,
				alt,
				decoding,
				height: dimensions.height,
				loading,
				width: dimensions.width,
			})}
			alt={alt}
		/>
	);
}
