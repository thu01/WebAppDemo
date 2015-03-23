'use strict';

var postsApp = angular.module('postsApp', ['ui.router']);

//Controler for review page
postsApp.controller('postsCtrl',[
'$scope',
'postsFactory',
'$rootScope',
'$state',
function($scope, postsFactory, $rootScope, $state){
  $scope.posts = postsFactory.posts;

  $scope.addPost = function()
  {
    if($scope.title === '')
    { 
      return; 
    }
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var second = today.getSeconds();
    if(dd<10)
    {
      dd='0'+dd;
    }
    if(mm<10) 
    {
      mm='0'+mm;
    }
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
      post_date: mm+'/'+dd+'/'+yyyy,
      post_date_time: hour+':'+minute+':'+second,
      post_content: $scope.title
      });
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