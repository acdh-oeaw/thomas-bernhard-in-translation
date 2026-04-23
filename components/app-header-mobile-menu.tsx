"use client";
import { MenuIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { Button, Dialog, DialogTrigger, Modal, ModalOverlay } from "react-aria-components";

import { AppNavLink } from "@/components/app-nav-link";
import { createHref } from "@/lib/create-href";
import { otherCategories, proseCategories } from "@/lib/model";
import { usePathname } from "@/lib/navigation";

const disclosureClassName = (active: boolean) => {
	return active
		? "font-medium lowercase text-[--color-link-active] transition"
		: "lowercase text-[--color-link] transition hover:text-[--color-link-hover] focus-visible:text-[--color-link-hover]";
};

export function AppHeaderMobileMenu(): ReactNode {
	const t = useTranslations("AppHeader");
	const catt = useTranslations("BernhardCategories");

	const pathname = usePathname();
	const [proseOpen, setProseOpen] = useState(
		proseCategories.some((c) => {
			return pathname.startsWith(`/works/${c}`);
		}),
	);
	const [worksOpen, setWorksOpen] = useState(
		proseOpen ||
			otherCategories.some((c) => {
				return pathname.startsWith(`/works/${c}`);
			}),
	);

	return (
		<DialogTrigger>
			<Button
				aria-label={t("links.open-menu")}
				className="flex min-h-9 items-center text-[--color-link] transition hover:text-[--color-link-hover] focus-visible:text-[--color-link-hover] lg:hidden"
			>
				<MenuIcon className="size-5" />
			</Button>
			<ModalOverlay className="fixed inset-0 z-40" isDismissable={true}>
				<Modal className="fixed inset-x-0 top-0 z-50 border-b bg-background shadow-md">
					<Dialog aria-label={t("navigation-primary")}>
						{({ close }) => {
							return (
								<div className="flex flex-col gap-6 p-6">
									<Button
										aria-label={t("links.close-menu")}
										className="self-start text-[--color-link] transition hover:text-[--color-link-hover] focus-visible:text-[--color-link-hover]"
										onPress={close}
									>
										<XIcon className="size-5" />
									</Button>
									<ul className="flex flex-col gap-3 text-sm" role="list">
										<li>
											<AppNavLink
												className="lowercase"
												href={createHref({ pathname: "/" })}
												onClick={close}
											>
												{t("links.home")}
											</AppNavLink>
										</li>
										<li>
											<button
												aria-expanded={worksOpen}
												className={disclosureClassName(worksOpen)}
												onClick={() => {
													setWorksOpen(!worksOpen);
												}}
												type="button"
											>
												{t("links.works")}
											</button>
											{worksOpen ? (
												<ul className="mt-2 flex flex-col gap-2 pl-4" role="list">
													<li>
														<button
															aria-expanded={proseOpen}
															className={disclosureClassName(proseOpen)}
															onClick={() => {
																setProseOpen(!proseOpen);
															}}
															type="button"
														>
															{catt("prose")}
														</button>
														{proseOpen ? (
															<ul className="mt-2 flex flex-col gap-2 pl-4" role="list">
																{proseCategories.map((c) => {
																	return (
																		<li key={c}>
																			<AppNavLink
																				className="lowercase"
																				href={`/works/${c}`}
																				onClick={close}
																			>
																				{catt(c)}
																			</AppNavLink>
																		</li>
																	);
																})}
															</ul>
														) : null}
													</li>
													{otherCategories.map((c) => {
														return (
															<li key={c}>
																<AppNavLink
																	className="lowercase"
																	href={`/works/${c}`}
																	onClick={close}
																>
																	{catt(c)}
																</AppNavLink>
															</li>
														);
													})}
												</ul>
											) : null}
										</li>
										{(
											[
												["languages", t("links.languages")],
												["translators", t("links.translators")],
												["about", t("links.about")],
												["search", t("links.search")],
											] as const
										).map(([id, label]) => {
											return (
												<li key={id}>
													<AppNavLink
														className="lowercase"
														href={createHref({ pathname: `/${id}` })}
														onClick={close}
													>
														{label}
													</AppNavLink>
												</li>
											);
										})}
									</ul>
								</div>
							);
						}}
					</Dialog>
				</Modal>
			</ModalOverlay>
		</DialogTrigger>
	);
}
