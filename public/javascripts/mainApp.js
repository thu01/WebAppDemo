var mainApp = angular.module('mainApp', ['ui.router', 'ngTable', 'ui.bootstrap', 'ngCookies', 'ngResource']);

mainApp.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $stateProvider
     .state('index',{
      url: '/',
      templateUrl: 'templates/news.html'
    })
    .state('products',{
      url: '/products',
      templateUrl: 'productsInfo.html',      
      resolve: {
        postPromise: ['productsInfoFactory', function(productsInfoFactory){
          return productsInfoFactory.getProductsInfo();
        }]
        },
      controller: 'productInfoCtrl'
    })
    .state('moments',{
      url: '/moments',
      templateUrl: 'moments.html',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
        },
      controller: 'momentsCtrl'
    });

    $urlRouterProvider.otherwise('/');
  }]);

mainApp.run(['$rootScope', '$location', 'Auth', 
        function ($rootScope, $location, Auth) {
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

///Factories
mainApp.factory('productsInfoFactory', ['$http', function($http){  
  var res = {
    products: []
  };
  res.getProductsInfo = function() {
    //console.log("http get products info");
    return $http.get('/productsinfo').success(function(data){
      angular.copy(data, res.products);
    });
  };
  return res;
}]);

mainApp.factory('posts', ['$http', function($http){  
  var o = {
    posts: []
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.createPost = function(post) {
  return $http.post('/posts', post).success(function(data){
    o.posts.push(data);
  });
};
  return o;
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
    return $resource('/auth/users/:id/', {},
    {
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
            } else {
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


///Controllers
//Controler for productInfo page
mainApp.controller('productInfoCtrl',[
'$scope',
'ngTableParams',
'productsInfoFactory',
function($scope, ngTableParams, productsInfoFactory){
  //console.log("productInfoCtrl");
  //$scope.productsInfo = productsInfoFactory.products;
  var data = productsInfoFactory.products;
  console.log("Info: length($scope.productsInfo)= " + data.length);
  $scope.ngTableProducts = new ngTableParams({
        page: 1,            // show first page
        count: 5           // count per page
    }, {
        total: data.length, // length of data
        getData: function($defer, params) {
            $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
}]);

//Controler for review page
mainApp.controller('momentsCtrl',[
'$scope',
'posts',
function($scope, posts){
	$scope.posts = posts.posts;
    //TODO: Use session data for user name
  $scope.addPost = function(){
      if($scope.title === '') { return; }
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      var hour = today.getHours();
      var minute = today.getMinutes();
      var second = today.getSeconds();
      if(dd<10) {
        dd='0'+dd
      } 
      if(mm<10) {
        mm='0'+mm
      } 
      posts.createPost({
        post_author: 'anonymous', 
        post_date: mm+'/'+dd+'/'+yyyy,
        post_date_time: hour+':'+minute+':'+second,
        post_content: $scope.title
      });
      location.reload();
    };
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
    } else {
      $scope.user = {};
    }

    (function loginPageOnLoad($cookieStore){
        console.log('load login');
        console.log('value' + $scope.button_remember_me);
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
          } else {
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
          } else {
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
