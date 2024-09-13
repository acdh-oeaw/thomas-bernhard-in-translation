import WorksPage from "./[work]/page";

interface BlankWorksPageProps {
	params: {
		category: string;
	};
}

export default function BlankWorksPage(props: BlankWorksPageProps) {
	return <WorksPage params={props.params} />;
}
