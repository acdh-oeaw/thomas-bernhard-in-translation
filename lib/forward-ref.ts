import {
	type ForwardedRef,
	forwardRef as f,
	type ReactNode,
	type Ref,
	type RefAttributes,
} from "react";

/**
 * @see https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/utils.tsx
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
declare type forwardRefWithGenerics = <T, P = {}>(
	render: (props: P, ref: Ref<T>) => ReactNode,
) => (props: P & RefAttributes<T>) => ReactNode;

export const forwardRef = f as forwardRefWithGenerics;

export type { ForwardedRef };
