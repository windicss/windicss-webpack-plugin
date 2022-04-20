import { runApp, IAppConfig } from 'ice';

import 'windi.css';
import 'windi-devtools';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
  },
};

runApp(appConfig);
