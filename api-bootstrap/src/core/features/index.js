import Feature from './Feature.js'
import FeatureRegistry from './FeatureRegistry.js'
import JwtFeature from './jwt/JwtFeature.js'
import SwaggerFeature from './swagger/SwaggerFeature.js'
import DockerFeature from './docker/DockerFeature.js'
import QualityFeature from './quality/QualityFeature.js'

const features = new FeatureRegistry()
features.register('jwt', JwtFeature)
features.register('swagger', SwaggerFeature)
features.register('docker', DockerFeature)
features.register('quality', QualityFeature)

export { Feature, FeatureRegistry }
export default features
