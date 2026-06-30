/* eslint-disable */
module.exports = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:alwayspromise@db:5432/pathify",
  },
};
