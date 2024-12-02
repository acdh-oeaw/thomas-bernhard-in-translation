import type { ReactNode } from "react";

interface DisclosureButtonProps {
	controls: string;
	label: string;
	state: boolean;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	setState: Function;
}

export function DisclosureButton(props: DisclosureButtonProps): ReactNode {
	const className = props.state
		? "text-link lowercase transition font-medium text-[--color-link-active]"
		: "text-link lowercase text-[--color-link] transition hover:text-[--color-link-hover] focus-visible:text-[--color-link-hover]";
	return (
		<button
			aria-controls={props.controls}
			// aria-current={props.state}
			aria-expanded={props.state}
			className={className}
			onClick={() => {
				props.setState(true);
			}}
			type="button"
		>
			{props.label}
		</button>
	);
}
