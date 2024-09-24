import type { ReactNode } from "react";

interface DisclosureButtonProps {
	controls: string;
	label: string;
	state: boolean;
	// eslint-disable-next-line @typescript-eslint/ban-types
	setState: Function;
}

export function DisclosureButton(props: DisclosureButtonProps): ReactNode {
	const className = props.state
		? "text-link transition font-medium text-on-background/80"
		: "text-link text-on-background/60 transition hover:text-on-background/80 focus-visible:text-on-background/80";
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
