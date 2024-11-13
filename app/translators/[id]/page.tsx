import { InstantSearch } from "@/components/instantsearch";

interface TranslatorsPageProps {
	params?: {
		id: string;
	};
}

export default function TranslatorsPage(props: TranslatorsPageProps) {
	return <InstantSearch>{props.params}</InstantSearch>;
}
