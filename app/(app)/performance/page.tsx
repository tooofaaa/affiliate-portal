import PerformanceContent from "@/components/features/performance/PerformanceContent";
import { getPerformanceStats } from "@/lib/actions/affiliate";

export default async function PerformancePage() {
  const stats = await getPerformanceStats();

  return <PerformanceContent stats={stats} />;
}
