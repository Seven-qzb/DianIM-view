import { MainNavTab } from '../types/chat';

export interface RouteState {
  tab: MainNavTab;
  sessionId?: string;
  subView?: string;
}
