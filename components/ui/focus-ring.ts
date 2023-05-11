import { styles } from "@acdh-oeaw/style-variants";

export const focusRing = styles({
	base: "outline outline-offset-2 outline-focus-ring forced-colors:outline-[Highlight]",
	variants: {
		isFocusVisible: {
			false: "outline-0",
			true: "outline-2",
		},
	},
});
