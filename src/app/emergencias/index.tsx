import { CommunityMap } from '@/features/map';
import { EmergencyCenterScreen } from '@/features/emergency';

export default function EmergencyRoute() {
  return (
    <EmergencyCenterScreen
      nearbyMap={<CommunityMap posts={[]} layers={['incidents', 'needs', 'resources', 'zones', 'cameras']} embedded height={280} />}
    />
  );
}
