// Locations schemas
export {
  locationBaseSchema,
  createLocationSchema,
  updateLocationSchema,
  locationIdSchema,
  nearbyLocationSchema,
  searchLocationSchema,
  locationIncludeBasic,
  locationIncludeDetail,
} from './locations';

// Users schemas  
export {
  userBaseSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  userDataByIdSchema,
  defaultUserOrderBy,
  defaultLocationOrderBy,
  userVisitsInclude,
} from './users';

// Visits schemas
export {
  visitBaseSchema,
  createVisitSchema,
  updateVisitSchema,
  visitIdSchema,
  visitsByLocationSchema,
  visitsByUserSchema,
  visitsByDateRangeSchema,
  visitsByRatingSchema,
  userStatsSchema,
  defaultVisitOrderBy,
  visitIncludeBasic,
  visitIncludeDetail,
  visitIncludeByLocation,
  visitIncludeByUser,
  visitIncludeByDateRange,
  visitIncludeByRating,
} from './visits';

// Visit Photos schemas
export {
  visitPhotoBaseSchema,
  createVisitPhotoSchema,
  updateVisitPhotoSchema,
  visitPhotoIdSchema,
  photosByVisitSchema,
  photosByUserSchema,
  photosByLocationSchema,
  createMultiplePhotosSchema,
  defaultPhotoOrderBy,
  visitPhotoIncludeAll,
  visitPhotoIncludeDetail,
  visitPhotoIncludeBasic,
  visitPhotoIncludeByUser,
  visitPhotoIncludeByLocation,
  visitPhotoIncludeCreate,
  visitPhotoIncludeUpdate,
  visitPhotoIncludeStats,
} from './visit_photos';