import typographyPlugin from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import animatePlugin from "tailwindcss-animate";
import reactAriaComponentsPlugin from "tailwindcss-react-aria-components";

const config = {
	content: ["./@(app|components|config|lib|styles)/**/*.@(css|js|ts|tsx)"],
	corePlugins: {
		container: false,
	},
	darkMode: ["variant", [':where([data-ui-color-scheme="dark"]) &']],
	plugins: [animatePlugin, reactAriaComponentsPlugin, typographyPlugin],
	theme: {
		extend: {
			fontFamily: {
				body: "var(--font-body, ui-sans-serif), system-ui, sans-serif",
				heading: "var(--font-heading, var(--font-body, ui-sans-serif)), system-ui, sans-serif",
			},
			colors: {
				neutral: {
					"0": "white",
					...colors.zinc,
					"1000": "black",
				},
				background:
					"color-mix(in sRGB, var(--color-background) calc(<alpha-value> * 100%), transparent)",
				"on-background":
					"color-mix(in sRGB, var(--color-on-background) calc(<alpha-value> * 100%), transparent)",
				surface: "color-mix(in sRGB, var(--color-surface) calc(<alpha-value> * 100%), transparent)",
				"on-surface":
					"color-mix(in sRGB, var(--color-on-surface) calc(<alpha-value> * 100%), transparent)",
				overlay: "color-mix(in sRGB, var(--color-overlay) calc(<alpha-value> * 100%), transparent)",
				"on-overlay":
					"color-mix(in sRGB, var(--color-on-overlay) calc(<alpha-value> * 100%), transparent)",
				primary: "color-mix(in sRGB, var(--color-primary) calc(<alpha-value> * 100%), transparent)",
				"on-primary":
					"color-mix(in sRGB, var(--color-on-primary) calc(<alpha-value> * 100%), transparent)",
				secondary:
					"color-mix(in sRGB, var(--color-secondary) calc(<alpha-value> * 100%), transparent)",
				"on-secondary":
					"color-mix(in sRGB, var(--color-on-secondary) calc(<alpha-value> * 100%), transparent)",
				muted: "color-mix(in sRGB, var(--color-muted) calc(<alpha-value> * 100%), transparent)",
				"on-muted":
					"color-mix(in sRGB, var(--color-on-muted) calc(<alpha-value> * 100%), transparent)",
				accent: "color-mix(in sRGB, var(--color-accent) calc(<alpha-value> * 100%), transparent)",
				"on-accent":
					"color-mix(in sRGB, var(--color-on-accent) calc(<alpha-value> * 100%), transparent)",
				negative:
					"color-mix(in sRGB, var(--color-negative) calc(<alpha-value> * 100%), transparent)",
				"on-negative":
					"color-mix(in sRGB, var(--color-on-negative) calc(<alpha-value> * 100%), transparent)",
				positive:
					"color-mix(in sRGB, var(--color-positive) calc(<alpha-value> * 100%), transparent)",
				"on-positive":
					"color-mix(in sRGB, var(--color-on-positive) calc(<alpha-value> * 100%), transparent)",
				notice: "color-mix(in sRGB, var(--color-notice) calc(<alpha-value> * 100%), transparent)",
				"on-notice":
					"color-mix(in sRGB, var(--color-on-notice) calc(<alpha-value> * 100%), transparent)",
				informative:
					"color-mix(in sRGB, var(--color-informative) calc(<alpha-value> * 100%), transparent)",
				"on-informative":
					"color-mix(in sRGB, var(--color-on-informative) calc(<alpha-value> * 100%), transparent)",
				border: "color-mix(in sRGB, var(--color-border) calc(<alpha-value> * 100%), transparent)",
				input: "color-mix(in sRGB, var(--color-input) calc(<alpha-value> * 100%), transparent)",
				"focus-ring":
					"color-mix(in sRGB, var(--color-focus-ring) calc(<alpha-value> * 100%), transparent)",
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: null,
					},
				},
			},
		},
		screens: {
			xs: "30rem",
			sm: "40rem",
			md: "48rem",
			lg: "64rem",
			xl: "80rem",
			"2xl": "96rem",
			"3xl": "120rem",
		},
	},
} satisfies Config;

export default config;
