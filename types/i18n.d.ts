import type metadata from "@/content/en/metadata/index.json";
import type messages from "@/messages/en.json";

declare global {
	type Messages = typeof messages & { metadata: typeof metadata };

	declare interface IntlMessages extends Messages {}
}
