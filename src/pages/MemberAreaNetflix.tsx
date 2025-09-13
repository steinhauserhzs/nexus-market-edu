// Nexus Netflix-Style Member Area - Main Page

import NetflixMemberArea from '@/components/member-area/netflix-style/NetflixMemberArea';
import SEOHead from '@/components/ui/seo-head';

const MemberAreaNetflix = () => {
  return (
    <>
      <SEOHead 
        title="Área de Membros - Nexus Market"
        description="Acesse seus produtos e cursos adquiridos na área de membros exclusiva."
      />
      <NetflixMemberArea />
    </>
  );
};

export default MemberAreaNetflix;