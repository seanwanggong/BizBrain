import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface UserState {
  isAuthenticated: boolean;
  user: User | null;
}

// 从 localStorage 获取初始状态
const getInitialState = (): UserState => {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (token && savedUser) {
    try {
      const user = JSON.parse(savedUser);
      if (
        user &&
        typeof user === 'object' &&
        'id' in user &&
        'email' in user &&
        'username' in user
      ) {
        return {
          isAuthenticated: true,
          user,
        };
      }
    } catch (e) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  return {
    isAuthenticated: false,
    user: null,
  };
};

const userSlice = createSlice({
  name: 'user',
  initialState: getInitialState(),
  reducers: {
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('user', JSON.stringify(action.payload));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setAuth, setUser, logout } = userSlice.actions;
export default userSlice.reducer; 