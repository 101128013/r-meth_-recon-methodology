export enum ContentType {
  COMMAND = 'command',
  TEXT = 'text',
  LIST = 'list',
  DORK_LIST = 'dork_list',
  SCRIPT = 'script',
  LINK_LIST = 'link_list'
}

export interface ReconItem {
  id: string;
  title?: string;
  description?: string;
  type: ContentType;
  content?: string | string[]; // Command string, text body, or list of strings
  meta?: {
    language?: string; // bash, javascript, graphql
    source?: string; // for links
  };
}

export interface ReconSection {
  id: string;
  title: string;
  icon?: string;
  items: ReconItem[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
}