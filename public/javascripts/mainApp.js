'use strict';

var mainApp = angular.module('mainApp', [
                                          'ui.router',
                                          'ui.bootstrap',
                                          'ngCookies',
                                          'ngResource',
                                          'productsInfoApp',
                                          'postsApp',
]);

mainApp.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $stateProvider
    .state('default',{
      url: '/',
      templateUrl: 'templates/news.html'
    })
    .state('news',{
      url: '/news',
      templateUrl: 'templates/news.html'
    })
    .state('products',{
      url: '/products',
      templateUrl: 'productsInfo.html',
    })
    .state('posts',{
      url: '/posts',
      templateUrl: 'posts.html',
    })
    .state('email',{
      url: '/email',
      onEnter: function($http) {
        $http.post('/email').success(function(){
          console.log('email sent successfully');
        })
      }
    })
    .state('contact',{
      url: '/contact',
      templateUrl: 'contact.html',
      controller: 'contactCtrl'
    });

    $urlRouterProvider.otherwise('/news');
}]);

mainApp.run(['$rootScope', '$location', 'Auth', function ($rootScope, $location, Auth) {
    //watching the value of the currentUser variable.
  $rootScope.$watch('currentUser', function(currentUser) {
    // if no currentUser and on a page that requires authorization then try to update it
    // will trigger 401s if user does not have a valid session
    console.log("rootscope watch");
    if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) == -1 )) {
      Auth.currentUser();
    }
  });
}]);

