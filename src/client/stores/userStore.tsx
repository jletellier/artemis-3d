import * as React from 'react';
import {
  createContext,
  useState,
  Dispatch,
  useContext,
  FunctionComponent,
  ReactNode,
} from 'react';

import { UserState } from '../../common/types/UserState';

const initialState: UserState = {
  selectedNodes: [],
  expandedNodes: [],
};

const UserStateContext = createContext<UserState | undefined>(undefined);
const SetUserStateContext = createContext<Dispatch<UserState> | undefined>(undefined);

interface IUserStoreProviderProps {
  children: ReactNode,
}

const UserStoreProvider: FunctionComponent = (props: IUserStoreProviderProps) => {
  const { children } = props;
  const [state, setState] = useState(initialState);

  return (
    <UserStateContext.Provider value={state}>
      <SetUserStateContext.Provider value={setState}>
        {children}
      </SetUserStateContext.Provider>
    </UserStateContext.Provider>
  );
};

function useUserState() {
  const context = useContext(UserStateContext);

  if (context === undefined) {
    throw new Error('useUserState must be used within a UserStoreProvider');
  }

  return context;
}

function useSetUserState() {
  const context = useContext(SetUserStateContext);

  if (context === undefined) {
    throw new Error('useSetUserState must be used within a UserStoreProvider');
  }

  return context;
}

export {
  UserStoreProvider,
  useUserState,
  useSetUserState,
};
