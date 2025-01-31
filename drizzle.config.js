/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://prepmaniadb_owner:PLVYalmcqS29@ep-rapid-mud-a5cq37d0.us-east-2.aws.neon.tech/prepmaniadb?sslmode=require',
    }
  };
  