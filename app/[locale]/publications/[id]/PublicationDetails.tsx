import type { ReactNode } from "react";

interface NameValueProps {
	name: string;
	children: ReactNode;
}

export function NameValue(props: NameValueProps): ReactNode {
	return (
		<>
			<dt className="bernhard-key">{props.name}</dt>
			<dd>{props.children}</dd>
		</>
	);
}

interface PublicationDetailsProps {
	children: ReactNode;
}

export function PublicationDetails(props: PublicationDetailsProps): ReactNode {
	const { children } = props;

	return <dl>{children}</dl>;
}
