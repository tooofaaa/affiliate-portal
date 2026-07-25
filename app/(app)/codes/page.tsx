import CodesContent from "@/components/features/codes/CodesContent";
import { getMyCode, getCodeHistory } from "@/lib/actions/affiliate";

export default async function CodesPage() {
  const [codeRes, historyRes] = await Promise.all([
    getMyCode(),
    getCodeHistory(),
  ]);

  return (
    <CodesContent
      activeCode={codeRes.data}
      history={historyRes.data}
    />
  );
}
