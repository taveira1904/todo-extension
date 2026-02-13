interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

declare global {
  interface Window {
    chrome: typeof ChromeRuntime & typeof ChromeStorage;
  }
  
  namespace ChromeRuntime {
    export interface Runtime {
      getURL(path: string): string;
    }
  }
  
  namespace ChromeStorage {
    export const storage: {
      sync: {
        get(keys: string[], callback: (result: any) => void): void;
        set(data: any, callback?: () => void): void;
        onChanged: {
          addListener(callback: (changes: any, area: string) => void): void;
          removeListener(callback: (changes: any, area: string) => void): void;
        };
      };
    };
    export interface StorageChange {
      newValue?: any;
      oldValue?: any;
    }
  }
  
  namespace ChromeTabs {
    export const tabs: {
      create(createProperties: { url: string }): void;
    };
  }
}

export type {};
