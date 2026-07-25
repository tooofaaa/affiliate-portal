import LinksContent from "@/components/features/links/LinksContent";
import { getMyLinks } from "@/lib/actions/affiliate";

export default async function LinksPage() {
  const { data: links } = await getMyLinks();

  return <LinksContent links={links} />;
}
