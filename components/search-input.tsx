"use client";

// eslint-disable-next-line no-restricted-imports
import { useRouter } from "next/navigation";
import { type ReactNode, useOptimistic } from "react";

interface SearchInputProps {
	value?: Array<string> | string;
}

export function SearchInput(props: SearchInputProps): ReactNode {
	const router = useRouter();
	const [optimisticValue, addOptimistic] = useOptimistic(
		props.value,
		(_currentState, optimisticValue: string) => {
			return optimisticValue;
		},
	);
	return (
		<input
			onChange={(e) => {
				addOptimistic(e.target.value);
				router.push(`?search=${e.target.value}`);
			}}
			placeholder="Heldenplatz"
			type="text"
			value={optimisticValue}
		/>
	);
}
