/* eslint-disable no-restricted-imports */
/* eslint-disable @next/next/no-img-element */

import NextImage, { type ImageProps as NextImageProps } from "next/image";

import { getImageDimensions } from "@/lib/get-image-dimensions";

interface ImageProps extends Omit<NextImageProps, "loader"> {}

export async function Image(props: ImageProps) {
	const { alt = "", decoding = "async", fill, height, loading = "lazy", src, width } = props;

	const dimensions =
		typeof src === "object" || fill === true || (width != null && height != null)
			? { width, height }
			: await getImageDimensions(src);

	if (dimensions == null) {
		return <img {...props} alt={alt} decoding={decoding} loading={loading} src={src as string} />;
	}

	return (
		<NextImage
			{...props}
			alt={alt}
			decoding={decoding}
			height={dimensions.height}
			loading={loading}
			width={dimensions.width}
		/>
	);
}