mainApp.factory('loginModalFactory', ['$modal','$log', function($modal, $log){
  var res = {
    o: []
  };
  res.openModal = function() {
    var modalInstance = $modal.open({
      templateUrl: 'templates/login.html',
      controller: 'ModalInstanceCtrl',
      size: 3,
      resolve: {
        items: function () {
        return 3;
        }
      }
    });
    modalInstance.result.then(function(){
      console.log("loginModalFactory");
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
  return res;
}]);

mainApp.factory('Session', ['$resource', function ($resource) {
  return $resource('/auth/session/');
}]);

mainApp.factory('User', ['$resource', function ($resource) {
  return $resource('/auth/users/:id/', {}, {
    'update': {
      method:'PUT'
    }
  });
 }]);

mainApp.factory('Auth', ['$location', '$rootScope', 'Session', 'User', '$cookieStore', function ($location, $rootScope, Session, User, $cookieStore){
  $rootScope.currentUser = $cookieStore.get('user') || null;
  $cookieStore.remove('user');
  var res = {};

  res.login = function(provider, user, callback) {
    var cb = callback || angular.noop;
    // console.log(user);
    var userInputs = user;
    Session.save({
      provider: provider,
      email: user.email,
      password: user.password,
      remember_me: user.remember_me
    }, function(user) {
      if (userInputs.remember_me) {
        $cookieStore.put('remember_me', userInputs.remember_me);
        $cookieStore.put('user_email', userInputs.email);
        $cookieStore.put('user_password', userInputs.password);
      }
      else {
        $cookieStore.put('remember_me', 0);
      };
      $rootScope.currentUser = user;
        return cb();
    }, function(err) {
        return cb(err.data);
      });
  };

  res.logout = function(callback) {
    var cb = callback || angular.noop;
    // $cookieStore.remove('user');
    Session.delete(function(res) {
      $rootScope.currentUser = null;
      return cb();
    },function(err) {
      return cb(err.data);
    });
  };

  res.createUser = function(userinfo, callback) {
    var cb = callback || angular.noop;
    console.log("Auth Create User: userinfo = " + angular.toJson(userinfo));
    User.save(userinfo,
      function(user) {
      $rootScope.currentUser = user;
        return cb();
      }, function(err) {
        return cb(err.data);
    });
  };

  res.currentUser = function() {
    Session.get(function(user) {
      console.log(user);
      $rootScope.currentUser = user;
    });
  };

  res.changePassword = function(email, oldPassword, newPassword, callback) {
    var cb = callback || angular.noop;
    User.update({
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword
    }, function(user) {
        console.log('password changed');
        return cb();
    }, function(err) {
        return cb(err.data);
    });
  };

  res.rstPwd = function(email, callback) {
    var cb = callback || angular.noop;
    User.update({
        user_email: email.user_email
    }, function(user) {
        console.log('password changed');
        return cb();
    }, function(err) {
        return cb(err.data);
    });
  };

  res.removeUser = function(email, password, callback) {
    var cb = callback || angular.noop;
    User.delete({
      email: email,
      password: password
    }, function(user) {
        console.log(user + 'removed');
        return cb();
    }, function(err) {
        return cb(err.data);
    });
  };

  return res;
}]);

mainApp.controller('HeaderCtrl', function ($scope, $modal, $log, $location, Auth) {
  $scope.buttonLoginClick = function (size) {
  var modalInstance = $modal.open({
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl',
    windowClass: 'login-modal-window',
    resolve: {
      items: function () {
      //TODO: Not needed
      return 1;
      }
    }
  });

  modalInstance.result.then(function (selectedItem) {
    $scope.selected = selectedItem;
  }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.logout = function() {
    Auth.logout(function(err) {
      if(!err) {
        $location.path('/login');
      }
    });
  };
});

mainApp.controller('loginCtrl', [
'$scope',
'$modalInstance',
'Auth',
'$location',
'$cookieStore',
function($scope, $modalInstance, Auth, $location, $cookieStore){
  $scope.button_remember_me = $cookieStore.get('remember_me') || 0;
  $scope.page_name = 'login-page';

  $scope.error = {};

  if ($cookieStore.get('remember_me')) {
    $scope.button_remember_me = $cookieStore.get('remember_me');
    $scope.user = {
      'email': $cookieStore.get('user_email'),
      'password': $cookieStore.get('user_password')
    };
  }
  else {
    $scope.user = {};
  }

  (function loginPageOnLoad($cookieStore){
    if($scope.button_remember_me)
    {
      console.log('remember_me enabled');
      angular.element(".btn-remember-me").removeClass('btn-default');
      angular.element(".btn-remember-me").addClass('btn-info glyphicon glyphicon-check');
    }
    else
    {
      console.log('remember_me disabled');
      angular.element(".btn-remember-me").removeClass('btn-info glyphicon glyphicon-check');
      angular.element(".btn-remember-me").addClass('btn-default');
    }
  })();

  $scope.btnRememberMeClick = function()
  {
    if($scope.button_remember_me===0)
    {
      $scope.button_remember_me = 1;
      angular.element(".btn-remember-me").removeClass('btn-default');
      angular.element(".btn-remember-me").addClass('btn-info glyphicon glyphicon-check');
    }
    else
    {
      $scope.button_remember_me = 0;
      angular.element(".btn-remember-me").removeClass('btn-info glyphicon glyphicon-check');
      angular.element(".btn-remember-me").addClass('btn-default');
    }
  };
  $scope.btnSwitchPage = function(pageKey)
  {
    var pageMapTable=
    {
      0:'login-page',
      1:'signup-page',
      2:'forgotpwd-page'
    };
    $scope.page_name = pageMapTable[pageKey];
  };

  $scope.login = function(form) {
    Auth.login('password', {
      'email': $scope.user.email,
      'password': $scope.user.password,
      'remember_me': $scope.button_remember_me
    },
    function(err) {
      $scope.errors = {};
      if (!err) {
        $modalInstance.dismiss('cancel');
        $location.path('/moments');
        //console.log( $scope.user.email + "!\n!" +  $scope.user.password);
      }
      else {
          angular.forEach(err.errors, function(error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.type;
        });
        $scope.error.other = err.message;
      }
    });
  };

  $scope.signup = function(form) {
    //console.log("Auth signup");
    Auth.createUser({
      'user_email': $scope.user.user_email,
      'user_name': $scope.user.user_name,
      'user_password': $scope.user.user_password
    },
    function(err) {
      $scope.errors = {};

      if (!err) {
        //TODO: Redirect to a new page
        $modalInstance.dismiss('cancel');
        $location.path('/moments');
        //console.log( $scope.user.email + "!\n!" +  $scope.user.password);
      }
      else {
        angular.forEach(err.errors, function(error, field) {
          console.log("field: " + field);
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.type;
        });
        $scope.error.other = err.message;
      }
    });
  };

  $scope.forgotpwd = function(form) {
    Auth.rstPwd({
      'user_email': $scope.user_email,
    },
    function(err) {
      $scope.errors = {};

      if (!err) {
        //TODO: Redirect to a new page
        $modalInstance.dismiss('cancel');
        $location.path('/moments');
        //console.log( $scope.user.email + "!\n!" +  $scope.user.password);
      }
      else {
        angular.forEach(err.errors, function(error, field) {
          console.log("field: " + field);
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.type;
        });
        $scope.error.other = err.message;
      }
    });
  };
}]);

mainApp.controller('contactCtrl', [
'$scope',
'$rootScope',
'$http',
'$location',
function($scope, $rootScope, $http, $location){

    $scope.submitContact = function() {
      var user;
      if ($rootScope.currentUser == null) {
        user = null;
      } else {
        user = $rootScope.currentUser.user_name;
      }
        var req = {
            'user': user,
            'date': new Date(),
            'fname': $scope.fname,
            'lname': $scope.lname,
            'phone': $scope.phone,
            'msg': $scope.message
        }
        return $http.post('/email/contact', req);
    };
}]);

//Directives
/**
 * Removes server error when user updates input
 */
mainApp.directive('mongooseError', function () {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      element.on('keydown', function() {
        return ngModel.$setValidity('mongoose', true);
      });
    }
 };
});

mainApp.controller('DummyCtrl', function ($scope) {
  $scope.dummy = 5;
});


