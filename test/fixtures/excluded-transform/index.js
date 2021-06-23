require ('./templates/App.vue')
require ('./node_modules_demo/my-package/should-transform.css')
require ('./node_modules_demo/some-other-package/should-not-transform.css')

require('virtual:windi-base.css')
require('virtual:windi-components.css')
require('virtual:windi-utilities.css')
