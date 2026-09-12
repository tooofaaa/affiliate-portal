import PerformanceContent from "@/components/features/performance/PerformanceContent";
import { getPerformanceStats, getMyConversions } from "@/lib/actions/affiliate";

export default async function PerformancePage() {
  const [stats, conversionsResult] = await Promise.all([
    getPerformanceStats(),
    getMyConversions(),
  ]);

  return <PerformanceContent stats={stats} conversions={conversionsResult.data} />;
}
