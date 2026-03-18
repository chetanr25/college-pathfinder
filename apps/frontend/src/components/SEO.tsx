import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
}

const SITE_NAME = 'College Path Finder';
const DEFAULT_DESCRIPTION =
  'Find the right engineering college for your KCET rank. Explore colleges, branches, and get AI-powered admission guidance.';

const SEO: React.FC<SEOProps> = ({ title, description = DEFAULT_DESCRIPTION }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | KCET College Predictor`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
};

export default SEO;
