import ApiWatchPage from './ApiWatchPage';

module.exports = function() {
  this.bindHook('sub_nav', function(app) {
    app.apiWatch = {
      name: '接口监测',
      path: '/project/:id/api_watch',
      component: ApiWatchPage
    }
  });
};