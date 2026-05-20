export interface DbClient {
  user: {
    create: (arg: any) => Promise<any>;
    findMany: () => Promise<any[]>;
    upsert: (arg: any) => Promise<any>;
    findUnique: (arg: any) => Promise<any>;
  };
  post: {
    findMany: (arg: { include: any }) => Promise<any[]>;
  };
  postLike: {
    findMany: () => Promise<any[]>;
  };
  comment: {
    findMany: () => Promise<any[]>;
  };
  notification: {
    findMany: () => Promise<any[]>;
  };
}