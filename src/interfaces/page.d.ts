export enum PageEnum {
  DRAFT = "draft",
  PUBLISH = "publish",
}

export interface PageCreate {
  content: string;
  name: string;
  status: PageEnum;
}

export interface PageList {
  content: string;
  name: string;
  handle: string;
  status: PageEnum;
  id: string;
  created_at: string;
  update_at: string;
}
