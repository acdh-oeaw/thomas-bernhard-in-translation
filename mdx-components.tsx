import { Link } from "@/components/link";

const components = {
	a: Link,
};

declare global {
	type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
	return components;
}
