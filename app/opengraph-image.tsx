import type { ImageResponse } from "next/og";
import { getLocale, getTranslations } from "next-intl/server";

import { MetadataImage } from "@/components/metadata-image";

export const runtime = "edge";

// export const alt = ''

export const size = {
	width: 1200,
	height: 630,
};

interface OpenGraphImageProps extends EmptyObject {}

export default async function OpenGraphImage(_props: OpenGraphImageProps): Promise<ImageResponse> {
	const locale = await getLocale();
	const meta = await getTranslations("metadata");

	const title = meta("title");

	return MetadataImage({ locale, size, title });
}
