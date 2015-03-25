'use strict';

var postsApp = angular.module('postsApp', [
                                            'ui.router',
                                            'angularUtils.directives.dirPagination',
]);

//Controler for review page
postsApp.controller('postsCtrl',[
'$scope',
'postsFactory',
'$rootScope',
'$state',
'$filter',
function($scope, postsFactory, $rootScope, $state, $filter){
  $scope.posts = postsFactory.posts;

  $scope.addPost = function()
  {
    if($scope.title === '')
    { 
      return; 
    }
    var today = new Date();
    var postDate = $filter('date')(today, 'MM/dd/yyyy');
    var postTime = $filter('date')(today, 'mediumTime');
    postsFactory.createPost({
      post_author: (function () {
        if ($rootScope.currentUser) 
        {
            return $rootScope.currentUser.user_name;
        } 
        else
        { 
          return 'anonymous'; 
        }
      })(),
      post_date: postDate,
      post_date_time: postTime,
      post_content: $scope.title
      });
    //Reload current page
    $state.go($state.current, {}, {reload: true});
  };
}]);

postsApp.factory('postsFactory', ['$http', function($http){
  var o = 
  {
    posts: []
  };
  o.getAll = function()
  {
    return $http.get('/posts').success(function(data)
    {
      angular.copy(data, o.posts);
    });
  };
  o.createPost = function(post) 
  {
    return $http.post('/posts', post).success(function(data)
    {
      o.posts.push(data);
    });
  };
  return o;
}]);