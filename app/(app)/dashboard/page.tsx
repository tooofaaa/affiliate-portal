import DashboardContent from "@/components/features/dashboard/DashboardContent";
import { getDashboardStats, getMyCode } from "@/lib/actions/affiliate";

export default async function DashboardPage() {
  const [stats, codeRes] = await Promise.all([
    getDashboardStats(),
    getMyCode(),
  ]);

  return (
    <DashboardContent
      stats={stats}
      activeCode={codeRes.data}
    />
  );
}
